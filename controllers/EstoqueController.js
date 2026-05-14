const EstoqueModel = require('../models/EstoqueModel');
const LoteModel = require('../models/LoteModel');
<<<<<<< HEAD
const ItemVendaModel = require('../models/ItemVendaModel');
const VendaModel = require('../models/VendaModel');
=======

>>>>>>> f31fb4a3ea8a5df154bd6d5798911749802a4ac2
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
<<<<<<< HEAD
=======

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

            if (!result) {
                return res.send({ ok: false, msg: 'Erro ao registrar movimentação de entrada!' });
            }

            const lote = new LoteModel(Number(loteId), null, null, null, null, null);
            const loteAtualizado = await lote.IncreaseStock(qtdNum);

            if (loteAtualizado){
                return res.send({ ok: true, msg: 'Estoque atualizado com sucesso!' });
            } else {
                return res.send({ ok: false, msg: 'Movimentação registrada, mas falhou ao atualizar saldo do lote.' });
            }
        } catch (error) {
            console.error('Erro ao adicionar estoque:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao atualizar estoque!' });
        }  
    }

    async RemoverEstoque(req, res) {
        try{
            const {loteId, quantidade} = req.body;

            if(!loteId || !quantidade) {
                return res.send({ ok: false, msg: 'Preencha os dados corretamente!' });
            }
            else{
                const qtdNum = parseFloat(quantidade);
                if (isNaN(qtdNum) || qtdNum <= 0) {
                    return res.send({ ok: false, msg: 'A quantidade deve ser maior que zero!' });
                }

                const lote = new LoteModel(Number(loteId), null, null, null, null, null);
                const possuiSaldo = await lote.HasAvailableStock(qtdNum);

                if (!possuiSaldo) {
                    return res.send({ ok: false, msg: 'Saldo insuficiente no lote para realizar saída!' });
                }

                let estoque = new EstoqueModel(0, loteId, 'SAIDA', 'AJUSTE', qtdNum, new Date());
                let result = await estoque.ExitFromInventory();

                if (!result) {
                    return res.send({ ok: false, msg: 'Erro ao registrar movimentação de saída!' });
                }

                const loteAtualizado = await lote.DecreaseStock(qtdNum);

                if (loteAtualizado) {
                    return res.send({ ok: true, msg: 'Saída registrada e saldo do lote atualizado com sucesso!' });
                }

                return res.send({ ok: false, msg: 'Movimentação registrada, mas falhou ao atualizar saldo do lote.' });
            }
        }
        catch (error) {
            console.error('Erro ao remover estoque:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao remover estoque!' });
        }
    }
>>>>>>> f31fb4a3ea8a5df154bd6d5798911749802a4ac2
}

module.exports = EstoqueController;