const Database = require('../utils/database');

class FornecedorModel{
    #id
    #nome
    #telefone
    #cnpj
    #status

    get id(){ return this.#id; } set id(value){ this.#id = value; }
    get nome(){ return this.#nome; } set nome(value){ this.#nome = value; }
    get telefone(){ return this.#telefone; } set telefone(value){ this.#telefone = value; }
    get cnpj(){ return this.#cnpj; } set cnpj(value){ this.#cnpj = value; }
    get status(){ return this.#status; } set status(value){ this.#status = value; } 



    constructor(id, nome, telefone, cnpj, status){
        this.#id = id;
        this.#nome = nome;
        this.#telefone = telefone;
        this.#cnpj = cnpj;
        this.#status = status;
    }

    async Create(){
        const sql = `insert into fornecedor (forn_nome, forn_telefone, forn_cnpj, forn_status)
        values (?, ?, ?, ?)`;
        const values = [this.#nome, this.#telefone, this.#cnpj, this.#status];
        let database = new Database();
        let result = await database.ExecutaComandoLastInserted(sql, values);
        return result;
    }

    async Get(id){
        const sql = `select * from fornecedor f left join endereco e on f.idFornecedor = e.idFornecedor where f.idFornecedor = ?`;
        const values = [id];
        let database = new Database();
        let rows = await database.ExecutaComando(sql, values);
        if(rows.length > 0){
            let fornecedor = new FornecedorModel(
                rows[0].idFornecedor,
                rows[0].forn_nome,
                rows[0].forn_telefone,
                rows[0].forn_cnpj,
                rows[0].forn_status,
//                rows[0].end_rua,
//                rows[0].end_bairro,
//                rows[0].end_cidade,
//                rows[0].end_num,
//                rows[0].end_estado,
//                rows[0].end_uf,
//                rows[0].end_cep
            );
            return fornecedor;
        } else {
            return false;
        }
    }

    async Update(){
        const sql = `update fornecedor set forn_nome = ?, forn_telefone = ?, forn_cnpj = ?  where idFornecedor = ?`;
        const values = [this.#nome, this.#telefone, this.#cnpj, this.#id];
        let database = new Database();
        let result = await database.ExecutaComandoNonQuery(sql, values);
        return result;
    }

    async ValidateByCnpj(cnpj){
        const sql = `select * from fornecedor where forn_cnpj = ?`;
        const values = [cnpj];
        let database = new Database();
        let rows = await database.ExecutaComando(sql, values);
        return rows;
    }

    async ValidateByCnpjInativo(cnpj){
        const sql = `select * from fornecedor where forn_cnpj = ? and forn_status = 'inativo'`;
        const values = [cnpj];
        let database = new Database();
        let rows = await database.ExecutaComando(sql, values);
        return rows;
    }

    async AtiveFornecedor(cnpj){
        const sql = `update fornecedor set forn_status = 'ativo' where forn_cnpj = ? and forn_status = 'inativo'`;
        const values = [cnpj];
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
                value.forn_cnpj,
                value.forn_status
            );
            fornecedores.push(value);
        });
        return fornecedores;
    }

    async Delete(id){
        //Deleção lógica
        const sql = `update fornecedor set forn_status = 'inativo' where idFornecedor = ?`;
        const values = [id];
        let database = new Database();
        let result = await database.ExecutaComandoNonQuery(sql, values);
        return result;
    }

}

module.exports = FornecedorModel;