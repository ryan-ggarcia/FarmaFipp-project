const DataBase = require('../utils/database');

class TipoServico{
    #id
    #nome
    #desc

    constructor(id,nome,desc) {
        this.#id = id;
        this.#nome = nome;
        this.#desc = desc;
    }

    getID(){return this.#id}
    getNOME(){return this.#nome}
    getDESC(){return this.#desc}

    setID(x){this.#id = x}
    setNOME(x){this.#nome = x}
    setDESC(x){this.#desc = x}

    async listar(){
        let sql = "select * from Tipo_Servico";
        let banco = new DataBase();
        let result = await banco.ExecutaComando(sql);
        let lista = []
        for(let i = 0; i < result.length; i++) {
            let linha = new TipoServico(
                result[i]["tipo_id"],
                result[i]["tipo_nome"],
                result[i]["tipo_descricao"]
            )
            lista.push(linha);
        }
        return lista;
    }
}
module.exports = TipoServico;