const express = require ('express');
const CarrinhoController = require ('../controllers/carrinhoController');

const router = express.Router();

let controller = new CarrinhoController;
router.get('/', controller.carrinho);

module.exports = router;
