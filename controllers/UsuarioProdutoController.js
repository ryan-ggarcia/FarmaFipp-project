const UsuarioProdutoModel = require('../models/UsuarioProdutosModel');

class UsuarioProdutosController {

    #processarProdutos(produtos) {
        const hoje = new Date();
        const gradients = ['img-gradient-1','img-gradient-2','img-gradient-3','img-gradient-4','img-gradient-5','img-gradient-6'];

        return produtos.map((produto, i) => {
            // Stock
            const qty = produto.quantidade || 0;
            let stockClass = 'stock-in';
            let stockText = 'Em estoque';
            if (qty <= 0) { stockClass = 'stock-out'; stockText = 'Sem estoque'; }
            else if (qty <= 10) { stockClass = 'stock-low'; stockText = 'Estoque baixo'; }


            let validadeStr = '';
            let validadeClass = 'validade-ok';
            if (produto.validade) {
                const validadeDate = new Date(produto.validade);
                validadeStr = validadeDate.toLocaleDateString('pt-BR');
                const diffDays = Math.ceil((validadeDate - hoje) / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) validadeClass = 'validade-danger';
                else if (diffDays <= 90) validadeClass = 'validade-warn';
            }

            // Preço formatado
            const precoFormatado = produto.preco
                ? Number(produto.preco).toFixed(2).replace('.', ',')
                : '0,00';

            return {
                id: produto.id,
                nome: produto.nome || 'Produto sem nome',
                descricao: produto.descricao || '',
                marca: produto.marca || '',
                img: produto.img || '',
                categoria: produto.categoria || '',
                preco: produto.preco || 0,
                precoFormatado,
                quantidade: qty,
                stockClass,
                stockText,
                validadeStr,
                validadeClass,
                gradientClass: gradients[i % gradients.length],
                disponivel: qty > 0
            };
        });
    }

    async UserProductsView(req, res) {
        let userProducts = new UsuarioProdutoModel();
        let produtosRaw = await userProducts.ReadAllProducts();
        let produtos = produtosRaw ? this.#processarProdutos(produtosRaw) : [];
        let ProdutosPromocaoRaw = await userProducts.ReadProductExpirationDateNear();
        let produtosPromocao = ProdutosPromocaoRaw ? this.#processarProdutos(ProdutosPromocaoRaw) : [];
        res.render("usuarioView/produtos", { layout: "layoutPublico", produtos, produtosPromocao });
    }
}

module.exports = UsuarioProdutosController;