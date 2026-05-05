const ProdutoModel = require('./ProdutoModel');
const Database = require('../utils/database')


class UsuarioProdutosModel extends ProdutoModel {
    constructor(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, img) {
        super(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, img);
    }

    async ReadAllProducts(){
        const sql = `SELECT p.*, c.cat_nome AS categoria_nome, l.lot_validade, l.lot_qnt 
                    FROM produto p 
                    LEFT JOIN categoria c ON p.Categoria_Produto = c.idCategoria
                    left join produto_lote pl on p.idProduto = pl.produto_idProduto
                    left join Lote l on pl.lote_lot_id = l.lot_id`;
        const banco = new Database();
        let rows =  await banco.ExecutaComando(sql);
        let produto = [];
        rows.forEach((row) => {
            produto.push(new UsuarioProdutosModel(
                row.idProduto,
                row.pro_nome,
                row.descricao,
                row.lot_validade,
                row.pro_preco,
                row.lot_qnt || 0,
                row.categoria_nome || 'Sem categoria',
                row.idFornecedor,
                row.marca,
                row.pro_img
            ));
        });
        return rows ? produto : false; 
    }
    

}

module.exports = UsuarioProdutosModel;