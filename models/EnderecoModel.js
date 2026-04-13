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

    constructor(endId, endRua, endBairro, endCidade, endNum, endEstado, endUF, endCep, cliId){
        this.#endId = endId;
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

    async Get(id){
        let sql = "select * from endereco where end_id = ?";

        let values = [id];

        let rows = await banco.ExecutaComando(sql, values);
        
        if(rows.length > 0){
            let endreco = new EnderecoModel(
                rows[0].end_id,
                rows[0].end_rua,
                rows[0].end_bairro,
                rows[0].end_cidade,
                rows[0].end_num,
                rows[0].end_estado,
                rows[0].end_uf,
                rows[0].end_cep,
                rows[0].cli_id
            )
            return endreco;
        }
        return null;
    }

    async Read(){
        let sql = "select * from endereco";

        let rows = await banco.ExecutaComando(sql);
        let lista = [];

        rows.forEach(rows =>{
            let endereco = new EnderecoModel(
                rows.end_id,
                rows.end_rua,
                rows.end_bairro,
                rows.end_cidade,
                rows.end_num,
                rows.end_estado,
                rows.end_uf,
                rows.end_cep,
                rows.cli_id
            )
            lista.push(endereco);
        })
        return lista;
    }

    async Update(){
        let sql = "update endereco set end_rua = ?, end_bairro = ?, end_cidade = ?, end_num = ?, end_estado = ?, end_uf = ?, end_cep = ? where end_id = ?";
        let values = [this.#endRua, this.#endBairro, this.#endCidade, this.#endNum, this.#endEstado, this.#endUF, this.#endCep, this.#endId];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }

    async Delete (id){
        let sql = "delete from endereco where cli_id = ?";
        let values = [id];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }
}

module.exports = EnderecoModel;