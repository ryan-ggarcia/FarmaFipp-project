const express = require ('express');
const CheckoutController = require ('../controllers/checkoutController');

const router = express.Router();

let controller = new CheckoutController;
router.get('/', controller.checkout);

module.exports = router;