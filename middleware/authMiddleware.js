const ClienteModel = require('../models/ClienteModel')

class AuthMiddleware{

    async validarCliente(req,res,next){
        if(req.signedCookies != undefined && req.signedCookies.usuarioLogado != undefined){
            let usuarioId = req.signedCookies.usuarioLogado
            let usuario = new ClienteModel()
            usuario = await usuario.Get(usuarioId)
            if(usuario != null && usuario.cliStatus == 1 && (usuario.perfilId == 1 || usuario.perfilId == 3)){
                next()
            }else{
                res.redirect("/login/")
            }
        }else{
            res.redirect("/login/")
        }
    }
    async validarAdmin(req,res,next){
        if(req.signedCookies != undefined && req.signedCookies.usuarioLogado != undefined ){
            let usuarioId = req.signedCookies.usuarioLogado
            let usuario = new ClienteModel()
            usuario = await usuario.Get(usuarioId)
            if(usuario != null && usuario.cliStatus == 1 && usuario.perfilId == 3){
                res.locals.user = usuario;
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