const express = require('express');
const EstoqueController = require('../controllers/EstoqueController');

const router = express.Router();

const ctrl = new EstoqueController();

router.get('/', ctrl.redirecionarGerenciar);
router.get('/gerenciar', ctrl.gerenciarEstoqueView);
router.get('/adicionar', ctrl.adicionarView);
router.post('/adicionar', ctrl.adicionar);
router.get('/baixa', ctrl.baixaView);
router.post('/baixa', ctrl.baixa);

module.exports = router;