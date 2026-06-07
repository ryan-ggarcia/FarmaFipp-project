const ProdutoModel = require('../models/ProdutoModel');
const ProdutoPromocaoModel = require('../models/ProdutoPromocaoModel');

class UsuarioController {
    async homeView(req, res) {
        try {
            const promoModel = new ProdutoPromocaoModel();
            const promocoes = await promoModel.ReadPromocoes();

            res.render("usuarioView/home", {
                layout: "layoutPublico",
                promocoes: Array.isArray(promocoes) ? promocoes : []
            });
        } catch (error) {
            console.error('Erro ao carregar home do usuário:', error);
            res.render("usuarioView/home", {
                layout: "layoutPublico",
                promocoes: []
            });
        }
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

            // Cria um mapa de promoções indexado por ID do produto
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

    carrinhoView(req, res) {
        res.render("usuarioView/carrinho", { layout: "layoutPublico" });
    }

    contatoView(req, res) {
        res.render("usuarioView/contato", { layout: "layoutPublico" });
    }

    sobreView(req, res) {
        res.render("usuarioView/sobre", { layout: "layoutPublico" });
    }
}

module.exports = UsuarioController