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

    async VendasView(req, res){
        res.render('vendas/index');
    }

    async ListarVendas(req, res){
        try {
            let ok = true;
            let msg = "";

            let params = req.query.produto
            const itemVenda = new ItemVendaModel();
            const lista = await itemVenda.ListarVendas(params);
            res.send(lista);
        } catch (error) {
            console.error('Erro ao listar vendas:', error);
            return res.status(500).send({ ok: false, msg: 'Erro ao listar vendas!' });
        }
    }

    async RegistrarVenda(req, res) {
        console.log(req.body);
        const itens = Array.isArray(req.body)
            ? req.body
            : (Array.isArray(req.body?.itens)
                ? req.body.itens
                : (Array.isArray(req.body?.cart) ? req.body.cart : []));

        try {
            if(itens.length === 0){
                return res.send({ ok: false, msg: 'Nenhum item enviado ao servidor!' });
            }
            let venda = new VendaModel()
            venda.status = 'Pendente'
            let id = await venda.RegistrarVenda();
            venda.valorFinal = 0;

            if(id){
                for(let item of itens){
                    const produto = await new ProdutoModel().Get(item.produtoId || item.id_produto || item.id);

                    if(!produto){
                        return res.send({ ok: false, msg: 'Produto não encontrado!' });
                    }

                    const quant = Number(item.quantidade);
                    const preco = Number(produto.preco);

                    if (Number.isNaN(quant) || quant <= 0) {
                        return res.send({ ok: false, msg: `Quantidade inválida para o produto ${produto.nome}!` });
                    }

                    if (Number.isNaN(preco) || preco < 0) {
                        return res.send({ ok: false, msg: `Preço inválido para o produto ${produto.nome}!` });
                    }

                    if(produto.quantidade < quant){
                        return res.send({ ok: false, msg: `Quantidade insuficiente do produto ${produto.nome} no estoque!` });
                    }

                    let itemVenda = new ItemVendaModel()
                    itemVenda.id_venda = id;
                    itemVenda.id_produto = produto.id;
                    itemVenda.id_lote = item.id_lote || item.idLote || null;
                    itemVenda.item_quant = quant;
                    itemVenda.item_valor = preco;
                    itemVenda.item_valor_total = quant * preco;
                    await itemVenda.RegistrarItemVenda();
                    venda.valorFinal += itemVenda.item_valor_total;

                    let estoque = new EstoqueModel(0, null, 'SAÍDA', "VENDA", quant, produto.id, null);
                    produto.quantidade -= quant;
                    await estoque.AddToInventory();
                    await produto.Update();
                }
                await venda.AtualizarVenda();
                return res.send({ ok: true, msg: 'Venda registrada com sucesso!' });
            } else {
                return res.status(500).send({ ok: false, msg: 'Erro ao criar registro de venda!' });
            }

        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao registrar venda!' });
        }
    }
}

module.exports = VendaController;