"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center px-6 md:px-24 py-3 w-full max-w-[1440px] mx-auto">
        <Link href="/" className="flex h-10 shrink-0 items-center overflow-hidden md:h-[3.125rem]">
          <Image
            src="/brand/logo-07-header.png"
            alt="Tela 88"
            width={768}
            height={768}
            className="h-20 w-auto max-w-none object-contain md:h-24"
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-12 font-headline tracking-tighter">
          <Link
            href="/servicos"
            className="text-on-surface/60 hover:text-primary-container transition-colors"
          >
            Serviços
          </Link>
          <Link
            href="/portfolio"
            className="text-on-surface/60 hover:text-primary-container transition-colors"
          >
            Portefólio
          </Link>
          <Link
            href="/contactos"
            className="bg-primary-container text-on-primary px-6 py-2 font-headline font-bold tracking-tighter transition-transform active:scale-95 hover:shadow-[0_0_20px_rgba(195,244,0,0.4)]"
          >
            Consultoria Gratuita
          </Link>
        </div>
        <button
          className="md:hidden text-primary-container"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-8 flex flex-col gap-6 font-headline tracking-tighter border-t border-outline-variant/10">
          <Link
            href="/servicos"
            className="text-on-surface/60 hover:text-primary-container transition-colors pt-6"
            onClick={() => setMenuOpen(false)}
          >
            Serviços
          </Link>
          <Link
            href="/portfolio"
            className="text-on-surface/60 hover:text-primary-container transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Portefólio
          </Link>
          <Link
            href="/contactos"
            className="bg-primary-container text-on-primary px-6 py-3 font-bold text-center active:scale-95"
            onClick={() => setMenuOpen(false)}
          >
            Consultoria Gratuita
          </Link>
        </div>
      )}
    </nav>
  );
}
