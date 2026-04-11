//CommonJS
const express = require('express');
const homeRouter = require("./routes/HomeRouter");
const usuarioRouter = require("./routes/UsuarioRouter")
const ServicoRouter = require ('./routes/servicoRouter');

const expressEjsLayouts = require('express-ejs-layouts');

const server = express();
server.set('view engine', 'ejs');

server.use(expressEjsLayouts);
server.set('layout', "layout.");
server.use(express.static("public"));
server.use(express.urlencoded({extended:true}));
server.use(express.json());
server.use("/", homeRouter);
server.use("/usuarioView",usuarioRouter)
server.use("/servicos", ServicoRouter);


    


server.listen(5000, function(){
    console.log("Servidor Iniciado.");
});
