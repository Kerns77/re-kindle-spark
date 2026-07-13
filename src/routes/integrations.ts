import { createFileRoute } from "@tanstack/react-router";
import html from "../html/integrations.html?raw";

export const Route = createFileRoute("/integrations")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
