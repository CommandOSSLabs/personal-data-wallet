import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MemWalSession } from "../auth.js";
import { TOOL_METADATA } from "./annotations.js";
import { wrapTool } from "./util.js";

const RESTORE_INPUT = {
    namespace: z
        .string()
        .min(1)
        .describe("Namespace bucket to restore. Server re-indexes every blob in this namespace."),
    limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .describe("Max number of memories to re-index (1-100)."),
} as const;

/** Sidecar `/walrus/query-blobs` cap is `min(limit*5, 100)`; raising `limit` expands it only while `limit < 20`. */
const SIDECAR_CAP_SATURATES_AT_LIMIT = 20;

/**
 * memwal_restore — re-index a namespace by re-downloading every blob from
 * Walrus, SEAL-decrypting, and re-embedding into the relayer's vector store.
 *
 * Use when: the user's local search index is empty / corrupted, or when
 * switching servers. After restore, `memwal_recall` returns fresh results.
 * The tool returns counts and the API's truncation signal; it does NOT
 * stream back the decrypted memory texts.
 */
export function formatRestoreResult(
    result: {
        namespace: string;
        total: number;
        restored: number;
        skipped: number;
        truncated?: boolean;
        /**
         * Relayer breakdown of `skipped` (WALM-385). Reaches us because
         * `MemWal.restore` spreads the whole response body, so unknown fields
         * survive even though the SDK's `RestoreResult` does not declare this
         * one yet — surfacing it in the SDK/Python types is a tracked
         * follow-up. Do not "tidy" that spread into a field pick.
         *
         * Optional on purpose: relayers older than WALM-385 omit it, and the
         * wording below must be unchanged for them.
         */
        skipped_reasons?: {
            already_indexed: number;
            permanently_failed: number;
            over_limit: number;
            by_reason?: Record<string, number>;
        };
    },
    limit = 10,
): string {
    const truncated = result.truncated === true;
    const hint = !truncated
        ? "\n  truncated=false is not proof the sidecar saw every blob."
        : limit < SIDECAR_CAP_SATURATES_AT_LIMIT
          ? "\n  ⚠️ More blobs remain to restore — increase limit and call again."
          : "\n  ⚠️ Sidecar cap is saturated — truncation follows this call's missing-blob page; truncated is not completeness (WALM-451 sourceCapped).";

    // A namespace whose blobs all sit in the relayer's permanent-failure
    // cache reports restored=0 skipped=N total=N — the same counts as a
    // namespace that is already fully restored — while recall stays empty.
    // Without this the agent reads "Restore page finished", retries, and
    // gets the identical answer forever (WALM-385).
    const breakdown = result.skipped_reasons;
    const permanentlyFailed = breakdown?.permanently_failed ?? 0;
    const overLimit = breakdown?.over_limit ?? 0;
    // Only call the restore blocked when no skipped blob is merely deferred
    // past `limit`. `over_limit > 0` means the next call provably makes
    // progress, and a single permanently-failed blob must not suppress that
    // retry signal: under the GH #501 threat model anyone can transfer one
    // foreign blob into the owner's address, it fails SEAL decrypt once and
    // stays negative-cached forever, so `permanently_failed >= 1` is a
    // permanent, attacker-reachable state for an otherwise healthy
    // namespace. Gating on it alone would tell agents to stop paging a
    // namespace that is 99% restorable — the mirror image of the WALM-431 /
    // GH #762 retry loop.
    const blocked = permanentlyFailed > 0 && overLimit === 0;
    const headline = blocked
        ? "Restore blocked"
        : truncated
          ? "Restore partially complete"
          : "Restore page finished";

    let detail = "";
    if (breakdown && result.skipped > 0) {
        detail +=
            `\n  skipped breakdown: already_indexed=${breakdown.already_indexed}` +
            `  permanently_failed=${permanentlyFailed}  over_limit=${breakdown.over_limit}`;
    }
    if (permanentlyFailed > 0) {
        // Sorted so the line is deterministic regardless of JSON key order.
        const reasons = Object.entries(breakdown?.by_reason ?? {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([reason, count]) => `${reason}=${count}`)
            .join(", ");
        detail +=
            `\n  ⚠️ ${permanentlyFailed} blob(s) permanently failed to restore` +
            (reasons ? ` (${reasons})` : "") +
            " — retrying or raising limit will NOT recover them; the relayer never re-attempts a" +
            " blob it has recorded as permanently failed." +
            (blocked
                ? " If recall is empty for this namespace, do not loop: report it, as the blobs" +
                  " exist on chain but the relayer cannot decrypt them (WALM-385)."
                : ` The other ${overLimit} skipped blob(s) are only over_limit and DO come back —` +
                  " keep calling with a higher limit until over_limit reaches 0 (WALM-385).");
    }

    return (
        `${headline} for namespace "${result.namespace}":\n` +
        `  total=${result.total}  restored=${result.restored}  skipped=${result.skipped}  truncated=${truncated}` +
        detail +
        hint
    );
}

export function registerRestoreTool(
    server: McpServer,
    session: MemWalSession
): void {
    server.registerTool(
        "memwal_restore",
        {
            ...TOOL_METADATA.memwal_restore,
            description:
                "Recovery tool. Re-index a namespace from Walrus blobs back into the relayer's search index — use when memwal_recall unexpectedly returns nothing even though facts were saved before (e.g. on a new machine, a fresh relayer, or after switching servers). Returns counts plus truncated status — does not return memory texts. truncated=true is known-retryable-incomplete: raising limit expands the sidecar cap only while limit < 20; after the cap saturates, truncation follows this call's missing-blob page. truncated=false is not completeness; WALM-451 will add sourceCapped. skipped_reasons explains the skipped count: permanently_failed blobs can never be restored, but keep paging while over_limit is non-zero; stop retrying and report it only once over_limit is 0 and permanently_failed is not. Call memwal_recall afterwards to query the rebuilt index.",
            inputSchema: RESTORE_INPUT,
        },
        wrapTool<{ namespace: string; limit: number }>(session, "memwal_restore", async ({ namespace, limit }) => {
            const result = await session.memwal.restore(namespace, limit);
            return {
                content: [
                    {
                        type: "text",
                        text: formatRestoreResult(result, limit),
                    },
                ],
            };
        })
    );
}
