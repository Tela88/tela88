# .agent

Diretório local para skills e memória operacional deste projeto.

## Estrutura

- `.agent/skills/` para skills locais e skills copiadas para uso operacional no projeto
- `.agent/context/project-memory.md` para contexto persistente do projeto
- `.agent/context/session-memory.md` para estado recente da sessão e próximos passos

## Papel desta pasta

Esta pasta não substitui o sistema de memória principal em `C:\Users\USER\.claude-mem`.

Usa antes uma abordagem em duas camadas:

- `C:\Users\USER\.claude-mem` como memória cross-session principal
- `.agent/context/` como memória local e explícita do projeto

## Regra prática

Antes de trabalho substancial, ler a memória local do projeto e depois validar o código atual.
