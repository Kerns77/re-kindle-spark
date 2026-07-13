import { createFileRoute } from "@tanstack/react-router";
import html from "../html/pulse.html?raw";

export const Route = createFileRoute("/pulse")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
