const VendaModel = require('../models/VendaModel');
const ItemVendaModel = require('../models/ItemVendaModel');
const ProdutoModel = require('../models/ProdutoModel');
const EstoqueModel = require('../models/EstoqueModel');
const LoteModel = require('../models/LoteModel');
const ProdutoPromocaoModel = require('../models/ProdutoPromocaoModel');
const Database = require('../utils/database');

function toMySqlDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 19).replace('T', ' ');
}

class VendaController {

    async VendasView(req, res){
        res.locals.active = 'vendas';
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
        const itens = Array.isArray(req.body)
            ? req.body
            : (Array.isArray(req.body?.itens)
                ? req.body.itens
                : (Array.isArray(req.body?.cart) ? req.body.cart : []));

        if(itens.length === 0){
            return res.send({ ok: false, msg: 'Nenhum item enviado ao servidor!' });
        }

        const banco = new Database();
        let connection;

        try {
            // Toda a venda ocorre numa transação: ou tudo é gravado, ou nada (sem dados parciais).
            connection = await banco.BeginTransaction();

            let venda = new VendaModel()
            venda.status = 'PENDENTE'
            venda.formaPagamento = 'PIX'
            venda.valorFinal = 0;
            let id = await venda.RegistrarVenda(connection);

            if(!id){
                await banco.Rollback(connection);
                return res.status(500).send({ ok: false, msg: 'Erro ao criar registro de venda!' });
            }

            for(let item of itens){
                const produto = await new ProdutoModel().Get(item.produtoId || item.id_produto || item.id);

                if(!produto){
                    await banco.Rollback(connection);
                    return res.send({ ok: false, msg: 'Produto não encontrado!' });
                }

                const quant = Number(item.quantidade);

                // Aplica o preço promocional vigente (o mesmo que o carrinho exibe),
                // caindo no preço cheio quando não há promoção ativa.
                const promo = await new ProdutoPromocaoModel().GetPromocaoByProdutoId(produto.id);
                const preco = (promo && Number(promo.precoPromocional) > 0)
                    ? Number(promo.precoPromocional)
                    : Number(produto.preco);

                if (Number.isNaN(quant) || quant <= 0) {
                    await banco.Rollback(connection);
                    return res.send({ ok: false, msg: `Quantidade inválida para o produto ${produto.nome}!` });
                }

                if (Number.isNaN(preco) || preco < 0) {
                    await banco.Rollback(connection);
                    return res.send({ ok: false, msg: `Preço inválido para o produto ${produto.nome}!` });
                }

                // Lote é a fonte da verdade do saldo: FEFO, não vencido e com saldo suficiente.
                const loteId = await new LoteModel().getLoteParaVenda(produto.id, quant, connection);
                if (!loteId) {
                    await banco.Rollback(connection);
                    return res.send({ ok: false, msg: `Quantidade insuficiente do produto ${produto.nome} no estoque!` });
                }

                // Baixa atômica no lote (o guard lot_qnt >= ? impede saldo negativo em vendas simultâneas).
                const lote = new LoteModel();
                lote.id = loteId;
                const baixouLote = await lote.DecreaseStock(quant, connection);
                if (!baixouLote) {
                    await banco.Rollback(connection);
                    return res.send({ ok: false, msg: `Quantidade insuficiente do produto ${produto.nome} no estoque!` });
                }

                // Mantém o contador denormalizado do produto sincronizado (best-effort).
                await new ProdutoModel().DecreaseStock(produto.id, quant, connection);

                let itemVenda = new ItemVendaModel()
                itemVenda.id_venda = id;
                itemVenda.id_produto = produto.id;
                itemVenda.id_lote = loteId;
                itemVenda.item_quant = quant;
                itemVenda.item_valor = preco;
                itemVenda.item_valor_total = quant * preco;
                await itemVenda.RegistrarItemVenda(connection);
                venda.valorFinal += itemVenda.item_valor_total;

                let estoque = new EstoqueModel(0, loteId, 'SAIDA', `VENDA #${id}`, quant, produto.id, null);
                await estoque.AddToInventory(connection);
            }

            venda.status = 'PAGO';
            await venda.AtualizarVenda(connection);

            await banco.Commit(connection);
            return res.send({ ok: true, msg: 'Venda registrada com sucesso!' });

        } catch (error) {
            if (connection) await banco.Rollback(connection);
            console.error('Erro ao registrar venda:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao registrar venda!' });
        }
    }
}

module.exports = VendaController;