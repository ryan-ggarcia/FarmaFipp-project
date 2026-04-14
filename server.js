//CommonJS
const express = require('express');
const homeRouter = require("./routes/HomeRouter");
const usuarioRouter = require("./routes/UsuarioRouter")
const ServicoRouter = require ('./routes/ServicoRouter');
const ClienteRouter = require('./routes/ClienteRoute');

const expressEjsLayouts = require('express-ejs-layouts');

const server = express();
server.set('view engine', 'ejs');
server.use(expressEjsLayouts);
// set default layout to views/layout.ejs
server.set('layout', "layout");
server.use(express.static("public"));
server.use(express.urlencoded({extended:true}));
server.use(express.json());
server.use("/", homeRouter);
server.use("/usuarioView",usuarioRouter)
server.use("/servicos", ServicoRouter);
server.use("/clientes", ClienteRouter);


    


server.listen(5000, function(){
    console.log("Servidor Iniciado.");
});
