const express = require('express');
const VendaController = require('../controllers/VendaController');
const middleware = require('../middleware/authMiddleware');

const router = express.Router();
const controller = new VendaController();

router.post('/confirmar', controller.RegistrarVenda);
router.get("/", middleware.validarAdmin, controller.VendasView)
router.get('/listar', middleware.validarAdmin, controller.ListarVendas)


module.exports = router;
