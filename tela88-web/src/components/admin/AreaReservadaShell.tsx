"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AreaReservadaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/area-reservada/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface xl:grid xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden xl:block">
        <AdminSidebar />
      </div>
      <div className="xl:min-h-screen">
        <div className="border-b border-outline-variant/12 bg-surface-container-low px-6 py-4 xl:hidden">
          <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">Tela 88</p>
          <p className="mt-2 font-headline text-lg font-bold text-on-surface">Admin Dashboard</p>
          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {[
                ["overview", "Painel"],
                ["pending", "Pedidos"],
                ["meetings", "Reuniões"],
                ["clients", "Clientes"],
                ["team", "Equipa"],
              ].map(([tab, label]) => (
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
