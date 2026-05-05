const express = require("express");
const FuncionarioController = require("../controllers/FuncionarioController");
let router = express.Router();

let controller = new FuncionarioController();

router.get("/cadastrar", controller.cadastrarView);
router.post("/cadastrar", controller.cadastrar);
router.get("/listar", controller.listarView);
router.get("/alterar/:id", controller.alterarView);
router.post("/alterar", controller.alterar);
router.post("/excluir", controller.excluir);


module.exports = router;