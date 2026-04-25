const FornecedorModel = require('../models/FornecedorModel')
const ProdutoModel = require('../models/ProdutoModel')
class ProdutoController {
    async listar(req,res){
        let listaPro = new ProdutoModel()
        let lista = await listaPro.Read()
        let categoria = new ProdutoModel()
        categoria = await categoria.ListCategorias()
        res.render('produtos/listar', {lista,categoria})
    }
    async cadastrarView(req,res){
        let fornecedor = new FornecedorModel();
        let listaFornecedor = await fornecedor.List();
        let produto = new ProdutoModel();
        let listaCategoria = await produto.ListCategorias();
        res.render('produtos/cadastrar', {categorias: listaCategoria, fornecedores: listaFornecedor});
    }

    async cadastrar(req,res){
        const {nome, descricao, validade, preco, quantidade, marca, lote, categoria, fornecedor} = req.body;
        const img = req.file.filename;
        if(nome == '' || descricao == '' || validade == '' || preco == '' || quantidade == '' || marca == '' || lote == '' || categoria == '' || fornecedor == '' || img == ''){
            return res.send({ok:false, msg: 'Preencha os dados corretamente!'});
        }
        
        if(preco <= 0){
            return res.send({ok:false, msg: 'O preço deve ser maior que zero!'});
        }
        if(quantidade < 0){
            return res.send({ok:false, msg: 'A quantidade não pode ser negativa!'});
        }

        if(validade < new Date().toISOString().split('T')[0]){
            return res.send({ok:false, msg: 'A validade deve ser uma data futura!'});
        }

        let produto = new ProdutoModel(null, nome, descricao, validade, preco, quantidade,  categoria, fornecedor, marca, lote, img);
        try {
            let result = await produto.Create();
            if(result){
                return res.send({ok:true, msg: 'Produto cadastrado com sucesso!'});
            }else{
                return res.send({ok:false, msg: 'Erro ao cadastrar o produto!'});
            }
        } catch (error) {
            console.error('Erro ao cadastrar o produto:', error);
            return res.status(500).send({ok:false, msg: 'Erro interno ao cadastrar o produto!'}) ;
        }
    }
    
    async AddView(req, res) {
        res.render('produtos/adicionar', { id: req.params.id });
    }

    async AddNewLot(req, res) {
        const { id } = req.params;
        const { lote, validade, quantidade } = req.body;
        if (lote == '' || validade == '' || quantidade == '') {
            return res.send({ ok: false, msg: 'Preencha os dados corretamente!' });
        }
        if (quantidade < 0) {
            return res.send({ ok: false, msg: 'A quantidade não pode ser negativa!' });
        }
        if (validade < new Date().toISOString().split('T')[0]) {
            return res.send({ ok: false, msg: 'A validade deve ser uma data futura!' });
        }
        
        let produto = new ProdutoModel(0, null, null, validade, null, quantidade, null, null, null, lote, null);
        try {
            let result = await produto.AddNewLot(id);
            if (result) {
                return res.send({ ok: true, msg: 'Lote adicionado com sucesso!' });
            } else {
                return res.send({ ok: false, msg: 'Erro ao adicionar o lote!' });
            }
        } catch (error) {
            console.error('Erro ao adicionar o lote:', error);
            return res.status(500).send({ ok: false, msg: 'Erro interno ao adicionar o lote!' });
        }
    }
}

module.exports = ProdutoController;