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
        const sql = 'insert into produto_lote (produto_idProduto, lote_lot_id) values (?, ?)';
        const values = [this.#prod_id, id];
        const banco = new Database();
        let result =  await banco.ExecutaComandoLastInserted(sql, values);
        return result;
    }
    async #CreateRelationWithFornecedor(id) {
        const sql = 'insert into fornecedor_lote (idFornecedor, lot_id) values (?, ?)';
        const values = [this.#forn_id, id];
        const banco = new Database();
        let result =  await banco.ExecutaComandoLastInserted(sql, values);   
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

}

module.exports = LoteModel;