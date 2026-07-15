import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listPagesTool from "./tools/list-pages";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "gsx-mcp",
  title: "GSX",
  version: "0.1.0",
  instructions:
    "Tools for the GSX app. Use `whoami` to verify the signed-in user and `list_pages` to enumerate the site's product pages.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listPagesTool],
});
