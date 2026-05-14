const express = require('express');
const EstoqueController = require('../controllers/EstoqueController');

const router = express.Router();

const ctrl = new EstoqueController();

router.get('/gerenciar', ctrl.gerenciarEstoqueView);
<<<<<<< HEAD

=======
router.get('/adicionar', ctrl.adicionarEstoqueView);
router.post('/adicionar', ctrl.AdicionarEstoque);
router.post('/remover', ctrl.RemoverEstoque);
>>>>>>> f31fb4a3ea8a5df154bd6d5798911749802a4ac2

module.exports = router;