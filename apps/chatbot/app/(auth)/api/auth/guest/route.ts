import { NextResponse } from "next/server";
import { signIn } from "@/app/(auth)/auth";
import {
  checkGuestAuthRateLimit,
  GUEST_AUTH_RATE_LIMIT_TTL_SECONDS,
  GuestAuthRateLimitError,
  guestAuthLimitFromError,
} from "@/lib/ratelimit";
import { getSessionToken } from "@/lib/session-token";

/**
 * Validate a redirect target before forwarding to auth.
 * Allows only:
 *   - Relative paths beginning with "/" (but not "//", which is protocol-relative)
 *   - Absolute URLs whose origin matches the request origin (same-origin)
 * Anything else (external hosts, javascript:, data:, //evil.com) falls back to "/".
 */
function isSafeRedirectUrl(redirectUrl: string, requestUrl: string): boolean {
  // Relative path — safe as long as it isn't protocol-relative ("//host/...")
  if (redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
    return true;
  }
  // Absolute URL — must share the same origin as the request
  try {
    const redirectOrigin = new URL(redirectUrl).origin;
    const requestOrigin = new URL(requestUrl).origin;
    return redirectOrigin === requestOrigin;
  } catch {
    // Unparseable URL (e.g. "javascript:alert(1)") — reject
    return false;
  }
}

function guestAuthLimitResponse(error: GuestAuthRateLimitError) {
  return NextResponse.json(
    { error: error.message },
    {
      status: error.status,
      headers: {
        "Retry-After":
          error.status === 429
            ? String(GUEST_AUTH_RATE_LIMIT_TTL_SECONDS)
            : "5",
      },
    }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawRedirectUrl = searchParams.get("redirectUrl") || "/";

  // Reject cross-origin or protocol-relative redirect targets
  const redirectUrl = isSafeRedirectUrl(rawRedirectUrl, request.url)
    ? rawRedirectUrl
    : "/";

  const token = await getSessionToken(request);

  if (token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    // Peek only: signIn("guest") runs authorize() in-process, which consumes.
    await checkGuestAuthRateLimit(request, { consume: false });
  } catch (error) {
    const limited = guestAuthLimitFromError(error);
    if (limited) {
      return guestAuthLimitResponse(limited);
    }
    throw error;
  }

  try {
    return await signIn("guest", { redirect: true, redirectTo: redirectUrl });
  } catch (error) {
    const limited = guestAuthLimitFromError(error);
    if (limited) {
      return guestAuthLimitResponse(limited);
    }
    throw error;
  }
}
