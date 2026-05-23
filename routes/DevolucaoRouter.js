const express = require("express");
const DevolucaoController = require("../controllers/DevolucaoController");

const router = express.Router();

let controladora = new DevolucaoController();

// Rotas internas (funcionário)
router.get("/", controladora.listarView);
router.get("/presencial", controladora.cadastrarPresencialView);
router.post("/presencial", controladora.cadastrarPresencial);
router.get("/detalhes/:id", controladora.detalhesView);
router.post("/status", controladora.atualizarStatus);
router.post("/deletar", controladora.deletar);

// Rotas públicas (cliente)
router.get("/online", controladora.solicitarOnlineView);
router.post("/online", controladora.solicitarOnline);

module.exports = router;
