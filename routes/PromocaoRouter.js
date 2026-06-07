const express = require('express');
const router = express.Router();
const PromocaoController = require('../controllers/PromocaoController');
const ctrl = new PromocaoController();

router.get('/', ctrl.listarView);
router.post('/alterar-desconto', ctrl.alterarDesconto);
router.post('/remover', ctrl.removerPromocao);
router.post('/executar', ctrl.executarPromocaoAutomatica);

module.exports = router;
