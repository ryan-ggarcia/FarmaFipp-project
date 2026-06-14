const Database = require("../utils/database");
const banco = new Database();

class ServicosCliente {
    #serv_id
    #serv_data
    #serv_obs
    #serv_tipo
    #serv_status
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

    get serv_status(){
        return this.#serv_status;
    }

    set serv_status(value){
        this.#serv_status = value;
    }

    get cliente_id(){
        return this.#cliente_id;
    }

    set cliente_id(value){
        this.#cliente_id = value;
    }

    constructor(serv_id, serv_data, serv_obs, serv_tipo, serv_status, cliente_id){
        this.#serv_id = serv_id;
        this.#serv_data = serv_data;
        this.#serv_obs = serv_obs;
        this.#serv_tipo = serv_tipo;
        this.#serv_status = serv_status;
        this.#cliente_id = cliente_id;
    }

    async cadastrar(){
        let sql = "insert into servicos_cliente (serv_data, serv_obs, serv_tipo, serv_status, cli_id) values (?,?,?,?,?)";

        let values = [this.#serv_data, this.#serv_obs, this.#serv_tipo, this.#serv_status, this.#cliente_id];

        let result = await banco.ExecutaComandoLastInserted(sql, values);

        return result;
    }

    async listar(){
        let sql = "select * from servicos_cliente sc inner join Tipo_Servico ts on sc.serv_tipo = ts.tipo_id";

        let rows = await banco.ExecutaComando(sql);

        let lista = [];

        if(rows.length > 0){
            rows.forEach(row => {
                let servico = new ServicosCliente(
                    row.serv_id,
                    row.serv_data,
                    row.serv_obs,
                    row.serv_tipo,
                    row.serv_status,
                    row.cli_id
                );
                servico.tipo_nome = row.tipo_nome;
                lista.push(servico);
            });
        }
        return lista;
    }

    async listarSolicitacoesAdmin(){
        const sql = `
            select
                sc.serv_id,
                sc.serv_data,
                sc.serv_obs,
                sc.serv_tipo,
                sc.serv_status,
                sc.cli_id,
                ts.tipo_nome,
                c.cli_nome
            from servicos_cliente sc
            inner join Tipo_Servico ts on sc.serv_tipo = ts.tipo_id
            inner join cliente c on sc.cli_id = c.idClinete
            order by sc.serv_data asc
        `;

        const rows = await banco.ExecutaComando(sql);
        return rows || [];
    }

    async atualizarStatus(id, status){
        const sql = "update servicos_cliente set serv_status = ? where serv_id = ?";
        const values = [status, id];
        const result = await banco.ExecutaComandoNonQuery(sql, values);
        return result;
    }

    async deletar(id){
        let sql = "update servicos_cliente set serv_status = 'Inativo' where serv_id = ?";

        let values = [id];

        let result = await banco.ExecutaComando(sql, values);

        return result;
    }

    async update (id){
            let sql = "update servicos_cliente set serv_data = ?, serv_obs = ?, serv_tipo = ? where serv_id = ?";

            let values = [this.#serv_data, this.#serv_obs, this.#serv_tipo, id];

            let result = await banco.ExecutaComando(sql, values);

            return result;
    }

    async get(id){
        let sql = "select * from servicos_cliente where serv_id = ?";

        let values = [id];

        let rows = await banco.ExecutaComando(sql, values);
        let lista = [];

        if(rows.length > 0){
            for(let row of rows){
                let servico = new ServicosCliente(
                    row.serv_id,
                    row.serv_data,
                    row.serv_obs,
                    row.serv_tipo,
                    row.serv_status,
                    row.cli_id
                );
                lista.push(servico);
            }
        }
        return lista;
    }
}

module.exports = ServicosCliente;