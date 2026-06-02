
const express = require('express');
const router = express.Router();
const PerfilController = require("../controllers/PerfileController");

let ctrl = new PerfilController();

router.get("/", ctrl.perfileView);
router.get("/servicos", (req, res) => res.redirect("/servicos/listar"));
router.get("/editar", ctrl.editarView);
router.post("/editar", ctrl.alterar);
router.post("/excluir", ctrl.excluir);

module.exports = router;