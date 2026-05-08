const Database = require('../utils/database');

class LoteModel {
    #id;
    #prod_id;
    #validade;
    #quantidade;
    #forn_id;
    #lot_name;

    get id() { return this.#id; } set id(value) { this.#id = value; }
    get prod_id() { return this.#prod_id; } set prod_id(value) { this.#prod_id = value; }
    get validade() { return this.#validade; } set validade(value) { this.#validade = value; }
    get quantidade() { return this.#quantidade; } set quantidade(value) { this.#quantidade = value; }
    get forn_id() { return this.#forn_id; } set forn_id(value) { this.#forn_id = value; }
    get lot_name() { return this.#lot_name; } set lot_name(value) { this.#lot_name = value; }

    constructor(id, prod_id, validade, quantidade, forn_id, lot_name) {
        this.#id = id;
        this.#prod_id = prod_id;
        this.#validade = validade;
        this.#quantidade = quantidade;
        this.#forn_id = forn_id;
        this.#lot_name = lot_name;
    }

    async #CreateRelationWithProduto(id) {
        const banco = new Database();
        let prod_ids = Array.isArray(this.#prod_id) ? this.#prod_id : [this.#prod_id];
        
        for (let prod of prod_ids) {
            const sql = 'insert into produto_lote (produto_idProduto, lote_lot_id) values (?, ?)';
            const values = [prod, id];
            let result = await banco.ExecutaComandoNonQuery(sql, values);
            if (!result) return false;
        }
        return true;
    }
    async #CreateRelationWithFornecedor(id) {
        const sql = 'insert into fornecedor_lote (idFornecedor, lot_id) values (?, ?)';
        const values = [this.#forn_id, id];
        const banco = new Database();
        let result =  await banco.ExecutaComandoNonQuery(sql, values);   
        return result;
    }

    async Create() {
        const sql = 'insert into Lote (lot_qnt, lot_name, lot_validade) values (?, ?, ?)';
        const values = [this.#quantidade, this.#lot_name, this.#validade];
        const banco = new Database();
        let result =  await banco.ExecutaComandoLastInserted(sql, values);
        let relationProduto = await this.#CreateRelationWithProduto(result);
        let relationFornecedor = await this.#CreateRelationWithFornecedor(result);
        if(!relationProduto || !relationFornecedor) {
            return 'Erro ao criar as relações do lote!';
        }
        return result;
    }

    async List() {
        const sql = 'select * from Lote';
        const banco = new Database();
        let rows = await banco.ExecutaComando(sql);
        if (rows.length > 0) {
            rows.forEach(row => {
                let lote = new LoteModel(row.lot_id, row.prod_id, row.lot_validade, row.lot_qnt, row.forn_id, row.lot_name);
                lote.id = row.lot_id;
                lote.prod_id = row.prod_id;
                lote.validade = row.lot_validade;
                lote.quantidade = row.lot_qnt;
                lote.forn_id = row.forn_id;
                lote.lot_name = row.lot_name;
            });
            return rows;
        } else {
            return false;
        }
        
    }

    async HasAvailableStock(quantidade) {
        const quantidadeNum = Number(quantidade);

        if (!this.#id || Number.isNaN(quantidadeNum) || quantidadeNum <= 0) {
            return false;
        }

        const sql = 'select lot_qnt from Lote where lot_id = ? limit 1';
        const values = [this.#id];
        const banco = new Database();
        const rows = await banco.ExecutaComando(sql, values);

        if (!rows || !rows.length) {
            return false;
        }

        return Number(rows[0].lot_qnt) >= quantidadeNum;
    }

    async DecreaseStock(quantidade) {
        const quantidadeNum = Number(quantidade);

        if (!this.#id || Number.isNaN(quantidadeNum) || quantidadeNum <= 0) {
            return false;
        }

        const sql = 'update Lote set lot_qnt = lot_qnt - ? where lot_id = ? and lot_qnt >= ?';
        const values = [quantidadeNum, this.#id, quantidadeNum];
        const banco = new Database();
        const result = await banco.ExecutaComando(sql, values);

        return !!(result && result.affectedRows > 0);
    }

    async IncreaseStock(quantidade) {
        const quantidadeNum = Number(quantidade);

        if (!this.#id || Number.isNaN(quantidadeNum) || quantidadeNum <= 0) {
            return false;
        }

        const sql = 'update Lote set lot_qnt = lot_qnt + ? where lot_id = ?';
        const values = [quantidadeNum, this.#id];
        const banco = new Database();
        const result = await banco.ExecutaComando(sql, values);

        return !!(result && result.affectedRows > 0);
    }
}

module.exports = LoteModel;