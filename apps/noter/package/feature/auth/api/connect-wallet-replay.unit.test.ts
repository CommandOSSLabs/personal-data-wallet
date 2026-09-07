import { beforeEach, describe, expect, it, vi } from "vitest";

// Replay-protection tests for the Sui-wallet sign-in path. These exercise the
// REAL authRouter procedures via createCaller, asserting the route:
//   - accepts only a server-issued challenge, so the caller can no longer pick
//     the message it signs;
//   - consumes that challenge, so replaying the same {challengeId, signature}
//     is UNAUTHORIZED and mints exactly one 24-hour wallet_sessions row;
//   - fails closed (SERVICE_UNAVAILABLE) when the challenge store is down.
// The service + challenge layers are mocked so no DB/Redis/crypto is needed; the
// single-use semantics of the store itself are covered by
// ../lib/enoki-challenge.unit.test.ts.

vi.mock("server-only", () => ({}));

const ADDR = `0x${"a".repeat(64)}`;
const CHALLENGE_ID = "challenge-1";
const SIGNATURE = "wallet-signature";

// Service mock: the wallet upsert resolves to a stub user.
const upsertWalletUser = vi.fn(async () => ({ id: "user-1", suiAddress: ADDR }));

vi.mock("../domain/service", () => ({
  upsertWalletUser,
  toSafeUser: (u: unknown) => u,
  DelegateCredentialConflictError: class extends Error {},
}));

// Challenge mock mirroring the real GETDEL contract: a challenge verifies at
// most once, for the purpose and address it was issued under.
const issuedChallenges = new Set<string>();
const verifyAndConsumeEnokiChallenge = vi.fn(
  async ({
    challengeId,
    purpose,
  }: {
    rawAddress: string;
    challengeId: string;
    signature: string;
    purpose: string;
  }) => {
    if (purpose !== "signin") return false;
    if (!issuedChallenges.has(challengeId)) return false;
    issuedChallenges.delete(challengeId); // atomic consume
    return true;
  }
);
const issueEnokiChallenge = vi.fn(async () => ({
  challengeId: CHALLENGE_ID,
  message: "Sign in to Walrus Memory Noter",
}));

vi.mock("../lib/enoki-challenge", () => ({
  issueEnokiChallenge,
  verifyAndConsumeEnokiChallenge,
}));

const SharedRedisUnavailableError = class extends Error {};
vi.mock("@/shared/lib/shared-redis", () => ({ SharedRedisUnavailableError }));

// Session inserts go through ctx.db.insert(...).values(...); capture each row so
// the number of sessions created — and what was written — can be asserted.
type SessionRow = { walletAddress: string; signedMessage: string };
const insertedRows: SessionRow[] = [];
const insertValues = vi.fn(async (row: SessionRow) => {
  insertedRows.push(row);
});
const db = { insert: vi.fn(() => ({ values: insertValues })) };

async function caller() {
  const { authRouter } = await import("./route");
  // Minimal ctx matching the tRPC Context shape used by these procedures.
  const ctx = {
    db,
    request: new Request("http://localhost/api/trpc/auth"),
    userId: null,
  };
  return authRouter.createCaller(ctx as never);
}

const connectInput = {
  walletType: "slush" as const,
  address: ADDR,
  challengeId: CHALLENGE_ID,
  signature: SIGNATURE,
};

beforeEach(() => {
  vi.clearAllMocks();
  insertedRows.length = 0;
  issuedChallenges.clear();
  issuedChallenges.add(CHALLENGE_ID);
});

describe("connectWallet — challenge replay protection", () => {
  it("rejects a replayed {challengeId, signature} and creates only one session", async () => {
    const c = await caller();

    const first = await c.connectWallet(connectInput);
    expect(first.sessionId).toBeTruthy();
    expect(insertValues).toHaveBeenCalledTimes(1);

    // Same triple again: the challenge is spent, so this must not mint a
    // second 24-hour session.
    await expect(c.connectWallet(connectInput)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(insertValues).toHaveBeenCalledTimes(1);
  });

  it("verifies the challenge under the signin purpose and the normalized address", async () => {
    const c = await caller();
    await c.connectWallet(connectInput);

    expect(verifyAndConsumeEnokiChallenge).toHaveBeenCalledWith({
      rawAddress: ADDR,
      challengeId: CHALLENGE_ID,
      signature: SIGNATURE,
      purpose: "signin",
    });
  });

  it("rejects an unknown challengeId with UNAUTHORIZED and creates no session", async () => {
    const c = await caller();
    await expect(
      c.connectWallet({ ...connectInput, challengeId: "never-issued" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(upsertWalletUser).not.toHaveBeenCalled();
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("fails closed with SERVICE_UNAVAILABLE when the challenge store is down", async () => {
    verifyAndConsumeEnokiChallenge.mockRejectedValueOnce(
      new SharedRedisUnavailableError()
    );
    const c = await caller();
    await expect(c.connectWallet(connectInput)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("does not persist a caller-chosen message as the signed credential", async () => {
    const c = await caller();
    await c.connectWallet(connectInput);

    // The consumed challenge id, never a caller-supplied string.
    expect(insertedRows[0].signedMessage).toBe(
      `wallet-challenge:${CHALLENGE_ID}`
    );
    expect(insertedRows[0].walletAddress).toBe(ADDR);
  });
});

describe("connectWallet — input contract", () => {
  it("rejects the legacy {message, signature} shape that carries no challengeId", async () => {
    const c = await caller();
    await expect(
      c.connectWallet({
        walletType: "slush",
        address: ADDR,
        signature: SIGNATURE,
        message: "Sign this message to authenticate with Noter",
      } as never)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(verifyAndConsumeEnokiChallenge).not.toHaveBeenCalled();
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects a malformed address before doing any challenge work", async () => {
    const c = await caller();
    await expect(
      c.connectWallet({ ...connectInput, address: "0xdeadbeef" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(verifyAndConsumeEnokiChallenge).not.toHaveBeenCalled();
  });
});

describe("issueWalletChallenge", () => {
  it("issues a signin-purpose challenge for the requested address", async () => {
    const c = await caller();
    const result = await c.issueWalletChallenge({ address: ADDR });

    expect(result).toEqual({
      challengeId: CHALLENGE_ID,
      message: "Sign in to Walrus Memory Noter",
    });
    expect(issueEnokiChallenge).toHaveBeenCalledWith(ADDR, "signin");
  });

  it("fails closed with SERVICE_UNAVAILABLE when the challenge store is down", async () => {
    issueEnokiChallenge.mockRejectedValueOnce(
      new SharedRedisUnavailableError()
    );
    const c = await caller();
    await expect(
      c.issueWalletChallenge({ address: ADDR })
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });
});
