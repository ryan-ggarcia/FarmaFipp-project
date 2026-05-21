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
    #produto_nome
    #venda_valor_total

    get produto_nome(){
        return this.#produto_nome;
    }

    set produto_nome(value){
        this.#produto_nome = value;
    }

    get venda_valor_total(){
        return this.#venda_valor_total;
    }

    set venda_valor_total(value){
        this.#venda_valor_total = value;
    }

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

    constructor(id_item, id_venda, id_produto, id_lote, item_quant, item_valor, item_valor_total, produto_nome, venda_valor_total){
        this.id_item = id_item
        this.id_venda = id_venda
        this.id_produto = id_produto
        this.id_lote = id_lote
        this.item_quant = item_quant
        this.item_valor = item_valor
        this.item_valor_total = item_valor_total
        this.#produto_nome = produto_nome
        this.#venda_valor_total = venda_valor_total
    }

    async RegistrarItemVenda(){
        let sql = "insert into venda_item_teste (id_venda, id_produto, id_lote, vitem_quant, vitem_valoruni, vitem_valortotal) values (?,?,?,?,?,?)"

        let values = [this.id_venda, this.id_produto, this.id_lote, this.item_quant, this.item_valor, this.item_valor_total]

        let result = await banco.ExecutaComando(sql, values)

        return result?.insertId || null
    }

    async ListarItensPorVenda(id_venda){
        let sql = "select * from venda_item_teste where id_venda = ?"

        let values = [id_venda]

        let result = await banco.ExecutaComando(sql, values)

        let lista = []

        for (let item of result){
            let itemVenda = new ItemVendaModel(item.id_item, item.id_venda, item.id_produto, item.id_lote, item.vitem_quant, item.vitem_valoruni, item.vitem_valortotal)
            lista.push(itemVenda)
        }
        return lista
    }

    async GetItemVenda(id_item){
        let sql = "select * from venda_item_teste where id_item = ?"

        let values = [id_item]

        let rows = await banco.ExecutaComando(sql, values)

        if (rows.length > 0){
            let item = rows[0]
            let itemVenda = new ItemVendaModel(item.id_item, item.id_venda, item.id_produto, item.id_lote, item.vitem_quant, item.vitem_valoruni, item.vitem_valortotal)
            return itemVenda
        }
        return null
    }

    async ListarVendas(){
        let sql = "select v.id_venda, v.ven_total, pr.pro_nome, vi.vitem_quant, vi.vitem_valoruni, vi.vitem_valortotal from venda_teste v inner join venda_item_teste vi on v.id_venda = vi.id_venda inner join produto pr on vi.id_produto = pr.idProduto order by 1";

        let rows = await banco.ExecutaComando(sql);

        return rows.map(function(row) {
            return {
                vendaId: row.id_venda,
                vendaValor: Number(row.ven_total || 0),
                itemNome: row.pro_nome,
                itemQuantidade: Number(row.vitem_quant || 0),
                itemValor: Number(row.vitem_valoruni || 0),
                itemValorTotal: Number(row.vitem_valortotal || 0)
            };
        });
    }

    toJSON(){
        return{
            vendaId: this.#id_venda,
            vendaValor: this.#venda_valor_total,
            itemQuant: this.#item_quant,
            itemValor: this.#item_valor,
            itemValorTotal: this.#item_valor_total,
            itemNome: this.#produto_nome
        }
    }
}

module.exports = ItemVendaModel