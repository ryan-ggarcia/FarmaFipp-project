const Database = require("../utils/database");

class ItemDevolucaoModel {
    #id
    #quantidade
    #devolucaoId
    #motivo
    #produtoId
    #nomeProduto

    constructor(id, quantidade, devolucaoId, motivo, produtoId, nomeProduto) {
        this.#id = id;
        this.#quantidade = quantidade;
        this.#devolucaoId = devolucaoId;
        this.#motivo = motivo;
        this.#produtoId = produtoId;
        this.#nomeProduto = nomeProduto;
    }

    // Getters
    getID() { return this.#id; }
    getQUANTIDADE() { return this.#quantidade; }
    getDEVOLUCAOID() { return this.#devolucaoId; }
    getMOTIVO() { return this.#motivo; }
    getPRODUTOID() { return this.#produtoId; }
    getNOMEPRODUTO() { return this.#nomeProduto; }

    // Setters
    setID(x) { this.#id = x; }
    setQUANTIDADE(x) { this.#quantidade = x; }
    setDEVOLUCAOID(x) { this.#devolucaoId = x; }
    setMOTIVO(x) { this.#motivo = x; }
    setPRODUTOID(x) { this.#produtoId = x; }
    setNOMEPRODUTO(x) { this.#nomeProduto = x; }

    async cadastrar() {
        let sql = `INSERT INTO item_devolucao 
            (itemDev_quantidade, EfetuarDevolucao_ItemDevolucao, itemDev_motivo, Produto_ItemDevolucao) 
            VALUES (?, ?, ?, ?)`;

        let valores = [
            this.#quantidade,
            this.#devolucaoId,
            this.#motivo,
            this.#produtoId
        ];

        let banco = new Database();
        let result = await banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }

    async listarPorDevolucao(devolucaoId) {
        let sql = `
            SELECT 
                i.idItem_devolucao, 
                i.itemDev_quantidade, 
                i.EfetuarDevolucao_ItemDevolucao, 
                i.itemDev_motivo, 
                i.Produto_ItemDevolucao,
                p.pro_nome
            FROM item_devolucao i
            INNER JOIN produto p ON i.Produto_ItemDevolucao = p.idProduto
            WHERE i.EfetuarDevolucao_ItemDevolucao = ?
        `;

        let valores = [devolucaoId];
        let banco = new Database();
        let rows = await banco.ExecutaComando(sql, valores);
        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            let item = new ItemDevolucaoModel(
                rows[i]["idItem_devolucao"],
                rows[i]["itemDev_quantidade"],
                rows[i]["EfetuarDevolucao_ItemDevolucao"],
                rows[i]["itemDev_motivo"],
                rows[i]["Produto_ItemDevolucao"],
                rows[i]["pro_nome"]
            );
            lista.push(item);
        }
        return lista;
    }
}

module.exports = ItemDevolucaoModel;
