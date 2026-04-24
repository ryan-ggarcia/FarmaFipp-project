const UsuarioProdutoModel = require('../models/UsuarioProdutosModel');

class UsuarioProdutosController {

    #processarProdutos(produtos, isPromocao = false) {
        const today = new Date();
        const desconto = 0.15
        
        return produtos.map(produto => {
            let precoFinal = Number(produto.preco || 0);


            if (isPromocao && produto.validade) {
                let dateValidade = new Date(produto.validade);
                let restDays = Math.ceil((dateValidade - today) / (1000 * 60 * 60 * 24));

                if(restDays <= 90) {
                    precoFinal = precoFinal * (1 - desconto);
                }
            }
            return {
            id: produto.id,
            nome: produto.nome || 'Produto sem nome',
            descricao: produto.descricao || 'Descrição não disponível',
            validade: produto.validade || 'Produto sem validade',
            preco: precoFinal.toFixed(2),
            quantidade: produto.quantidade || 0,
            categoria: produto.categoria || 'Categoria não disponível',
            fornecedor: produto.fornecedor || 'Fornecedor não disponível',
            marca: produto.marca || 'Marca não disponível',
            img: produto.img || 'Imagem não disponível'
        }
        })
        
        

    }

    async UserProductsView(req, res) {
        let userProducts = new UsuarioProdutoModel();
        let produtosRaw = await userProducts.ReadAllProducts();
        let produtos = produtosRaw ? this.#processarProdutos(produtosRaw) : [];
        let ProdutosPromocaoRaw = await userProducts.ReadProductExpirationDateNear();
        let produtosPromocao = ProdutosPromocaoRaw ? this.#processarProdutos(ProdutosPromocaoRaw, true) : [];
        res.render("usuarioView/produtos", { layout: "layoutPublico", produtos, produtosPromocao });
    }
}

module.exports = UsuarioProdutosController;