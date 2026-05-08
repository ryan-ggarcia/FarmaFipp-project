const Database = require('../utils/database')
const banco = new Database()

class ItemVendaModel{
    #id_item
    #id_venda
    #id_produto
    #id_lote

    get id_item(){
        return this.#id_item
    }

    set id_item(value){
        this.#id_item = value
    }

    get id_venda(){
        return this.#id_venda
    }

    set id_venda(value){
        this.#id_venda = value
    }

    get id_produto(){
        return this.#id_produto
    }

    set id_produto(value){
        this.#id_produto = value
    }

    get id_lote(){
        return this.#id_lote
    }

    set id_lote(value){
        this.#id_lote = value
    }

    constructor(id_item, id_venda, id_produto, id_lote){
        this.id_item = id_item
        this.id_venda = id_venda
        this.id_produto = id_produto
        this.id_lote = id_lote
    }

    async RegistrarItemVenda(){
        let sql = "insert into venda_item_teste (id_venda, id_produto, id_lote) values (?,?,?)"

        let values = [this.id_venda, this.id_produto, this.id_lote]

        let result = await banco.ExecutaComando(sql, values)

        return result?.insertId || null
    }
}

module.exports = ItemVendaModel