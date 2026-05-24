const express = require('express');
const VendaController = require('../controllers/VendaController');

const router = express.Router();
const controller = new VendaController();

router.post('/confirmar', controller.RegistrarVenda);
router.get("/", controller.VendasView)
router.get('/listar', controller.ListarVendas)


module.exports = router;
