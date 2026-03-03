const express = require ('express');
const AutenticacaoController = require ('../controllers/autenticacaoController');

const router = express.Router();

let controller = new AutenticacaoController;
router.get('/', controller.autenticar);
router.get('/cadastro', controller.cadastro);
router.get('/login', controller.login);

module.exports = router;