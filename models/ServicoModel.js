const Database = require("../utils/database");

class ServicoModel{
    #id
    #data
    #hora
    #preco
    #status
    #obs
    #tipo
    #func
    #clie
    #desc_tipo
    #nome_func
    #nome_clie
    constructor(id,data,hora,preco,status,obs,tipo,func,clie,desc_tipo,nome_func,nome_clie) {
        this.#id = id;
        this.#data = data;
        this.#hora = hora;
        this.#preco = preco;
        this.#status = status;
        this.#obs = obs;
        this.#tipo = tipo;
        this.#func = func;
        this.#clie = clie;
        this.#desc_tipo = desc_tipo;
        this.#nome_func = nome_func;
        this.#nome_clie = nome_clie;
    }

    getID(){return this.#id}
    getDATA(){return this.#data}
    getTIPO(){return this.#tipo}
    getSTATUS(){return this.#status}
    getOBS(){return this.#obs}
    getFUNC(){return this.#func}
    getCLIE(){return this.#clie}
    getDESC_TIPO(){return this.#desc_tipo}
    getNOME_FUNC(){return this.#nome_func}
    getNOME_CLIE(){return this.#nome_clie}
    getHORA(){return this.#hora}
    getPRECO(){return this.#preco}

    setID(x){this.#id = x}
    setDATA(x){this.#data = x}
    setTIPO(x){this.#tipo = x}
    setSTATUS(x){this.#status = x}
    setOBS(x){this.#obs = x}
    setFUNC(x){this.#func = x}
    setCLIE(x){this.#clie = x}
    setDESC_TIPO(x){this.#desc_tipo = x}
    setNOME_FUNC(x){this.#nome_func = x}
    setNOME_CLIE(x){this.#nome_clie = x}
    setHORA(x){this.#hora = x}
    setPRECO(x){this.#preco = x}

    async cadastrar() {
        let sql = "insert into agendar_servico (serv_data,serv_hora,serv_preco,serv_status,serv_observacoes,serv_tipo,funcionario_agenda,cliente_agenda) values (?,?,?,?,?,?,?,?)"

        let valores = [
            this.getDATA(), 
            this.getHORA(), 
            this.getPRECO(), 
            this.getSTATUS(), 
            this.getOBS(), 
            this.getDESC(), 
            this.getTIPO(), 
            this.getFUNC(), 
            this.getCLIE()
            ];

        let banco = new Database();
        let result = await banco.ExecutaComandoNonQuery(sql,valores)

        return result;
    }

    async obter(id) {
        let sql = "select * from agendar_servico where idAgendar_Servico = ?";
        let valores = [id];

        let banco = new Database();

        let rows = await banco.ExecutaComando(sql, valores);

        if(rows.length > 0) {
            let servico = new ServicoModel(
                rows[0]["idAgendar_Servico"],
                rows[0]["serv_data"],
                rows[0]["serv_hora"],
                rows[0]["serv_preco"],
                rows[0]["serv_status"],
                rows[0]["serv_observacoes"],
                rows[0]["serv_descricao"],
                rows[0]["serv_tipo"],
                rows[0]["funcionario_agenda"],
                rows[0]["cliente_agenda"]
            );

            return servico;
        }

        return null;
    }

    async atualizar() {
        let sql = "update agendar_servico set serv_data = ?, serv_hora = ?, serv_preco = ?, serv_status = ?, serv_observacoes = ?, serv_tipo = ?, funcionario_agenda = ?, cliente_agenda = ? where idAgendar_Servico = ?";

        let valores = [
            this.getDATA(),
            this.getHORA(),
            this.getPRECO(),
            this.getSTATUS(),
            this.getOBS(),
            this.getDESC(),
            this.getTIPO(),
            this.getFUNC(),
            this.getCLIE(),
            this.getID()
        ];
        let banco = new Database();
        let result = await banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async deletar(id) {
        //Deletando primeiro a entidade filho do relacionamentos muitos pra muitos
        const sqlChild = "delete from agendar_servico_funcionario where Agendar_Servico_idAgendar_Servico = ?"
        
        const sql = "delete from agendar_servico where idAgendar_Servico = ?";
        const valores = [id]; 
        const banco = new Database();
        let deleteChild = await banco.ExecutaComandoNonQuery(sqlChild, valores);
        if(deleteChild){
            //Caso o retoro da promisse de deleção do filho seja positivo 
            let result = await banco.ExecutaComandoNonQuery(sql, valores);
            return result
        }else{
            return null;
        }

    }

    async listar() {
        
        let sql = `
            select 
                s.idAgendar_Servico, s.serv_data, s.serv_hora, s.serv_preco, s.serv_status, s.serv_observacoes, t.tipo_nome, f.func_nome, c.cli_nome
            from 
                agendar_servico s
            inner join Tipo_Servico t on s.serv_tipo = t.tipo_id
            inner join funcionario f on s.funcionario_agenda = f.idFuncionario
            inner join cliente c on s.cliente_agenda = c.idClinete

        `;

        let banco = new Database();
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for(let i = 0; i< rows.length; i++) {
            let servico = new ServicoModel(
                rows[i]["idAgendar_Servico"],
                rows[i]["serv_data"],
                rows[i]["serv_hora"],
                rows[i]["serv_preco"],
                rows[i]["serv_status"],
                rows[i]["serv_observacoes"],
                rows[i]["serv_tipo"],
                rows[i]["funcionario_agenda"],
                rows[i]["cliente_agenda"],
                rows[i]["tipo_nome"],
                rows[i]["func_nome"],
                rows[i]["cli_nome"]
            );
            lista.push(servico);
        }
        return lista;
    }
}

module.exports = ServicoModel;