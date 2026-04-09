"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = "idle" | "loading" | "error";

export default function AdminLoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setError(payload?.error ?? "Não foi possível entrar.");
      return;
    }

    router.push("/area-reservada");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40">
          Utilizador
        </label>
        <input
          type="text"
          value={form.username}
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          className="w-full border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary-container"
          placeholder="admin"
          autoComplete="username"
        />
      </div>

      <div>
        <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40">
          Palavra-passe
        </label>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          className="w-full border border-outline-variant/20 bg-surface-container-low px-5 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary-container"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {error ? <p className="font-body text-sm text-error">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-primary-container px-6 py-4 font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-primary transition-all duration-200 hover:shadow-[0_0_40px_-8px_rgba(195,244,0,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "loading" ? "A entrar..." : "Entrar na área reservada"}
      </button>
    </form>
  );
}
