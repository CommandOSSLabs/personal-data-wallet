import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

// createContext is where the malformed-header guard lives (issue #779). A
// non-uuid x-session-id used to reach eq(walletSessions.id, …) and make
// Postgres raise. The route-layer session-binding tests inject ctx.sessionId
// already parsed, so they cannot catch a regression here. These call the real
// createContext with the db mocked and assert the lookup is skipped unless the
// header is a uuid.

const VALID_SESSION = "0192f0a0-0000-7000-8000-000000000001";
const USER_ID = "user-1";

const { select, from, where, limit } = vi.hoisted(() => ({
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("@/shared/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => select(...args),
  },
}));

function requestOpts(headers?: HeadersInit): FetchCreateContextFnOptions {
  return {
    req: new Request("http://localhost/api/trpc", { headers }),
    resHeaders: new Headers(),
    info: {} as FetchCreateContextFnOptions["info"],
  };
}

async function load() {
  return import("./init");
}

beforeEach(() => {
  vi.clearAllMocks();
  select.mockReturnValue({ from });
  from.mockReturnValue({ where });
  where.mockReturnValue({ limit });
  limit.mockResolvedValue([]);
});

describe("createContext — x-session-id UUID guard", () => {
  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["non-uuid", "not-a-uuid"],
  ] as const)(
    "treats a %s header as no credential and skips the session lookup",
    async (_label, header) => {
      const { createContext } = await load();
      const ctx = await createContext(
        requestOpts(
          header === undefined ? undefined : { "x-session-id": header }
        )
      );

      expect(ctx.sessionId).toBeNull();
      expect(ctx.userId).toBeNull();
      expect(select).not.toHaveBeenCalled();
    }
  );

  it("looks up an expired uuid session but does not authenticate it", async () => {
    limit.mockResolvedValueOnce([
      {
        id: VALID_SESSION,
        userId: USER_ID,
        expiresAt: new Date(Date.now() - 60_000),
      },
    ]);
    const { createContext } = await load();
    const ctx = await createContext(
      requestOpts({ "x-session-id": VALID_SESSION })
    );

    expect(select).toHaveBeenCalledOnce();
    expect(ctx.sessionId).toBe(VALID_SESSION);
    expect(ctx.userId).toBeNull();
  });

  it("authenticates a valid uuid session", async () => {
    limit.mockResolvedValueOnce([
      {
        id: VALID_SESSION,
        userId: USER_ID,
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
    const { createContext } = await load();
    const ctx = await createContext(
      requestOpts({ "x-session-id": VALID_SESSION })
    );

    expect(select).toHaveBeenCalledOnce();
    expect(ctx.sessionId).toBe(VALID_SESSION);
    expect(ctx.userId).toBe(USER_ID);
  });
});
