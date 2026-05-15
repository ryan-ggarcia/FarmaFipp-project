const DevolucaoModel = require("../models/DevolucaoModel");
const ItemDevolucaoModel = require("../models/ItemDevolucaoModel");
const ProdutoModel = require("../models/ProdutoModel");
const ClienteModel = require("../models/ClienteModel");

class DevolucaoController {

    // ===========================
    // ROTAS INTERNAS (funcionário)
    // ===========================

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

        let { tipo, clienteId, dataCompra, produtoId, quantidade, motivo, observacao } = req.body;

        // Validação dos campos obrigatórios
        if (!tipo || !clienteId || !dataCompra || !produtoId || !quantidade || !motivo) {
            return res.send({ ok: false, msg: "Preencha todos os campos obrigatórios!" });
        }

        // Validação do prazo de devolução (30 dias)
        let dataCompraDate = new Date(dataCompra);
        let hoje = new Date();
        let diffDias = Math.floor((hoje - dataCompraDate) / (1000 * 60 * 60 * 24));

        if (diffDias > 30) {
            return res.send({ ok: false, msg: "Prazo de devolução expirado! Máximo de 30 dias após a compra." });
        }

        if (diffDias < 0) {
            return res.send({ ok: false, msg: "A data da compra não pode ser uma data futura!" });
        }

        // Cadastrar a devolução (presencial = já Aprovado)
        // ENUM tipo: 'Venda' ou 'Compra' (banco real)
        // ENUM status: 'Aprovado', 'Aguardando', 'Nao Aprovado' (banco real)
        let dataHoje = new Date().toISOString().split('T')[0];
        let devolucao = new DevolucaoModel(
            0, dataHoje, 'Aprovado', observacao || '', 0, tipo, 'presencial', dataCompra, null, clienteId, null, null, null
        );

        let devolucaoId = await devolucao.cadastrar();

        if (devolucaoId) {
            // Cadastrar o item da devolução
            let item = new ItemDevolucaoModel(0, quantidade, devolucaoId, motivo, produtoId, null);
            let resultItem = await item.cadastrar();

            if (resultItem) {
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

        // Validar status permitidos (valores reais do banco)
        let statusPermitidos = ['Aprovado', 'Aguardando', 'Nao Aprovado'];
        if (!statusPermitidos.includes(status)) {
            return res.send({ ok: false, msg: "Status inválido!" });
        }

        let devolucao = new DevolucaoModel();
        devolucao.setID(id);
        devolucao.setSTATUS(status);
        devolucao.setOBSERVACAO(observacao || '');
        devolucao.setFUNCIONARIOID(null);

        // Se o status for 'Aprovado' vindo de 'Aguardando', é uma finalização
        if (status === 'Aprovado') {
            devolucao.setDATAFINALIZACAO(new Date());
        }

        let result = await devolucao.atualizarStatus();

        if (result) {
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

    // ===========================
    // ROTAS PÚBLICAS (cliente)
    // ===========================

    async solicitarOnlineView(req, res) {
        let produto = new ProdutoModel();
        let listaProdutos = await produto.Read();
        res.render("posVenda/solicitarOnline", { listaProdutos, layout: 'layoutPublico' });
    }

    async solicitarOnline(req, res) {
        let ok = false;
        let msg = "";

        let { tipo, produtoId, dataCompra, quantidade, motivo, nomeCliente, contato } = req.body;

        // Validação dos campos obrigatórios
        if (!tipo || !produtoId || !dataCompra || !quantidade || !motivo || !nomeCliente || !contato) {
            return res.send({ ok: false, msg: "Preencha todos os campos obrigatórios!" });
        }

        // Validação do prazo de devolução (30 dias)
        let dataCompraDate = new Date(dataCompra);
        let hoje = new Date();
        let diffDias = Math.floor((hoje - dataCompraDate) / (1000 * 60 * 60 * 24));

        if (diffDias > 30) {
            return res.send({ ok: false, msg: "Prazo de devolução expirado! Máximo de 30 dias após a compra." });
        }

        if (diffDias < 0) {
            return res.send({ ok: false, msg: "A data da compra não pode ser uma data futura!" });
        }

        // Cadastrar a devolução (online = Aguardando, sem funcionário)
        let dataHoje = new Date().toISOString().split('T')[0];
        let descricao = "Solicitação online - Cliente: " + nomeCliente + " | Contato: " + contato;

        let devolucao = new DevolucaoModel(
            0, dataHoje, 'Aguardando', descricao, 0, tipo, 'online', dataCompra, null, null, null, null, null
        );

        let devolucaoId = await devolucao.cadastrar();

        if (devolucaoId) {
            // Cadastrar o item da devolução
            let item = new ItemDevolucaoModel(0, quantidade, devolucaoId, motivo, produtoId, null);
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
