const Database = require('../utils/database');

class DescarteModel {
    #id
    #data
    #quantidade
    #produtoId
    #funcionarioId
    #nomeProduto
    #nomeFuncionario

    constructor(id, data, quantidade, produtoId, funcionarioId, nomeProduto, nomeFuncionario) {
        this.#id = id;
        this.#data = data;
        this.#quantidade = quantidade;
        this.#produtoId = produtoId;
        this.#funcionarioId = funcionarioId;
        this.#nomeProduto = nomeProduto || null;
        this.#nomeFuncionario = nomeFuncionario || null;
    }

    getID() { return this.#id; }
    getData() { return this.#data; }
    getQuantidade() { return this.#quantidade; }
    getProdutoId() { return this.#produtoId; }
    getFuncionarioId() { return this.#funcionarioId; }
    getNomeProduto() { return this.#nomeProduto; }
    getNomeFuncionario() { return this.#nomeFuncionario; }

    setID(x) { this.#id = x; }
    setData(x) { this.#data = x; }
    setQuantidade(x) { this.#quantidade = x; }
    setProdutoId(x) { this.#produtoId = x; }
    setFuncionarioId(x) { this.#funcionarioId = x; }

    async cadastrar() {
        let sql = `INSERT INTO efetuar_descarte 
            (des_date, des_quantidade, Produto_Descarte, Funcionario_Descarte) 
            VALUES (?, ?, ?, ?)`;

        let valores = [
            this.#data || new Date(),
            this.#quantidade,
            this.#produtoId,
            this.#funcionarioId
        ];

        let banco = new Database();
        let result = await banco.ExecutaComandoLastInserted(sql, valores);
        this.#id = result;
        return result;
    }

    async listar() {
        let sql = `
            SELECT 
                d.idEfetuar_descarte,
                d.des_date,
                d.des_quantidade,
                d.Produto_Descarte,
                d.Funcionario_Descarte,
                p.pro_nome,
                f.func_nome
            FROM efetuar_descarte d
            LEFT JOIN produto p ON d.Produto_Descarte = p.idProduto
            LEFT JOIN funcionario f ON d.Funcionario_Descarte = f.idFuncionario
            ORDER BY d.idEfetuar_descarte DESC
        `;

        let banco = new Database();
        let rows = await banco.ExecutaComando(sql);
        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            let descarte = new DescarteModel(
                rows[i]["idEfetuar_descarte"],
                rows[i]["des_date"],
                rows[i]["des_quantidade"],
                rows[i]["Produto_Descarte"],
                rows[i]["Funcionario_Descarte"],
                rows[i]["pro_nome"],
                rows[i]["func_nome"]
            );
            lista.push(descarte);
        }
        return lista;
    }

    async obter(id) {
        let sql = `
            SELECT d.*, p.pro_nome, f.func_nome
            FROM efetuar_descarte d
            LEFT JOIN produto p ON d.Produto_Descarte = p.idProduto
            LEFT JOIN funcionario f ON d.Funcionario_Descarte = f.idFuncionario
            WHERE d.idEfetuar_descarte = ?
        `;
        let valores = [id];
        let banco = new Database();
        let rows = await banco.ExecutaComando(sql, valores);

        if (rows.length > 0) {
            return new DescarteModel(
                rows[0]["idEfetuar_descarte"],
                rows[0]["des_date"],
                rows[0]["des_quantidade"],
                rows[0]["Produto_Descarte"],
                rows[0]["Funcionario_Descarte"],
                rows[0]["pro_nome"],
                rows[0]["func_nome"]
            );
        }
        return null;
    }

    async deletar(id) {
        let sql = "DELETE FROM efetuar_descarte WHERE idEfetuar_descarte = ?";
        let banco = new Database();
        let result = await banco.ExecutaComandoNonQuery(sql, [id]);
        return result;
    }
}

module.exports = DescarteModel;
