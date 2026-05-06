const VendaModel = require('../models/VendaModel');
const ItemVendaModel = require('../models/ItemVendaModel');

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

            for (let item of itensVenda) {
                const idProduto = item.id_produto || item.idProduto || item.id;
                if (!idProduto) {
                    continue;
                }

                const idLote = item.id_lote || item.idLote || null;
                let itemVenda = new ItemVendaModel(null, vendaId, idProduto, idLote);
                await itemVenda.RegistrarItemVenda();
            }

            return res.send({ ok: true, msg: 'Venda registrada com sucesso.', vendaId });
        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            return res.status(500).send({ ok: false, msg: 'Erro ao registrar venda.' });
        }
    }
}

module.exports = VendaController;