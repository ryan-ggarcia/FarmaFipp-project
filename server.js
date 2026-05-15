//CommonJS
require('dotenv').config()
const express = require('express');
const cookieParser = require("cookie-parser");
const expressEjsLayouts = require('express-ejs-layouts');

// Rotas públicas
const usuarioRouter = require("./routes/UsuarioRouter");
const loginRouter = require('./routes/loginRouter');

// Rotas admin
const homeRouter = require("./routes/HomeRouter");
const ServicoRouter = require('./routes/ServicoRouter');
const ClienteRouter = require('./routes/ClienteRoute');
const FornecedorRouter = require('./routes/FornecedorRoute');
const ProdutoRouter = require('./routes/ProdutoRouter');
const EstoqueRouter = require('./routes/EstoqueRoute');
const FuncionarioRouter = require('./routes/FuncionarioRoute');
const DevolucaoRouter = require('./routes/DevolucaoRouter');

// API
const VendaRouter = require('./routes/VendaRouter');

const server = express();

server.set('view engine', 'ejs');
server.use(cookieParser());
server.use(expressEjsLayouts);
server.set('layout', "layout");
server.use(express.static(__dirname + "/public"));
server.use(express.urlencoded({extended:true}));
server.use(express.json());

// ==============================
// ROTAS PÚBLICAS (layoutPublico)
// ==============================
server.use("/", usuarioRouter);
server.use("/login", loginRouter);

// ==============================
// ROTAS ADMIN (layout admin)
// ==============================
server.use("/admin", homeRouter);
server.use("/admin/produtos", ProdutoRouter);
server.use("/admin/servicos", ServicoRouter);
server.use("/admin/clientes", ClienteRouter);
server.use("/admin/fornecedores", FornecedorRouter);
server.use("/admin/funcionarios", FuncionarioRouter);
server.use("/admin/estoque", EstoqueRouter);
server.use("/admin/pos-venda", DevolucaoRouter);

// ==============================
// API
// ==============================
server.use("/venda", VendaRouter);

global.CAMINHO_IMG_ABS = __dirname + "/public/img/produtos/";  
global.CAMINHO_IMG_NAVEGADOR = "/img/produtos/";  


server.listen(process.env.PORT || 5000, function(){
    console.log("Servidor Iniciado.");
});
