//CommonJS
require('dotenv').config()
const express = require('express');
const cookieParser = require("cookie-parser");
const expressEjsLayouts = require('express-ejs-layouts');

// Rotas públicas
const usuarioRouter = require("./routes/UsuarioRouter");
const loginRouter = require('./routes/loginRouter');
const ProdutoPublicRouter = require('./routes/ProdutoPublicRouter');

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
server.use("/", homeRouter);
server.use("/usuario",usuarioRouter)
server.use("/servicos", ServicoRouter);
server.use("/clientes", ClienteRouter);
server.use("/fornecedores", FornecedorRouter);
server.use("/produtos", ProdutoRouter);
server.use("/estoque", EstoqueRouter);
server.use('/venda', VendaRouter);
server.use('/vendas', VendaRouter);

global.CAMINHO_IMG_ABS = __dirname + "/public/img/produtos/";  
global.CAMINHO_IMG_NAVEGADOR = "/img/produtos/";  


server.listen(process.env.PORT || 5000, function(){
    console.log("Servidor Iniciado.");
});
