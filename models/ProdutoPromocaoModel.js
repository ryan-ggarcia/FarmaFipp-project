const ProdutoModel = require('./ProdutoModel');
const Database = require('../utils/database')

class ProdutoPromocaoModel extends ProdutoModel{
    constructor(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, img) {
        super(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, img);
    }

    async #addInPromocao(produto) {
        const discountRate = 0.15;
        let precoFinal = produto.preco || 0;
        precoFinal = precoFinal - (precoFinal * discountRate);
        let sql = 'insert into promocao (prom_dataInicio, prom_dataFinal, prom_valor, prom_porcentagem,idProduto) values (?, ?, ?, ?, ?)';
        let banco = new Database();
        let values = [ new Date(), produto.validade, precoFinal.toFixed(2), discountRate * 100, produto.id];
        let result = await banco.ExecutaComandoNonQuery(sql, values);
        if (result) {
            return precoFinal.toFixed(2);
        }else {
            return false;
        }
    }

    async ReadProductExpirationDateNear(){
        const sql = `SELECT p.*, c.cat_nome AS categoria_nome, l.lot_validade, l.lot_qnt 
                    FROM produto p 
                    LEFT JOIN categoria c ON p.Categoria_Produto = c.idCategoria 
                    left join produto_lote pl on p.idProduto = pl.produto_idProduto
                    left join Lote l on pl.lote_lot_id = l.lot_id
                    WHERE l.lot_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)`;
        const banco = new Database();
        let rows = await banco.ExecutaComando(sql);
        if(!rows || rows.length === 0) { return false; }
        let produto = [];
        let addedToPromocao = false;
        for (const row of rows) {
            let newProduct = new ProdutoPromocaoModel(
                row.idProduto,
                row.pro_nome,
                row.descricao,
                row.lot_validade,
                row.pro_preco,
                row.pro_quantidade,
                row.categoria_nome || 'Sem categoria',
                row.idFornecedor,
                row.marca,
                row.pro_img
            )
            let discounPrice = await this.#addInPromocao(newProduct);
            if (discounPrice) {
                newProduct.preco = discounPrice;
                produto.push(newProduct);
            }else {
                return false;
            }
        }

        return produto.length > 0 ? produto : false;
    }
}

module.exports = ProdutoPromocaoModel;