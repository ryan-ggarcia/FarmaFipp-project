const ClienteModel = require("../models/ClienteModel");


class PerfilController{

    async perfileView(req, res){
        let usuario = new ClienteModel();
        let id = req.cookies.usuarioLogado;
        let cliente = await usuario.Get(id);
        let user = cliente || false;
        res.render("perfil/perfile", {user: user, layout: false});
    }

    async editarView(req, res){
        let usuario = new ClienteModel();
        let id = req.cookies.usuarioLogado;
        let cliente = await usuario.Get(id);
        let user = cliente || false;
        res.render("perfil/editar", {user: user, layout: false});
    }
}


module.exports = PerfilController;