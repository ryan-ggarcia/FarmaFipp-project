const LoginController = require("../controllers/LoginController");
const UsuarioController = require("../controllers/UsuarioController");
const AuthMiddleware = require('../middleware/authMiddleware');
const express = require("express")

let controller = new UsuarioController()
let loginController = new LoginController()
const router = express.Router()

let auth = new AuthMiddleware()

router.get("/",  controller.homeView)
router.get("/produtos",  controller.produtosView)

module.exports = router