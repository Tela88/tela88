import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Política de Privacidade — Tela 88",
  description: "Como a Tela 88 recolhe, usa e protege os teus dados.",
};

const sections = [
  {
    title: "Quem somos",
    content:
      "A Tela 88 é uma agência de marketing. Para qualquer questão sobre privacidade, podes escrever para hello@tela88.io.",
  },
  {
    title: "Que dados recolhemos",
    content:
      "Recolhemos apenas o necessário para responder a contactos, prestar serviços e melhorar o website. Isto pode incluir nome, email, empresa e dados básicos de navegação.",
  },
  {
    title: "Como usamos os dados",
    content:
      "Usamos a informação para responder aos teus pedidos, prestar serviços contratados, comunicar contigo e melhorar a nossa operação. Não vendemos dados a terceiros.",
  },
  {
    title: "Os teus direitos",
    content:
      "Podes pedir acesso, correção, apagamento, portabilidade ou limitação do tratamento dos teus dados, dentro dos termos legais aplicáveis.",
  },
  {
    title: "Segurança",
    content:
      "Aplicamos medidas técnicas e organizacionais adequadas para proteger os teus dados contra acesso indevido, perda ou destruição.",
  },
];

export default function PrivacidadePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-primary-container/7 blur-[130px]" />

          <div className="relative mx-auto max-w-[1100px] px-6 md:px-12">
            <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] px-7 py-10 shadow-[0_30px_100px_-60px_rgba(0,0,0,0.85)] backdrop-blur-sm md:px-12 md:py-14">
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-label text-[11px] uppercase tracking-[0.22em] text-primary-container">
                Legal
              </span>
              <h1 className="mt-6 max-w-3xl font-headline text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-on-surface md:text-7xl">
                Política de privacidade, sem rodeios.
              </h1>
              <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-on-surface/60 md:text-xl">
                Explicamos o que recolhemos, porque o fazemos e como podes pedir alterações aos teus dados.
              </p>
              <p className="mt-6 font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                Última atualização: Abril 2026
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-24">
          <div className="mx-auto max-w-[1100px] px-6 md:px-12">
            <div className="mb-6 rounded-[1.75rem] border border-white/8 bg-surface-container-low/80 p-6">
              <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">Resumo</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <p className="font-body text-sm leading-relaxed text-on-surface/58">Recolhemos o mínimo necessário.</p>
                <p className="font-body text-sm leading-relaxed text-on-surface/58">Não vendemos os teus dados.</p>
                <p className="font-body text-sm leading-relaxed text-on-surface/58">Podes pedir acesso, correção ou apagamento.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[1.75rem] border border-white/8 bg-surface-container-low/80 p-7 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.95)] md:p-8"
                >
                  <h2 className="font-headline text-2xl font-bold text-on-surface">{section.title}</h2>
                  <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-on-surface/58">{section.content}</p>
                </article>
              ))}

              <div className="rounded-[1.75rem] border border-primary-container/14 bg-gradient-to-br from-white/[0.04] to-primary-container/[0.03] p-7 md:p-8">
                <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">Contacto</p>
                <p className="mt-3 font-body text-base leading-relaxed text-on-surface/60">
                  Se tiveres dúvidas sobre privacidade, escreve para{" "}
                  <a className="text-primary-container" href="mailto:hello@tela88.io">
                    hello@tela88.io
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
