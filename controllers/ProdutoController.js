const FornecedorModel = require('../models/FornecedorModel')
const ProdutoModel = require('../models/ProdutoModel')
const LoteModel = require('../models/LoteModel')

class ProdutoController {
    async listar(req, res) {
        try {
            let listaPro = new ProdutoModel()
            let lista = await listaPro.Read()
            let categoria = new ProdutoModel()
            categoria = await categoria.ListCategorias()
            res.render('produtos/listar', { lista, categoria })
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
        if (isNaN(qtdNum) || qtdNum < 0) {
            return res.send({ ok: false, msg: 'A quantidade não pode ser negativa!' });
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
        const { id } = req.params;
        if (!id) {
            return res.send({ ok: false, msg: 'ID do produto não informado!' });
        }
        try {
            let produto = new ProdutoModel();
            let result = await produto.Delete(id);
            if (result) {
                return res.send({ ok: true, msg: 'Produto excluído com sucesso!' });
            } else {
                return res.send({ ok: false, msg: 'Erro ao excluir o produto!' });
            }
        } catch (error) {
            console.error('Erro ao excluir o produto:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao excluir o produto!' });
        }
    }
}

module.exports = ProdutoController;