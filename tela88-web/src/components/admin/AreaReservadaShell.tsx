"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { AuthenticatedUser } from "@/lib/crm-types";

export default function AreaReservadaShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthenticatedUser | null;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/area-reservada/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const mobileNavItems = [
    ["tasks", "Tarefas"],
    ["my-zone", "Minha Zona"],
    ["professionals", "Profissionais"],
    ["services", "Servicos"],
    ["clients", "Clientes"],
    ["meetings", "Reunioes"],
    ["pending", "Pedidos"],
    ["overview", "Painel"],
  ].filter(([tab]) =>
    initialUser?.role === "admin"
      ? true
      : initialUser?.role === "secretaria"
        ? tab !== "services" && tab !== "overview"
        : tab !== "services" && tab !== "overview" && tab !== "professionals",
  );

  return (
    <div className="min-h-screen bg-surface xl:grid xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden xl:block">
        <Suspense
          fallback={
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
            </aside>
          }
        >
          <AdminSidebar initialUser={initialUser} />
        </Suspense>
      </div>
      <div className="xl:min-h-screen">
        <div className="border-b border-outline-variant/12 bg-surface-container-low px-6 py-4 xl:hidden">
          <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">Tela 88</p>
          <p className="mt-2 font-headline text-lg font-bold text-on-surface">Admin Dashboard</p>
          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {mobileNavItems.map(([tab, label]) => (
                <Link
                  key={tab}
                  href={`/area-reservada?tab=${tab}`}
                  className="whitespace-nowrap border border-outline-variant/15 bg-surface px-4 py-2 font-body text-sm text-on-surface/70"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
