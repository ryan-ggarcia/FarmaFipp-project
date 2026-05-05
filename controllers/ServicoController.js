const ServicoModel = require("../models/ServicoModel");
const TipoServico = require("../models/TipoServicoModel");
const ClienteModel = require("../models/ClienteModel")
const FuncionarioModel = require("../models/FuncionarioModel")

class ServicoController {
    async listarView(req, res) {
        let servico = new ServicoModel();
        let lista = await servico.listar();

        res.render("servicos/listar", { lista, active: 'servicos' })
    }

    async cadastrarView(req, res) {
        let tipoServico = new TipoServico();
        let listaTipos = await tipoServico.listar();
        let listaCliente = new ClienteModel()
        listaCliente = await listaCliente.Read()
        res.render("servicos/cadastrar", { listaTipos, listaCliente, active: 'servicos' });
    }

    async alterarView(req, res) {
        let servico = new ServicoModel();
        let tipoServico = new TipoServico();
        let listaTipos = await tipoServico.listar();
        let listaCliente = new ClienteModel()
        let listaFunc = new FuncionarioModel()
        listaCliente = await listaCliente.Read()
        listaFunc = await listaFunc.Read()
        servico = await servico.obter(req.params.idAlteracao);

        res.render("servicos/alterar", { servico,listaTipos, listaCliente, listaFunc, active: 'servicos' });
    }

    async cadastrar(req, res) {
        console.log(req.body);
        let ok = false;
        let msg = "";
        // Treat status as optional; default to false => 'nao aprovado'
        let { data, hora, preco, status, obs, descricao, tipo, func, clie } = req.body;
        if (data != "" && tipo != "" && descricao != "" && typeof status !== 'undefined' && hora != "" && preco != "" && func != "" && clie != "" && obs != "") {
            let statusStr = typeof status === 'undefined' ? 'Aguardando' : (status ? 'Ativo' : 'Inativo');
            let servico = new ServicoModel(0, data, tipo, statusStr, descricao);
            let result = await servico.cadastrar();

            if (result) {
                ok = true;
            }
            else {
                ok = false;
            }
        }
        else {
            ok = false;
            msg = "Erro durante a validação das informações do serviço!";

        }

        res.send({ ok, msg })
    }

    async alterar(req, res) {
        let ok = false;
        let msg = "";
        const statusBool = (typeof req.body.status !== 'undefined') ? (req.body.status === true || req.body.status === 'true') : false;
        if (req.body.id != "0" && req.body.data != "" && req.body.tipo != "" && req.body.descricao != "") {
            let servico = new ServicoModel(req.body.id, req.body.data, req.body.tipo, statusBool ? 'aprovado' : 'nao aprovado', req.body.descricao);
            let result = await servico.atualizar();
            if (result) {
                ok = true;
                msg = "Serviço alterado!";
            }
            else {
                ok = false;
                msg = "Erro ao alterar serviço no banco de dados";
            }
        }
        else {
            ok = false;
            msg = "Erro ao validar as informações do serviço!";
        }

        res.send({ ok, msg });
    }

    async deletar(req, res) {
        let ok = false;
        let msg = "";
        if (req.body.id && req.body.id != "0") {
            let servico = new ServicoModel();
            let result = await servico.deletar(req.body.id);
            if (result != null) {
                ok = true;
                msg = "Serviço excluído!";
            }
            else {
                ok = false;
                msg = "Erro ao excluir serviço no banco de dados!";
            }
        }
        else {
            ok = false;
            msg = "ID não informado para exclusão!";
        }
        res.send({ ok, msg });
    }
}

class UsuarioController {







}

module.exports = ServicoController;