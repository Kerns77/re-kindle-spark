import { createFileRoute } from "@tanstack/react-router";
import html from "../html/stockroom.html?raw";

export const Route = createFileRoute("/stockroom")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
