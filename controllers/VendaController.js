const VendaModel = require('../models/VendaModel');
const ItemVendaModel = require('../models/ItemVendaModel');
<<<<<<< HEAD
const ProdutoModel = require('../models/ProdutoModel');
=======
const LoteModel = require('../models/LoteModel');
>>>>>>> f31fb4a3ea8a5df154bd6d5798911749802a4ac2
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
        console.log(req.body);
        const itens = Array.isArray(req.body)
            ? req.body
            : (Array.isArray(req.body?.itens)
                ? req.body.itens
                : (Array.isArray(req.body?.cart) ? req.body.cart : []));
        let ok = true;
        let msg = '';
        try {
            if(itens.length === 0){
                return res.send({ ok: false, msg: 'Nenhum item enviado ao servidor!' });
            }
            let venda = new VendaModel()
            let id = await venda.RegistrarVenda();
            venda.total = 0;

<<<<<<< HEAD
            if(id){
                let produto = new ProdutoModel();
                for(let item of itens){
                    produto = await produto.Get(item.produtoId || item.id_produto || item.id);
=======
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
>>>>>>> f31fb4a3ea8a5df154bd6d5798911749802a4ac2

                    if(produto.quantidade < item.quantidade){
                        return res.send({ ok: false, msg: `Quantidade insuficiente do produto ${produto.nome} no estoque!` });
                    }

                    let itemVenda = new ItemVendaModel()
                    itemVenda.id_venda = id;
                    itemVenda.id_produto = produto.id;
                    itemVenda.id_lote = item.id_lote || item.idLote || null;
                    itemVenda.item_quant = item.quantidade;
                    itemVenda.item_valor = produto.preco;
                    itemVenda.item_valor_total = itemVenda.item_quant * itemVenda.item_valor;
                    await itemVenda.RegistrarItemVenda();
                    venda.total += itemVenda.item_valor_total;

<<<<<<< HEAD
                    let estoque = new EstoqueModel(0, null, 'SAÍDA', "VENDA", itemVenda.item_quant, produto.id, null);
                    produto.quantidade -= itemVenda.item_quant;
                    await estoque.AddToInventory();
                }
                await venda.AtualizarVenda();
                return res.send({ ok: true, msg: 'Venda registrada com sucesso!' });
=======
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
>>>>>>> f31fb4a3ea8a5df154bd6d5798911749802a4ac2
            }

        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao registrar venda!' });
        }
    }
}

module.exports = VendaController;