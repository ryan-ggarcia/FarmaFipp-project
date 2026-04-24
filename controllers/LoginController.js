const LoginModel = require('../models/LoginModel')
const bcrypt = require('bcrypt')
class LoginController{
    async loginView(req,res){
        res.render('login/login', {layout: false})
    }
    async efetuarLogin(req, res) {
        let ok = false
        let msg = ""
        let perfil = 0
        let { email, senha } = req.body

        if(email != "" && senha != ""){
            let banco = new LoginModel()
            let result = await banco.verificar(email)
            if(result != null){
                if( await bcrypt.compare(senha,result.senha)){
                    // gravar id do usuário no cookie (result tem cli_id)
                    res.cookie("usuarioLogado", result.cli_id)
                    ok = true
                    msg = "Redirecionando para a página inícial..."
                    perfil = result.cli_status
                    return res.send({ ok, msg, perfil })
                } else {
                    ok = false
                    msg = "Verifique se a senha esta correta!"
                    return res.send({ ok, msg })
                }
            } else {
                ok = false
                msg = "Email não encontrado!"
                return res.send({ok,msg})
            }
        } else {
            ok = false
            msg = "Preencha e-mail e senha"
            return res.send({ ok, msg })
        }
    }
    async cadastroView(req, res) {
        res.render("login/cadastro", { layout: false })
    }
}

module.exports = LoginController