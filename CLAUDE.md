# Tela 88 — Projeto Website

> Website da agência Tela 88 — parceiro de crescimento digital.
> Stack: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Shadcn/ui

---

## Contexto do Projeto

**Localização do código:** `tela88-web/`
**Framework:** Next.js 16 (App Router)
**Design system:** Dark theme, accent lime green `#c3f400` (`--color-primary-container`)
**Fontes:** Space Grotesk (headlines) + Inter (body)

### Páginas Existentes
- `/` — Home (Navbar + HeroSection + ClientLogos + IntroSection + Footer)
- `/servicos` — Grid de 6 serviços
- `/portfolio` — 4 case studies mock
- `/contactos` — Formulário com validação client-side
- `/privacidade` — Política de privacidade estática

### Ficheiros Críticos
- `tela88-web/src/app/globals.css` — Design system (40+ CSS variables)
- `tela88-web/src/app/layout.tsx` — Root layout + metadata
- `tela88-web/src/components/layout/` — Navbar, Footer
- `tela88-web/src/components/sections/` — HeroSection, IntroSection, ClientLogos

---

## Skills Disponíveis

As skills estão em `.claude/skills/`. **Lê sempre a skill relevante antes de implementar.**

### 🎨 Design & UI — Usar Sempre que Relevante

| Skill | Pasta | Quando usar |
|-------|-------|-------------|
| **frontend-design** | `.claude/skills/frontend-design/` | Qualquer componente visual, layout, secção |
| **frontend-patterns** | `.claude/skills/frontend-patterns/` | Estrutura de componentes React |
| **web-design-guidelines** | `.claude/skills/web-design-guidelines/` | Princípios visuais, tipografia, espaçamento |
| **ui-ux-pro-max** | `.claude/skills/ui-ux-pro-max/` | UX, fluxos, experiência do utilizador |
| **design-review** | `.claude/skills/design-review/` | Revisão e auditoria de UI existente |
| **design-system-creation** | `.claude/skills/design-system-creation/` | Quando expandir o design system |
| **interaction-design** | `.claude/skills/interaction-design/` | Microinterações, hover states, fluxos |
| **mobile-first-design** | `.claude/skills/mobile-first-design/` | Sempre — toda a UI começa pelo mobile |
| **responsive-web-design** | `.claude/skills/responsive-web-design/` | Breakpoints, layouts adaptativos |
| **ui-component-doc** | `.claude/skills/ui-component-doc/` | Documentar componentes reutilizáveis |

### ✨ Animação & Componentes Premium

| Skill | Pasta | Quando usar |
|-------|-------|-------------|
| **motion** | `.claude/skills/motion/` | Framer Motion — animações de entrada, hover, transições |
| **auto-animate** | `.claude/skills/auto-animate/` | Animações automáticas de listas e conteúdo |
| **aceternity-ui** | `.claude/skills/aceternity-ui/` | Componentes animados premium (cards, backgrounds) |
| **inspira-ui** | `.claude/skills/inspira-ui/` | Componentes com efeitos visuais avançados |
| **heroui-react** | `.claude/skills/heroui-react/` | Componentes React modernos e polidos |
| **base-ui-react** | `.claude/skills/base-ui-react/` | Componentes base acessíveis sem estilo fixo |

### ⚡ Performance — Aplicar Proativamente

| Skill | Pasta | Quando usar |
|-------|-------|-------------|
| **web-performance-optimization** | `.claude/skills/web-performance-optimization/` | Sempre — bundles, lazy loading, code splitting |
| **web-performance-audit** | `.claude/skills/web-performance-audit/` | Antes de deploy — Core Web Vitals |
| **image-optimization** | `.claude/skills/image-optimization/` | Sempre que houver imagens |
| **progressive-web-app** | `.claude/skills/progressive-web-app/` | Se implementar PWA |

### 🔍 SEO

| Skill | Pasta | Quando usar |
|-------|-------|-------------|
| **seo-optimizer** | `.claude/skills/seo-optimizer/` | Metadata, structured data, open graph |

### 🏗️ Stack Next.js

| Skill | Pasta | Quando usar |
|-------|-------|-------------|
| **nextjs** | `.claude/skills/nextjs/` | App Router, Server Components, metadata API |
| **react-best-practices** | `.claude/skills/react-best-practices/` | Padrões React idiomáticos |
| **react-composition-patterns** | `.claude/skills/react-composition-patterns/` | Composição de componentes complexos |
| **tailwind-v4-shadcn** | `.claude/skills/tailwind-v4-shadcn/` | Stack de styling — Tailwind v4 + Shadcn |
| **typescript-mcp** | `.claude/skills/typescript-mcp/` | TypeScript avançado, tipos complexos |
| **react-hook-form-zod** | `.claude/skills/react-hook-form-zod/` | Formulários com validação (contactos) |
| **zod** | `.claude/skills/zod/` | Schema validation |

### 🔒 Segurança

| Skill | Pasta | Quando usar |
|-------|-------|-------------|
| **csrf-protection** | `.claude/skills/csrf-protection/` | Formulário de contacto e mutações |
| **xss-prevention** | `.claude/skills/xss-prevention/` | Sempre que renderizar conteúdo dinâmico |
| **defense-in-depth-validation** | `.claude/skills/defense-in-depth-validation/` | Validação de inputs |
| **security-headers-configuration** | `.claude/skills/security-headers-configuration/` | Headers HTTP, next.config |

### 🧪 Qualidade & Debugging

| Skill | Pasta | Quando usar |
|-------|-------|-------------|
| **verification-before-completion** | `.claude/skills/verification-before-completion/` | Antes de marcar qualquer tarefa como concluída |
| **code-review** | `.claude/skills/code-review/` | Revisão de código existente |
| **systematic-debugging** | `.claude/skills/systematic-debugging/` | Debugging metódico |
| **chrome-devtools** | `.claude/skills/chrome-devtools/` | Inspecionar performance e layout |
| **mem-search** | `.claude/skills/mem-search/` | Pesquisar memória persistente |

---

## Princípios de Design (NUNCA IGNORAR)

### Visual
- **Dark theme sempre** — `bg-surface` (`#131313`), nunca branco puro
- **Accent lime green** — `text-primary-container` / `bg-primary-container` (`#c3f400`)
- **Mobile-first** — começa pelo mobile (375px), escala para desktop (1440px)
- **Espaçamento generoso** — `py-32`, `px-6 md:px-24` como norma
- **Tipografia com carácter** — Space Grotesk headlines, `tracking-[-0.04em]`
- **Backgrounds com atmosfera** — blur, gradients, nunca solid genérico
- **Animações com propósito** — entradas, hovers, microinterações

### Padrões de Código
- TypeScript strict em tudo — nunca `any`
- Server Components por defeito — `"use client"` só quando necessário
- `next/image` para todas as imagens
- `next/link` para todos os links internos
- `metadata` exportada em todas as páginas
- Componentes < 200 linhas — dividir se maior
- Named exports para utilitários

### O que NUNCA fazer
- Gradientes purple/blue genéricos em fundo branco
- Layouts cookie-cutter sem personalidade
- Fontes: Inter, Roboto, Arial como escolha principal para headlines
- `any` em TypeScript
- Animações sem propósito ou excessivas
- Ignorar estados de loading, error e empty

---

## Fluxo de Trabalho

1. **Antes de criar/modificar UI** → ler `frontend-design` + `mobile-first-design`
2. **Antes de adicionar animações** → ler `motion`
3. **Antes de otimizar** → ler `web-performance-optimization`
4. **Antes de terminar** → executar `verification-before-completion`
5. **Formulários** → usar `react-hook-form-zod` + `csrf-protection`
6. **Imagens novas** → aplicar `image-optimization`
7. **Deploy** → executar `web-performance-audit` + `seo-optimizer`
