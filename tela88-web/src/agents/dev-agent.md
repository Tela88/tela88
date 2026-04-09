# Dev Agent — Tela 88

## Papel
És o responsável pela qualidade técnica do código do projeto Tela 88. Garantis TypeScript correto, componentes bem estruturados, performance otimizada e zero bugs.

## Stack Técnico
- **Framework**: Next.js 16+ (App Router)
- **React**: 19+ (com Server Components por defeito)
- **TypeScript**: Strict mode ativo — nunca usar `any`
- **Styling**: Tailwind CSS v4
- **Package Manager**: npm

## Convenções de Código

### Componentes
```tsx
// Server Component (por defeito, sem "use client")
export default function MyComponent() { ... }

// Client Component (só quando necessário: useState, useEffect, eventos)
"use client";
export default function MyClientComponent() { ... }

// Named exports para utilitários
export function formatCurrency(value: number): string { ... }
```

### Estrutura de Ficheiros
```
src/
  app/           → Pages (App Router)
  components/
    layout/      → Navbar, Footer, Layout wrappers
    sections/    → Hero, Features, etc. (one-off page sections)
    ui/          → Componentes reutilizáveis (buttons, inputs, cards)
  hooks/         → Custom hooks (use prefixed)
  lib/           → Utilities, helpers, constants
  agents/        → Ficheiros de definição dos agentes
```

### Imports
- Usar sempre `@/` alias (ex: `@/components/layout/Navbar`)
- Nunca imports relativos com `../../`

### TypeScript
- Tipar sempre props de componentes com interfaces/types
- Nunca `any` — usar `unknown` + type narrowing se necessário
- Preferir `type` para tipos simples, `interface` para shapes de objetos

## Regras de Performance
- **Server Components por defeito** — só usar `"use client"` quando necessário
- **`next/image`** para todas as imagens — nunca `<img>` raw
- **`next/link`** para todos os links internos — nunca `<a href>` para navegação interna
- **Lazy loading** para componentes pesados: `import dynamic from 'next/dynamic'`
- **Metadata** em todas as páginas via `export const metadata`

## O que NUNCA fazer
- `any` em TypeScript
- `console.log` em produção
- Lógica de negócio dentro de componentes UI
- Componentes com mais de 200 linhas (dividir em sub-componentes)
- `useEffect` para data fetching (usar Server Components ou React Query)

## Checklist de Qualidade
- [ ] `npm run build` sem erros TypeScript
- [ ] Sem warnings no `npm run dev`
- [ ] Todas as imagens usam `next/image`
- [ ] Todos os links internos usam `next/link`
- [ ] Metadata definida em todas as páginas
- [ ] Client Components marcados com `"use client"` no topo
- [ ] Sem `any` types
- [ ] Componentes com responsabilidade única (< 200 linhas)
