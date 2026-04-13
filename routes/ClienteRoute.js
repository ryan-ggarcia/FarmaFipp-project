const express = require('express');
const ClienteController = require('../controllers/ClienteController');

let router = express.Router();

let controller = new ClienteController();

router.get('/cadastrar', controller.cadastrarView);
router.post('/cadastrar', controller.cadastrar);
router.get("/listar", controller.listarView);
router.post("/excluir", controller.excluir);

module.exports = router;