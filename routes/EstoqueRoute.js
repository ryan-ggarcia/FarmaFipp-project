const express = require('express');
const EstoqueController = require('../controllers/EstoqueController');

const router = express.Router();

const ctrl = new EstoqueController();

router.get('/gerenciar', ctrl.gerenciarEstoqueView);
router.get('/adicionar', ctrl.adicionarEstoqueView);
router.post('/adicionar', ctrl.AdicionarEstoque);
router.post('/remover', ctrl.RemoverEstoque);

module.exports = router;