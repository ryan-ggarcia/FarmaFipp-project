

class UsuarioController{
    homeView(req,res){
        res.render("usuarioView/home", {layout:"layoutPublico"})
    }
    produtosView(req,res){
        res.render("usuarioView/produtos", {layout:"layoutPublico"})
    }
}

module.exports = UsuarioController