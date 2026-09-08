import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MemWalSession } from "../auth.js";
import { wrapTool } from "./util.js";

const INPUT = {
    filename: z.string().min(1).describe("Original filename, including extension."),
    bytes_b64: z
        .string()
        .min(1)
        .describe("Standard base64 of the file bytes. Do not summarize or embed the file."),
    mime_type: z.string().optional().describe("IANA MIME type, e.g. application/pdf."),
    source: z
        .string()
        .optional()
        .describe("upload | attachment | mcp | framework:<name>. Defaults to mcp."),
    namespace: z.string().optional(),
} as const;

export function registerStoreArtifactTool(server: McpServer, session: MemWalSession): void {
    server.tool(
        "memwal_store_artifact",
        "Archive a file or framework output into Walrus Memory as an encrypted artifact. Use when the user attaches a file, or when a run produces JSON/logs you should keep. Does not embed the file for semantic recall — store a short text fact with remember if you also need retrieval. Pass the raw file as standard base64.",
        INPUT,
        wrapTool<{
            filename: string;
            bytes_b64: string;
            mime_type?: string;
            source?: string;
            namespace?: string;
        }>(async ({ filename, bytes_b64, mime_type, source, namespace }) => {
            const bytes = Buffer.from(bytes_b64, "base64");
            const stored = await session.memwal.storeArtifactAndWait({
                filename,
                bytes,
                mimeType: mime_type,
                source: source ?? "mcp",
                namespace,
            });
            return {
                content: [
                    {
                        type: "text",
                        text:
                            `Stored artifact ${stored.artifact_id}\n` +
                            `filename=${stored.filename} mime=${stored.mime_type} ` +
                            `bytes=${stored.byte_size} status=${stored.status} ` +
                            `blob_id=${stored.blob_id ?? ""}\n` +
                            `Not embedded. Pin a fact with memwal_remember and source_artifact_id if needed.`,
                    },
                ],
            };
        }),
    );
}
