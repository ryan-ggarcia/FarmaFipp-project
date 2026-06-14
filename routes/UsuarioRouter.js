const UsuarioController = require("../controllers/UsuarioController");
const express = require("express")

let controller = new UsuarioController()
const router = express.Router()

router.get("/", controller.homeView)
router.get("/shop", controller.produtosView)
router.get("/carrinho", controller.carrinhoView)
router.get("/contato", controller.contatoView)
router.get("/sobre", controller.sobreView)
router.get("/servicos", controller.cadastrarServicoView)
router.get("/servicos/listar", controller.listarServicos)
router.post("/servicos/cadastrar", controller.cadastrarServico)
router.post("/servicos/cancelar/:id", controller.excluirServico)
router.get("/servicos/alterar/:id", controller.alterarView)
router.post("/servicos/alterar/:id", controller.alterarServico)

module.exports = router