const ClienteModel = require('../models/ClienteModal')
const EnderecoModel = require('../models/EnderecoModal')
const bcrypt = require('bcrypt');

class ClienteController{
    async cadastrarView(req, res){
       res.render('clientes/cadastrar');
    }

    async listarView(req, res){
        let cliente = new ClienteModel();
        let lista = await cliente.Read();
        res.render('clientes/listar', {lista});
    }

    async alterarView(req, res){
        let cliente = new ClienteModel();
        cliente = await cliente.Get(req.params.id)

        res.render('clientes/alterar', {cliente});
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
            0, rua, bairro, cidade, numero, estado, uf, cep, cliId
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

    async excluir(req, res){
        let ok = false;
        let msg = ""
        const {id} = req.body;

        if(id && id != "0"){
            let cliente = new ClienteModel();
            let endereco = new EnderecoModel();

            let resultEnd = await endereco.Delete(id);

            let result = await cliente.Delete(id);

            if(result && resultEnd){
                return res.send({ok: true, msg: "Cliente e endereço excluídos com sucesso!"})
            }
            else{
                return res.send({ok: false, msg: "Erro ao excluir cliente e endereço!"})
            }
        }
        else{
            return res.send({ok: false, msg: "ID do cliente inválido!"})
        }

        res.send({ok, msg});
    }
}

module.exports = ClienteController;