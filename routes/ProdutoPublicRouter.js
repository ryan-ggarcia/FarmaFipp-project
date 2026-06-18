const express = require('express');
const ProdutoController = require('../controllers/ProdutoController');

const router = express.Router();
const ctrl = new ProdutoController();

router.get('/obter/:produtoId', ctrl.obterProduto);

module.exports = router;
