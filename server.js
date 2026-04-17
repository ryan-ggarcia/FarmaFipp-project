//CommonJS
require('dotenv').config()
const express = require('express');
const homeRouter = require("./routes/HomeRouter");
// const autenticacaoRouter = require ('./routes/autenticacaoRoute');
// const carrinhoRouter = require ('./routes/carrinhoRoute');
// const checkoutRouter = require ('./routes/checkoutRoute');
// const produtoRouter = require ('./routes/produtoRoute');
const ServicoRouter = require('./routes/ServicoRouter');
const ClienteRouter = require('./routes/ClienteRoute')

const expressEjsLayouts = require('express-ejs-layouts');

const server = express();
server.set('view engine', 'ejs');

server.use(expressEjsLayouts);
server.set('layout', "./layout.ejs");
server.use(express.static("public"));
server.use(express.urlencoded({extended:true}));
server.use(express.json());
server.use("/", homeRouter);
// server.use("/cadastro", autenticacaoRouter);
// server.use("/carrinho", carrinhoRouter);
// server.use("/checkout", checkoutRouter);
// server.use("/contato",homeRouter);
// server.use("/faq", homeRouter);
// server.use("lista_produtos", produtoRouter);
// server.use("/login", autenticacaoRouter);
// server.use("/pagina_produto", produtoRouter);
// server.use("/produtos", produtoRouter);
// server.use("/autenticar", autenticacaoRouter);
server.use("/servicos", ServicoRouter);
server.use("/clientes", ClienteRouter);


    


server.listen(process.env.PORT || 5000, function(){
    console.log("Servidor Iniciado.");
});
