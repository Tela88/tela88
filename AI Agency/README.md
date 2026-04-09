# AI Agency

Base operacional para montar uma agência de marketing automatizada dentro deste projeto.

## Objetivo

Criar uma linha de produção com subagentes especializados, squads por serviço, memória persistente, outputs previsíveis e espaço para MCPs e automações.

## Estrutura principal

- `.agents/` agentes especialistas permanentes
- `_core/` regras partilhadas, schemas e templates base
- `clients/` contexto por cliente
- `squads/` pipelines reutilizáveis por tipo de serviço
- `memory/` memória global da agência
- `playbooks/` SOPs e processos
- `outputs/` entregáveis gerados
- `mcp/` plano e setup de MCPs

## Modelo de funcionamento

1. Receber briefing do cliente
2. Guardar contexto do cliente em `clients/<cliente>/`
3. Escolher um squad em `squads/`
4. Gerar um run com estado e artefactos próprios
5. Executar tarefas por agente
6. Fazer QA e entrega
7. Atualizar memória útil

## Agentes permanentes

- `orchestrator`
- `strategy`
- `research`
- `copy`
- `design`
- `motion`
- `web`
- `seo`
- `ads`
- `social`
- `automation`
- `qa`

## Squads iniciais

- `client-onboarding`
- `website-launch`
- `content-engine`
- `paid-acquisition`
- `social-monthly`

## Princípios

- usar assets reais sempre que existirem
- preferir processos simples e observáveis
- guardar estado por run
- reduzir checkpoints manuais ao mínimo útil
- separar memória global, memória de cliente e memória de squad
