import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

function isSafeNext(value: string | undefined | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "",
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const next = isSafeNext(search.next) ?? "/";
      throw redirect({ href: next });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const safeNext = isSafeNext(next) ?? "/";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        window.location.href = safeNext;
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [safeNext]);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(safeNext)}` },
          });
    const { data, error } = await fn;
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup" && !data.session) {
      setError("Check your email to confirm your account.");
      return;
    }
    navigate({ href: safeNext });
  }

  async function onGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(safeNext)}`,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message ?? "Google sign-in failed");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          border: "1px solid #e5e5ea",
          borderRadius: 22,
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.5, margin: 0 }}>
          {mode === "signin" ? "Sign in to GSX" : "Create your GSX account"}
        </h1>
        <p style={{ marginTop: 8, color: "#6e6e73", fontSize: 15 }}>
          {mode === "signin"
            ? "Sign in to continue."
            : "Get started with GSX."}
        </p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          style={{
            marginTop: 24,
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #d2d2d7",
            background: "#fff",
            borderRadius: 980,
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0", color: "#86868b", fontSize: 13 }}>
          <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
          or
          <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
        </div>

        <form onSubmit={onEmail} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "12px 14px", border: "1px solid #d2d2d7", borderRadius: 12, fontSize: 15 }}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "12px 14px", border: "1px solid #d2d2d7", borderRadius: 12, fontSize: 15 }}
          />
          {error && (
            <p role="alert" style={{ color: "#c00", fontSize: 13, margin: 0 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
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
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "#6e6e73", textAlign: "center" }}>
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            style={{ background: "none", border: "none", color: "#0071e3", cursor: "pointer", fontSize: 14, padding: 0 }}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
