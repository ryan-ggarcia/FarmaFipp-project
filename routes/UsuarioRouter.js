const UsuarioController = require("../controllers/UsuarioController");
const express = require("express")

let controller = new UsuarioController()
const router = express.Router()

router.get("/", controller.homeView)
router.get("/shop", controller.produtosView)
router.get("/carrinho", controller.carrinhoView)

module.exports = router