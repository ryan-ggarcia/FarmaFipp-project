const express = require ('express');
const ProdutoController = require ('../controllers/produtoController');

const router = express.Router();

let controller = new ProdutoController;
router.get('/', controller.produto);
router.get('/pagina_produto', controller.pagina_produto);
router.get('/lista_produtos', controller.lista_produtos);



module.exports = router;