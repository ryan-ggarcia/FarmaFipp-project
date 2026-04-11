const ClienteModel = require('../models/ClienteModel');
const EnderecoModel = require('../models/EnderecoModel');
const bcrypt = require('bcrypt');

class ClienteController{
    async cadastrarView(req, res){
        res.render('clientes/cadastrar');
    }

    async cadastrar(req, res) {
        let ok = false;
        let msg = ""

        console.log(req.body)

        const { nome, cpf, data, telefone, email, senha } = req.body;
        const { rua, numero, bairro, cidade, estado, cep, uf } = req.body;

        if (!nome || !cpf || !data || !telefone || !email || !senha) {
            return res.send({ ok: false, msg: "Preencha os dados do cliente" })
        }

        if (!rua || !numero || !bairro || !cidade || !estado || !cep || !uf) {
            return res.send({ ok: false, msg: "Preencha os dados do endereço" })
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        let cliente = new ClienteModel(0, nome, 1, cpf, email, senhaHash, telefone, data)

        let result = await cliente.Create()

        if (!result) {
            return res.send({ ok: false, msg: "Erro ao cadastrar cliente" })
        }

        const cliId = result

        let endereco = new EnderecoModel(
            rua, bairro, cidade, numero, estado, uf, cep, cliId
        )

        let resultEnd = await endereco.Create()

        if (!resultEnd) {
            return res.send({ ok: false, msg: "Erro ao cadastrar endereço" })
        }

        return res.send({
            ok: true,
            msg: "Cliente e endereço cadastrados com sucesso!"
        })
    }
}

module.exports = ClienteController;