const UsuarioProdutosController = require('./UsuarioProdutoController');

const produtosCtrl = new UsuarioProdutosController();

class UsuarioController{
    homeView(req,res){
        res.render("usuarioView/home", {layout:"layoutPublico"})
    }

    async produtosView(req, res){
        await produtosCtrl.UserProductsView(req, res);
    }
}

module.exports = UsuarioController