const ClienteModel = require('../models/ClienteModel');
const EnderecoModel = require('../models/EnderecoModel');
const {cpf} = require ('cpf-cnpj-validator');
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
        let endereco = new EnderecoModel()
        cliente = await cliente.Get(req.params.id)
        endereco = await endereco.Get(cliente.cliId)
        res.render('clientes/alterar', {cliente, endereco});
    }

    async cadastrar(req, res) {
        let ok = false;
        let msg = ""

        console.log(req.body)

        const { nome, cpf: inputCpf, data, telefone, email, senha, rua, numero, bairro, cidade, estado, cep, uf } = req.body;

        const cpfLimpo = inputCpf ? inputCpf.replace(/\D/g, '') : '';

        if (!nome || !cpfLimpo || !data || !telefone || !email || !senha) {
            return res.send({ ok: false, msg: "Preencha os dados do cliente" })
        }

        if (!rua || !numero || !bairro || !cidade || !estado || !cep || !uf) {
            return res.send({ ok: false, msg: "Preencha os dados do endereço" })
        }

        if(!cpfLimpo || !cpf.isValid(cpfLimpo)){
            return res.send({ ok: false, msg: "CPF inválido" })
        }
        //Verificar se CPF ou email já existem no banco
        let cpfExistente = await new ClienteModel().FindByCpf(cpfLimpo);
        let emailExistente = await new ClienteModel().FindByEmail(email);

        if(cpfExistente || emailExistente){
            let msgCpf = cpfExistente ? "CPF já cadastrado. " : "";
            let msgEmail = emailExistente ? "Email já cadastrado." : "";
            return res.send({ ok: false, msg: msgCpf + msgEmail })
        }


        const senhaHash = await bcrypt.hash(senha, 10)

        let cliente = new ClienteModel(0, nome, 1, cpfLimpo, email, senhaHash, telefone, data)

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

        return res.send({ok: true, msg: "Cliente e endereço cadastrados com sucesso!"})
    }

    async alterar(req, res){
        let ok = false;
        let msg = ""

        const { id, nome, cpf: inputCpf, data, telefone, email, senha, status, endId, rua, num, bairro, cidade, estado, cep, uf } = req.body;

        const cpfLimpo = inputCpf ? inputCpf.replace(/\D/g, '') : '';

        if (!id || !nome || !cpfLimpo || !data || !telefone || !email || !senha) {
            return res.send({ok: false, msg: "Preencha os dados do cliente"})
        }

        if (!endId || !rua || !num || !bairro || !cidade || !estado || !cep || !uf) {
            return res.send({ok: false, msg: "Preencha os dados do endereço"})
        }

        if(!cpf.isValid(cpfLimpo)){
            return res.send({ok: false, msg: "CPF inválido"})
        }

        //Update do cliente
        let cliente = new ClienteModel(id, nome, status, cpfLimpo, email, senha, telefone, data)
        let result = await cliente.Update()

        //Update do endereço
        let endereco = new EnderecoModel(endId, rua, bairro, cidade, num, estado, uf, cep, id)
        let resultEnd = await endereco.Update()

        //Verificação dos resultados
        if(result && resultEnd){
            return res.send({ok: true, msg: "Dados do cliente alterados com sucesso!"})
        }
        else{
            let errorMsg = !result ? "Erro ao alterar dados do cliente":"Erro ao alterar dados do endereço";
            return res.send({ok: false, msg: errorMsg})
        }
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