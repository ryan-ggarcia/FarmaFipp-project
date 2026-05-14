const express = require('express');
const EstoqueController = require('../controllers/EstoqueController');

const router = express.Router();

const ctrl = new EstoqueController();

router.get('/gerenciar', ctrl.gerenciarEstoqueView);


module.exports = router;