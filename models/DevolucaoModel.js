const Database = require("../utils/database");

class DevolucaoModel {
    #id
    #data
    #status
    #observacao
    #valorTotal
    #tipo
    #origem
    #dataCompra
    #dataFinalizacao
    #clienteId
    #funcionarioId
    #nomeCliente
    #nomeFuncionario

    constructor(id, data, status, observacao, valorTotal, tipo, origem, dataCompra, dataFinalizacao, clienteId, funcionarioId, nomeCliente, nomeFuncionario) {
        this.#id = id;
        this.#data = data;
        this.#status = status;
        this.#observacao = observacao;
        this.#valorTotal = valorTotal;
        this.#tipo = tipo;
        this.#origem = origem;
        this.#dataCompra = dataCompra;
        this.#dataFinalizacao = dataFinalizacao;
        this.#clienteId = clienteId;
        this.#funcionarioId = funcionarioId;
        this.#nomeCliente = nomeCliente;
        this.#nomeFuncionario = nomeFuncionario;
    }

    // Getters
    getID() { return this.#id; }
    getDATA() { return this.#data; }
    getSTATUS() { return this.#status; }
    getOBSERVACAO() { return this.#observacao; }
    getVALORTOTAL() { return this.#valorTotal; }
    getTIPO() { return this.#tipo; }
    getORIGEM() { return this.#origem; }
    getDATACOMPRA() { return this.#dataCompra; }
    getDATAFINALIZACAO() { return this.#dataFinalizacao; }
    getCLIENTEID() { return this.#clienteId; }
    getFUNCIONARIOID() { return this.#funcionarioId; }
    getNOMECLIENTE() { return this.#nomeCliente; }
    getNOMEFUNCIONARIO() { return this.#nomeFuncionario; }

    // Setters
    setID(x) { this.#id = x; }
    setDATA(x) { this.#data = x; }
    setSTATUS(x) { this.#status = x; }
    setOBSERVACAO(x) { this.#observacao = x; }
    setVALORTOTAL(x) { this.#valorTotal = x; }
    setTIPO(x) { this.#tipo = x; }
    setORIGEM(x) { this.#origem = x; }
    setDATACOMPRA(x) { this.#dataCompra = x; }
    setDATAFINALIZACAO(x) { this.#dataFinalizacao = x; }
    setCLIENTEID(x) { this.#clienteId = x; }
    setFUNCIONARIOID(x) { this.#funcionarioId = x; }
    setNOMECLIENTE(x) { this.#nomeCliente = x; }
    setNOMEFUNCIONARIO(x) { this.#nomeFuncionario = x; }

    async cadastrar() {
        let sql = `INSERT INTO efetuar_devolucao 
            (devo_data, devo_status, devo_observacao, devo_valorTotal, devo_tipo, devo_origem, devo_data_compra, Cliente_Devolucao, Funcionario_idFuncionario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        let valores = [
            this.#data,
            this.#status,
            this.#observacao,
            this.#valorTotal,
            this.#tipo,
            this.#origem,
            this.#dataCompra,
            this.#clienteId,
            this.#funcionarioId
        ];

        let banco = new Database();
        let result = await banco.ExecutaComandoLastInserted(sql, valores);
        return result;
    }

    async listar() {
        let sql = `
            SELECT 
                d.idEfetuar_devolucao, 
                d.devo_data, 
                d.devo_status, 
                d.devo_observacao, 
                d.devo_valorTotal, 
                d.devo_tipo, 
                d.devo_origem, 
                d.devo_data_compra, 
                d.devo_data_finalizacao,
                d.Cliente_Devolucao,
                d.Funcionario_idFuncionario,
                c.cli_nome,
                f.func_nome
            FROM efetuar_devolucao d
            LEFT JOIN cliente c ON d.Cliente_Devolucao = c.idClinete
            LEFT JOIN funcionario f ON d.Funcionario_idFuncionario = f.idFuncionario
            ORDER BY d.idEfetuar_devolucao DESC
        `;

        let banco = new Database();
        let rows = await banco.ExecutaComando(sql);
        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            let devolucao = new DevolucaoModel(
                rows[i]["idEfetuar_devolucao"],
                rows[i]["devo_data"],
                rows[i]["devo_status"],
                rows[i]["devo_observacao"],
                rows[i]["devo_valorTotal"],
                rows[i]["devo_tipo"],
                rows[i]["devo_origem"],
                rows[i]["devo_data_compra"],
                rows[i]["devo_data_finalizacao"],
                rows[i]["Cliente_Devolucao"],
                rows[i]["Funcionario_idFuncionario"],
                rows[i]["cli_nome"],
                rows[i]["func_nome"]
            );
            lista.push(devolucao);
        }
        return lista;
    }

    async obter(id) {
        let sql = `
            SELECT 
                d.*, 
                c.cli_nome, 
                f.func_nome
            FROM efetuar_devolucao d
            LEFT JOIN cliente c ON d.Cliente_Devolucao = c.idClinete
            LEFT JOIN funcionario f ON d.Funcionario_idFuncionario = f.idFuncionario
            WHERE d.idEfetuar_devolucao = ?
        `;
        let valores = [id];
        let banco = new Database();
        let rows = await banco.ExecutaComando(sql, valores);

        if (rows.length > 0) {
            let devolucao = new DevolucaoModel(
                rows[0]["idEfetuar_devolucao"],
                rows[0]["devo_data"],
                rows[0]["devo_status"],
                rows[0]["devo_observacao"],
                rows[0]["devo_valorTotal"],
                rows[0]["devo_tipo"],
                rows[0]["devo_origem"],
                rows[0]["devo_data_compra"],
                rows[0]["devo_data_finalizacao"],
                rows[0]["Cliente_Devolucao"],
                rows[0]["Funcionario_idFuncionario"],
                rows[0]["cli_nome"],
                rows[0]["func_nome"]
            );
            return devolucao;
        }
        return null;
    }

    async atualizarStatus() {
        let sql = `UPDATE efetuar_devolucao 
                    SET devo_status = ?, devo_observacao = ?, Funcionario_idFuncionario = ?`;
        let valores = [this.#status, this.#observacao, this.#funcionarioId];

        // Se o status for 'Aprovado' e é finalização, registrar a data
        if (this.#dataFinalizacao) {
            sql += `, devo_data_finalizacao = NOW()`;
        }

        sql += ` WHERE idEfetuar_devolucao = ?`;
        valores.push(this.#id);

        let banco = new Database();
        let result = await banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }

    async deletar(id) {
        // Primeiro deleta os itens filhos
        const sqlItens = "DELETE FROM item_devolucao WHERE EfetuarDevolucao_ItemDevolucao = ?";
        const valores = [id];
        const banco = new Database();

        await banco.ExecutaComandoNonQuery(sqlItens, valores);

        // Depois deleta a devolução
        const sql = "DELETE FROM efetuar_devolucao WHERE idEfetuar_devolucao = ?";
        let result = await banco.ExecutaComandoNonQuery(sql, valores);
        return result;
    }
}

module.exports = DevolucaoModel;
