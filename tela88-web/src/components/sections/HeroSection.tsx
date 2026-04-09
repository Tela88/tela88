import Link from "next/link";

const focusAreas = [
  "Visibilidade",
  "Tráfego",
  "Conversão",
  "Retenção",
];

const salesData = [
  { month: "Jan", value: 4200 },
  { month: "Fev", value: 5100 },
  { month: "Mar", value: 6400 },
  { month: "Abr", value: 7900 },
  { month: "Mai", value: 9100 },
  { month: "Jun", value: 11200 },
];

const maxSales = Math.max(...salesData.map((item) => item.value));

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-surface pt-28 pb-20 md:pt-32 md:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(195,244,0,0.14),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(195,244,0,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:96px_96px]" />
      <div className="pointer-events-none absolute left-[6%] top-24 h-72 w-72 rounded-full bg-primary-container/12 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-primary-container/10 blur-[140px]" />

      <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-14 px-6 md:px-24 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7 xl:pr-12">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary-container" />
            <span className="font-label text-[0.72rem] uppercase tracking-[0.28em] text-on-surface/78">
              Agência de Crescimento Digital
            </span>
          </div>

          <h1 className="max-w-[10ch] font-headline text-5xl font-bold leading-[0.9] tracking-[-0.05em] text-on-surface sm:text-6xl md:text-7xl xl:text-[5.5rem]">
            Crescimento digital <br />
            <span className="text-primary-container">com quem executa.</span>
          </h1>

          <p className="mt-8 max-w-[36rem] font-body text-lg leading-[1.75] text-on-surface/68">
            Visibilidade, tráfego, conversão e retenção — quatro áreas, um parceiro
            que executa tudo.
            <br />
            <br />
            Os resultados aparecem nas tuas métricas, não nos nossos relatórios.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/contactos"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary-container px-6 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-on-primary transition-all hover:translate-y-[-1px] hover:shadow-[0_16px_40px_-18px_rgba(195,244,0,0.9)] active:scale-[0.98]"
            >
              Consultoria Gratuita
            </Link>
            <a
              href="#impacto"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-on-surface transition-all hover:bg-white/[0.06] active:scale-[0.98]"
            >
              Ver Resultados
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {focusAreas.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-surface-container-low/70 px-4 py-2 font-label text-[0.72rem] uppercase tracking-[0.18em] text-on-surface/62"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-[30rem]">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md" />
            <div className="absolute -right-5 bottom-16 h-32 w-32 rounded-full border border-primary-container/25 bg-primary-container/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl">
              <div className="rounded-[1.6rem] border border-white/8 bg-[#111111]/90 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="font-label text-[0.68rem] uppercase tracking-[0.28em] text-on-surface/45">
                      Alojamento Local
                    </p>
                    <h2 className="mt-2 font-headline text-2xl font-bold tracking-[-0.04em] text-on-surface">
                      Crescimento de vendas
                    </h2>
                  </div>
                  <div className="rounded-full border border-primary-container/25 bg-primary-container/12 px-3 py-1 font-label text-[0.68rem] uppercase tracking-[0.2em] text-primary-container">
                    6 meses
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-headline text-2xl font-bold text-primary-container">
                      €11.2K
                    </p>
                    <p className="mt-2 font-body text-sm leading-snug text-on-surface/52">
                      vendas em junho
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-headline text-2xl font-bold text-primary-container">
                      82%
                    </p>
                    <p className="mt-2 font-body text-sm leading-snug text-on-surface/52">
                      taxa de ocupação
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-headline text-2xl font-bold text-primary-container">
                      46
                    </p>
                    <p className="mt-2 font-body text-sm leading-snug text-on-surface/52">
                      reservas no mês
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-label text-[0.68rem] uppercase tracking-[0.24em] text-on-surface/45">
                      Vendas mensais
                    </p>
                    <p className="font-label text-[0.68rem] uppercase tracking-[0.2em] text-primary-container">
                      +167% em 6 meses
                    </p>
                  </div>

                  <div className="flex h-52 items-end gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-3 pt-6 pb-4">
                    {salesData.map((item) => (
                      <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                        <span className="font-label text-[0.62rem] uppercase tracking-[0.14em] text-on-surface/38">
                          €{(item.value / 1000).toFixed(1)}k
                        </span>
                        <div className="flex h-36 w-full items-end">
                          <div
                            className="w-full rounded-t-[1rem] bg-primary-container shadow-[0_0_25px_rgba(195,244,0,0.22)]"
                            style={{ height: `${(item.value / maxSales) * 100}%` }}
                          />
                        </div>
                        <span className="font-body text-xs text-on-surface/56">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <div>
                      <p className="font-body text-sm text-on-surface/72">
                        Exemplo simples de crescimento
                      </p>
                      <p className="mt-1 font-body text-xs text-on-surface/44">
                        mais reservas, mais ocupação e mais faturação
                      </p>
                    </div>
                    <p className="font-headline text-xl font-bold text-primary-container">
                      +€7K
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
