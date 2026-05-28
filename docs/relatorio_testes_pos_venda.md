# Relatório de Testes — Módulo Pós-Venda (FarmaFipp)
Data: 2026-05-08

## Resumo

| Métrica               | Valor       |
|-----------------------|-------------|
| Total de testes       | 13          |
| Aprovados (PASS)      | 13          |
| Reprovados (FAIL)     | 0           |
| Erros encontrados     | 4           |
| Erros corrigidos      | 4           |

---

## Erros Encontrados e Corrigidos

### ERRO 1 — Nomes de colunas incorretos no DevolucaoModel.js
- **Arquivo:** `models/DevolucaoModel.js`
- **Severidade:** CRÍTICA (impedia todas as queries SQL)
- **Descrição:** Os nomes das colunas no SQL estavam baseados no diagrama EER, mas o banco real usa nomes diferentes.
- **Mapeamento das correções:**

| Código original (errado) | Banco real (correto) |
|--------------------------|---------------------|
| `devol_data`             | `devo_data`         |
| `devol_status`           | `devo_status`       |
| `devol_descricao`        | `devo_observacao`   |
| `devol_valorFinal`       | `devo_valorTotal`   |
| `devol_tipo`             | `devo_tipo`         |

- **Correção:** Renomeados todos os nomes de colunas nas queries SQL do Model.

---

### ERRO 2 — Valores ENUM incompatíveis
- **Arquivos:** `controllers/DevolucaoController.js`, todas as Views, `public/js/posVenda/detalhes.js`
- **Severidade:** CRÍTICA (INSERT falharia por valor inválido no ENUM)
- **Descrição:** O código usava valores de ENUM inventados, enquanto o banco já tinha valores definidos.
- **Mapeamento das correções:**

| Campo         | Código original (errado)                          | Banco real (correto)                        |
|---------------|---------------------------------------------------|---------------------------------------------|
| `devo_status` | `'pendente', 'aprovado', 'recusado', 'finalizado'`| `'Aprovado', 'Aguardando', 'Nao Aprovado'`  |
| `devo_tipo`   | `'devolucao', 'troca'`                            | `'Venda', 'Compra'`                         |

- **Correção:** Atualizados Controller, Views e frontend JS para usar os valores corretos.

---

### ERRO 3 — `Funcionario_idFuncionario` NOT NULL
- **Arquivo:** Tabela `efetuar_devolucao` no banco de dados
- **Severidade:** CRÍTICA (impedia INSERT de devoluções presenciais e online)
- **Descrição:** A coluna `Funcionario_idFuncionario` era NOT NULL, mas no fluxo presencial o funcionário pode não ser informado (nenhuma autenticação ativa) e no fluxo online não existe funcionário associado inicialmente.
- **Correção:** `ALTER TABLE efetuar_devolucao MODIFY COLUMN Funcionario_idFuncionario INT NULL`

---

### ERRO 4 — `Cliente_Devolucao` NOT NULL
- **Arquivo:** Tabela `efetuar_devolucao` no banco de dados
- **Severidade:** CRÍTICA (impedia INSERT de solicitações online)
- **Descrição:** A coluna `Cliente_Devolucao` era NOT NULL, mas no fluxo online o cliente não tem cadastro no sistema (informa nome e contato no formulário).
- **Correção:** `ALTER TABLE efetuar_devolucao MODIFY COLUMN Cliente_Devolucao INT NULL`

---

## Alterações no Banco de Dados Realizadas

```sql
-- Colunas adicionadas
ALTER TABLE efetuar_devolucao ADD COLUMN devo_origem ENUM('presencial', 'online') NOT NULL DEFAULT 'presencial';
ALTER TABLE efetuar_devolucao ADD COLUMN devo_data_compra DATE NULL;
ALTER TABLE efetuar_devolucao ADD COLUMN devo_data_finalizacao DATETIME NULL;
ALTER TABLE item_devolucao ADD COLUMN Produto_ItemDevolucao INT NULL;

-- Colunas modificadas (permitir NULL)
ALTER TABLE efetuar_devolucao MODIFY COLUMN Funcionario_idFuncionario INT NULL;
ALTER TABLE efetuar_devolucao MODIFY COLUMN Cliente_Devolucao INT NULL;
ALTER TABLE efetuar_devolucao MODIFY COLUMN devo_observacao VARCHAR(170) NULL;
```

---

## Resultado dos Testes (Após Correções)

| #  | Teste                                           | Rota                         | Resultado | Resposta                                                  |
|----|------------------------------------------------|------------------------------|-----------|-----------------------------------------------------------|
| 1  | GET listar (página vazia)                      | `GET /pos-venda`             | ✅ 200    | Página renderizada corretamente                           |
| 2  | GET formulário presencial                      | `GET /pos-venda/presencial`  | ✅ 200    | Formulário carregado com produtos e clientes              |
| 3  | GET formulário online (público)                | `GET /pos-venda/online`      | ✅ 200    | Formulário público carregado com produtos                 |
| 4  | POST presencial (dados válidos)                | `POST /pos-venda/presencial` | ✅ PASS   | `{"ok":true,"msg":"Devolução/troca registrada..."}`       |
| 5  | POST online (dados válidos)                    | `POST /pos-venda/online`     | ✅ PASS   | `{"ok":true,"msg":"Solicitação enviada..."}`              |
| 6  | POST online (prazo expirado, 60 dias)          | `POST /pos-venda/online`     | ✅ PASS   | `{"ok":false,"msg":"Prazo de devolução expirado..."}`     |
| 7  | POST online (data futura)                      | `POST /pos-venda/online`     | ✅ PASS   | `{"ok":false,"msg":"data da compra não pode ser futura"}` |
| 8  | POST online (campos obrigatórios faltando)     | `POST /pos-venda/online`     | ✅ PASS   | `{"ok":false,"msg":"Preencha todos os campos..."}`        |
| 9  | GET listar (com registros inseridos)           | `GET /pos-venda`             | ✅ 200    | Tabela com registros exibidos                             |
| 10 | POST atualizar status (aprovar)                | `POST /pos-venda/status`     | ✅ PASS   | `{"ok":true,"msg":"Status atualizado..."}`                |
| 11 | POST atualizar status (status inválido)        | `POST /pos-venda/status`     | ✅ PASS   | `{"ok":false,"msg":"Status inválido!"}`                   |
| 12 | POST deletar (sem ID)                          | `POST /pos-venda/deletar`    | ✅ PASS   | `{"ok":false,"msg":"ID não informado..."}`                |
| 13 | GET detalhes de registro existente              | `GET /pos-venda/detalhes/1`  | ✅ 200    | Página de detalhes renderizada                            |

---

## Estrutura Final do Banco

### efetuar_devolucao
| Coluna                    | Tipo                                          | NULL |
|---------------------------|-----------------------------------------------|------|
| idEfetuar_devolucao       | INT (PK, AUTO_INCREMENT)                      | NO   |
| devo_data                 | DATE                                          | NO   |
| devo_status               | ENUM('Aprovado','Aguardando','Nao Aprovado')  | NO   |
| devo_observacao           | VARCHAR(170)                                  | YES  |
| devo_valorTotal           | DECIMAL(10,2)                                 | NO   |
| devo_tipo                 | ENUM('Venda','Compra')                        | NO   |
| devo_origem               | ENUM('presencial','online')                   | NO   |
| devo_data_compra          | DATE                                          | YES  |
| devo_data_finalizacao     | DATETIME                                      | YES  |
| Cliente_Devolucao         | INT (FK -> cliente)                           | YES  |
| Funcionario_idFuncionario | INT (FK -> funcionario)                       | YES  |

### item_devolucao
| Coluna                         | Tipo           | NULL |
|--------------------------------|----------------|------|
| idItem_devolucao               | INT (PK)       | NO   |
| itemDev_quantidade             | DECIMAL(10,0)  | NO   |
| EfetuarDevolucao_ItemDevolucao | INT (FK)       | NO   |
| itemDev_motivo                 | VARCHAR(170)   | NO   |
| Produto_ItemDevolucao          | INT            | YES  |
