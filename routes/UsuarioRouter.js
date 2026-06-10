const UsuarioController = require("../controllers/UsuarioController");
const express = require("express")

let controller = new UsuarioController()
const router = express.Router()

router.get("/", controller.homeView)
router.get("/shop", controller.produtosView)
router.get("/servicos", controller.agendarServicoView)
router.post("/servicos/agendar", controller.agendarServico)
router.get("/carrinho", controller.carrinhoView)
router.get("/contato", controller.contatoView)
router.get("/sobre", controller.sobreView)

module.exports = router