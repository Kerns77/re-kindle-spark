import { createFileRoute } from "@tanstack/react-router";
import html from "../../html/enterprise/contact.html?raw";

export const Route = createFileRoute("/enterprise/contact")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
