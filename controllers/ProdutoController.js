const FornecedorModel = require('../models/FornecedorModel')
const ProdutoModel = require('../models/ProdutoModel')
const LoteModel = require('../models/LoteModel')
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
            res.render('produtos/listar', { lista, categoria, lote });
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
            res.render('produtos/cadastrar', { categorias: listaCategoria, fornecedores: listaFornecedor });
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
                listaFornecedores: fornecedores
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

                res.send({ ok: true, produto: {
                    id: produto.id,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    quantidade: produto.quantidade,
                    img: produto.img
                }});
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

        const precoNum = parseFloat(preco);
        const qtdNum = parseInt(quantidade, 10);

        if (isNaN(precoNum) || precoNum <= 0) {
            return res.send({ ok: false, msg: 'O preço deve ser maior que zero!' });
        }
        if (isNaN(qtdNum) || qtdNum <= 0) {
            return res.send({ ok: false, msg: 'A quantidade deve ser maior que zero!' });
        }

        let produto = new ProdutoModel(null, nome, descricao, null, precoNum, qtdNum, categoria, fornecedor, marca, null, img);
        try {
            let result = await produto.Create();
            if (result) {
                return res.send({ ok: true, msg: 'Produto cadastrado com sucesso!' });
            } else {
                return res.send({ ok: false, msg: 'Erro ao cadastrar o produto!' });
            }
        } catch (error) {
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
                const caminhoImgAbs = global.CAMINHO_IMG_ABS || 'public/img/produtos/';
                produto.img = req.file.filename;

                const nomeArquivoAnterior = (produtoOld.img || '').split('/').pop();
                if(nomeArquivoAnterior && fs.existsSync(caminhoImgAbs + nomeArquivoAnterior)){
                    fs.unlinkSync(caminhoImgAbs + nomeArquivoAnterior);
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