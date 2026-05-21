const Database = require('../utils/database')
const banco = new Database()

class ItemVendaModel{
    #id_item
    #id_venda
    #id_produto
    #id_lote
    #item_quant
    #item_valor
    #item_valor_total

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

    get item_quant(){
        return this.#item_quant
    }

    set item_quant(value){
        this.#item_quant = value
    }

    get item_valor(){
        return this.#item_valor
    }

    set item_valor(value){
        this.#item_valor = value
    }

    get item_valor_total(){
        return this.#item_valor_total
    }

    set item_valor_total(value){
        this.#item_valor_total = value
    }

    constructor(id_item, id_venda, id_produto, id_lote, item_quant, item_valor, item_valor_total){
        this.id_item = id_item
        this.id_venda = id_venda
        this.id_produto = id_produto
        this.id_lote = id_lote
        this.item_quant = item_quant
        this.item_valor = item_valor
        this.item_valor_total = item_valor_total
    }

    async RegistrarItemVenda(){
        let sql = `INSERT INTO venda_item_teste 
            (id_venda, id_produto, id_lote, vitem_quant, vitem_valoruni, vitem_valortotal) 
            VALUES (?, ?, ?, ?, ?, ?)`

        let values = [this.id_venda, this.id_produto, this.id_lote, this.item_quant, this.item_valor, this.item_valor_total]

        let result = await banco.ExecutaComandoNonQuery(sql, values)

        return result
    }

    async ListarItensPorVenda(id_venda){
        let sql = `SELECT vil.*, p.pro_nome 
                   FROM venda_item_teste vil
                   INNER JOIN produto p ON vil.id_produto = p.idProduto
                   WHERE vil.id_venda = ?`

        let values = [id_venda]

        let result = await banco.ExecutaComando(sql, values)

        let lista = []

        for (let item of result){
            let itemVenda = new ItemVendaModel(
                item.id_venda_item, 
                item.id_venda, 
                item.id_produto, 
                item.id_lote, 
                item.vitem_quant, 
                item.vitem_valoruni, 
                item.vitem_valortotal
            )
            itemVenda.nomeProduto = item.pro_nome || null
            lista.push(itemVenda)
        }
        return lista
    }

    async GetItemVenda(id_item){
        let sql = "SELECT * FROM venda_item_teste WHERE id_venda_item = ?"

        let values = [id_item]

        let rows = await banco.ExecutaComando(sql, values)

        if (rows.length > 0){
            let item = rows[0]
            let itemVenda = new ItemVendaModel(
                item.id_venda_item, 
                item.id_venda, 
                item.id_produto, 
                item.id_lote, 
                item.vitem_quant, 
                item.vitem_valoruni, 
                item.vitem_valortotal
            )
            return itemVenda
        }
        return null
    }
}

module.exports = ItemVendaModel