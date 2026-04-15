const express = require('express');
const router = express.Router();

const FornecedorController = require('../controllers/FornecedorController');

let ctrl = new FornecedorController();

router.get('/', ctrl.listaView);
router.delete('/delete', ctrl.delete);

module.exports = router;