import { createFileRoute } from "@tanstack/react-router";
import html from "../html/customer-buyback-template.html?raw";

export const Route = createFileRoute("/customer-buyback-template")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
