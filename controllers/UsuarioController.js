const ProdutoModel = require('../models/ProdutoModel');
const ProdutoPromocaoModel = require('../models/ProdutoPromocaoModel');
const TipoServicoModel = require('../models/TipoServicoModel');
const ServicosCliente = require("../models/ServicosCliente");
const ClienteModel = require("../models/ClienteModel");

class UsuarioController {
    homeView(req, res) {
        res.render("usuarioView/home", { layout: "layoutPublico" })
    }
    async produtosView(req, res) {
        try {
            const produtos = new ProdutoModel();
            const listaBruta = await produtos.Read();
            const lista = (Array.isArray(listaBruta) ? listaBruta : []).filter((produto) => {
                const possuiLote = produto && produto.id_lote != null;
                const estoque = Number(produto?.quantidade || 0);
                return possuiLote && !Number.isNaN(estoque) && estoque > 0;
            });

            const categoriasMap = new Map();
            const marcasMap = new Map();
            const precos = [];

            for (const produto of lista) {
                if (produto.categoria) {
                    categoriasMap.set(produto.categoria, (categoriasMap.get(produto.categoria) || 0) + 1);
                }

                if (produto.marca) {
                    marcasMap.set(produto.marca, (marcasMap.get(produto.marca) || 0) + 1);
                }

                const preco = Number(produto.preco);
                if (!Number.isNaN(preco)) {
                    precos.push(preco);
                }
            }

            const categorias = [...categoriasMap.entries()]
                .map(([nome, total]) => ({ nome, total }))
                .sort((a, b) => b.total - a.total);

            const marcas = [...marcasMap.entries()]
                .map(([nome, total]) => ({ nome, total }))
                .sort((a, b) => b.total - a.total);

            const faixaPreco = {
                min: precos.length ? Math.floor(Math.min(...precos)) : 0,
                max: precos.length ? Math.ceil(Math.max(...precos)) : 0
            };

            const promProducts = new ProdutoPromocaoModel();
            const produtosPromocao = await promProducts.ReadProductExpirationDateNear();

            res.render("usuarioView/produtos", {
                layout: "layoutPublico",
                lista,
                categorias,
                produtosPromocao: Array.isArray(produtosPromocao) ? produtosPromocao : []
            });
        } catch (error) {
            console.error('Erro ao carregar produtos para usuário:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar produtos.' });
        }
    }

    carrinhoView(req, res) {
        res.render("usuarioView/carrinho", { layout: "layoutPublico" });
    }

    contatoView(req, res) {
        res.render("usuarioView/contato", { layout: "layoutPublico" });
    }

    sobreView(req, res) {
        res.render("usuarioView/sobre", { layout: "layoutPublico" });
    }

    async cadastrarServicoView(req, res){
        let tipoServico = new TipoServicoModel();
        let listaServicos = await tipoServico.listar();
        res.render("usuarioView/servicos", { layout: "layoutPublico", listaServicos });
    }

    async cadastrarServico(req, res){
        let usuarioModel = new ClienteModel();
        let usuario = await usuarioModel.Get(req.usuarioId);

        let usuarioId = usuario.cliId;
        console.log(usuarioId);

        const { data, hora, tipo, obs } = req.body;
        console.log(req.body);
        if(!data || !hora || !tipo){
            return res.send({ ok: false, msg: "Preencha todos os campos obrigatórios!" });
        }

        if(data < new Date().toISOString().split("T")[0]){
            return res.send({ ok: false, msg: "Insira uma data válida!" });
        }
        
        let servico = new ServicosCliente();
        servico.serv_id = null;
        servico.serv_data = new Date(`${data}T${hora}`);
        servico.serv_obs = obs || "";
        servico.serv_tipo = tipo;
        servico.serv_status = "Aguardando Aprovacao";
        servico.cliente_id = usuarioId;
        await servico.cadastrar();

        return res.send({ ok: true, msg: "Serviço cadastrado com sucesso! Aguarde a aprovação da equipe." });
    }

    async listarServicos(req, res){
        let usuarioModel = new ClienteModel();
        let usuario = await usuarioModel.Get(req.usuarioId);

        let usuarioId = usuario.cliId;

        let servico = new ServicosCliente();
        let listaServicos = await servico.listar();
        let servicosUsuario = listaServicos
            .filter(serv => {
                const mesmoCliente = Number(serv.cliente_id) === usuarioId;
                const status = String(serv.serv_status).toLowerCase();
                const visivel =
                    status === "1" ||
                    status === "ativo" ||
                    status === "agendado" ||
                    status === "aguardando" ||
                    status === "aguardando aprovacao" ||
                    status === "aprovado" ||
                    status === "recusado" ||
                    status === "nao_aprovado";
                return mesmoCliente && visivel;
            })
            .sort((a, b) => new Date(a.serv_data) - new Date(b.serv_data));

        res.render("usuarioView/listarServicos", { layout: "layoutPublico", listaServicos: servicosUsuario });
    }

    async excluirServico(req, res){
        const id = req.body?.id || req.params?.id;

        if(!id){
            return res.send({ ok: false, msg: "ID do serviço é obrigatório!" });
        }

        let servico = new ServicosCliente();
        let result = await servico.deletar(id);

        if(result){
            return res.send({ ok: true, msg: "Serviço cancelado com sucesso!" });
        } else {
            return res.send({ ok: false, msg: "Erro ao cancelar o serviço." });
        }
    }

    async alterarView(req, res){
        let servico = new ServicosCliente();
        let lista = await servico.get(req.params.id);
        let servicoSelecionado = Array.isArray(lista) ? lista[0] : null;

        if(!servicoSelecionado){
            return res.redirect("/servicos/listar");
        }

        let tipoServico = new TipoServicoModel();
        let tipos = await tipoServico.listar();

        res.render("usuarioView/alterarServico", {
            layout: "layoutPublico",
            lista: servicoSelecionado,
            tipos
        });
    }

    async alterarServico(req, res){
        const id = req.params?.id || req.body?.id;
        const { data, hora, tipo, obs, status } = req.body;

        if(!id){
            return res.send({ ok: false, msg: "ID do serviço é obrigatório!" });
        }

        if(!data || !hora || !tipo){
            return res.send({ ok: false, msg: "Preencha todos os campos obrigatórios!" });
        }

        if(data < new Date().toISOString().split("T")[0]){
            return res.send({ ok: false, msg: "Insira uma data válida!" });
        }

        let servico = new ServicosCliente(id, new Date(`${data}T${hora}`), obs || "", tipo, status || "Ativo", null);
        let result = await servico.update(id);

        if(result){
            return res.send({ ok: true, msg: "Serviço alterado com sucesso!" });
        } else {
            return res.send({ ok: false, msg: "Erro ao alterar o serviço." });
        }
    }
}

module.exports = UsuarioController