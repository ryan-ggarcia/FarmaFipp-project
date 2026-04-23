//CommonJS
const express = require('express');
const homeRouter = require("./routes/HomeRouter");
const usuarioRouter = require("./routes/UsuarioRouter")
const ServicoRouter = require ('./routes/ServicoRouter');
const ClienteRouter = require('./routes/ClienteRoute');
const FornecedorRouter = require('./routes/FornecedorRoute');
const path = require('path');
const expressEjsLayouts = require('express-ejs-layouts');

const server = express();
server.set('view engine', 'ejs');

server.use(expressEjsLayouts);
// set default layout to views/layout.ejs
server.set('layout', "layout");
server.use(express.static("public"));
server.use('/img', express.static(path.join(__dirname, 'img')));
server.use(express.urlencoded({extended:true}));
server.use(express.json());
server.use("/admin", homeRouter);
server.use("/",usuarioRouter)
server.use("/servicos", ServicoRouter);
server.use("/clientes", ClienteRouter);
server.use("/fornecedores", FornecedorRouter);

    


server.listen(5000, function(){
    console.log("Servidor Iniciado.");
});
