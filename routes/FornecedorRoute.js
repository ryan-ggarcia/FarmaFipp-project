const express = require('express');
const router = express.Router();

const FornecedorController = require('../controllers/FornecedorController');

let ctrl = new FornecedorController();

router.get('/', ctrl.listaView);
router.delete('/delete', ctrl.delete);
router.get('/cadastrar', ctrl.cadastrarView);
router.post('/cadastrar', ctrl.cadastrar);
router.put('/alterar', ctrl.alterar);
router.get('/alterar/:id', ctrl.alterarView);




module.exports = router;