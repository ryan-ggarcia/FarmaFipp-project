const Database = require('../utils/database')
const banco = new Database()

class VendaModel{
    #id
    #data
    #status
    #tipo
    #quantidade
    #valorFinal
    #funcionarioId
    #formaPagamento

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

    get tipo(){
        return this.#tipo
    }

    set tipo(value){
        this.#tipo = value
    }

    get quantidade(){
        return this.#quantidade
    }

    set quantidade(value){
        this.#quantidade = value
    }

    get valorFinal(){
        return this.#valorFinal
    }

    set valorFinal(value){
        this.#valorFinal = value
    }

    get funcionarioId(){
        return this.#funcionarioId
    }

    set funcionarioId(value){
        this.#funcionarioId = value
    }

    get formaPagamento(){
        return this.#formaPagamento
    }

    set formaPagamento(value){
        this.#formaPagamento = value
    }

    constructor(id, data, status, tipo, quantidade, valorFinal, funcionarioId, formaPagamento = 'PIX'){
        this.id = id
        this.data = data
        this.status = status
        this.tipo = tipo
        this.quantidade = quantidade
        this.valorFinal = valorFinal
        this.funcionarioId = funcionarioId
        this.formaPagamento = formaPagamento
    }

    async RegistrarVenda(transactionConnection = null){
        let sql = `INSERT INTO venda_teste
            (ven_status, ven_forma_pagamento, ven_total)
            VALUES (?, ?, ?)`

        let values = [this.status || 'PENDENTE', this.formaPagamento || 'PIX', this.valorFinal || 0]

        let result = transactionConnection
            ? await banco.ExecutaComandoLastInsertedTransacao(sql, values, transactionConnection)
            : await banco.ExecutaComandoLastInserted(sql, values)

        this.id = result;

        return result
    }

    async ListarVendas(){
        let sql = `SELECT v.id_venda, v.ven_data, v.ven_status, v.ven_total
                   FROM venda_teste v
                   ORDER BY v.id_venda DESC`

        let result = await banco.ExecutaComando(sql)

        let lista = []

        for (let item of result){
            let venda = new VendaModel(
                item.id_venda,
                item.ven_data,
                item.ven_status,
                null, 
                null,
                item.ven_total,
                null
            )
            lista.push(venda)
        }
        return lista
    }

    async Get(id){
        let sql = "SELECT * FROM venda_teste WHERE id_venda = ?"
        
        let values = [id]

        let rows = await banco.ExecutaComando(sql, values)

        if(rows.length > 0){
            let item = rows[0]
            let venda = new VendaModel(
                item.id_venda,
                item.ven_data,
                item.ven_status,
                null, 
                null,
                item.ven_total,
                null,
                item.ven_forma_pagamento
            )
            return venda
        }
        return null
    }

    async AtualizarVenda(transactionConnection = null){
        let sql = "UPDATE venda_teste SET ven_total = ?, ven_status = ? WHERE id_venda = ?"

        let values = [this.valorFinal, this.status, this.id]

        let result = transactionConnection
            ? await banco.ExecutaComandoNonQueryTransacao(sql, values, transactionConnection)
            : await banco.ExecutaComandoNonQuery(sql, values)

        return result
    }
}

module.exports = VendaModel