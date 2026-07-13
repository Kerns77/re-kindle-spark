import { createFileRoute } from "@tanstack/react-router";
import html from "../html/sell.html?raw";

export const Route = createFileRoute("/sell")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
