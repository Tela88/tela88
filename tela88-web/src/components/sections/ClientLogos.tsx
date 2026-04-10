const trustSignals = [
  "Mais pedidos de orçamento",
  "Mais reservas diretas",
  "Mais vendas",
  "Mais organização comercial",
];

export default function ClientLogos() {
  return (
    <section className="relative overflow-hidden bg-surface py-18 md:py-22">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(195,244,0,0.08),transparent_18%),radial-gradient(circle_at_82%_30%,rgba(195,244,0,0.05),transparent_18%)]" />

      <div className="relative mx-auto max-w-[1240px] px-6 md:px-12">
        <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] px-7 py-8 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.95)] md:px-10 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary-container">
                Onde criamos impacto
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                O digital tem de trazer resultado e clareza.
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 lg:max-w-[38rem] lg:justify-end">
              {trustSignals.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-surface-container-low/72 px-4 py-2 font-label text-[0.72rem] uppercase tracking-[0.18em] text-on-surface/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
