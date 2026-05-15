const Database = require('../utils/database')
const banco = new Database()

class VendaModel{
    #id
    #data
    #status
    #pagamento
    #total

    get id(){
        return this.#id
    }

    set id(value){
        this.#id = value
    }

    get data(){
        return this.#data
    }

    set data(value){
        this.#data = value
    }

    get status(){
        return this.#status
    }

    set status(value){
        this.#status = value
    }

    get pagamento(){
        return this.#pagamento
    }

    set pagamento(value){
        this.#pagamento = value
    }

    get total(){
        return this.#total
    }

    set total(value){
        this.#total = value
    }

    constructor(id, data, status, pagamento, total){
        this.id = id
        this.data = data
        this.status = status
        this.pagamento = pagamento
        this.total = total
    }

    async RegistrarVenda(){
        let sql = "insert into venda_teste (ven_data) values (now())"

        let values = [this.data, this.status, this.pagamento, this.total]

        let result = await banco.ExecutaComandoLastInserted(sql, values)
        
        this.id = result;

        return result
    }

    async ListarVendas(){
        let sql = "select * from venda_teste"

        let result = await banco.ExecutaComando(sql)

        let lista = []

        for (let item of result){
            let venda = new VendaModel(item.id_venda, item.ven_data, item.ven_status, item.ven_forma_pagamento, item.ven_total)
            lista.push(venda)
        }
        return lista
    }

    async Get(id){
        let sql = "select * from venda_teste where id_venda = ?"
        
        let values = [id]

       let rows = await banco.ExecutaComando(sql, values)

       if(rows.length > 0){
            rows.forEach(item => {
                let venda = new VendaModel(item.id_venda, item.ven_data, item.ven_status, item.ven_forma_pagamento, item.ven_total)
                return venda
            })
       }
       return null
    }

    async AtualizarVenda(){
        let sql = "update venda_teste set ven_total = ? where id_venda = ?"

        let values = [this.total, this.id]

        let result = await banco.ExecutaComandoNonQuery(sql, values)

        return result
    }
}

module.exports = VendaModel