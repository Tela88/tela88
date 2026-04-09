const logos = ["VORTEX", "QUANTUM", "SYNERGY", "KINETIC", "OXY-TECH"];

export default function ClientLogos() {
  return (
    <section className="py-20 bg-surface border-y border-outline-variant/10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-24">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-center text-on-surface/40 mb-12">
          A Apoiar Líderes de Indústria
        </p>
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-30 grayscale contrast-125">
          {logos.map((logo) => (
            <div
              key={logo}
              className="h-8 w-32 bg-on-surface/20 rounded-sm flex items-center justify-center font-headline font-bold text-xs"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
