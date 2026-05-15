# Fluxo de Saída de Estoque por Lote (Venda)

## Objetivo
Garantir que a venda de produtos dê baixa no lote correto, mantendo:
- saldo real por lote
- rastreabilidade de movimentações
- controle de validade (FEFO)

## Regra Principal
A saída para venda deve ser feita por lote, não apenas por produto agregado.

## Conceitos
- **Lote**: fonte de verdade do saldo atual (`lot_qnt`) e validade (`lot_validade`).
- **Movimentação de estoque**: histórico/auditoria (`movimentacao_estoque`), com `tipo` e `origem`.

## Fluxo Funcional
1. Usuário seleciona um produto para venda.
2. Sistema lista lotes vinculados ao produto com saldo > 0.
3. Sistema ordena lotes por validade (mais próxima primeiro - FEFO).
4. Usuário confirma quantidade de venda.
5. Sistema valida saldo no lote escolhido.
6. Sistema registra movimentação de saída:
   - `tipo = SAIDA`
   - `origem = VENDA`
7. Sistema atualiza saldo do lote:
   - `lot_qnt = lot_qnt - quantidadeVendida`
8. Sistema confirma operação e retorna sucesso.

## Fluxo Técnico (Transacional)
1. `BEGIN`
2. `SELECT` lote para conferir saldo e validade
3. `INSERT` em `movimentacao_estoque`
4. `UPDATE` em `Lote` reduzindo `lot_qnt`
5. `COMMIT`
6. Em erro: `ROLLBACK`

## Validações Obrigatórias
- Quantidade da venda > 0
- Lote existente
- Lote com saldo suficiente
- Lote não vencido (regra recomendada para farmácia)
- Concorrência (não permitir saldo negativo em vendas simultâneas)

## Resultado Esperado
- Histórico completo de entradas e saídas
- Saldo por lote consistente
- Segurança para auditoria e rastreabilidade sanitária

## Exemplo de Estruturas Envolvidas
- `Lote(lot_id, lot_name, lot_qnt, lot_validade, ...)`
- `movimentacao_estoque(mov_id, lote_id, tipo, origem, quantidade, data_mov)`

## Diagrama do Fluxo
```mermaid
flowchart TD
    A[Selecionar Produto] --> B[Listar Lotes com saldo > 0]
    B --> C[Ordenar por validade FEFO]
    C --> D[Selecionar Lote + Quantidade]
    D --> E{Saldo suficiente?}
    E -- Não --> F[Retornar erro de saldo]
    E -- Sim --> G[BEGIN TRANSACTION]
    G --> H[Registrar SAIDA em movimentacao_estoque]
    H --> I[Atualizar lot_qnt no Lote]
    I --> J[COMMIT]
    J --> K[Retornar sucesso]
    H --> L[Erro]
    I --> L
    L --> M[ROLLBACK]