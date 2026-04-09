"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/area-reservada/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="border border-outline-variant/30 px-4 py-2 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/60 transition-colors hover:border-primary-container hover:text-primary-container"
    >
      Terminar sessão
    </button>
  );
}
