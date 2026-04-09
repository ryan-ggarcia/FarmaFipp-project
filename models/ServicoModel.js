const Database = require("../utils/database");

class ServicoModel{
    #id
    #data
    #tipo
    #status
    #desc

    constructor(a, b, c, d, e){
        this.setID(a);
        this.setDATA(b);
        this.setTIPO(c);
        this.setSTATUS(d);
        this.setDESC(e);
    }

    getID(){return this.#id}
    getDATA(){return this.#data}
    getTIPO(){return this.#tipo}
    getSTATUS(){return this.#status}
    getDESC(){return this.#desc}

    setID(x){this.#id = x}
    setDATA(x){this.#data = x}
    setTIPO(x){this.#tipo = x}
    setSTATUS(x){this.#status = x}
    setDESC(x){this.#desc = x}

    async cadastrar() {
        let sql = "insert into Servico (serv_data,serv_tipo, serv_status, serv_descricao) values (?,?,?,?)"

        let valores = [this.getDATA(), this.getTIPO(), this.getSTATUS(), this.getDESC()];

        let banco = new Database();
        let result = await banco.ExecutaComandoNonQuery(sql,valores)

        return result;
    }

    async obter(id) {
        let sql = "select * from Servico where idServico = ?";
        let valores = [id];

        let banco = new Database();

        let rows = await banco.ExecutaComando(sql, valores);

        if(rows.length > 0) {
            let servico = new ServicoModel(rows[0]["idServico"],rows[0]["serv_data"], rows[0]["serv_tipo"], rows[0]["serv_status"], rows[0]["serv_descricao"]);

            return servico;
        }

        return null;
    }

    async atualizar() {
        let sql = "update Servico set serv_data = ?, serv_tipo = ?, serv_status = ?, serv_descricao = ? where idServico = ?";

        let valores = [this.getDATA(), this.getTIPO(), this.getSTATUS(), this.getDESC(), this.getID()];
        let banco = new Database();
        let result = await banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async deletar(id) {
        let sql = "delete from Servico where idServico = ?";
        let valores = [id]; 
        let banco = new Database();

        let result = await banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async listar() {
        let sql = "select * from Servico";

        let banco = new Database();
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for(let i = 0; i< rows.length; i++) {
            let servico = new ServicoModel(rows[i]["idServico"], rows[i]["serv_data"], rows[i]["serv_tipo"], rows[i]["serv_status"], rows[i]["serv_descricao"]);
            lista.push(servico);
        }
        return lista;
    }
}

module.exports = ServicoModel;