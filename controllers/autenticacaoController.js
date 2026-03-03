class AutenticacaoController 
{
    autenticar(req,res)
    {
        res.render('autenticar');
    }
    cadastro (req,res)
    {
        res.render('cadastro');
    } 

    login (req,res)
    {
        res.render('login');
    }
}
module.exports = AutenticacaoController; 


