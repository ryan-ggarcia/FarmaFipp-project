const VendaModel = require('../models/VendaModel');
const ItemVendaModel = require('../models/ItemVendaModel');
const LoteModel = require('../models/LoteModel');
const EstoqueModel = require('../models/EstoqueModel');

function toMySqlDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 19).replace('T', ' ');
}

class VendaController {
    async RegistrarVenda(req, res) {
        try {
            const { data, status, pagamento, total, itens, cart } = req.body;

            const itensVenda = Array.isArray(itens) ? itens : (Array.isArray(cart) ? cart : []);
            const totalCalculado = Number(total || 0);

            if (!itensVenda.length) {
                return res.status(400).send({ ok: false, msg: 'Carrinho vazio para registrar venda.' });
            }

            const itensNormalizados = [];

            for (let item of itensVenda) {
                const idProduto = item.id_produto || item.idProduto || item.id;
                const idLote = item.id_lote || item.idLote || null;
                const quantidade = Number(item.quantidade || item.qtd || 1);

                if (!idProduto) {
                    return res.status(400).send({ ok: false, msg: 'Item da venda sem id do produto.' });
                }

                if (!idLote) {
                    return res.status(400).send({ ok: false, msg: `Produto ${idProduto} sem lote selecionado.` });
                }

                if (Number.isNaN(quantidade) || quantidade <= 0) {
                    return res.status(400).send({ ok: false, msg: `Quantidade inválida para o produto ${idProduto}.` });
                }

                const loteModel = new LoteModel(idLote, null, null, null, null, null);
                const possuiSaldo = await loteModel.HasAvailableStock(quantidade);

                if (!possuiSaldo) {
                    return res.status(400).send({
                        ok: false,
                        msg: `Estoque insuficiente no lote ${idLote} para o produto ${idProduto}.`
                    });
                }

                itensNormalizados.push({ idProduto, idLote, quantidade });
            }

            const dataVenda = toMySqlDateTime(data);
            const statusVenda = status || 'PENDENTE';
            const formaPagamento = (pagamento || 'PIX').toString().toUpperCase();

            if (!dataVenda) {
                return res.status(400).send({ ok: false, msg: 'Data da venda inválida.' });
            }

            let venda = new VendaModel(null, dataVenda, statusVenda, formaPagamento, totalCalculado);
            let vendaId = await venda.RegistrarVenda();

            if (!vendaId) {
                return res.status(500).send({ ok: false, msg: 'Falha ao registrar cabeçalho da venda.' });
            }

            for (let item of itensNormalizados) {
                let itemVenda = new ItemVendaModel(null, vendaId, item.idProduto, item.idLote);
                await itemVenda.RegistrarItemVenda();

                let estoque = new EstoqueModel(0, item.idLote, 'SAIDA', 'VENDA', item.quantidade, new Date());
                await estoque.ExitFromInventory();

                let loteModel = new LoteModel(item.idLote, null, null, null, null, null);
                const estoqueAtualizado = await loteModel.DecreaseStock(item.quantidade);

                if (!estoqueAtualizado) {
                    return res.status(409).send({
                        ok: false,
                        msg: `Falha ao atualizar estoque do lote ${item.idLote}.`
                    });
                }
            }

            return res.send({ ok: true, msg: 'Venda registrada com sucesso.', vendaId });
        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            return res.status(500).send({ ok: false, msg: 'Erro ao registrar venda.' });
        }
    }
}

module.exports = VendaController;