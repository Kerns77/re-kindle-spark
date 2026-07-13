import { createFileRoute } from "@tanstack/react-router";
import html from "../html/flow.html?raw";

export const Route = createFileRoute("/flow")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
