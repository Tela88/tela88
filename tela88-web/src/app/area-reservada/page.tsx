import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getCrmDashboardData } from "@/lib/crm-store";
import { redirect } from "next/navigation";

type DashboardTab = "overview" | "pending" | "meetings" | "clients" | "team";

export default async function ReservedAreaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const validTabs = new Set(["overview", "pending", "meetings", "clients", "team"]);
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/area-reservada/login");
  }

  const { requests, clients, teamMembers, tasks } = await getCrmDashboardData();
  const pendingRequests = requests.filter((item) => item.status === "pending");
  const scheduledMeetings = requests.filter((item) => item.status === "agendado");
  const attendedMeetings = requests.filter((item) => item.status === "atendido");
  const clientsFromMeetings = requests.filter((item) => item.status === "cliente");
  const params = await searchParams;
  const activeTab = validTabs.has(params.tab ?? "") ? (params.tab as DashboardTab) : "overview";

  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10">
        <div className="border-b border-outline-variant/15 pb-10">
          <span className="mb-5 block font-label text-xs uppercase tracking-[0.25em] text-primary-container">
            Área Reservada
          </span>
          <h1 className="font-headline text-5xl font-bold tracking-[-0.04em] text-on-surface md:text-6xl">
            Operação comercial e clientes
          </h1>
          <p className="mt-5 max-w-4xl font-body text-lg leading-relaxed text-on-surface/55">
            Sessão iniciada como <span className="text-on-surface">{admin.username}</span>. Os pedidos entram
            como pendentes, podem ser confirmados com data e hora, aparecem na agenda e depois passam para
            cliente com pack de serviços e gestão no kaban.
          </p>
        </div>
        <AdminDashboard
          pendingRequests={pendingRequests}
          scheduledMeetings={scheduledMeetings}
          attendedMeetings={attendedMeetings}
          clientsFromMeetings={clientsFromMeetings}
          clients={clients}
          teamMembers={teamMembers}
          tasks={tasks}
          activeTab={activeTab}
        />
      </section>
    </main>
  );
}
