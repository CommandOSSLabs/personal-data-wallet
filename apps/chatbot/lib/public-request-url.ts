const BIND_HOSTNAMES = new Set(["0.0.0.0", "::", "[::]"]);

function firstHeader(headers: Headers, name: string): string | null {
  const value = headers.get(name)?.split(",")[0]?.trim();
  return value ? value : null;
}

function isBindHostname(hostname: string): boolean {
  return BIND_HOSTNAMES.has(hostname.toLowerCase());
}

function hostnameFromHost(host: string): string | null {
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return null;
  }
}

/** Host headers that are listen addresses, not browser-reachable origins. */
function usablePublicHost(host: string | null): string | null {
  if (!host) {
    return null;
  }
  const hostname = hostnameFromHost(host);
  if (!hostname || isBindHostname(hostname)) {
    return null;
  }
  return host;
}

function publicProtocol(headers: Headers, fallbackProtocol: string): string {
  const proto = firstHeader(headers, "x-forwarded-proto")?.toLowerCase();
  if (proto === "http" || proto === "https") {
    return proto;
  }
  return fallbackProtocol.replace(/:$/, "");
}

/**
 * Rebuild the browser-facing request URL when Next.js reports a bind address
 * (`HOSTNAME=0.0.0.0`). Prefer `x-forwarded-host` when it is not a bind address.
 */
export function publicRequestUrl(request: Request): URL {
  const url = new URL(request.url);
  const forwardedHost = usablePublicHost(
    firstHeader(request.headers, "x-forwarded-host")
  );
  const hostHeader = usablePublicHost(firstHeader(request.headers, "host"));
  const publicHost =
    forwardedHost ?? (isBindHostname(url.hostname) ? hostHeader : null);

  if (!publicHost) {
    return url;
  }

  // Reconstruct rather than mutate `.host` — Node keeps the previous port
  // (e.g. `:3000`) when the forwarded host has none.
  try {
    const protocol = publicProtocol(request.headers, url.protocol);
    return new URL(
      `${protocol}://${publicHost}${url.pathname}${url.search}${url.hash}`
    );
  } catch {
    return url;
  }
}

/** Pathname+search for guest `redirectUrl`; relative only, never `//`. */
export function guestReturnPath(request: Request): string {
  try {
    const url = new URL(request.url);
    const path = `${url.pathname}${url.search}`;
    if (path.startsWith("/") && !path.startsWith("//")) {
      return path;
    }
  } catch {
    // Unparseable request URL — fall back to home.
  }
  return "/";
}

/**
 * Allow relative paths (not `//`) and absolute URLs whose origin matches the
 * public request origin. Bind-address origins are never safe redirect targets.
 */
export function isSafeRedirectUrl(
  redirectUrl: string,
  request: Request
): boolean {
  if (redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
    return true;
  }

  try {
    const redirectOrigin = new URL(redirectUrl);
    if (isBindHostname(redirectOrigin.hostname)) {
      return false;
    }

    const publicOrigin = publicRequestUrl(request);
    if (isBindHostname(publicOrigin.hostname)) {
      return false;
    }

    return redirectOrigin.origin === publicOrigin.origin;
  } catch {
    return false;
  }
}
