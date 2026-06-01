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
        
        let servico = new ServicosCliente();
        servico.serv_id = null;
        servico.serv_data = new Date(`${data}T${hora}`);
        servico.serv_obs = obs || "";
        servico.serv_tipo = tipo;
        servico.cliente_id = usuarioId;
        await servico.cadastrar();

        return res.send({ ok: true, msg: "Serviço cadastrado com sucesso!" });
    }
}

module.exports = UsuarioController