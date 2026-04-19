const FuncionarioModel = require("../models/FuncionarioModel")
const { cpf } = require("cpf-cnpj-validator")

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
        funcionario = await funcionario.Get(req.params.id)
        res.render("funcionarios/alterar", {funcionario})
    }

    async cadastrar(req, res){
        let {nome, cargo, cpf: inputCpf, telefone, email, senha, matricula} = req.body;

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

        let funcionario = new FuncionarioModel(0, cargo, nome, telefone, email, senha, matricula, cpfLimpo, 1)
        let result = await funcionario.Create()

        if(result){
            res.send({ok: true, msg: "Funcionário cadastrado com sucesso"})
        } else {
            res.send({ok: false, msg: "Erro ao cadastrar funcionário"})
        } 
    }

    async alterar(req, res){
        let {id, nome, cargo, cpf: inputCpf, telefone, email, senha, matricula} = req.body;

        const cpfLimpo = inputCpf ? inputCpf.replace(/\D/g, '') : '';

        if(!id || !nome || !cargo || !cpfLimpo || !telefone || !email || !senha || !matricula){
            return res.send({ok: false, msg: "Preencha todos os campos"})
        }

        let funcionario = new FuncionarioModel(id, cargo, nome, telefone, email, senha, matricula, cpfLimpo, 1)
        let result = await funcionario.Update()

        if(result){
            res.send({ok: true, msg: "Funcionário alterado com sucesso"})
        } else {
            res.send({ok: false, msg: "Erro ao alterar funcionário"})
        }
    }

    async excluir(req, res){
        let {id} = req.body;

        if(!id){
            return res.send({ok: false, msg: "ID do funcionário é obrigatório"})
        }

        let funcionario = new FuncionarioModel();
        let result = await funcionario.Delete(id)

        if(result){
            res.send({ok: true, msg: "Funcionário excluído com sucesso"})
        }
        else{
            res.send({ok: false, msg: "Erro ao excluir funcionário"})
        }
    }

}

module.exports = FuncionarioController;