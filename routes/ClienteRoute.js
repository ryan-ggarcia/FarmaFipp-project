const express = require('express');
const ClienteController = require('../controllers/ClienteController');

let router = express.Router();

let controller = new ClienteController();

router.get('/cadastrar', controller.cadastrarView);
router.post('/cadastrar', controller.cadastrar);

module.exports = router;