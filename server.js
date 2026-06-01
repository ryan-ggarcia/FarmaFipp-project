//CommonJS
require('dotenv').config()
const express = require('express');
const cookieParser = require("cookie-parser");
const expressEjsLayouts = require('express-ejs-layouts');

// Rotas admin
const homeRouter = require("./routes/HomeRouter");
const ServicoRouter = require('./routes/ServicoRouter');
const ClienteRouter = require('./routes/ClienteRoute');
const FornecedorRouter = require('./routes/FornecedorRoute');
const ProdutoRouter = require('./routes/ProdutoRouter');
const EstoqueRouter = require('./routes/EstoqueRoute');
const FuncionarioRouter = require('./routes/FuncionarioRoute');
const DevolucaoRouter = require('./routes/DevolucaoRouter');


// Rotas públicas e cliente
const usuarioRouter = require("./routes/UsuarioRouter");
const loginRouter = require('./routes/loginRouter');
const ProdutoPublicRouter = require('./routes/ProdutoPublicRouter');
const PerfilRoute = require('./routes/PerfilRoute');
const DevolucaoPublicRouter = require('./routes/DevolucaoPublicRouter');

// API
const VendaRouter = require('./routes/VendaRouter');

const server = express();
const middleware = require('./middleware/authMiddleware');

server.set('view engine', 'ejs');
server.use(cookieParser());
server.use(expressEjsLayouts);
server.set('layout', "layout");
server.use(express.static(__dirname + "/public"));
server.use(express.urlencoded({extended:true}));
server.use(express.json());

// ==============================
// ROTAS LIVRES (sem login)
// ==============================
server.use("/login", loginRouter);

server.get("/logout", function (req, res) {
    res.clearCookie("usuarioLogado");
    res.redirect("/login");
});

// ==============================
// ROTAS ADMIN (layout admin)
// ==============================
server.use("/admin/produtos", middleware.validarAdmin, ProdutoRouter);
server.use("/admin/servicos", middleware.validarAdmin, ServicoRouter);
server.use("/admin/clientes", middleware.validarAdmin, ClienteRouter);
server.use("/admin/fornecedores", middleware.validarAdmin, FornecedorRouter);
server.use("/admin/funcionarios", middleware.validarAdmin, FuncionarioRouter);
server.use("/admin/estoque", middleware.validarAdmin, EstoqueRouter);
server.use("/admin/pos-venda", middleware.validarAdmin, DevolucaoRouter);
server.use("/admin", middleware.validarAdmin, homeRouter);

// ==============================
// ROTAS CLIENTE / PÚBLICAS LOGADAS
// ==============================
server.use("/perfil", middleware.validarCliente, PerfilRoute);
server.use("/produtos", middleware.validarCliente, ProdutoPublicRouter);
server.use("/pos-venda", middleware.validarCliente, DevolucaoPublicRouter);
server.use("/", middleware.validarCliente, usuarioRouter);

// ==============================
// API
// ==============================
server.use("/venda", VendaRouter);

global.CAMINHO_IMG_ABS = __dirname + "/public/img/produtos/";  
global.CAMINHO_IMG_NAVEGADOR = "/img/produtos/";  


server.listen(process.env.PORT || 5000, function(){
    console.log("Servidor Iniciado.");
});
