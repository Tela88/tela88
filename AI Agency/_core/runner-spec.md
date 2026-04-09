# Runner Spec

Especificação simples para futuros runners ou orquestradores desta agência.

## Conceitos

- `client`: conta ou marca atendida pela agência
- `squad`: pipeline reutilizável para um tipo de trabalho
- `run`: execução concreta de um squad para um cliente

## Estrutura de um run

- `run.json` com metadados e estado
- `brief.md` com o pedido normalizado
- `artifacts/` com saídas intermédias e finais
- `logs/` para notas operacionais ou erros

## Estados recomendados

- `queued`
- `running`
- `waiting_approval`
- `blocked`
- `completed`
- `failed`

## Contrato mínimo

Todo o run deve guardar:

- `client_id`
- `squad_id`
- `run_id`
- `status`
- `started_at`
- `updated_at`
- `current_step`
- `artifacts`

## Regra prática

Não executar trabalho sem criar primeiro a pasta do run e o ficheiro `run.json`.
