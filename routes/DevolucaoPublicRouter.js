const express = require("express");
const DevolucaoController = require("../controllers/DevolucaoController");

const router = express.Router();
let controladora = new DevolucaoController();

// Rotas públicas (cliente)
router.get("/online", controladora.solicitarOnlineView);
router.post("/online", controladora.solicitarOnline);

module.exports = router;
