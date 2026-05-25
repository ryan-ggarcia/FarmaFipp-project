const ClienteModel = require('../models/ClienteModel')

class AuthMiddleware{

    async validarCliente(req,res,next){
        if(req.cookies != undefined && req.cookies.usuarioLogado != undefined){
            let usuarioId = req.cookies.usuarioLogado
            let usuario = new ClienteModel()
            usuario = await usuario.Get(usuarioId)
            if(usuario != null && usuario.cliStatus == 1 && usuario.perfilId == 1){
                next()
            }else{
                res.redirect("/login/")
            }
        }else{
            res.redirect("/login/")
        }
    }
    async validarAdmin(req,res,next){
        if(req.cookies != undefined && req.cookies.usuarioLogado != undefined ){
            let usuarioId = req.cookies.usuarioLogado
            let usuario = new ClienteModel()
            usuario = await usuario.Get(usuarioId)
            if(usuario != null && usuario.cliStatus == 1 && usuario.perfilId == 3){
                next()
            }else{
                res.redirect("/login/")
            }
        }else{
            res.redirect("/login/")
        }
    }
}

module.exports = new AuthMiddleware();