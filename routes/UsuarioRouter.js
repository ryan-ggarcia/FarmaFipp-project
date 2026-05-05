const LoginController = require("../controllers/LoginController");
const UsuarioController = require("../controllers/UsuarioController");
const AuthMiddleware = require('../middleware/authMiddleware');
const express = require("express")

let controller = new UsuarioController()
let loginController = new LoginController()
const router = express.Router()

router.get("/", controller.homeView)
router.get("/shop",controller.produtosView)
router.get("/login",loginController.loginView)
router.get("/carrinho", controller.carrinhoView)

module.exports = router