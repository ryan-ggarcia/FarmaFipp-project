const VendaModel = require('../models/VendaModel');
const ItemVendaModel = require('../models/ItemVendaModel');
const ProdutoModel = require('../models/ProdutoModel');
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

            if(id){
                let produto = new ProdutoModel();
                for(let item of itens){
                    produto = await produto.Get(item.produtoId || item.id_produto || item.id);

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

                    let estoque = new EstoqueModel(0, null, 'SAÍDA', "VENDA", itemVenda.item_quant, produto.id, null);
                    produto.quantidade -= itemVenda.item_quant;
                    await estoque.AddToInventory();
                }
                await venda.AtualizarVenda();
                return res.send({ ok: true, msg: 'Venda registrada com sucesso!' });
            }

        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao registrar venda!' });
        }
    }
}

module.exports = VendaController;