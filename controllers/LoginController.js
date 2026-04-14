
class LoginController{
    loginView(req,res){
        res.render('usuarioView/login', {layout: false})
    }
}

module.exports = LoginController
