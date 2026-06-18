const LoginModel = require('../models/LoginModel')
const ClienteModel = require('../models/ClienteModel')
const EnderecoModelCliente = require('../models/EnderecoModelCliente')
const { cpf } = require('cpf-cnpj-validator')
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

        if(email && senha){
            let banco = new LoginModel()
            let result = await banco.verificar(email)
            if(result != null){
                
                if( await bcrypt.compare(senha,result.senha)){
                    res.cookie("usuarioLogado", result.cli_id, { signed: true, httpOnly: true })
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

    async cadastrar(req, res) {
        try {
            const { nome, cpf: inputCpf, data, telefone, email, senha, rua, numero, complemento, bairro, cidade, estado, cep, uf } = req.body;

            const cpfLimpo = inputCpf ? inputCpf.replace(/\D/g, '') : '';

            if (!nome || !cpfLimpo || !data || !telefone || !email || !senha) {
                return res.send({ ok: false, msg: "Preencha todos os dados pessoais" })
            }

            if (!rua || !numero || !bairro || !cidade || !estado || !cep || !uf) {
                return res.send({ ok: false, msg: "Preencha todos os dados do endereço" })
            }

            if (!cpfLimpo || !cpf.isValid(cpfLimpo)) {
                return res.send({ ok: false, msg: "CPF inválido" })
            }

            let cpfExistente = await new ClienteModel().FindByCpf(cpfLimpo);
            let emailExistente = await new ClienteModel().FindByEmail(email);

            if (cpfExistente || emailExistente) {
                let msgCpf = cpfExistente ? "CPF já cadastrado. " : "";
                let msgEmail = emailExistente ? "Email já cadastrado." : "";
                return res.send({ ok: false, msg: msgCpf + msgEmail })
            }

            const senhaHash = await bcrypt.hash(senha, 10)

            let cliente = new ClienteModel(0, nome, 1, cpfLimpo, email, senhaHash, telefone, data, 1)
            let result = await cliente.Create()

            if (!result) {
                return res.send({ ok: false, msg: "Erro ao cadastrar cliente" })
            }

            const cliId = result

            let endereco = new EnderecoModelCliente(
                0, rua, bairro, cidade, numero, estado, uf, cep, complemento || '', cliId
            )
            let resultEnd = await endereco.Create()

            if (!resultEnd) {
                return res.send({ ok: false, msg: "Erro ao cadastrar endereço" })
            }

            return res.send({ ok: true, msg: "Cadastro realizado com sucesso! Bem-vindo à FarmaFipp!" })
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            return res.send({ ok: false, msg: "Erro interno ao processar cadastro. Tente novamente." })
        }
    }
    
}

module.exports = LoginController