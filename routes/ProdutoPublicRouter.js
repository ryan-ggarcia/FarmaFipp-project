/**
 * Router público para API de produtos (usado pelo front-end do carrinho)
 * Expõe apenas a rota GET /obter/:produtoId — sem rotas de admin.
 */
const express = require('express');
const ProdutoController = require('../controllers/ProdutoController');

const router = express.Router();
const ctrl = new ProdutoController();

router.get('/obter/:produtoId', ctrl.obterProduto);

module.exports = router;
