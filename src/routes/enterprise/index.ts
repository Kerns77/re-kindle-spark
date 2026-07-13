import { createFileRoute } from "@tanstack/react-router";
import html from "../../html/enterprise/index.html?raw";

export const Route = createFileRoute("/enterprise/")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
