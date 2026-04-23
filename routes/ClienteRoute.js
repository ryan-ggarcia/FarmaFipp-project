const express = require('express');
const ClienteController = require('../controllers/ClienteController');

let router = express.Router();

let controller = new ClienteController();

router.get('/cadastrar', controller.cadastrarView);
router.post('/cadastrar', controller.cadastrar);
router.get("/listar", controller.listarView);
router.get("/alterar/:id", controller.alterarView);
router.post("/alterar", controller.alterar);
router.post("/excluir", controller.excluir);

module.exports = router;
