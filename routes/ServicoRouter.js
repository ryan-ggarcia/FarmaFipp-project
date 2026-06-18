const express = require("express");
const ServicoController = require("../controllers/ServicoController");

const router = express.Router();

let controladora = new ServicoController();
router.get("/", controladora.listarView);
router.get("/cadastrar", controladora.cadastrarView);
router.post("/cadastrar", controladora.cadastrar);
router.post("/alterar", controladora.alterar);
router.post("/aceitar", controladora.aceitar);
router.post("/cancelar", controladora.cancelar);
router.post("/deletar", controladora.deletar);


router.get("/alterar/:idAlteracao", controladora.alterarView);


module.exports = router;