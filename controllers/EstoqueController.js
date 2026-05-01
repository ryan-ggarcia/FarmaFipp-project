const EstoqueModel = require('../models/EstoqueModel');
const LoteModel = require('../models/LoteModel');


class EstoqueController {
    async gerenciarEstoqueView(req, res) {
        try{
            const Estoque = new EstoqueModel();
            const estoqueList = await Estoque.ListInventory();
            res.render('estoque/gerenciar', { estoqueList: estoqueList || [] });
        } 
        catch (error) {
            console.error('Erro ao carregar view de gerenciamento de estoque:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de gerenciamento de estoque!' });
        }
    }

    async adicionarEstoqueView(req, res) {
        try {
            const loteModel = new LoteModel();
            const lotes = await loteModel.List();
            res.render('estoque/adicionar', { lotes: lotes || [] });
        } catch (error) {
            console.error('Erro ao carregar view de adição de estoque:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de adição de estoque!' });
        }
    }

    async AdicionarEstoque(req, res) {
        try {
            const { loteId, quantidade } = req.body;

            if (!loteId || !quantidade) {
                return res.send({ ok: false, msg: 'Preencha os dados corretamente!' });
            }

            const qtdNum = parseFloat(quantidade);
            if (isNaN(qtdNum) || qtdNum <= 0) {
                return res.send({ ok: false, msg: 'A quantidade deve ser maior que zero!' });
            }

            let estoque = new EstoqueModel(0, loteId, 'ENTRADA', 'COMPRA', qtdNum, new Date());

            let result = await estoque.AddToInventory();

            if (result){
                return res.send({ ok: true, msg: 'Estoque atualizado com sucesso!' });
            } else {
                return res.send({ ok: false, msg: 'Erro ao atualizar estoque!' });
            }
        } catch (error) {
            console.error('Erro ao adicionar estoque:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao atualizar estoque!' });
        }
        
    }
}

module.exports = EstoqueController;