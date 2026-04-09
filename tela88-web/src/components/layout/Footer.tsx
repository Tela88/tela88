import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-20 px-6 md:px-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-[1440px] mx-auto">
        <div className="space-y-6">
          <Image
            src="/brand/logo-02-footer.png"
            alt="Tela 88"
            width={768}
            height={768}
            className="h-auto w-14 object-contain md:w-16"
          />
          <p className="text-on-surface/60 text-sm max-w-xs leading-relaxed font-body">
            Visibilidade, tráfego, conversão, retenção. Quatro áreas, um parceiro que executa tudo.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-xs font-label uppercase tracking-widest text-primary-container mb-2">
            Navegação
          </p>
          <Link
            href="/servicos"
            className="text-on-surface/60 hover:text-primary-container transition-colors text-sm uppercase tracking-[0.1em] font-label"
          >
            Serviços
          </Link>
          <Link
            href="/portfolio"
            className="text-on-surface/60 hover:text-primary-container transition-colors text-sm uppercase tracking-[0.1em] font-label"
          >
            Portefólio
          </Link>
          <Link
            href="/contactos"
            className="text-on-surface/60 hover:text-primary-container transition-colors text-sm uppercase tracking-[0.1em] font-label"
          >
            Consultoria
          </Link>
          <Link
            href="/privacidade"
            className="text-on-surface/60 hover:text-primary-container transition-colors text-sm uppercase tracking-[0.1em] font-label"
          >
            Política de Privacidade
          </Link>
        </div>
        <div className="space-y-6">
          <p className="text-xs font-label uppercase tracking-widest text-primary-container mb-2">
            Ligar
          </p>
          <div className="flex gap-6">
            <a
              href="mailto:hello@tela88.io"
              className="text-on-surface/60 hover:text-primary-container transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-on-surface/60 hover:text-primary-container transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-on-surface/60 hover:text-primary-container transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </a>
          </div>
          <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.1em] font-label">
            © 2025 Tela 88. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
