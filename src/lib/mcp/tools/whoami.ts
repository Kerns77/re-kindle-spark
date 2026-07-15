import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "whoami",
  title: "Who am I",
  description: "Returns the signed-in user's ID and email for the connected GSX account.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { user_id: ctx.getUserId(), email: ctx.getUserEmail() ?? null },
            null,
            2,
          ),
        },
      ],
    };
  },
});
