const ProdutoModel = require('./ProdutoModel');
const Database = require('../utils/database');
const fs = require('fs');
const path = require('path');

// Caminho do arquivo de configuração de desconto
const CONFIG_PATH = path.join(__dirname, '..', 'config_promocao.json');

class ProdutoPromocaoModel extends ProdutoModel {
    constructor(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, img) {
        super(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, img);
    }

    /**
     * Retorna o percentual de desconto atual.
     * Lê da tabela configuracoes; se não existir, retorna 15 (padrão).
     */
    static async GetDescontoAtual() {
        try {
            const banco = new Database();
            const sql = "SELECT valor FROM configuracoes WHERE chave = 'percentual_desconto'";
            const rows = await banco.ExecutaComando(sql);
            if(rows && rows.length > 0){
                const val = Number(rows[0].valor);
                if (!Number.isNaN(val) && val > 0 && val <= 100) {
                    return val;
                }
            }
        } catch (error) { console.error('Erro ao buscar desconto:', error) }
        return 15;
    }

    /**
     * Salva um novo percentual de desconto na tabela de configuração.
     * @param {number} percentual — valor entre 1 e 100
     */
    static async SetDesconto(percentual) {
        const val = Number(percentual);
        if (Number.isNaN(val) || val <= 0 || val > 100) {
            return false;
        }
        try {
            const banco = new Database();
            const sql = "UPDATE configuracoes SET valor = ? WHERE chave = 'percentual_desconto'";
            const result = await banco.ExecutaComandoNonQuery(sql, [val.toString()]);
            // Caso a linha não exista, a gente insere
            if(!result){
                const insertSql = "INSERT INTO configuracoes (chave, valor) VALUES ('percentual_desconto', ?)";
                await banco.ExecutaComandoNonQuery(insertSql, [val.toString()]);
            }
            return true;
        } catch (error) {
            console.error('Erro ao atualizar desconto:', error);
            return false;
        }
    }

    /**
     * Insere promoção para um produto SOMENTE se não existir promoção ativa.
     * Retorna o preço promocional (existente ou recém-criado), ou false em erro.
     */
    async #addInPromocao(produto) {
        const banco = new Database();

        // Verifica se já existe promoção ativa para este produto
        const sqlCheck = 'SELECT idPromocao, prom_valor FROM promocao WHERE idProduto = ? AND prom_dataFinal >= CURDATE()';
        const existing = await banco.ExecutaComando(sqlCheck, [produto.id]);

        if (existing && existing.length > 0) {
            // Promoção já existe — retorna o preço promocional existente
            return Number(existing[0].prom_valor).toFixed(2);
        }

        // Cria nova promoção
        const discountRate = (await ProdutoPromocaoModel.GetDescontoAtual()) / 100;
        let precoFinal = Number(produto.preco) || 0;
        precoFinal = precoFinal - (precoFinal * discountRate);

        const sql = 'INSERT INTO promocao (prom_dataInicio, prom_dataFinal, prom_valor, prom_porcentagem, idProduto) VALUES (?, ?, ?, ?, ?)';
        const values = [new Date(), produto.validade, precoFinal.toFixed(2), discountRate * 100, produto.id];
        const result = await banco.ExecutaComandoNonQuery(sql, values);

        if (result) {
            return precoFinal.toFixed(2);
        } else {
            return false;
        }
    }

    /**
     * Busca produtos com lotes vencendo nos próximos 90 dias e os coloca em promoção.
     * Idempotente: não cria duplicatas graças ao #addInPromocao refatorado.
     */
    async ReadProductExpirationDateNear() {
        const sql = `SELECT p.*, c.cat_nome AS categoria_nome, l.lot_validade, l.lot_qnt 
                    FROM produto p 
                    LEFT JOIN categoria c ON p.Categoria_Produto = c.idCategoria 
                    LEFT JOIN produto_lote pl ON p.idProduto = pl.produto_idProduto
                    LEFT JOIN Lote l ON pl.lote_lot_id = l.lot_id
                    WHERE l.lot_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
                    AND coalesce(p.prod_status, 'Ativo') = 'Ativo'`;
        const banco = new Database();
        let rows = await banco.ExecutaComando(sql);
        if (!rows || rows.length === 0) { return false; }

        let produto = [];
        for (const row of rows) {
            let newProduct = new ProdutoPromocaoModel(
                row.idProduto,
                row.pro_nome,
                row.descricao,
                row.lot_validade,
                row.pro_preco,
                row.pro_quantidade,
                row.categoria_nome || 'Sem categoria',
                row.idFornecedor,
                row.marca,
                row.pro_img
            );
            let discountPrice = await this.#addInPromocao(newProduct);
            if (discountPrice) {
                newProduct.precoOriginal = row.pro_preco;
                newProduct.precoPromocional = discountPrice;
                newProduct.porcentagemDesconto = await ProdutoPromocaoModel.GetDescontoAtual();
                newProduct.preco = discountPrice;
                produto.push(newProduct);
            }
        }

        return produto.length > 0 ? produto : false;
    }

    /**
     * Lista todas as promoções ativas com dados do produto.
     * Usada pelo painel admin e pela home do usuário.
     */
    async ReadPromocoes() {
        const sql = `SELECT pr.idPromocao, pr.prom_dataInicio, pr.prom_dataFinal, 
                            pr.prom_valor, pr.prom_porcentagem, pr.idProduto,
                            p.pro_nome, p.pro_preco, p.pro_img, p.pro_quantidade,
                            c.cat_nome, p.marca, l.lot_validade, l.lot_id
                    FROM promocao pr
                    INNER JOIN produto p ON pr.idProduto = p.idProduto
                    LEFT JOIN categoria c ON p.Categoria_Produto = c.idCategoria
                    LEFT JOIN produto_lote pl ON p.idProduto = pl.produto_idProduto
                    LEFT JOIN Lote l ON pl.lote_lot_id = l.lot_id
                    WHERE pr.prom_dataFinal >= CURDATE()
                    AND coalesce(p.prod_status, 'Ativo') = 'Ativo'
                    ORDER BY pr.prom_dataFinal ASC`;
        const banco = new Database();
        const rows = await banco.ExecutaComando(sql);

        if (!rows || rows.length === 0) { return []; }

        return rows.map(row => ({
            idPromocao: row.idPromocao,
            dataInicio: row.prom_dataInicio,
            dataFinal: row.prom_dataFinal,
            precoPromocional: Number(row.prom_valor),
            porcentagem: Number(row.prom_porcentagem),
            idProduto: row.idProduto,
            nomeProduto: row.pro_nome,
            precoOriginal: Number(row.pro_preco),
            imgProduto: row.pro_img,
            quantidade: row.pro_quantidade,
            categoria: row.cat_nome,
            marca: row.marca,
            validade: row.lot_validade,
            lotId: row.lot_id
        }));
    }

    /**
     * Obtém promoção ativa de um produto específico.
     * @param {number} produtoId
     * @returns {object|null} dados da promoção ou null
     */
    async GetPromocaoByProdutoId(produtoId) {
        const sql = `SELECT pr.idPromocao, pr.prom_valor, pr.prom_porcentagem, pr.prom_dataFinal
                    FROM promocao pr
                    WHERE pr.idProduto = ? AND pr.prom_dataFinal >= CURDATE()
                    ORDER BY pr.idPromocao DESC LIMIT 1`;
        const banco = new Database();
        const rows = await banco.ExecutaComando(sql, [produtoId]);

        if (!rows || rows.length === 0) { return null; }

        return {
            idPromocao: rows[0].idPromocao,
            precoPromocional: Number(rows[0].prom_valor),
            porcentagem: Number(rows[0].prom_porcentagem),
            dataFinal: rows[0].prom_dataFinal
        };
    }

    /**
     * Remove uma promoção pelo ID.
     * @param {number} id — idPromocao
     */
    async RemoverPromocao(id) {
        const sql = 'DELETE FROM promocao WHERE idPromocao = ?';
        const banco = new Database();
        return await banco.ExecutaComandoNonQuery(sql, [id]);
    }

    /**
     * Lista todas as promoções (ativas + expiradas) para o painel admin.
     */
    async ReadTodasPromocoes() {
        const sql = `SELECT pr.idPromocao, pr.prom_dataInicio, pr.prom_dataFinal,
                            pr.prom_valor, pr.prom_porcentagem, pr.idProduto,
                            p.pro_nome, p.pro_preco, p.pro_img,
                            c.cat_nome,
                            (SELECT MIN(l.lot_validade)
                                FROM produto_lote pl
                                INNER JOIN Lote l ON pl.lote_lot_id = l.lot_id
                                WHERE pl.produto_idProduto = p.idProduto) AS lot_validade,
                            CASE
                                WHEN pr.prom_dataFinal < CURDATE() THEN 'Expirada'
                                ELSE 'Ativa'
                            END AS status
                    FROM promocao pr
                    INNER JOIN produto p ON pr.idProduto = p.idProduto
                    LEFT JOIN categoria c ON p.Categoria_Produto = c.idCategoria
                    ORDER BY pr.prom_dataFinal DESC`;
        const banco = new Database();
        const rows = await banco.ExecutaComando(sql);
        return rows || [];
    }
}

module.exports = ProdutoPromocaoModel;