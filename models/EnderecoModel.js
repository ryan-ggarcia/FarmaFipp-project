let Database = require('../utils/database');
let banco = new Database();

class EnderecoModel{
    #endId;
    #endRua;
    #endBairro;
    #endCidade;
    #endNum;
    #endEstado;
    #endUf;
    #endCep;
    #cliId;
    #idFornecedor;

    get endId(){
        return this.#endId;
    }

    set endId(value){
        this.#endId = value;
    }

    get endRua(){
        return this.#endRua;
    }

    set endRua(value){
        this.#endRua = value;
    }

    get endBairro(){
        return this.#endBairro;
    }

    set endBairro(value){
        this.#endBairro = value;
    }

    get endCidade(){
        return this.#endCidade;
    }

    set endCidade(value){
        this.#endCidade = value;
    }

    get endNum(){
        return this.#endNum;
    }

    set endNum(value){
        this.#endNum = value;
    }

    get endEstado(){
        return this.#endEstado;
    }

    set endEstado(value){
        this.#endEstado = value;
    }

    get endUf(){
        return this.#endUf;
    }

    set endUf(value){
        this.#endUf = value;
    }

    get endCep(){
        return this.#endCep;
    }

    set endCep(value){
        this.#endCep = value;
    }

    get cliId(){
        return this.#cliId;
    }

    set cliId(value){
        this.#cliId = value;
    }

    get idFornecedor(){
        return this.#idFornecedor;
    }

    set idFornecedor(value){
        this.#idFornecedor = value;
    }

    constructor(endId, endRua, endBairro, endCidade, endNum, endEstado, endUf, endCep, cliId, idFornecedor){
        this.#endId = endId;
        this.#endRua = endRua;
        this.#endBairro = endBairro;
        this.#endCidade = endCidade;
        this.#endNum = endNum;
        this.#endEstado = endEstado;
        this.#endUf = endUf;
        this.#endCep = endCep;
        this.#cliId = cliId;
        this.#idFornecedor = idFornecedor;
    }

    async Create(){
        let sql = "insert into endereco (end_rua, end_bairro, end_cidade, end_num, end_estado, end_uf, end_cep, idFornecedor) values (?, ?, ?, ?, ?, ?, ?, ?)";

        let values = [this.#endRua, this.#endBairro, this.#endCidade, this.#endNum, this.#endEstado, this.#endUf, this.#endCep, this.#idFornecedor];

        let result = await banco.ExecutaComandoLastInserted(sql, values);

        return result;
    }

    async UpdateFornecedorEndereço(){
        let sql = "update endereco set end_rua = ?, end_bairro = ?, end_cidade = ?, end_num = ?, end_estado = ?, end_uf = ?, end_cep = ? where idFornecedor = ?";

        let values = [this.#endRua, this.#endBairro, this.#endCidade, this.#endNum, this.#endEstado, this.#endUf, this.#endCep, this.#idFornecedor];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }

    async Get(id){
        let sql = "select * from endereco where end_id = ?";

        let values = [id];

        let rows = await banco.ExecutaComando(sql, values);

        if(rows.length > 0){
            let endereco = new EnderecoModel(
                rows[0]["end_id"],
                rows[0]["end_rua"],
                rows[0]["end_bairro"],
                rows[0]["end_cidade"],
                rows[0]["end_num"],
                rows[0]["end_estado"],
                rows[0]["end_uf"],
                rows[0]["end_cep"],
                null,
                rows[0]["idFornecedor"]);

            return endereco;
        }
        return false;
    }

    async GetByFornecedor(id){
        const sql = 'select * from endereco where idFornecedor = ?';
        const values = [id];

        let rows = await banco.ExecutaComando(sql, values);

        if(rows.length > 0){
            let endereco = new EnderecoModel(
                rows[0]["end_id"],
                rows[0]["end_rua"],
                rows[0]["end_bairro"],
                rows[0]["end_cidade"],
                rows[0]["end_num"],
                rows[0]["end_estado"],
                rows[0]["end_uf"],
                rows[0]["end_cep"],
                null,
                rows[0]["idFornecedor"]);

            return endereco;
        }
        return false;
    }

    async DeleteByCliente(id){
        return false;
    }
    async DeleteByFornecedor(id){
        let sql = "delete from endereco where idFornecedor = ? ";

        let values = [id];

        let result = await banco.ExecutaComandoNonQuery(sql, values);
        
        return result;
    }

}

module.exports = EnderecoModel;