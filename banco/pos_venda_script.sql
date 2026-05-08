-- ============================================================
-- SCRIPT SQL - PÓS-VENDA (DEVOLUÇÃO E TROCA)
-- FarmaFipp Project - VERSÃO FINAL (TESTADA E VALIDADA)
-- ============================================================
-- As tabelas efetuar_devolucao e item_devolucao JÁ EXISTEM
-- no banco. Este script adiciona as colunas novas necessárias
-- e ajusta constraints para suportar fluxo online e presencial.
-- ============================================================

-- 1) Adicionar novas colunas em efetuar_devolucao
ALTER TABLE efetuar_devolucao 
    ADD COLUMN devo_origem ENUM('presencial', 'online') NOT NULL DEFAULT 'presencial' AFTER devo_tipo,
    ADD COLUMN devo_data_compra DATE NULL AFTER devo_origem,
    ADD COLUMN devo_data_finalizacao DATETIME NULL AFTER devo_data_compra;

-- 2) Adicionar coluna de produto em item_devolucao
ALTER TABLE item_devolucao
    ADD COLUMN Produto_ItemDevolucao INT NULL AFTER itemDev_motivo;

-- 3) Permitir NULL nas FKs (necessário para fluxo online)
ALTER TABLE efetuar_devolucao MODIFY COLUMN Funcionario_idFuncionario INT NULL;
ALTER TABLE efetuar_devolucao MODIFY COLUMN Cliente_Devolucao INT NULL;
ALTER TABLE efetuar_devolucao MODIFY COLUMN devo_observacao VARCHAR(170) NULL;
