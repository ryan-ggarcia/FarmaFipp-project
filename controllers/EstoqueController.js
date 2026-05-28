const EstoqueModel = require('../models/EstoqueModel');
const LoteModel = require('../models/LoteModel');
const ItemVendaModel = require('../models/ItemVendaModel');
const VendaModel = require('../models/VendaModel');
class EstoqueController {
    async redirecionarGerenciar(req, res) {
        return res.redirect('/admin/estoque/gerenciar');
    }

    async gerenciarEstoqueView(req, res) {
        try{
            const Estoque = new EstoqueModel();
            const estoqueList = await Estoque.ListInventory();
            res.render('estoque/gerenciar', { estoqueList: estoqueList || [], active: 'estoque' });
        } 
        catch (error) {
            console.error('Erro ao carregar view de gerenciamento de estoque:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de gerenciamento de estoque!' });
        }
    }

    async adicionarView(req, res) {
        try {
            const lote = new LoteModel();
            const lotes = await lote.List();
            res.render('estoque/adicionar', { lotes: Array.isArray(lotes) ? lotes : [], active: 'estoque' });
        } catch (error) {
            console.error('Erro ao carregar view de adicionar estoque:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de adição de estoque!' });
        }
    }

    async adicionar(req, res) {
        try {
            const loteIdNum = Number(req.body?.loteId);
            const quantidadeNum = Number(req.body?.quantidade);

            if (Number.isNaN(loteIdNum) || loteIdNum <= 0 || Number.isNaN(quantidadeNum) || quantidadeNum <= 0) {
                return res.send({ ok: false, msg: 'Dados inválidos para adicionar estoque.' });
            }

            const loteModel = new LoteModel();
            const lotes = await loteModel.List();
            const loteSelecionado = Array.isArray(lotes)
                ? lotes.find((l) => Number(l.lot_id) === loteIdNum)
                : null;

            if (!loteSelecionado) {
                return res.send({ ok: false, msg: 'Lote não encontrado.' });
            }

            const loteOp = new LoteModel();
            loteOp.id = loteIdNum;
            const atualizou = await loteOp.IncreaseStock(quantidadeNum);

            if (!atualizou) {
                return res.send({ ok: false, msg: 'Não foi possível atualizar o lote informado.' });
            }

            const estoque = new EstoqueModel(0, loteIdNum, 'ENTRADA', 'COMPRA', quantidadeNum, loteSelecionado.prod_id || null, null);
            await estoque.AddToInventory();

            return res.send({ ok: true, msg: 'Entrada no estoque registrada com sucesso!' });
        } catch (error) {
            console.error('Erro ao adicionar estoque:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao adicionar estoque.' });
        }
    }

    async baixaView(req, res) {
        try {
            const lote = new LoteModel();
            const lotes = await lote.List();

            const vendaModel = new VendaModel();
            const vendas = await vendaModel.ListarVendas();

            res.render('estoque/baixa', {
                lotes: Array.isArray(lotes) ? lotes : [],
                vendas: Array.isArray(vendas) ? vendas : [],
                active: 'estoque'
            });
        } catch (error) {
            console.error('Erro ao carregar view de baixa de estoque:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de baixa de estoque!' });
        }
    }

    async baixa(req, res) {
        try {
            const vendaId = req.body?.id_venda ? Number(req.body.id_venda) : null;

            if (vendaId && !Number.isNaN(vendaId)) {
                const itemVenda = new ItemVendaModel();
                const itens = await itemVenda.ListarPorVenda(vendaId);

                if (!Array.isArray(itens) || itens.length === 0) {
                    return res.send({ ok: false, msg: 'Nenhum item encontrado para a venda informada.' });
                }

                for (const item of itens) {
                    if (!item.id_lote) {
                        continue;
                    }

                    const lote = new LoteModel();
                    lote.id = Number(item.id_lote);
                    const baixou = await lote.DecreaseStock(Number(item.vitem_quant));
                    if (!baixou) {
                        return res.send({ ok: false, msg: `Estoque insuficiente no lote ${item.id_lote}.` });
                    }

                    const mov = new EstoqueModel(0, Number(item.id_lote), 'SAIDA', `VENDA #${vendaId}`, Number(item.vitem_quant), Number(item.id_produto), item.id_venda_item);
                    await mov.AddToInventory();
                }

                return res.send({ ok: true, msg: 'Baixa registrada com sucesso a partir da venda.' });
            }

            const loteIdNum = Number(req.body?.loteId);
            const quantidadeNum = Number(req.body?.quantidade);

            if (Number.isNaN(loteIdNum) || loteIdNum <= 0 || Number.isNaN(quantidadeNum) || quantidadeNum <= 0) {
                return res.send({ ok: false, msg: 'Informe lote e quantidade válidos para baixa manual.' });
            }

            const lote = new LoteModel();
            lote.id = loteIdNum;

            const baixou = await lote.DecreaseStock(quantidadeNum);
            if (!baixou) {
                return res.send({ ok: false, msg: 'Quantidade indisponível para baixa nesse lote.' });
            }

            const mov = new EstoqueModel(0, loteIdNum, 'SAIDA', 'BAIXA MANUAL', quantidadeNum, null, null);
            await mov.AddToInventory();

            return res.send({ ok: true, msg: 'Baixa manual registrada com sucesso!' });
        } catch (error) {
            console.error('Erro ao registrar baixa:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao registrar baixa de estoque.' });
        }
    }
}

module.exports = EstoqueController;