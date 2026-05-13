const SobreController = require("../controllers/SobreController");
const express = require('express');

let controladora = new SobreController();
const router = express.Router();
router.get("/", controladora.home);
module.exports = router;