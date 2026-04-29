"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import type { AuthenticatedUser } from "@/lib/crm-types";

const dashboardItems = [
  { id: "tasks", label: "Tarefas" },
  { id: "my-zone", label: "Minha Zona" },
  { id: "professionals", label: "Profissionais" },
  { id: "services", label: "Servicos" },
  { id: "clients", label: "Clientes" },
  { id: "meetings", label: "Reunioes" },
  { id: "pending", label: "Pedidos pendentes" },
  { id: "overview", label: "Painel geral" },
] as const;

export default function AdminSidebar({ initialUser }: { initialUser: AuthenticatedUser | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "tasks";
  const isClientPage = pathname.startsWith("/area-reservada/clientes/");
  const visibleItems = dashboardItems.filter((item) =>
    initialUser?.role === "admin"
      ? true
      : initialUser?.role === "secretaria"
        ? item.id !== "services" && item.id !== "overview"
        : item.id !== "services" && item.id !== "overview" && item.id !== "professionals",
  );

  return (
    <aside className="sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-outline-variant/15 bg-surface-container-low px-4 py-6">
      <div className="border-b border-outline-variant/12 pb-5">
        <p className="font-label text-[10px] uppercase tracking-[0.28em] text-primary-container">
          Tela 88
        </p>
        <h2 className="mt-3 font-headline text-2xl font-bold text-on-surface">Admin Dashboard</h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/45">
          Tarefas, servicos, clientes, reunioes e pipeline comercial.
        </p>
      </div>

      {initialUser ? (
        <div className="mt-5 border-b border-outline-variant/12 pb-5">
          <div className="flex items-center gap-3">
            {initialUser.avatarUrl ? (
              <img
                src={initialUser.avatarUrl}
                alt={initialUser.name}
                className="h-11 w-11 rounded-full border border-outline-variant/20 object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/20 bg-surface text-sm font-bold text-primary-container">
                {initialUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-headline text-base font-bold text-on-surface">{initialUser.name}</p>
              <p className="truncate font-body text-sm text-on-surface/55">
                {initialUser.functionRole || initialUser.role}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <Link
          href="/"
          className="flex items-center justify-between border border-primary-container/30 bg-primary-container/8 px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.14em] text-primary-container transition-colors hover:bg-primary-container hover:text-on-primary"
        >
          <span>Ver site</span>
          <span aria-hidden="true" className="text-base leading-none">
            ↗
          </span>
        </Link>
      </div>

      <nav className="mt-6 space-y-2">
        {visibleItems.map((item) => {
          const active = !isClientPage && currentTab === item.id;

          return (
            <Link
              key={item.id}
              href={`/area-reservada?tab=${item.id}`}
              className={`block border px-4 py-3 font-body text-sm transition-colors ${
                active
                  ? "border-primary-container bg-primary-container text-on-primary"
                  : "border-outline-variant/15 bg-surface text-on-surface/68 hover:border-primary-container"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <LogoutButton />
      </div>
    </aside>
  );
}
