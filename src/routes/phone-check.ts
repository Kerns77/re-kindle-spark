import { createFileRoute } from "@tanstack/react-router";
import html from "../html/phone-check.html?raw";

export const Route = createFileRoute("/phone-check")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
