const ClienteModel = require('../models/ClienteModel')

class AuthMiddleware{

    async validarCliente(req,res,next){
        if(req.cookies != undefined && req.cookies.usuarioLogado != undefined){
            let usuarioId = req.cookies.usuarioLogado
            let usuario = new ClienteModel()
            usuario = await usuario.Get(usuarioId)
            if(usuario != null && usuario.cliStatus == 1 && (usuario.perfilId == 1 || usuario.perfilId == 3)){
                req.usuarioId = req.cookies.usuarioLogado;
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
                res.locals.user = usuario;
                next()
            }else{
                res.redirect("/login/")
            }
        }else{
            res.redirect("/login/")
        }
    }

    async validarAdminOuFuncionario(req,res,next){
        if(req.cookies != undefined && req.cookies.usuarioLogado != undefined ){
            let usuarioId = req.cookies.usuarioLogado
            let usuario = new ClienteModel()
            usuario = await usuario.Get(usuarioId)
            if(usuario != null && usuario.cliStatus == 1 && (usuario.perfilId == 3 || usuario.perfilId == 1)){
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