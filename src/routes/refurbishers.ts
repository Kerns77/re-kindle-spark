import { createFileRoute } from "@tanstack/react-router";
import html from "../html/refurbishers.html?raw";

export const Route = createFileRoute("/refurbishers")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
