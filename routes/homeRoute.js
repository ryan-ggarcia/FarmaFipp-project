const express = require ('express');
const HomeController = require ('../controllers/homeController');

const router = express.Router();

let controller = new HomeController;
router.get('/', controller.home);
router.get('/faq', controller.faq);
router.get('/contato', controller.contato);

module.exports = router;