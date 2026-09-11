/**
 * AUTH API INPUT SCHEMAS
 * Zod validation for auth API routes
 *
 * Following type-flow.md:
 * - Derive from DB insert schemas where fields map to tables
 * - Use standalone schemas for flow-specific fields (e.g., jwt, redirectUri)
 */

import { z } from "zod";
import { walletSessionInsertSchema } from "@/shared/db/type";

// Session id is deliberately absent here: getSession and logout take it from the
// x-session-id header via the tRPC context, so it can never be supplied as input.

// ═══════════════════════════════════════════════════════════════
// Shared Field Schemas
// ═══════════════════════════════════════════════════════════════

// Canonical Sui address: 0x + 64 hex. Reject malformed input at the boundary so
// it never reaches normalizeSuiAddress (which would silently left-pad garbage
// into a valid-looking-but-wrong address) or a DB lookup.
export const suiAddressSchema = z
  .string()
  .regex(/^0x[0-9a-f]{64}$/i, "Invalid Sui address");

// ═══════════════════════════════════════════════════════════════
// Wallet Auth Inputs
// ═══════════════════════════════════════════════════════════════

/**
 * Input for wallet authentication
 * Derives field types from walletSessionInsertSchema
 * Uses client-friendly names (address instead of walletAddress)
 *
 * The caller does NOT supply the message that was signed: it proves ownership of
 * `address` by signing a server-issued single-use challenge (issueWalletChallenge)
 * and returning that challenge's id. Accepting a caller-chosen message would let
 * anyone replay one captured {message, signature, address} triple into an
 * unlimited number of 24-hour sessions.
 */
export const connectWalletInput = z.object({
  walletType: walletSessionInsertSchema.shape.walletType.pipe(z.enum(["slush"])), // Subset validation
  address: suiAddressSchema, // Maps to walletAddress in DB
  challengeId: z.string().min(1),
  signature: z.string().min(1),
});

export type ConnectWalletInput = z.infer<typeof connectWalletInput>;
