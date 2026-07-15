import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthOAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{
    data: {
      client?: { name?: string } | null;
      redirect_url?: string;
      redirect_to?: string;
      scope?: string;
    } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function oauth(): AuthOAuthNamespace {
  return (supabase.auth as unknown as { oauth: AuthOAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId =
      new URLSearchParams(location.search).get("authorization_id") ?? "";
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      <p style={{ color: "#c00" }}>
        Could not load this authorization request: {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f7",
        padding: 24,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          border: "1px solid #e5e5ea",
          borderRadius: 22,
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 500, letterSpacing: -0.5, margin: 0 }}>
          Connect {clientName} to GSX
        </h1>
        <p style={{ marginTop: 12, color: "#3a3a3c", fontSize: 15, lineHeight: 1.5 }}>
          This lets {clientName} use this app as you. It can call the app's enabled tools while
          you are signed in. This does not bypass GSX's permissions or backend policies.
        </p>

        {details?.scope && (
          <p style={{ marginTop: 16, fontSize: 13, color: "#6e6e73" }}>
            Requested scope: <code>{details.scope}</code>
          </p>
        )}

        {error && (
          <p role="alert" style={{ marginTop: 16, color: "#c00", fontSize: 14 }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 28, display: "flex", gap: 12, flexDirection: "column" }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            style={{
              padding: "12px 16px",
              background: "#0071e3",
              color: "#fff",
              border: "none",
              borderRadius: 980,
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            style={{
              padding: "12px 16px",
              background: "#fff",
              color: "#1d1d1f",
              border: "1px solid #d2d2d7",
              borderRadius: 980,
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel connection
          </button>
        </div>
      </div>
    </main>
  );
}
