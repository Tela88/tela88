import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const admin = await getAuthenticatedAdmin();

  if (admin) {
    redirect("/area-reservada");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface pt-36">
        <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 pb-24 md:px-24">
          <div className="max-w-xl">
            <span className="mb-5 block font-label text-xs uppercase tracking-[0.25em] text-primary-container">
              Área Reservada
            </span>
            <h1 className="font-headline text-5xl font-bold tracking-[-0.04em] text-on-surface md:text-6xl">
              Acesso aos pedidos de consultoria
            </h1>
            <p className="mt-5 max-w-lg font-body text-lg leading-relaxed text-on-surface/55">
              Entra com as credenciais da Tela 88 para veres todos os pedidos recebidos no site.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,0.7fr)]">
            <div className="border border-outline-variant/20 bg-surface-container-low p-8 md:p-10">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                O que tens aqui
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "Lista cronológica dos pedidos de consultoria gratuita",
                  "Resumo rápido por prioridade principal e dados do lead",
                  "Base pronta para evoluir depois para CRM ou base de dados",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-container" />
                    <p className="font-body text-sm leading-relaxed text-on-surface/60">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-outline-variant/20 bg-surface-container p-8 md:p-10">
              <AdminLoginForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
