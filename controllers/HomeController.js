const ServicoModel   = require('../models/ServicoModel');
const FuncionarioModel = require('../models/FuncionarioModel');
const ClienteModel   = require('../models/ClienteModel');
const ProdutosModel  = require('../models/ProdutoModel');
const FornecedorModel = require('../models/FornecedorModel');
const VendaModel     = require('../models/VendaModel');

class HomeController {

    async home(req, res) {
        try {
            let servicoModel = new ServicoModel();
            let servicos = await servicoModel.listar();

            let funcionarioModel = new FuncionarioModel();
            let funcionarios = await funcionarioModel.Read();

            let clienteModel = new ClienteModel();
            let clientes = await clienteModel.Read();

            let fornecedorModel = new FornecedorModel();
            let fornecedores = await fornecedorModel.List();

            let produtoModel = new ProdutosModel();
            let produtos = await produtoModel.Read();

            let vendaModel = new VendaModel();
            let vendasRaw  = await vendaModel.ListarVendas();

            const vendasData = vendasRaw.map(v => ({
                data:       v.data ? new Date(v.data).toISOString().split('T')[0] : null,
                valorFinal: parseFloat(v.valorFinal) || 0
            }));

            const servicosData = servicos.map(s => {
                let d = s.getDATA();
                let dateStr = null;
                if (d) {
                    try {
                        if (d instanceof Date) dateStr = d.toISOString().split('T')[0];
                        else                   dateStr = String(d).split('T')[0];
                    } catch (_) {}
                }
                return {
                    data:   dateStr,
                    status: s.getSTATUS ? s.getSTATUS() : null,
                    preco:  parseFloat(s.getPRECO ? s.getPRECO() : 0) || 0
                };
            });

            const totalVendas   = vendasData.reduce((a, v) => a + v.valorFinal, 0);
            const totalServicos = servicosData.reduce((a, s) => a + s.preco, 0);

            res.render('home', {
                servicos, funcionarios, clientes, fornecedores, produtos,
                vendasData, servicosData, totalVendas, totalServicos,
                active: 'dashboard'
            });
        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
            res.render('home', {
                servicos: [], funcionarios: [], clientes: [], fornecedores: [],
                produtos: [], vendasData: [], servicosData: [],
                totalVendas: 0, totalServicos: 0,
                active: 'dashboard'
            });
        }
    }
}

module.exports = HomeController;
