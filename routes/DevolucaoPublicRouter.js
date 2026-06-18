const express = require("express");
const DevolucaoController = require("../controllers/DevolucaoController");

const router = express.Router();
let controladora = new DevolucaoController();

router.get("/online", controladora.solicitarOnlineView);
router.post("/online", controladora.solicitarOnline);

module.exports = router;
