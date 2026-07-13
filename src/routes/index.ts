import { createFileRoute } from "@tanstack/react-router";
import html from "../html/index.html?raw";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
