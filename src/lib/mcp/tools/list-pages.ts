import { defineTool } from "@lovable.dev/mcp-js";

const PAGES: { path: string; title: string; description: string }[] = [
  { path: "/", title: "Home", description: "GSX overview and product marketing home page." },
  { path: "/buyback", title: "Buyback", description: "Buyback program for phones and devices." },
  { path: "/customer-buyback-template", title: "Customer Buyback Template", description: "Template flow for customer-initiated buybacks." },
  { path: "/flow", title: "Flow", description: "GSX Flow product page." },
  { path: "/integrations", title: "Integrations", description: "Integrations catalog and details." },
  { path: "/phone-check", title: "Phone Check", description: "Device diagnostics and phone-check tooling." },
  { path: "/pricing", title: "Pricing", description: "GSX pricing and plans." },
  { path: "/provenance", title: "Provenance", description: "Provenance / device history product page." },
  { path: "/pulse", title: "Pulse", description: "GSX Pulse product page." },
  { path: "/refurbishers", title: "Refurbishers", description: "Solutions for refurbishers." },
  { path: "/retail", title: "Retail", description: "Solutions for retail." },
  { path: "/sell", title: "Sell", description: "Selling flow / merchant page." },
  { path: "/stockroom", title: "Stockroom", description: "Stockroom / inventory product page." },
  { path: "/enterprise", title: "Enterprise", description: "Enterprise overview." },
  { path: "/enterprise/pricer", title: "Enterprise Pricer", description: "Enterprise pricing tool." },
  { path: "/enterprise/contact", title: "Enterprise Contact", description: "Enterprise contact form." },
];

export default defineTool({
  name: "list_pages",
  title: "List site pages",
  description: "List all marketing/product pages available on the GSX site with their paths and short descriptions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(PAGES, null, 2) }],
      structuredContent: { pages: PAGES },
    };
  },
});
