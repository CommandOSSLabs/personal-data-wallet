import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MemWalSession } from "../auth.js";
import { wrapTool } from "./util.js";

const INPUT = {
    artifact_id: z.string().min(1),
} as const;

const TEXT_PREVIEW_BYTES = 4_096;

export function registerGetArtifactTool(server: McpServer, session: MemWalSession): void {
    server.tool(
        "memwal_get_artifact",
        "Fetch one artifact's metadata. For text/json, includes a short plaintext preview. Binary files return metadata only — download via the SDK or Playground.",
        INPUT,
        wrapTool<{ artifact_id: string }>(async ({ artifact_id }) => {
            const row = await session.memwal.getArtifact(artifact_id);
            const header =
                `artifact_id=${row.artifact_id}\n` +
                `status=${row.status} filename=${row.filename} mime=${row.mime_type}\n` +
                `bytes=${row.byte_size} source=${row.source} blob_id=${row.blob_id ?? ""}`;
            let preview = "";
            const mime = row.mime_type || "";
            const isText =
                mime.startsWith("text/") ||
                mime === "application/json" ||
                mime.endsWith("+json") ||
                mime.endsWith("+xml");
            if (row.status === "done" && isText && row.bytes && row.bytes.byteLength > 0) {
                const slice = row.bytes.slice(0, TEXT_PREVIEW_BYTES);
                preview = `\n\npreview:\n${new TextDecoder().decode(slice)}`;
                if (row.bytes.byteLength > TEXT_PREVIEW_BYTES) {
                    preview += `\n… truncated (${row.byte_size} bytes total)`;
                }
            } else if (row.status === "done" && !isText) {
                preview = "\n\nBinary artifact — bytes omitted from MCP. Use the SDK getArtifact() or Playground to download.";
            }
            return {
                content: [{ type: "text", text: header + preview }],
            };
        }),
    );
}
