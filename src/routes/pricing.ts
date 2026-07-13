import { createFileRoute } from "@tanstack/react-router";
import html from "../html/pricing.html?raw";

export const Route = createFileRoute("/pricing")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
