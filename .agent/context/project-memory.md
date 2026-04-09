# Project Memory

## Projeto

- Nome: Tela 88 website
- Código principal em `tela88-web/`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- Idioma principal do site: português

## Estrutura atual

- Home em `tela88-web/src/app/page.tsx`
- Serviços em `tela88-web/src/app/servicos/page.tsx`
- Portefólio em `tela88-web/src/app/portfolio/page.tsx`
- Contactos em `tela88-web/src/app/contactos/page.tsx`
- Privacidade em `tela88-web/src/app/privacidade/page.tsx`

## Branding e UI

- Direção visual: tema escuro com accent lime green
- Header usa o asset real `07.png`, copiado para `tela88-web/public/brand/logo-07-header.png`
- Footer usa o asset real `02.png`, copiado para `tela88-web/public/brand/logo-02-footer.png`
- Hero da homepage foi simplificado para um painel visual mais legível, com foco em crescimento de vendas para alojamento local
- O utilizador prefere assets reais e não quer reconstruções aproximadas quando já forneceu ficheiros originais

## Preferências persistentes do utilizador

- Quer linguagem simples, concreta e compreensível para não-marketers
- Quer uso automático das skills relevantes sem precisar de pedir explicitamente
- Quer continuidade de contexto entre sessões
- Prefere soluções visuais calmas, premium e fáceis de entender

## Memória do agente

- Sistema de memória cross-session já existe em `C:\Users\USER\.claude-mem`
- A `.agent/context/` serve como camada local de projeto, não como substituto do `claude-mem`
- A skill `.agent/skills/mem-context` deve ser tratada como ponte entre a memória local do projeto e o sistema global existente

## Regras práticas para próximas sessões

- Ler primeiro esta memória e `session-memory.md` antes de trabalho substancial
- Validar sempre o estado atual do código antes de agir
- Em tarefas de frontend, design ou motion, verificar as skills locais relevantes
- Usar sempre os assets reais do utilizador quando existirem
- Evitar dashboards abstratos se a comunicação puder ser mais concreta
