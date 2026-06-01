const Database = require("../utils/database");
const banco = new Database();

class ServicosCliente {
    #serv_id
    #serv_data
    #serv_obs
    #serv_tipo
    #cliente_id

    get serv_id(){
        return this.#serv_id;
    }

    set serv_id(value){
        this.#serv_id = value;
    }

    get serv_data(){
        return this.#serv_data;
    }

    set serv_data(value){
        this.#serv_data = value;
    }

    get serv_obs(){
        return this.#serv_obs;
    }

    set serv_obs(value){
        this.#serv_obs = value;
    }

    get serv_tipo(){
        return this.#serv_tipo;
    }

    set serv_tipo(value){
        this.#serv_tipo = value;
    }

    get cliente_id(){
        return this.#cliente_id;
    }

    set cliente_id(value){
        this.#cliente_id = value;
    }

    constructor(serv_id, serv_data, serv_obs, serv_tipo, cliente_id){
        this.#serv_id = serv_id;
        this.#serv_data = serv_data;
        this.#serv_obs = serv_obs;
        this.#serv_tipo = serv_tipo;
        this.#cliente_id = cliente_id;
    }

    async cadastrar(){
        let sql = "insert into servicos_cliente (serv_data, serv_obs, serv_tipo, cli_id) values (?,?,?,?)";

        let values = [this.#serv_data, this.#serv_obs, this.#serv_tipo, this.#cliente_id];

        let result = await banco.ExecutaComandoLastInserted(sql, values);

        return result;
    }

    async listar(){
        let sql = "select * from servicos_cliente sc inner join tipo_servico ts on sc.serv_tipo = ts.idTipo_Servico";

        let rows = await banco.ExecutaComando(sql);

        let lista = [];

        if(rows.length > 0){
            rows.forEach(row => {
                let servico = new ServicosCliente(
                    row.serv_id,
                    row.serv_data,
                    row.serv_obs,
                    row.serv_tipo,
                    row.cli_id
                );
                servico.tipo_nome = row.tipo_nome;
                lista.push(servico);
            });
        }
        return lista;
    }
}

module.exports = ServicosCliente;