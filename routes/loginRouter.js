const LoginController = require("../controllers/LoginController");
const express = require("express")

let controller =  new LoginController

const router = express.Router()

router.get("/",controller.loginView)
router.get("/cadastro", controller.cadastroView)
router.post("/efetuarLogin", controller.efetuarLogin)

module.exports = router