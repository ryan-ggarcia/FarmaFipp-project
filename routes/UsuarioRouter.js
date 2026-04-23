const LoginController = require("../controllers/LoginController");
const UsuarioController = require("../controllers/UsuarioController");
const express = require("express")

let controller = new UsuarioController()
let loginController = new LoginController()
const router = express.Router()

router.get("/", controller.homeView)
router.get("/produtos",controller.produtosView)
router.get("/login",loginController.loginView)

module.exports = router