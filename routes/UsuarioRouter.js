const UsuarioController = require("../controllers/UsuarioController")
const express = require("express")

let controller = new UsuarioController()
const router = express.Router()

router.get("/home", controller.homeView)
router.get("/produtos",controller.produtosView)

module.exports = router