"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

const dashboardItems = [
  { id: "tasks", label: "Tarefas" },
  { id: "my-zone", label: "Minha Zona" },
  { id: "services", label: "Servicos" },
  { id: "clients", label: "Clientes" },
  { id: "meetings", label: "Reunioes" },
  { id: "pending", label: "Pedidos pendentes" },
  { id: "overview", label: "Painel geral" },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "tasks";
  const isClientPage = pathname.startsWith("/area-reservada/clientes/");

  return (
    <aside className="flex min-h-screen flex-col border-r border-outline-variant/15 bg-surface-container-low px-4 py-6">
      <div className="border-b border-outline-variant/12 pb-5">
        <p className="font-label text-[10px] uppercase tracking-[0.28em] text-primary-container">
          Tela 88
        </p>
        <h2 className="mt-3 font-headline text-2xl font-bold text-on-surface">Admin Dashboard</h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/45">
          Tarefas, servicos, clientes, reunioes e pipeline comercial.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {dashboardItems.map((item) => {
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
