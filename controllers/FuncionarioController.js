const FuncionarioModel = require("../models/FuncionarioModel")
const EnderecoModelFuncionario = require("../models/EnderecoModelFuncionario")
const { cpf } = require("cpf-cnpj-validator")
const bcrypt = require("bcrypt")

class FuncionarioController{
    async cadastrarView(req, res){
        res.render("funcionarios/cadastrar")
    }

    async listarView(req, res){
        let funcionario = new FuncionarioModel();
        let lista = await funcionario.Read();
        res.render("funcionarios/listar", {lista})
    }

    async alterarView(req, res){
        let funcionario = new FuncionarioModel();
        let endereco = new EnderecoModelFuncionario();
        funcionario = await funcionario.Get(req.params.id)
        endereco = await endereco.Get(funcionario.funcId)
        res.render("funcionarios/alterar", {funcionario, endereco})
    }

    async cadastrar(req, res){
        let {nome, cargo, cpf: inputCpf, telefone, email, senha, matricula, rua, num, complemento, bairro, cidade, estado, cep, uf} = req.body;

         const cpfLimpo = inputCpf ? inputCpf.replace(/\D/g, '') : '';

        if(!nome || !cargo || !cpfLimpo || !telefone || !email || !senha || !matricula){
            return res.send({ok: false, msg: "Preencha todos os campos"})
        }

        if(!cpfLimpo || !cpf.isValid(cpfLimpo)){
            return res.send({ ok: false, msg: "CPF inválido" })
        }

        let cpfExistente = await new FuncionarioModel().FindByCpf(cpfLimpo);
        let matriculaExistente = await new FuncionarioModel().FindByRegistration(matricula);

        if(cpfExistente || matriculaExistente){
            let msgCpf = cpfExistente ? "CPF já cadastrado. " : "";
            let msgMatricula = matriculaExistente ? "Matrícula já cadastrada." : "";
            return res.send({ ok: false, msg: msgCpf + msgMatricula })
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        let funcionario = new FuncionarioModel(0, cargo, nome, telefone, email, senhaHash, matricula, cpfLimpo, 2)
        let result = await funcionario.Create()

        if(!result){
            return res.send({ok: false, msg: "Erro ao cadastrar funcionário"})
        }

        const funcId = result 

        let endereco = new EnderecoModelFuncionario(
            0, rua, bairro, cidade, num, estado, uf, cep, complemento, funcId
        )

        let resultEnd = await endereco.Create()

         if(!resultEnd){
            return res.send({ok: false, msg: "Erro ao cadastrar endereço do funcionário"})
        }

        res.send({ok: true, msg: "Funcionário e endereço cadastrados com sucesso"})
    }

    async alterar(req, res){
        let {id, nome, cargo, cpf: inputCpf, telefone, email, senha, matricula, endId, rua, num, complemento, bairro, cidade, estado, cep, uf} = req.body;

        const cpfLimpo = inputCpf ? inputCpf.replace(/\D/g, '') : '';

        if(!id || !nome || !cargo || !cpfLimpo || !telefone || !email || !senha || !matricula){
            return res.send({ok: false, msg: "Preencha todos os campos"})
        }

        if (!endId || !rua || !num || !bairro || !cidade || !estado || !cep || !uf) {
            return res.send({ok: false, msg: "Preencha os dados do endereço"})
        }

        if(!cpf.isValid(cpfLimpo)){
            return res.send({ok: false, msg: "CPF inválido"})
        }

        let funcionario = new FuncionarioModel(id, cargo, nome, telefone, email, senha, matricula, cpfLimpo, 2)
        let result = await funcionario.Update()

        let endereco = new EnderecoModelFuncionario(endId, rua, bairro, cidade, num, estado, uf, cep, complemento || "", id)
        let resultEnd = await endereco.Update()

        if(result && resultEnd){
            res.send({ok: true, msg: "Dados do funcionário alterados com sucesso"})
        } else {
            let errorMsg = !result ? "Erro ao alterar dados do funcionário" : "Erro ao alterar dados do endereço";
            res.send({ok: false, msg: errorMsg})
        }
    }

    async excluir(req, res){
        let {id} = req.body;

        if(id && id != "0"){

        let funcionario = new FuncionarioModel();
        let endereco = new EnderecoModelFuncionario();

        let resultEnd = await endereco.Delete(id)
        let result = await funcionario.Delete(id)

        if(result && resultEnd){
            res.send({ok: true, msg: "Funcionário e endereço excluídos com sucesso"})
        }
        else{
            res.send({ok: false, msg: "Erro ao excluir funcionário"})
            }
        }else{
            res.send({ok: false, msg: "ID do funcionário inválido"})
        }
    }

}

module.exports = FuncionarioController;