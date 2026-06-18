const DevolucaoModel = require("../models/DevolucaoModel");
const ItemDevolucaoModel = require("../models/ItemDevolucaoModel");
const ProdutoModel = require("../models/ProdutoModel");
const ClienteModel = require("../models/ClienteModel");
const LoteModel = require("../models/LoteModel");
const EstoqueModel = require("../models/EstoqueModel");
const ItemVendaModel = require("../models/ItemVendaModel");

async function validarDevolucaoContraVenda(produtoId, quantidade) {
    const qtd = Number(quantidade);
    if (!produtoId || Number.isNaN(qtd) || qtd <= 0) {
        return 'Produto ou quantidade inválidos para devolução.';
    }

    const vendido = await new ItemVendaModel().totalVendidoPorProduto(produtoId);
    if (vendido <= 0) {
        return 'Não há registro de venda deste produto; não é possível registrar devolução/troca.';
    }

    const devolvido = await new ItemDevolucaoModel().totalDevolvidoAprovadoPorProduto(produtoId);
    const disponivel = vendido - devolvido;
    if (qtd > disponivel) {
        return `Quantidade indisponível para devolução (vendido: ${vendido}, já devolvido: ${devolvido}).`;
    }

    return null;
}

async function restocarDevolucao(devolucaoId) {
    const origem = `DEVOLUCAO #${devolucaoId}`;

    const jaMovimentado = await new EstoqueModel().existeMovimentacaoPorOrigem(origem);
    if (jaMovimentado) {
        return;
    }

    const itens = await new ItemDevolucaoModel().listarPorDevolucao(devolucaoId);
    for (const item of (Array.isArray(itens) ? itens : [])) {
        const produtoId = item.getPRODUTOID();
        const quantidade = Number(item.getQUANTIDADE());

        if (!produtoId || Number.isNaN(quantidade) || quantidade <= 0) {
            continue;
        }

        const loteId = await new LoteModel().getLotePreferencialPorProduto(produtoId);
        if (loteId) {
            const lote = new LoteModel();
            lote.id = loteId;
            await lote.IncreaseStock(quantidade);
        }

        const mov = new EstoqueModel(0, loteId, 'ENTRADA', origem, quantidade, produtoId, item.getID());
        await mov.AddToInventory();

        const substituto = item.getPRODUTOSUBSTITUTO();
        if (substituto) {
            const loteSubId = await new LoteModel().getLoteParaVenda(substituto, quantidade);
            if (loteSubId) {
                const loteSub = new LoteModel();
                loteSub.id = loteSubId;
                await loteSub.DecreaseStock(quantidade);
            }
            const movSaida = new EstoqueModel(0, loteSubId, 'SAIDA', `TROCA #${devolucaoId}`, quantidade, substituto, item.getID());
            await movSaida.AddToInventory();
        }
    }
}

async function validarSubstitutoTroca(tipo, produtoSubstituto, quantidade) {
    if (tipo !== 'Venda') {
        return null;
    }
    if (!produtoSubstituto) {
        return 'Para troca, informe o produto substituto.';
    }
    const loteId = await new LoteModel().getLoteParaVenda(produtoSubstituto, quantidade);
    if (!loteId) {
        return 'Produto substituto sem estoque/lote válido para a quantidade informada.';
    }
    return null;
}

class DevolucaoController {

    async listarView(req, res) {
        let devolucao = new DevolucaoModel();
        let lista = await devolucao.listar();
        res.render("posVenda/listar", { lista, active: 'posVenda' });
    }

    async cadastrarPresencialView(req, res) {
        let produto = new ProdutoModel();
        let listaProdutos = await produto.Read();
        let cliente = new ClienteModel();
        let listaClientes = await cliente.Read();
        res.render("posVenda/cadastrarPresencial", { listaProdutos, listaClientes, active: 'posVenda' });
    }

    async cadastrarPresencial(req, res) {
        let ok = false;
        let msg = "";

        let { tipo, clienteId, dataCompra, produtoId, quantidade, motivo, observacao, produtoSubstituto } = req.body;

        if (!tipo || !clienteId || !dataCompra || !produtoId || !quantidade || !motivo) {
            return res.send({ ok: false, msg: "Preencha todos os campos obrigatórios!" });
        }

        let dataCompraDate = new Date(dataCompra);
        let hoje = new Date();
        let diffDias = Math.floor((hoje - dataCompraDate) / (1000 * 60 * 60 * 24));

        if (diffDias > 30) {
            return res.send({ ok: false, msg: "Prazo de devolução expirado! Máximo de 30 dias após a compra." });
        }

        if (diffDias < 0) {
            return res.send({ ok: false, msg: "A data da compra não pode ser uma data futura!" });
        }

        let erroVenda = await validarDevolucaoContraVenda(produtoId, quantidade);
        if (erroVenda) {
            return res.send({ ok: false, msg: erroVenda });
        }

        let erroTroca = await validarSubstitutoTroca(tipo, produtoSubstituto, quantidade);
        if (erroTroca) {
            return res.send({ ok: false, msg: erroTroca });
        }

        let dataHoje = new Date().toISOString().split('T')[0];
        let devolucao = new DevolucaoModel(
            0, dataHoje, 'Aprovado', observacao || '', 0, tipo, 'presencial', dataCompra, null, clienteId, null, null, null
        );

        let devolucaoId = await devolucao.cadastrar();

        if (devolucaoId) {
            let item = new ItemDevolucaoModel(0, quantidade, devolucaoId, motivo, produtoId, null, tipo === 'Venda' ? produtoSubstituto : null);
            let resultItem = await item.cadastrar();

            if (resultItem) {
                await restocarDevolucao(devolucaoId);
                ok = true;
                msg = "Devolução/troca registrada com sucesso!";
            } else {
                ok = false;
                msg = "Devolução criada, mas houve erro ao salvar o item.";
            }
        } else {
            ok = false;
            msg = "Erro ao registrar a devolução no banco de dados!";
        }

        res.send({ ok, msg });
    }

    async detalhesView(req, res) {
        let devolucao = new DevolucaoModel();
        let resultado = await devolucao.obter(req.params.id);

        if (!resultado) {
            return res.redirect("/admin/pos-venda");
        }

        let itemModel = new ItemDevolucaoModel();
        let itens = await itemModel.listarPorDevolucao(req.params.id);

        res.render("posVenda/detalhes", { devolucao: resultado, itens, active: 'posVenda' });
    }

    async atualizarStatus(req, res) {
        let ok = false;
        let msg = "";

        let { id, status, observacao } = req.body;

        if (!id || !status) {
            return res.send({ ok: false, msg: "ID e status são obrigatórios!" });
        }

        let statusPermitidos = ['Aprovado', 'Aguardando', 'Nao Aprovado'];
        if (!statusPermitidos.includes(status)) {
            return res.send({ ok: false, msg: "Status inválido!" });
        }

        let devolucao = new DevolucaoModel();
        devolucao.setID(id);
        devolucao.setSTATUS(status);
        devolucao.setOBSERVACAO(observacao || '');
        devolucao.setFUNCIONARIOID(null);

        if (status === 'Aprovado') {
            devolucao.setDATAFINALIZACAO(new Date());
        }

        let result = await devolucao.atualizarStatus();

        if (result) {
            if (status === 'Aprovado') {
                await restocarDevolucao(id);
            }
            ok = true;
            msg = "Status atualizado com sucesso!";
        } else {
            ok = false;
            msg = "Erro ao atualizar o status!";
        }

        res.send({ ok, msg });
    }

    async deletar(req, res) {
        let ok = false;
        let msg = "";

        if (req.body.id && req.body.id != "0") {
            let devolucao = new DevolucaoModel();
            let result = await devolucao.deletar(req.body.id);

            if (result) {
                ok = true;
                msg = "Devolução excluída com sucesso!";
            } else {
                ok = false;
                msg = "Erro ao excluir a devolução!";
            }
        } else {
            ok = false;
            msg = "ID não informado para exclusão!";
        }

        res.send({ ok, msg });
    }

    async solicitarOnlineView(req, res) {
        let produto = new ProdutoModel();
        let listaProdutos = await produto.Read();
        res.render("posVenda/solicitarOnline", { listaProdutos, layout: 'layoutPublico' });
    }

    async solicitarOnline(req, res) {
        let ok = false;
        let msg = "";

        let { tipo, produtoId, dataCompra, quantidade, motivo, nomeCliente, contato, produtoSubstituto } = req.body;

        if (!tipo || !produtoId || !dataCompra || !quantidade || !motivo || !nomeCliente || !contato) {
            return res.send({ ok: false, msg: "Preencha todos os campos obrigatórios!" });
        }

        let dataCompraDate = new Date(dataCompra);
        let hoje = new Date();
        let diffDias = Math.floor((hoje - dataCompraDate) / (1000 * 60 * 60 * 24));

        if (diffDias > 30) {
            return res.send({ ok: false, msg: "Prazo de devolução expirado! Máximo de 30 dias após a compra." });
        }

        if (diffDias < 0) {
            return res.send({ ok: false, msg: "A data da compra não pode ser uma data futura!" });
        }

        let erroVenda = await validarDevolucaoContraVenda(produtoId, quantidade);
        if (erroVenda) {
            return res.send({ ok: false, msg: erroVenda });
        }

        let erroTroca = await validarSubstitutoTroca(tipo, produtoSubstituto, quantidade);
        if (erroTroca) {
            return res.send({ ok: false, msg: erroTroca });
        }

        let dataHoje = new Date().toISOString().split('T')[0];
        let descricao = "Solicitação online - Cliente: " + nomeCliente + " | Contato: " + contato;

        let devolucao = new DevolucaoModel(
            0, dataHoje, 'Aguardando', descricao, 0, tipo, 'online', dataCompra, null, null, null, null, null
        );

        let devolucaoId = await devolucao.cadastrar();

        if (devolucaoId) {
            let item = new ItemDevolucaoModel(0, quantidade, devolucaoId, motivo, produtoId, null, tipo === 'Venda' ? produtoSubstituto : null);
            let resultItem = await item.cadastrar();

            if (resultItem) {
                ok = true;
                msg = "Solicitação enviada com sucesso! Aguarde a análise da equipe.";
            } else {
                ok = false;
                msg = "Erro ao registrar o item da solicitação.";
            }
        } else {
            ok = false;
            msg = "Erro ao registrar a solicitação no sistema!";
        }

        res.send({ ok, msg });
    }
}

module.exports = DevolucaoController;
