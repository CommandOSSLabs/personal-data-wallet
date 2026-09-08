import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MemWalSession } from "../auth.js";
import { wrapTool } from "./util.js";

const INPUT = {
    namespace: z.string().optional(),
} as const;

export function registerListArtifactsTool(server: McpServer, session: MemWalSession): void {
    server.tool(
        "memwal_list_artifacts",
        "List encrypted artifacts in a namespace (filename, mime, size, status). Does not return file bytes.",
        INPUT,
        wrapTool<{ namespace?: string }>(async ({ namespace }) => {
            const result = await session.memwal.listArtifacts(namespace);
            const lines = result.artifacts.map(
                (row) =>
                    `${row.artifact_id}  ${row.status}  ${row.filename}  ${row.mime_type}  ${row.byte_size}B  source=${row.source}`,
            );
            return {
                content: [
                    {
                        type: "text",
                        text:
                            lines.length === 0
                                ? "No artifacts in this namespace."
                                : lines.join("\n"),
                    },
                ],
            };
        }),
    );
}
