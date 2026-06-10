const DataBase = require('../utils/database');

class TipoServico{
    #id
    #nome
    #desc
    #valor

    constructor(id,nome,desc,valor) {
        this.#id = id;
        this.#nome = nome;
        this.#desc = desc;
        this.#valor = valor;
    }

    getID(){return this.#id}
    getNOME(){return this.#nome}
    getDESC(){return this.#desc}
    getVALOR(){return this.#valor}

    setID(x){this.#id = x}
    setNOME(x){this.#nome = x}
    setDESC(x){this.#desc = x}
    setVALOR(x){this.#valor = x}

    async listar(){
        let sql = "select * from Tipo_Servico";
        let banco = new DataBase();
        let result = await banco.ExecutaComando(sql);
        let lista = []
        for(let i = 0; i < result.length; i++) {
            let linha = new TipoServico(
                result[i]["tipo_id"],
                result[i]["tipo_nome"],
                result[i]["tipo_descricao"],
                result[i]["tipo_valor"]
            )
            lista.push(linha);
        }
        return lista;
    }

    async obter(id){
        let sql = "select * from Tipo_Servico where tipo_id = ?";
        let banco = new DataBase();
        let rows = await banco.ExecutaComando(sql, [id]);
        if(rows.length > 0){
            return new TipoServico(
                rows[0]["tipo_id"],
                rows[0]["tipo_nome"],
                rows[0]["tipo_descricao"],
                rows[0]["tipo_valor"]
            );
        }
        return null;
    }
}
module.exports = TipoServico;