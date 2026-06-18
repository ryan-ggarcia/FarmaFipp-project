const ProdutoPromocaoModel = require('../models/ProdutoPromocaoModel');

class PromocaoController {

    async listarView(req, res) {
        try {
            const promoModel = new ProdutoPromocaoModel();
            const promocoes = await promoModel.ReadTodasPromocoes();
            const descontoAtual = await ProdutoPromocaoModel.GetDescontoAtual();

            res.render('promocoes/listar', {
                promocoes,
                descontoAtual,
                active: 'promocoes'
            });
        } catch (error) {
            console.error('Erro ao listar promoções:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao listar promoções.' });
        }
    }

    async alterarDesconto(req, res) {
        try {
            const { percentual } = req.body;
            const val = Number(percentual);

            if (Number.isNaN(val) || val <= 0 || val > 100) {
                return res.send({ ok: false, msg: 'O percentual deve ser entre 1 e 100.' });
            }

            const result = await ProdutoPromocaoModel.SetDesconto(val);
            if (result) {
                return res.send({ ok: true, msg: `Desconto alterado para ${val}%. As promoções ativas foram atualizadas para o novo valor.` });
            }
            return res.send({ ok: false, msg: 'Erro ao salvar configuração.' });
        } catch (error) {
            console.error('Erro ao alterar desconto:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno.' });
        }
    }

    async removerPromocao(req, res) {
        try {
            const { id } = req.body;
            if (!id) {
                return res.send({ ok: false, msg: 'ID da promoção não informado.' });
            }

            const promoModel = new ProdutoPromocaoModel();
            const result = await promoModel.RemoverPromocao(id);

            if (result) {
                return res.send({ ok: true, msg: 'Promoção removida com sucesso.' });
            }
            return res.send({ ok: false, msg: 'Promoção não encontrada ou já removida.' });
        } catch (error) {
            console.error('Erro ao remover promoção:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao remover promoção.' });
        }
    }

    async executarPromocaoAutomatica(req, res) {
        try {
            const promoModel = new ProdutoPromocaoModel();
            const resultado = await promoModel.ReadProductExpirationDateNear();

            if (resultado && Array.isArray(resultado) && resultado.length > 0) {
                return res.send({
                    ok: true,
                    msg: `Promoção automática executada! ${resultado.length} produto(s) colocado(s) em promoção.`
                });
            }
            return res.send({
                ok: true,
                msg: 'Nenhum produto novo encontrado para promoção. Todos os produtos elegíveis já estão em promoção ou não há lotes próximos do vencimento.'
            });
        } catch (error) {
            console.error('Erro ao executar promoção automática:', error);
            return res.status(500).send({ ok: false, msg: 'Erro ao executar promoção automática.' });
        }
    }
}

module.exports = PromocaoController;
