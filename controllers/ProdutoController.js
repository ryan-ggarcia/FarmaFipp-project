const FornecedorModel = require('../models/FornecedorModel')
const ProdutoModel = require('../models/ProdutoModel')
const ProdutoPromocaoModel = require('../models/ProdutoPromocaoModel')
const LoteModel = require('../models/LoteModel')
const EstoqueModel = require('../models/EstoqueModel')

const fs = require('fs')
class ProdutoController {
    async listar(req, res) {
        try {
            let listaPro = new ProdutoModel()
            let lista = await listaPro.Read()
            let categoria = new ProdutoModel()
            categoria = await categoria.ListCategorias()
            let lote = new LoteModel()
            lote = await lote.List()
            res.render('produtos/listar', { lista, categoria, lote, active: 'produtos' });
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao listar produtos!' });
        }
    }

    async cadastrarView(req, res) {
        try {
            let fornecedor = new FornecedorModel();
            let listaFornecedor = await fornecedor.List();
            let produto = new ProdutoModel();
            let listaCategoria = await produto.ListCategorias();
            res.render('produtos/cadastrar', { categorias: listaCategoria, fornecedores: listaFornecedor, active: 'produtos' });
        } catch (error) {
            console.error('Erro ao carregar view de cadastro:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de cadastro!' });
        }
    }

    async AlterarView(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).send({ ok: false, msg: 'ID do produto não informado!' });
            }

            let produtoModel = new ProdutoModel();
            let produto = await produtoModel.Get(id);

            if (!produto) {
                return res.status(404).send({ ok: false, msg: 'Produto não encontrado!' });
            }

            let categoriasModel = new ProdutoModel();
            let categorias = await categoriasModel.ListCategorias();

            let fornecedoresModel = new FornecedorModel();
            let fornecedores = await fornecedoresModel.List();

            return res.render('produtos/alterar', {
                produto,
                categorias,
                fornecedores,
                produtoAlter: produto,
                listaCategorias: categorias,
                listaFornecedores: fornecedores,
                active: 'produtos'
            });
        } catch (error) {
            console.error('Erro ao carregar view de alteração de produto:', error);
            return res.status(500).send({ ok: false, msg: 'Erro ao carregar página de alteração!' });
        }
    }

    async obterProduto(req, res){
        try{
            const { produtoId } = req.params;
            if(!produtoId){
                return res.status(400).send({ ok: false, msg: 'ID do produto não informado!' });
            }
            else{
                let produtoModel = new ProdutoModel();
                let produto = await produtoModel.Get(produtoId);

                if(!produto){
                    return res.status(404).send({ ok: false, msg: 'Produto não encontrado!' });
                }

                produtoModel.id = produtoId;
                const lotes = await produtoModel.GetLote();
                const loteDisponivel = Array.isArray(lotes)
                    ? lotes.find(l => Number(l.lot_qnt || 0) > 0) || lotes[0]
                    : null;
                const idLote = loteDisponivel ? loteDisponivel.lot_id : null;

                // Verifica se existe promoção ativa
                const promoModel = new ProdutoPromocaoModel();
                const promo = await promoModel.GetPromocaoByProdutoId(produtoId);

                const resposta = {
                    id: produto.id,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    quantidade: produto.quantidade,
                    img: produto.img,
                    id_lote: idLote
                };

                if (promo) {
                    resposta.precoPromocional = promo.precoPromocional;
                    resposta.porcentagemDesconto = promo.porcentagem;
                }

                res.send({ ok: true, produto: resposta });
            }
        }
        catch(error){
            console.error('Erro ao obter produto:', error);
            return res.status(500).send({ ok: false, msg: 'Erro ao obter produto!' });
        }
    }

    async cadastrar(req, res) {
        const { nome, descricao, preco, quantidade, marca, categoria, fornecedor } = req.body;
        const img = req.file?.filename || null;

        if (!nome?.trim() || !descricao?.trim() || !preco || !quantidade || !marca?.trim() || !categoria || !fornecedor) {
            return res.send({ ok: false, msg: 'Preencha os dados corretamente!' });
        }

        if (nome.trim().length > 45) {
            return res.send({ ok: false, msg: 'O nome do produto deve ter no máximo 45 caracteres!' });
        }
        if (marca.trim().length > 30) {
            return res.send({ ok: false, msg: 'A marca deve ter no máximo 30 caracteres!' });
        }
        if (descricao.trim().length > 200) {
            return res.send({ ok: false, msg: 'A descrição deve ter no máximo 200 caracteres!' });
        }

        const precoNum = parseFloat(preco);
        const qtdNum = parseInt(quantidade, 10);

        if (isNaN(precoNum) || precoNum <= 0) {
            return res.send({ ok: false, msg: 'O preço deve ser maior que zero!' });
        }
        if (isNaN(qtdNum) || qtdNum <= 0) {
            return res.send({ ok: false, msg: 'A quantidade deve ser maior que zero!' });
        }

        let produto = new ProdutoModel(null, nome, descricao, null, precoNum, qtdNum, categoria, fornecedor, marca, null, img);
        
        const Database = require('../utils/database');
        const banco = new Database();
        let connection;
        
        try {
            connection = await banco.BeginTransaction();

            let result = await produto.Create(connection);
            if (result) {
                let estoque = new EstoqueModel()
                estoque.id = 0
                estoque.loteId = null
                estoque.tipo = 'ENTRADA'
                estoque.origem = `Cadastro do produto ${nome}`
                estoque.produtoId = result // result é o insertId
                estoque.itensId = null
                estoque.quantidade = produto.quantidade

                await estoque.AddToInventory(connection);

                await banco.Commit(connection);
                return res.send({ ok: true, msg: 'Produto registrado no estoque!' });
            } else {
                await banco.Rollback(connection);
                return res.send({ ok: false, msg: 'Erro ao cadastrar o produto!' });
            }
        } catch (error) {
            if(connection) await banco.Rollback(connection);
            console.error('Erro ao cadastrar o produto:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao cadastrar o produto!' });
        }
    }

    async excluir(req, res) {
        const id = req.params.id || req.body.id;
        if (!id) {
            return res.send({ ok: false, msg: 'ID do produto não informado!' });
        }
        try {
            let produto = new ProdutoModel();
            let result = await produto.Delete(id);
            if (result) {
                // Invalida/Remove as promoções vinculadas
                const promoModel = new ProdutoPromocaoModel();
                const promoAtiva = await promoModel.GetPromocaoByProdutoId(id);
                if (promoAtiva) {
                    await promoModel.RemoverPromocao(promoAtiva.idPromocao);
                }

                return res.send({ ok: true, msg: 'Produto inativado com sucesso!' });
            } else {
                return res.send({ ok: false, msg: 'Erro ao excluir o produto!' });
            }
        } catch (error) {
            console.error('Erro ao excluir o produto:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao excluir o produto!' });
        }
    }

    async alterar(req, res){
        try {
            const { id, nome, descricao, preco, quantidade, marca, categoria, fornecedor } = req.body;

            if(!id || !nome?.trim() || !descricao?.trim() || !preco || !quantidade || !marca?.trim() || !categoria || !fornecedor) {
                return res.send({ ok: false, msg: 'Preencha os dados corretamente!' });
            }

            if (nome.trim().length > 45) {
                return res.send({ ok: false, msg: 'O nome do produto deve ter no máximo 45 caracteres!' });
            }
            if (marca.trim().length > 30) {
                return res.send({ ok: false, msg: 'A marca deve ter no máximo 30 caracteres!' });
            }
            if (descricao.trim().length > 200) {
                return res.send({ ok: false, msg: 'A descrição deve ter no máximo 200 caracteres!' });
            }

            const precoNum = parseFloat(preco);
            const qtdNum = parseInt(quantidade, 10);

            if (isNaN(precoNum) || precoNum <= 0) {
                return res.send({ ok: false, msg: 'O preço deve ser maior que zero!' });
            }
            if (isNaN(qtdNum) || qtdNum <= 0) {
                return res.send({ ok: false, msg: 'A quantidade deve ser maior que zero!' });
            }

            let produto = new ProdutoModel(id, nome, descricao, null, precoNum, qtdNum, categoria, fornecedor, marca, null);
            let produtoOld = await produto.Get(id);

            if (!produtoOld) {
                return res.status(404).send({ ok: false, msg: 'Produto não encontrado!' });
            }

            if(req.file != null){
                const path = require('path');
                const pastaImg = path.resolve(__dirname, '..', 'public', 'img', 'produtos');
                produto.img = req.file.filename;

                if (produtoOld.img) {
                    const nomeArquivoAnterior = path.basename(produtoOld.img);
                    const imagensProtegidas = ['barra-de-imagem.png', 'imagem.png'];
                    const caminhoAnteriorAbs = path.join(pastaImg, nomeArquivoAnterior);

                    if (!imagensProtegidas.includes(nomeArquivoAnterior) && caminhoAnteriorAbs.startsWith(pastaImg) && fs.existsSync(caminhoAnteriorAbs)) {
                        fs.unlinkSync(caminhoAnteriorAbs);
                    }
                }
            }

            let result = await produto.Update();

            if (result) {
                return res.send({ ok: true, msg: 'Produto alterado com sucesso!' });
            }

            return res.send({ ok: false, msg: 'Erro ao alterar o produto!' });
        } catch (error) {
            console.error('Erro ao alterar o produto:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao alterar o produto!' });
        }
    }
}

module.exports = ProdutoController;