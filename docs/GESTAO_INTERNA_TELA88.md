# Tela88 - Sistema de Gestao Interna

> **Data:** 2026-04-22  
> **Objetivo:** Documento de referencia para impressao e alinhamento interno.  
> **Fonte de verdade:** Codigo atual do backoffice em `tela88-web/src`, dados mock em `tela88-web/data/crm-data.json` e rotas API em `tela88-web/src/app/api`.  
> **Regra:** Este documento descreve o sistema existente e a evolucao logica prevista. Quando houver base de dados real, este documento deve ser atualizado.

---

## 1. Visao Geral

O sistema de gestao interna da Tela88 funciona como um backoffice simples para acompanhar o ciclo comercial e operacional da agencia:

1. Entrada de pedidos pelo website.
2. Triagem comercial.
3. Marcacao e acompanhamento de reunioes.
4. Conversao de pedidos em clientes.
5. Definicao de packs e servicos contratados.
6. Gestao do estado de producao por cliente e por servico.
7. Criacao e acompanhamento de tarefas.
8. Distribuicao de trabalho pela equipa.

Atualmente, a persistencia e feita em ficheiros JSON locais. A arquitetura esta preparada para evoluir para CRM/base de dados, mas ainda nao usa Supabase ou outra base de dados no backoffice da Tela88.

---

## 2. Stack Atual

| Camada | Tecnologia / Ficheiro | Funcao |
|---|---|---|
| Frontend | Next.js App Router | Website publico e area reservada |
| UI | Tailwind CSS v4 + CSS variables | Design system escuro da Tela88 |
| Auth admin | `src/lib/auth.ts` | Login simples por cookie assinado |
| Store CRM | `src/lib/crm-store.ts` | Leitura/escrita em JSON |
| Tipos | `src/lib/crm-types.ts` | Estados e entidades do sistema |
| Catalogo | `src/lib/service-catalog.ts` | Servicos, labels e estados |
| Dados | `data/crm-data.json` | Mock data principal |
| Pedidos legacy | `data/consultation-requests.json` | Pedidos antigos/importados |

---

## 3. Acessos E Area Reservada

### Rotas principais

| Rota | Funcao | Acesso |
|---|---|---|
| `/area-reservada/login` | Login administrativo | Publico |
| `/area-reservada` | Dashboard interno | Admin autenticado |
| `/area-reservada?tab=overview` | Painel principal | Admin |
| `/area-reservada?tab=pending` | Pedidos pendentes | Admin |
| `/area-reservada?tab=meetings` | Reunioes | Admin |
| `/area-reservada?tab=clients` | Clientes | Admin |
| `/area-reservada?tab=team` | Equipa e tarefas | Admin |
| `/area-reservada/clientes/[id]` | Gestao individual do cliente | Admin |

### Credenciais atuais de desenvolvimento

| Campo | Valor default |
|---|---|
| Utilizador | `admin` |
| Palavra-passe | `change-me` |
| Cookie | `tela88_admin_session` |
| Duracao | 7 dias |

Em producao, estes valores devem vir de variaveis de ambiente:

| Variavel | Funcao |
|---|---|
| `TELA88_ADMIN_USERNAME` | Utilizador admin |
| `TELA88_ADMIN_PASSWORD` | Palavra-passe admin |
| `TELA88_SESSION_SECRET` | Segredo para assinar sessoes |

---

## 4. Entidades Do Sistema

### Pedido / Lead

Representa uma entrada comercial vinda do formulario ou inserida no CRM.

| Campo | Descricao |
|---|---|
| `id` | Identificador unico |
| `name` | Nome da pessoa |
| `email` | Email de contacto |
| `company` | Empresa |
| `revenue` | Faixa de faturacao |
| `challenge` | Problema/desafio descrito pelo lead |
| `focusArea` | Area principal de foco |
| `createdAt` | Data de entrada |
| `status` | Estado comercial |
| `scheduledAt` | Data/hora de reuniao |
| `internalNotes` | Notas internas |
| `clientId` | Cliente gerado apos conversao |

### Cliente

Representa uma conta convertida e pronta para gestao operacional.

| Campo | Descricao |
|---|---|
| `id` | Identificador unico |
| `requestId` | Pedido que originou o cliente |
| `name` / `email` / `company` | Dados comerciais |
| `revenue` | Faixa de faturacao |
| `challenge` | Desafio original |
| `focusArea` | Area estrategica principal |
| `clientStage` | Estado do cliente |
| `packName` | Nome do pack vendido |
| `packDescription` | Descricao do pack |
| `setupFee` | Valor de setup |
| `monthlyFee` | Valor mensal |
| `services` | Servicos contratados e respetivo estado |
| `internalNotes` | Notas internas |

### Servico Contratado

Cada cliente pode ter varios servicos associados. Cada servico tem um estado proprio.

| Campo | Descricao |
|---|---|
| `id` | Identificador do servico |
| `stage` | Estado de entrega desse servico |

### Membro Da Equipa

Representa uma pessoa interna ou colaborador operacional.

| Campo | Descricao |
|---|---|
| `id` | Identificador unico |
| `name` | Nome |
| `role` | Funcao |
| `status` | Disponibilidade |
| `dailyCapacity` | Capacidade do dia |

### Tarefa

Representa uma unidade de trabalho operacional.

| Campo | Descricao |
|---|---|
| `id` | Identificador unico |
| `title` | Titulo |
| `description` | Descricao |
| `status` | Estado no quadro |
| `priority` | Prioridade |
| `assigneeId` | Responsavel |
| `dueDate` | Data limite |
| `clientId` | Cliente associado |
| `serviceId` | Servico associado |

---

## 5. Estados E Catalogos

### Estados De Pedido

| Estado | Significado | Uso atual |
|---|---|---|
| `pending` | Pedido novo, ainda sem reuniao confirmada | Sim |
| `agendado` | Reuniao marcada | Sim |
| `atendido` | Reuniao feita, ainda nao convertido | Sim |
| `cliente` | Pedido convertido em cliente | Sim |
| `fechado` | Pedido fechado/perdido | Tipo existe, pouco usado na UI atual |

### Estados De Cliente

| Estado | Significado |
|---|---|
| `em-processo` | Cliente em preparacao, onboarding, proposta/pack ou arranque |
| `em-producao` | Cliente ativo em producao/execucao |

### Catalogo De Servicos

| ID | Label |
|---|---|
| `websites-crm` | Websites e CRM |
| `anuncios-trafego-organico` | Anuncios e Trafego Organico |
| `funis-conversao` | Funis de Conversao |
| `consultoria-marketing` | Consultoria de Marketing |
| `design-grafico` | Design Grafico |
| `gestao-redes-sociais` | Gestao de Redes Sociais |

### Estados De Entrega Do Servico

| Estado | Significado |
|---|---|
| `planeado` | Servico definido mas ainda nao iniciado |
| `em-processo` | Preparacao ou execucao inicial |
| `em-producao` | Execucao ativa/recorrente |
| `concluido` | Entrega concluida |

### Estados Da Equipa

| Estado | Significado |
|---|---|
| `disponivel` | Pode receber trabalho |
| `ocupado` | Capacidade limitada |
| `offline` | Nao disponivel |

### Estados Das Tarefas

| Estado | Significado |
|---|---|
| `hoje` | Prioridade do dia |
| `em-curso` | Em execucao |
| `em-revisao` | A aguardar validacao/revisao |
| `feito` | Concluida |

### Prioridades Das Tarefas

| Prioridade | Uso |
|---|---|
| `alta` | Trabalho urgente ou de maior impacto |
| `media` | Trabalho normal |
| `baixa` | Trabalho secundario ou sem urgencia |

---

## 6. Fluxo Comercial

### Fluxo principal

1. Um lead entra pelo formulario de contacto.
2. O sistema cria um pedido com estado `pending`.
3. O pedido aparece em `Pedidos pendentes`.
4. A equipa confirma uma reuniao e adiciona notas internas.
5. O pedido passa para `agendado`.
6. Depois da reuniao, o pedido passa para `atendido`.
7. Se houver conversao, o pedido passa para `cliente`.
8. O sistema cria ou associa um registo de cliente.
9. O cliente passa a ser gerido na area `Clientes`.

### Regras praticas

| Momento | Acao |
|---|---|
| Lead novo | Validar fit, desafio e area de foco |
| Antes da reuniao | Confirmar data/hora e preparar notas |
| Depois da reuniao | Marcar como atendido ou converter |
| Conversao | Definir pack, valores, servicos e estado do cliente |
| Pos-conversao | Criar tarefas associadas ao cliente/servicos |

---

## 7. Fluxo De Reunioes

A area de reunioes funciona como um quadro de pipeline comercial.

| Coluna | Origem | Proxima acao |
|---|---|---|
| Agendado | Pedido com `status = agendado` | Fazer reuniao |
| Atendido | Pedido com `status = atendido` | Converter ou fechar |
| Cliente | Pedido com `status = cliente` | Abrir cliente |

O sistema suporta drag and drop entre colunas e acoes por botao. As alteracoes chamam endpoints internos e atualizam o JSON.

---

## 8. Fluxo De Clientes E Servicos

### Cliente

Depois de convertido, o cliente deve ter:

1. Pack comercial definido.
2. Descricao clara do pack.
3. Setup fee e mensalidade.
4. Servicos contratados.
5. Estado de cada servico.
6. Notas internas.
7. Proxima reuniao ou data relevante.

### Servicos

Cada servico dentro do cliente deve responder a quatro perguntas:

| Pergunta | Exemplo |
|---|---|
| O que foi vendido? | Websites e CRM |
| Em que estado esta? | Em processo |
| Quem trabalha nisso? | Tarefa atribuida a Mariana |
| Qual e a proxima entrega? | Landing + CRM inicial |

### Ciclo recomendado

1. Cliente entra em `em-processo`.
2. Equipa define pack e servicos.
3. Servicos comecam em `planeado`.
4. Cada servico gera tarefas.
5. Quando a execucao arranca, servico passa para `em-processo` ou `em-producao`.
6. Quando finalizado, passa para `concluido`.
7. Cliente pode passar para `em-producao` quando estiver em execucao recorrente.

---

## 9. Fluxo De Tarefas E Equipa

As tarefas sao a ponte entre o cliente, o servico e a equipa.

### Criacao de tarefa

Uma tarefa deve incluir:

| Campo | Regra |
|---|---|
| Titulo | Acao clara e curta |
| Descricao | Contexto suficiente para executar |
| Responsavel | Membro da equipa |
| Estado | `hoje`, `em-curso`, `em-revisao` ou `feito` |
| Prioridade | `alta`, `media` ou `baixa` |
| Cliente | Opcional, mas recomendado |
| Servico | Opcional, mas recomendado quando ligada a cliente |
| Data limite | Opcional, mas util para planeamento |

### Quadro de tarefas

| Coluna | Significado |
|---|---|
| Hoje | Trabalho a atacar agora |
| Em curso | Trabalho em execucao |
| Em revisao | Trabalho pronto para validar |
| Feito | Trabalho concluido |

### Relacao com equipa

Cada membro da equipa tem estado e capacidade diaria. O objetivo e evitar atribuir tarefas sem visibilidade de carga.

| Decisao | Deve considerar |
|---|---|
| Atribuir tarefa | Capacidade diaria e funcao |
| Mudar prioridade | Impacto no cliente e prazo |
| Passar para revisao | Existe output validavel? |
| Marcar como feito | Entrega foi concluida e revista? |

---

## 10. Mapa Do Backoffice

| Area | O que mostra | Acoes principais |
|---|---|---|
| Painel principal | KPIs, proxima reuniao, tarefas, clientes recentes | Navegar para detalhe |
| Pedidos pendentes | Leads por confirmar | Marcar reuniao |
| Reunioes | Pipeline agendado/atendido/cliente | Drag and drop, converter |
| Clientes | Kanban de clientes e base de clientes | Abrir cliente, mudar estado |
| Cliente individual | Pack, servicos, notas e tarefas do cliente | Editar pack/servicos, rever tarefas |
| Equipa e tarefas | Membros, capacidade, criacao de tarefas e quadro diario | Criar membro, criar tarefa, mover tarefas |

---

## 11. Endpoints Internos

| Endpoint | Metodo | Funcao |
|---|---|---|
| `/api/auth/login` | POST | Login admin e criacao de cookie |
| `/api/auth/logout` | POST | Logout admin |
| `/api/consultations` | POST | Criar pedido a partir do website |
| `/api/admin/requests/[id]/confirm` | POST | Confirmar data/hora de reuniao |
| `/api/admin/requests/[id]/attended` | POST | Marcar reuniao como atendida |
| `/api/admin/requests/[id]/convert` | POST | Converter pedido em cliente |
| `/api/admin/requests/[id]/stage` | POST | Alterar estado de pedido no kanban |
| `/api/admin/clients/[id]` | POST | Atualizar pack, servicos e notas do cliente |
| `/api/admin/clients/[id]/stage` | POST | Alterar estado do cliente |
| `/api/admin/tasks` | POST | Criar tarefa |
| `/api/admin/tasks/[id]` | POST | Atualizar tarefa |
| `/api/admin/team` | POST | Criar membro da equipa |

Todas as acoes admin passam por verificacao de sessao e validacao basica de origem.

---

## 12. Persistencia Atual

### Ficheiros

| Ficheiro | Funcao |
|---|---|
| `data/crm-data.json` | Store principal: pedidos, clientes, equipa e tarefas |
| `data/consultation-requests.json` | Dados legacy de pedidos |

### Limites do modelo atual

| Limite | Impacto |
|---|---|
| JSON local | Nao e adequado para multiutilizador real |
| Sem historico/auditoria | Nao se sabe quem alterou o que |
| Sem permissao granular | So existe admin simples |
| Sem relacoes fortes | Integridade depende do codigo |
| Sem anexos/assets por cliente | Entregaveis ainda nao estao estruturados |
| Sem notificacoes | Follow-up depende de consulta manual |

---

## 13. Evolucao Recomendada

### Fase 1 - Estabilizar mock CRM

1. Corrigir encoding de texto nos dados e labels.
2. Normalizar linguagem: usar "kanban" em vez de "kaban".
3. Rever estados e fechar o fluxo `fechado`.
4. Adicionar validacoes mais fortes aos formularios.
5. Melhorar visao de detalhe por cliente.

### Fase 2 - Base de dados

Criar tabelas equivalentes:

| Tabela | Entidade |
|---|---|
| `consultation_requests` | Pedidos/leads |
| `clients` | Clientes |
| `client_services` | Servicos por cliente |
| `team_members` | Equipa |
| `tasks` | Tarefas |
| `activity_log` | Historico de alteracoes |
| `meetings` | Reunioes e follow-ups |

### Fase 3 - Operacao real

1. Autenticacao com utilizadores reais.
2. Roles por funcao.
3. Auditoria de alteracoes.
4. Notificacoes internas.
5. Relatorios por cliente.
6. Ligacao a automacoes da AI Agency.
7. Espaco por cliente com assets, briefings, outputs e memoria.

---

## 14. Modelo Operacional Desejado

O backoffice deve tornar-se o centro da operacao interna da Tela88:

```text
Pedido -> Reuniao -> Cliente -> Pack -> Servicos -> Tarefas -> Equipa -> Entregas -> Retencao
```

O sistema ideal deve permitir responder rapidamente:

| Pergunta | Onde responder |
|---|---|
| Que leads temos por tratar? | Pedidos pendentes |
| Que reunioes estao marcadas? | Reunioes |
| Que clientes estao em processo? | Clientes |
| Que servicos cada cliente contratou? | Cliente individual |
| Que tarefas existem para hoje? | Equipa e tarefas |
| Quem esta responsavel por cada entrega? | Tarefa + equipa |
| O que falta para entregar? | Estado do servico + tarefas abertas |

---

## 15. Resumo Executivo

O sistema atual ja define o esqueleto de uma operacao interna de agencia:

- CRM comercial para leads e reunioes.
- Conversao de leads em clientes.
- Gestao de packs e servicos por cliente.
- Kanban de clientes.
- Equipa com capacidade diaria.
- Tarefas associadas a clientes e servicos.
- API interna para mutacoes.
- Store local em JSON, pronta para ser substituida por base de dados.

A prioridade seguinte deve ser transformar esta estrutura mock numa base persistente real, mantendo o mesmo modelo mental: simples, observavel e orientado a execucao.

---

**Fim do documento**
