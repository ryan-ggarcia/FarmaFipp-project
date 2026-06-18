const ProdutoModel = require('../models/ProdutoModel');
const ProdutoPromocaoModel = require('../models/ProdutoPromocaoModel');
const ServicoModel = require('../models/ServicoModel');
const TipoServico = require('../models/TipoServicoModel');
const FuncionarioModel = require('../models/FuncionarioModel');

class UsuarioController {
    async homeView(req, res) {
        const promoModel = new ProdutoPromocaoModel();
        const promocoesBrutas = await promoModel.ReadPromocoes();
        const vistosPromo = new Set();
        const promocoes = (Array.isArray(promocoesBrutas) ? promocoesBrutas : []).filter(p => {
            if (!p || p.idProduto == null || vistosPromo.has(p.idProduto)) return false;
            vistosPromo.add(p.idProduto);
            return true;
        });

        const listaBruta = await new ProdutoModel().Read();
        const vistos = new Set();
        const produtos = (Array.isArray(listaBruta) ? listaBruta : []).filter(p => {
            if (!p || p.id == null || vistos.has(p.id)) return false;
            vistos.add(p.id);
            return true;
        }).slice(0, 8);

        const todasCategorias = await new ProdutoModel().ListNomesCategorias();
        const populares = [
            'Higiene Pessoal e Cuidados',
            'Saúde Infantil e Bebês',
            'Vitaminas e Suplementos',
            'Primeiros Socorros',
            'Analgésicos e Antitérmicos'
        ];
        const categorias = populares.filter(nome => todasCategorias.includes(nome));

        const marcas = await new ProdutoModel().ListNomesMarcas();

        res.render("usuarioView/home", {
            layout: "layoutPublico",
            promocoes: Array.isArray(promocoes) ? promocoes : [],
            produtos,
            categorias,
            marcas
        });
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

            const promoMap = {};
            if (Array.isArray(produtosPromocao)) {
                produtosPromocao.forEach(p => {
                    promoMap[String(p.id)] = {
                        precoOriginal: Number(p.precoOriginal || p.preco),
                        precoPromocional: Number(p.precoPromocional || p.preco),
                        porcentagem: Number(p.porcentagemDesconto || 15)
                    };
                });
            }

            res.render("usuarioView/produtos", {
                layout: "layoutPublico",
                lista,
                categorias,
                produtosPromocao: Array.isArray(produtosPromocao) ? produtosPromocao : [],
                promoMap
            });
        } catch (error) {
            console.error('Erro ao carregar produtos para usuário:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar produtos.' });
        }
    }

    async produtoDetalheView(req, res) {
        const { id } = req.params;

        const listaBruta = await new ProdutoModel().Read();
        const produto = (Array.isArray(listaBruta) ? listaBruta : [])
            .find(p => p && String(p.id) === String(id));

        if (!produto) {
            return res.redirect('/shop');
        }

        const promProducts = new ProdutoPromocaoModel();
        const produtosPromocao = await promProducts.ReadProductExpirationDateNear();

        let promo = null;
        if (Array.isArray(produtosPromocao)) {
            const match = produtosPromocao.find(p => String(p.id) === String(id));
            if (match) {
                promo = {
                    precoOriginal: Number(match.precoOriginal || match.preco),
                    precoPromocional: Number(match.precoPromocional || match.preco),
                    porcentagem: Number(match.porcentagemDesconto || 15)
                };
            }
        }

        res.render("usuarioView/produto-detalhe", {
            layout: "layoutPublico",
            produto,
            promo
        });
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

    async agendarServicoView(req, res) {
        const clie = req.signedCookies.usuarioLogado;
        const listaTipos = await new TipoServico().listar();
        const listaFunc = await new FuncionarioModel().Read();
        const listaAgendamentos = await new ServicoModel().listarPorCliente(Number(clie));
        res.render("usuarioView/agendar-servico", {
            layout: "layoutPublico",
            listaTipos,
            listaFunc,
            listaAgendamentos
        });
    }

    async excluirAgendamento(req, res) {
        const clie = req.signedCookies.usuarioLogado;
        const { id } = req.body;

        const vazio = (v) => v === undefined || v === null || String(v).trim() === '';

        if (vazio(clie)) {
            return res.send({ ok: false, msg: 'Sessão expirada. Faça login novamente.' });
        }
        if (vazio(id) || String(id) === '0') {
            return res.send({ ok: false, msg: 'Agendamento não informado para exclusão.' });
        }

        const result = await new ServicoModel().deletarDoCliente(Number(id), Number(clie));

        if (result) {
            return res.send({ ok: true, msg: 'Agendamento excluído com sucesso!' });
        }
        return res.send({ ok: false, msg: 'Não foi possível excluir o agendamento.' });
    }

    async agendarServico(req, res) {
        const { data, hora, tipo, func, obs } = req.body;
        const clie = req.signedCookies.usuarioLogado;

        const vazio = (v) => v === undefined || v === null || String(v).trim() === '';
        const horaValida = /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(hora || ''));
        const hoje = new Date().toISOString().split('T')[0];

        if (vazio(clie)) {
            return res.send({ ok: false, msg: 'Sessão expirada. Faça login novamente.' });
        }
        if (vazio(data) || vazio(hora) || vazio(tipo) || String(tipo) === '0' || vazio(func) || String(func) === '0') {
            return res.send({ ok: false, msg: 'Preencha o tipo de serviço, o profissional, a data e a hora.' });
        }
        if (!horaValida) {
            return res.send({ ok: false, msg: 'Hora inválida. Informe um horário entre 00:00 e 23:59.' });
        }
        if (data < hoje) {
            return res.send({ ok: false, msg: 'Não é permitido agendar em data anterior à atual.' });
        }

        const conflito = await new ServicoModel().verificarConflito(data, hora, Number(func), Number(clie));
        if (conflito) {
            const msg = conflito.funcionario
                ? 'O profissional selecionado já possui um serviço nesse horário.'
                : 'Você já possui um serviço agendado nesse horário.';
            return res.send({ ok: false, msg });
        }

        const tipoServico = await new TipoServico().obter(Number(tipo));
        const preco = (tipoServico && tipoServico.getVALOR() != null) ? Number(tipoServico.getVALOR()) : 0;

        const servico = new ServicoModel(0, data, hora, preco, 'Aguardando', obs || '', Number(tipo), Number(func), Number(clie));
        const result = await servico.cadastrar();

        if (result) {
            return res.send({ ok: true, msg: 'Serviço agendado com sucesso! Aguarde a confirmação.' });
        }
        return res.send({ ok: false, msg: 'Erro ao agendar serviço.' });
    }
}

module.exports = UsuarioController