const HomeController = require("../controllers/HomeController");
const express = require('express');

let controladora = new HomeController();
const router = express.Router();
router.get("/", controladora.home);
module.exports = router;