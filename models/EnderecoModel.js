let Database = require('../utils/database');
let banco = new Database();

class EnderecoModel{
    #endId;
    #endRua;
    #endBairro;
    #endCidade;
    #endNum;
    #endEstado;
    #endUF;
    #endCep;
    #cliId;

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

    get endUF(){
        return this.#endUF;
    }

    set endUF(value){
        this.#endUF = value;
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

    constructor(endRua, endBairro, endCidade, endNum, endEstado, endUF, endCep, cliId){
        this.#endRua = endRua;
        this.#endBairro = endBairro;
        this.#endCidade = endCidade;
        this.#endNum = endNum;
        this.#endEstado = endEstado;
        this.#endUF = endUF;
        this.#endCep = endCep;
        this.#cliId = cliId;
    }

    async Create(){
        let sql = "insert into endereco (end_rua, end_bairro, end_cidade, end_num, end_estado, end_uf, end_cep, cli_id) values (?, ?, ?, ?, ?, ?, ?, ?)";
        let values = [this.#endRua, this.#endBairro, this.#endCidade, this.#endNum, this.#endEstado, this.#endUF, this.#endCep, this.#cliId];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }
}

module.exports = EnderecoModel;