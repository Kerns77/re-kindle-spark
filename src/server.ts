import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function normalizeHtmlResponse(response: Response): Promise<Response> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.clone().text();
  const leakedMarker = "/* Fix: dark CTA blocks were showing dark ink text";
  if (!html.includes(leakedMarker)) return response;

  const ctaFixCss = `.cta-block { background: var(--bg-dark) !important; color: #f5f5f7 !important; }
.cta-block h1, .cta-block h2, .cta-block h3, .cta-block h4 { color: #f5f5f7 !important; }
.cta-block p, .cta-block .sub, .cta-block .lead { color: #a1a1a6 !important; }
.cta-block .eyebrow { color: #2997ff !important; background: transparent !important; }
.cta-block .btn-primary { background: #fff !important; color: #1d1d1f !important; }
.cta-block .btn-primary:hover { background: #f5f5f7 !important; color: #1d1d1f !important; }
.cta-block .btn-secondary { background: transparent !important; color: #f5f5f7 !important; }
.cta-block .btn-secondary:hover { color: #fff !important; }`;

  const leakedBlockPattern = /\/\* Fix: dark CTA blocks were showing dark ink text[\s\S]*?\.cta-block \.btn-secondary:hover \{ color: #fff !important; \}\s*/g;
  const cleanedHtml = html.replace(leakedBlockPattern, "");
  const fixedHtml = cleanedHtml.includes("</head>")
    ? cleanedHtml.replace("</head>", `<style id="cta-contrast-fix">${ctaFixCss}</style></head>`)
    : cleanedHtml;

  return new Response(fixedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      return await normalizeHtmlResponse(normalizedResponse);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
