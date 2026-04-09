const ServicoModel = require('../models/ServicoModel');

class HomeController {

    async home(req, res) {
        try {
            const servicoModel = new ServicoModel();
            const servicos = await servicoModel.listar();
            res.render('home', { servicos, active: 'dashboard' });
        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
            res.render('home', { servicos: [], active: 'dashboard' });
        }
    }
}
module.exports = HomeController;