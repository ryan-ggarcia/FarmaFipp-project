# Fluxo de Checkout e Registro de Vendas

Este documento descreve o fluxo atual utilizado para registrar vendas e itens de venda no projeto, cobrindo front-end e back-end.

## 1. Visao Geral

Fluxo resumido:

1. Usuario adiciona produtos no carrinho (armazenado em localStorage com chave cart).
2. Na pagina de checkout, o front-end renderiza os itens e calcula totais.
3. Ao clicar em Finalizar pagamento, o front envia um POST para /venda/confirmar.
4. O controller valida os dados e registra o cabecalho da venda.
5. O controller registra os itens vinculados ao id da venda.
6. O front limpa o carrinho e redireciona para a loja em caso de sucesso.

## 2. Front-end (Checkout)

Arquivo principal:

- public/js/produtos/checkout.js

### 2.1 Origem dos dados

O checkout usa dados do localStorage:

- chave: cart
- estrutura esperada por item (exemplo):

```json
{
  "id": 10,
  "nome": "Dipirona",
  "descricao": "Analgésico",
  "preco": 30,
  "quantidade": 2,
  "img": "/img/produtos/x.png",
  "id_lote": 5
}
```

### 2.2 Calculo de totais no front

O script calcula:

- subtotal: soma de preco * quantidade
- frete: 12.00 quando subtotal > 0
- desconto: 5% quando subtotal >= 200
- total: subtotal + frete - desconto

### 2.3 Acao de finalizacao

No clique do botao btnConfirmOrder, o front monta e envia:

- endpoint: POST /venda/confirmar
- content-type: application/json
- payload:

```json
{
  "data": "2026-05-05T23:45:36.444Z",
  "status": "PENDENTE",
  "pagamento": "pix",
  "total": 249.5,
  "subtotal": 250,
  "frete": 12,
  "desconto": 12.5,
  "itens": [
    {
      "id_produto": 10,
      "id_lote": 5,
      "quantidade": 2,
      "preco_unitario": 125,
      "subtotal": 250
    }
  ]
}
```

Observacao: atualmente o back-end persiste apenas id_produto e id_lote por item.

## 3. Back-end (API de Vendas)

Arquivos principais:

- routes/VendaRouter.js
- controllers/VendaController.js
- models/VendaModel.js
- models/ItemVendaModel.js
- server.js (registro da rota /venda)

### 3.1 Rota

A rota de vendas esta registrada como:

- POST /venda/confirmar

### 3.2 Controller

No metodo RegistrarVenda:

1. Le req.body: data, status, pagamento, total, itens, cart.
2. Define itensVenda usando itens (ou cart como fallback).
3. Valida se existe pelo menos 1 item.
4. Converte data para formato MySQL DATETIME com toMySqlDateTime:
   - entrada tipica: 2026-05-05T23:45:36.444Z
   - saida: 2026-05-05 23:45:36
5. Cria venda com VendaModel e chama RegistrarVenda().
6. Recebe vendaId (insertId).
7. Itera itensVenda e registra cada item com ItemVendaModel.
8. Retorna resposta de sucesso com vendaId.

### 3.3 Model de Venda

Tabela alvo atual:

- venda_teste

Campos gravados:

- ven_data
- ven_status
- ven_forma_pagamento
- ven_total

Metodo:

- RegistrarVenda() usa ExecutaComandoLastInserted para retornar insertId.

### 3.4 Model de Item da Venda

Tabela alvo atual:

- venda_item_teste

Campos gravados:

- id_venda
- id_produto
- id_lote

Metodo:

- RegistrarItemVenda() usa ExecutaComandoNonQuery.

## 4. Contrato Atual de Resposta

Resposta de sucesso:

```json
{
  "ok": true,
  "msg": "Venda registrada com sucesso.",
  "vendaId": 123
}
```

Resposta de erro (exemplos):

```json
{
  "ok": false,
  "msg": "Carrinho vazio para registrar venda."
}
```

```json
{
  "ok": false,
  "msg": "Data da venda invalida."
}
```

## 5. Pontos de Atencao

1. Nao ha transacao SQL no fluxo atual.
   - Se a venda for inserida e um item falhar, pode haver inconsistencia.

2. Itens enviados pelo front possuem quantidade/preco/subtotal, mas esses dados nao sao persistidos na tabela de item atual.
   - Hoje so id_produto e id_lote sao salvos.

3. O total da venda e aceito do front-end.
   - Em ambiente de producao, o ideal e recalcular no servidor para evitar manipulacao do payload.

## 6. Sugestao de Evolucao

Para um fluxo mais robusto:

1. Adicionar colunas de quantidade, preco_unitario e subtotal em venda_item_teste.
2. Recalcular total no back-end com base nos itens recebidos.
3. Usar transacao (BEGIN/COMMIT/ROLLBACK) para cabecalho + itens.
4. Adicionar id_cliente na venda quando houver autenticacao de usuario.
