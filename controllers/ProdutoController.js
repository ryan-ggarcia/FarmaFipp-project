const FornecedorModel = require('../models/FornecedorModel')
const ProdutoModel = require('../models/ProdutoModel')
class ProdutoController {

    async cadastrarView(req,res){
        let fornecedor = new FornecedorModel();
        let listaFornecedor = await fornecedor.List();
        let produto = new ProdutoModel();
        let listaCategoria = await produto.ListCategorias();
        res.render('produtos/cadastrar', {categorias: listaCategoria, fornecedores: listaFornecedor});
    }

    async cadastrar(req,res){
        const {nome, descricao, validade, preco, quantidade, marca, categoria, fornecedor} = req.body;
        const img = req.file.filename;
        if(nome == '' || descricao == '' || validade == '' || preco == '' || quantidade == '' || marca == '' || categoria == '' || fornecedor == '' || img == ''){
            return res.send({ok:false, msg: 'Preencha os dados corretamente!'});
        }
        
        if(preco <= 0){
            return res.send({ok:false, msg: 'O preço deve ser maior que zero!'});
        }
        if(quantidade < 0){
            return res.send({ok:false, msg: 'A quantidade não pode ser negativa!'});
        }

        let produto = new ProdutoModel(null, nome, descricao, validade, preco, quantidade, marca, categoria, fornecedor, img);
        try {
            let result = await produto.Create();
            if(result){
                return res.send({ok:true, msg: 'Produto cadastrado com sucesso!'});
            }else{
                return res.send({ok:false, msg: 'Erro ao cadastrar o produto!'});
            }
        } catch (error) {
            console.error('Erro ao cadastrar o produto:', error);
            return res.send({ok:false, msg: 'Erro ao cadastrar o produto!'});
        }
    }
    
}

module.exports = ProdutoController;