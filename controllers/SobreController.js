const ServicoModel = require('../models/ServicoModel');
const FuncionarioModel = require('../models/FuncionarioModel');
const ClienteModel = require('../models/ClienteModel');
const ProdutosModel = require('../models/ProdutoModel');
const FornecedorModel = require('../models/FornecedorModel');

class SobreController {

    async home(req, res) {
        try{
            let servicoModel = new ServicoModel();
            let servicos = await servicoModel.listar();
            let funcionarioModel = new FuncionarioModel();
            let funcionarios = await funcionarioModel.Read();
            let clienteModel = new ClienteModel();
            let clientes = await clienteModel.Read();
            let fornecedorModel = new FornecedorModel();
            let fornecedores = await fornecedorModel.List();
            res.render('sobre', { servicos, funcionarios, clientes, fornecedores, active: 'dashboard' });
        }
        catch (err) {
            console.error('Erro ao carregar a página Sobre Nós:', err);
            res.render('sobre', { servicos: [], funcionarios: [], clientes: [], fornecedores: [], active: 'dashboard' });
        }
        
    }
}

module.exports = SobreController;