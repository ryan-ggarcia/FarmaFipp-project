class HomeController
{
    home(req,res)
    {
        res.render('home');
    }

    faq(req,res)
    {
        res.render('faq');
    }

    contato(req,res)
    {
        res.render('contato');
    }
}

module.exports = HomeController;