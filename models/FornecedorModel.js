const Database = require('../utils/database');

class FornecedorModel{
    #id
    #nome
    #telefone
    #endereco
    #cnpj
    #status

    get id(){ return this.#id; } set id(value){ this.#id = value; }
    get nome(){ return this.#nome; } set nome(value){ this.#nome = value; }
    get telefone(){ return this.#telefone; } set telefone(value){ this.#telefone = value; }
    get endereco(){ return this.#endereco; } set endereco(value){ this.#endereco = value; }
    get cnpj(){ return this.#cnpj; } set cnpj(value){ this.#cnpj = value; }
    get status(){ return this.#status; } set status(value){ this.#status = value; } 



    constructor(id, nome, telefone, endereco, cnpj, status){
        this.#id = id;
        this.#nome = nome;
        this.#telefone = telefone;
        this.#endereco = endereco;
        this.#cnpj = cnpj;
        this.#status = status;
    }

    async Create(){
        const sql = `insert into fornecedor (forn_nome, forn_telefone, forn_cnpj, forn_status)
        values (?, ?, ?, ?)`;
        const values = [this.#nome, this.#telefone, this.#cnpj, this.#status];
        let database = new Database();
        let result = await database.ExecutaComandoNonQuery(sql, values);
        return result;
    }

    async List(){
        const sql = `select * from fornecedor`;
        let database = new Database();
        let rows = await database.ExecutaComando(sql);
        let fornecedores = [];
        rows.forEach(value => {
            value = new FornecedorModel(
                value.idFornecedor,
                value.forn_nome,
                value.forn_telefone,
                value.forn_endereco,
                value.forn_status,
                value.forn_cnpj
            );
            fornecedores.push(value);
        });

    }

    async delete(id){
        const sql = `delete from fornecedor where id = ?`;
        const values = [id];
        let database = new Database();
        let result = await database.ExecutaComandoNonQuery(sql, values);
        return result;
    }

}

module.exports = FornecedorModel;