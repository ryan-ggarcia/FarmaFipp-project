const ProdutoModel = require('../models/ProdutoModel');
const FornecedorModel = require('../models/FornecedorModel');
const LoteModel = require('../models/LoteModel');

class LoteController {

    async CadastroLoteView(req, res) {
        try {
            let produto = new ProdutoModel();
            let listaProdutos = await produto.Read();
            let fornecedor = new FornecedorModel();
            let listaFornecedor = await fornecedor.List();
            res.render('produtos/cadastrarLote', { produtos: listaProdutos, fornecedores: listaFornecedor });
        } catch (error) {
            console.error('Erro ao carregar view de cadastro de lote:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de cadastro de lote!' });
        }
    }

    async CadastroLote(req, res) {
        const { validade, quantidade, produto, fornecedor, nome } = req.body;

        if (!nome?.trim() || !validade || !quantidade || !produto || (Array.isArray(produto) && produto.length === 0) || !fornecedor) {
            return res.send({ ok: false, msg: 'Preencha os dados corretamente!' });
        }

        const qtdNum = parseInt(quantidade, 10);
        if (isNaN(qtdNum) || qtdNum <= 0) {
            return res.send({ ok: false, msg: 'A quantidade deve ser maior que zero!' });
        }

        if (validade <= new Date().toISOString().split('T')[0]) {
            return res.send({ ok: false, msg: 'A validade deve ser uma data futura!' });
        }

        let loteModel = new LoteModel(null, produto, validade, qtdNum, fornecedor, nome);
        try {
            let result = await loteModel.Create();
            if (typeof result === 'string') {
                // Error message returned from model
                return res.status(500).send({ ok: false, msg: result });
            }
            if (result) {
                return res.status(200).send({ ok: true, msg: 'Lote cadastrado com sucesso!' });
            } else {
                return res.status(500).send({ ok: false, msg: 'Erro ao cadastrar o lote!' });
            }
        } catch (error) {
            console.error('Erro ao cadastrar o lote:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao cadastrar o lote!' });
        }
    }
}

module.exports = LoteController;