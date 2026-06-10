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
        let listaCliente = new ClienteModel();
        let listaFunc = new FuncionarioModel();

        listaCliente = await listaCliente.Read();
        listaFunc = await listaFunc.Read();

        res.render("servicos/cadastrar", { listaTipos, listaCliente, listaFunc, active: 'servicos' });
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
        let ok = false;
        let msg = "";
        let { data, hora, preco, status, obs, tipo, func, clie } = req.body;

        const vazio = (v) => v === undefined || v === null || String(v).trim() === '';

        const precoNum = Number(preco);
        const horaValida = /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(hora || ''));
        const hoje = new Date().toISOString().split('T')[0];
        const statusNormalizado = String(status || '').toLowerCase();

        const camposInvalidos = [];
        if (vazio(data)) camposInvalidos.push('data');
        if (vazio(hora)) camposInvalidos.push('hora');
        if (vazio(preco)) camposInvalidos.push('preco');
        if (vazio(obs)) camposInvalidos.push('obs');
        if (vazio(statusNormalizado) || statusNormalizado === '0') camposInvalidos.push('status');
        if (vazio(tipo) || String(tipo) === '0') camposInvalidos.push('tipo');
        if (vazio(func) || String(func) === '0') camposInvalidos.push('func');
        if (vazio(clie) || String(clie) === '0') camposInvalidos.push('clie');

        if (camposInvalidos.length > 0) {
            return res.send({ ok: false, msg: `Campos obrigatórios inválidos: ${camposInvalidos.join(', ')}.` });
        }

        if (!horaValida) {
            return res.send({ ok: false, msg: "Hora inválida. Informe um horário entre 00:00 e 23:59." });
        }

        if (Number.isNaN(precoNum) || precoNum < 0) {
            return res.send({ ok: false, msg: "Preço inválido. Informe um valor numérico não negativo." });
        }

        if (data < hoje) {
            return res.send({ ok: false, msg: "Não é permitido cadastrar serviço em data anterior à atual." });
        }

        const statusMap = {
            aprovado: 'Ativo',
            ativo: 'Ativo',
            aguardando: 'Aguardando',
            inativo: 'Inativo',
            nao_aprovado: 'Inativo'
        };

        const statusFinal = statusMap[statusNormalizado];

        if (!statusFinal) {
            return res.send({ ok: false, msg: 'Status inválido para cadastro de serviço.' });
        }

        let servico = new ServicoModel(0, data, hora, precoNum, statusFinal, obs, Number(tipo), Number(func), Number(clie));
        let result = await servico.cadastrar();

        if (result) {
            ok = true;
            msg = "Serviço cadastrado com sucesso!";
        } else {
            ok = false;
            msg = "Erro ao cadastrar serviço no banco de dados!";
        }

        res.send({ ok, msg });
    }

    async alterar(req, res) {
        let ok = false;
        let msg = "";

        const { id, data, hora, preco, status, obs, tipo, func, clie } = req.body;
        const vazio = (v) => v === undefined || v === null || String(v).trim() === '';
        const precoNum = Number(preco);
        const horaValida = /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(hora || ''));

        if (
            vazio(id) || String(id) === '0' ||
            vazio(data) ||
            vazio(hora) ||
            vazio(preco) ||
            vazio(obs) ||
            vazio(status) || String(status) === '0' ||
            vazio(tipo) || String(tipo) === '0' ||
            vazio(func) || String(func) === '0' ||
            vazio(clie) || String(clie) === '0'
        ) {
            return res.send({ ok: false, msg: "Erro ao validar as informações do serviço!" });
        }

        if (!horaValida) {
            return res.send({ ok: false, msg: "Hora inválida. Informe um horário entre 00:00 e 23:59." });
        }

        if (Number.isNaN(precoNum) || precoNum < 0) {
            return res.send({ ok: false, msg: "Preço inválido. Informe um valor numérico não negativo." });
        }

        const statusMap = {
            aprovado: 'Ativo',
            ativo: 'Ativo',
            aguardando: 'Aguardando',
            inativo: 'Inativo',
            nao_aprovado: 'Inativo'
        };

        const statusFinal = statusMap[String(status).toLowerCase()] || status;

        let servico = new ServicoModel(Number(id), data, hora, precoNum, statusFinal, obs, Number(tipo), Number(func), Number(clie));
        let result = await servico.atualizar();

        if (result) {
            ok = true;
            msg = "Serviço alterado!";
        }
        else {
            ok = false;
            msg = "Erro ao alterar serviço no banco de dados";
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