const UsuarioProdutoModel = require('../models/UsuarioProdutosModel');
const ProdutoPromocaoModel = require('../models/ProdutoPromocaoModel');
class UsuarioProdutosController {


    async UserProductsView(req, res) {
        let userProducts = new UsuarioProdutoModel();
        let promProducts = new ProdutoPromocaoModel();
        let produtos = await userProducts.ReadAllProducts();
        let produtosPromocao = await promProducts.ReadProductExpirationDateNear();
        res.render("usuarioView/produtos", { layout: "layoutPublico", produtos, produtosPromocao });
    }
}

module.exports = UsuarioProdutosController;