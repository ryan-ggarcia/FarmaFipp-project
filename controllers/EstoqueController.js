const EstoqueModel = require('../models/EstoqueModel');
const LoteModel = require('../models/LoteModel');
const ItemVendaModel = require('../models/ItemVendaModel');
const VendaModel = require('../models/VendaModel');
class EstoqueController {
    async gerenciarEstoqueView(req, res) {
        try{
            const Estoque = new EstoqueModel();
            const estoqueList = await Estoque.ListInventory();
            res.render('estoque/gerenciar', { estoqueList: estoqueList || [] });
        } 
        catch (error) {
            console.error('Erro ao carregar view de gerenciamento de estoque:', error);
            res.status(500).send({ ok: false, msg: 'Erro ao carregar página de gerenciamento de estoque!' });
        }
    }
}

module.exports = EstoqueController;