import ClientManagementForm from "@/components/admin/ClientManagementForm";
import ClientTaskBoard from "@/components/admin/ClientTaskBoard";
import TaskCreateForm from "@/components/admin/TaskCreateForm";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getClientById, getClients, getTasks, getTeamMembers } from "@/lib/crm-store";
import { focusAreaLabels, getServiceLabel, serviceDeliveryStageLabels } from "@/lib/service-catalog";
import { notFound, redirect } from "next/navigation";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/area-reservada/login");
  }

  const { id } = await params;
  const client = await getClientById(id);
  const [teamMembers, tasks, clients] = await Promise.all([getTeamMembers(), getTasks(), getClients()]);

  if (!client) {
    notFound();
  }

  const clientTasks = tasks.filter((task) => task.clientId === client.id);

  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10">
        <div className="mb-10 border-b border-outline-variant/15 pb-8">
          <span className="mb-5 block font-label text-xs uppercase tracking-[0.25em] text-primary-container">
            Gestao individual de cliente
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-5xl font-bold tracking-[-0.04em] text-on-surface md:text-6xl">
              {client.company || client.name}
            </h1>
            <span className="border border-primary-container/25 px-3 py-1 font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
              {focusAreaLabels[client.focusArea] ?? client.focusArea}
            </span>
          </div>
          <p className="mt-5 max-w-3xl font-body text-lg leading-relaxed text-on-surface/55">
            Aqui podes gerir o pack de servicos, o estado no kaban, notas internas e a proxima reuniao.
          </p>
        </div>

        <ClientManagementForm client={client} />

        <section className="mt-10 space-y-8">
          <div className="border-t border-outline-variant/15 pt-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Operacao do cliente</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                Tarefas ligadas ao pack
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(320px,0.42fr)_minmax(0,1fr)]">
              <TaskCreateForm teamMembers={teamMembers} clients={clients} defaultClientId={client.id} />

              <div className="border border-outline-variant/15 bg-surface-container-low p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Resumo do pack</h3>
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
                    {client.services.length} servicos
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {client.services.length === 0 ? (
                    <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center md:col-span-2">
                      <p className="font-body text-sm text-on-surface/45">
                        Ainda nao existem servicos associados a este cliente.
                      </p>
                    </div>
                  ) : (
                    client.services.map((service) => (
                      <div key={service.id} className="border border-outline-variant/12 bg-surface p-4">
                        <p className="font-headline text-lg font-bold text-on-surface">
                          {getServiceLabel(service.id)}
                        </p>
                        <p className="mt-2 font-body text-sm text-on-surface/55">
                          {serviceDeliveryStageLabels[service.stage]}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Tarefas do cliente</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                Arrasta entre colunas e organiza a operacao
              </span>
            </div>

            <ClientTaskBoard
              clientId={client.id}
              tasks={clientTasks}
              teamMembers={teamMembers}
              clients={clients}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
