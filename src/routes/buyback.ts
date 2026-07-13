import { createFileRoute } from "@tanstack/react-router";
import html from "../html/buyback.html?raw";

export const Route = createFileRoute("/buyback")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
