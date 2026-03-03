class ProdutoController
{
    produto(req,res)
    {
        res.render('produtos');
    }
    lista_produtos(req,res)
    {
        res.render('lista_produtos');
    }

    pagina_produto(req,res)
    {
        res.render('pagina_produto');
    }
}
module.exports = ProdutoController;