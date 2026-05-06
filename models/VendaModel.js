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
        let sql = "insert into venda_teste (ven_data, ven_status, ven_forma_pagamento, ven_total) values (?,?,?,?)"

        let values = [this.data, this.status, this.pagamento, this.total]

        let result = await banco.ExecutaComandoLastInserted(sql, values)

        return result
    }
}

module.exports = VendaModel