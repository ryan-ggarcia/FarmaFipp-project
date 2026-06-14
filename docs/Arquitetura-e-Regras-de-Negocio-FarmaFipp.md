# FarmaFipp - Ferramentas, Arquitetura, Operacoes e Regras de Negocio

## 1. Ferramentas e Tecnologias Utilizadas

### Backend
- Node.js
- Express 5 (roteamento e camada HTTP)
- CommonJS (modulos com require/module.exports)
- dotenv (configuracao por variaveis de ambiente)
- cookie-parser (leitura de cookie de sessao)
- bcrypt (hash e validacao de senha)
- mysql2 (acesso ao banco MySQL com pool de conexoes)

### Frontend
- EJS (renderizacao server-side)
- express-ejs-layouts (layout padrao e reaproveitamento de templates)
- Bootstrap 5 (estilizacao e componentes)
- JavaScript no cliente (fetch, validacoes, interacoes)
- SheetJS/XLSX via CDN (exportacao de relatorio de vendas em Excel)

### Qualidade e Suporte
- Jest (estrutura de testes automatizados)
- multer + file-type (upload e validacao de tipo de arquivo)
- cpf-cnpj-validator e @brazilian-utils/brazilian-utils (validacoes de dados brasileiros)

## 2. Arquitetura do Projeto

O sistema segue arquitetura em camadas no padrao MVC com renderizacao no servidor:

- routes/: define endpoints e delega para controllers.
- controllers/: aplica validacoes, regras de negocio e orquestra os models.
- models/: executa SQL, encapsula entidades e persistencia.
- views/: telas EJS (admin e publico).
- public/: assets estaticos (CSS, JS, imagens).
- middleware/: autenticacao/autorizacao por perfil.
- utils/database.js: infraestrutura de acesso ao banco.

### Fluxo tecnico de uma requisicao
1. Usuario aciona uma rota (formulario/tela/fetch).
2. Router direciona para o controller correspondente.
3. Controller valida dados e regras.
4. Model executa SQL no MySQL.
5. Controller retorna JSON (API) ou renderiza EJS (view).

## 3. Estrutura de Acesso e Perfis

O projeto segmenta rotas por contexto:

- Rotas livres: /login e /logout.
- Rotas admin: /admin/* com validacao de perfil.
- Rotas cliente/publicas logadas: /perfil, /produtos, /pos-venda e / (usuario).
- API de vendas: /venda.

No middleware de autenticacao, o acesso e controlado por cookie usuarioLogado e por perfil/status do usuario.

## 4. Operacoes Basicas e Fundamentais

## 4.1 Cadastros e manutencao (CRUD)
- Clientes: cadastro, listagem, alteracao e exclusao.
- Funcionarios: cadastro, listagem, alteracao e exclusao.
- Fornecedores: cadastro, alteracao, mudanca de status e exclusao.
- Produtos: cadastro com imagem, alteracao, exclusao, listagem e consulta por ID.
- Lotes/estoque: entrada e baixa de estoque.
- Servicos: cadastro/listagem/alteracao/exclusao no admin.

## 4.2 Operacoes de autenticacao e conta
- Login com verificacao de senha com bcrypt.
- Cadastro publico de cliente com validacao de CPF e hash de senha.
- Edicao de perfil do cliente autenticado.

## 4.3 Operacoes fundamentais de negocio
- Checkout e registro de venda.
- Baixa automatica de estoque na venda.
- Movimentacao de estoque do tipo SAIDA vinculada a VENDA.
- Fluxo de pos-venda (devolucao/troca presencial e solicitacao online).
- Solicitacoes de servico do cliente com aprovacao/reprovacao administrativa.

## 4.4 Operacao de saida: Relatorio de vendas

O sistema possui uma saida operacional de vendas na tela de pedidos:

- View: views/vendas/index.ejs
- Endpoint: GET /venda/listar
- Fonte: join entre venda_teste, venda_item_teste e produto
- Filtros: por numero do pedido (id) ou nome de produto
- Colunas exibidas: ID do pedido, valor do pedido, produto, quantidade, valor unitario e valor total do item
- Exportacao: botao "Exportar para Excel" gera vendas.xlsx (SheetJS)

Esse fluxo atende a necessidade de acompanhamento operacional e exportacao de dados de venda para analise externa.

## 5. Regras de Negocio Implementadas

## 5.1 Cliente e cadastro
- CPF obrigatorio e validado.
- Email e CPF com checagem de duplicidade.
- Senha sempre persistida com hash (bcrypt).
- Dados de endereco exigidos no cadastro de cliente.

## 5.2 Produtos e vitrine
- Na vitrine do cliente, apenas produtos com lote e quantidade > 0 sao exibidos.
- Produtos promocionais sao destacados no fluxo publico.

## 5.3 Vendas e estoque
- Nao permite registrar venda sem itens.
- Nao permite quantidade invalida (<= 0) por item.
- Nao permite venda de produto inexistente.
- Nao permite venda com estoque insuficiente.
- Total da venda e recalculado no backend pela soma dos itens processados.
- Venda inicia como PENDENTE e finaliza como PAGO apos gravacao dos itens.
- Cada item vendido gera baixa de estoque e registro de movimentacao de saida.

## 5.4 Servicos
- Solicitacao de servico do cliente nasce como Aguardando Aprovacao.
- Solicitacao so pode ser para data/hora futuras validas.
- Admin/funcionario pode aprovar (Aprovado) ou recusar (Recusado) solicitacoes.
- Operacao de cancelamento marca servico como Inativo no banco.

## 5.5 Pos-venda (devolucoes)
- Campos obrigatorios para registrar solicitacao/devolucao.
- Regra de prazo: maximo de 30 dias da data de compra.
- Bloqueio de data de compra futura.
- Fluxo presencial inicia com status Aprovado.
- Fluxo online inicia com status Aguardando.
- Status validos no processo: Aprovado, Aguardando, Nao Aprovado.

## 6. Resumo Arquitetural

A construcao do FarmaFipp combina:
- MVC no backend (routes/controllers/models).
- SSR com EJS para telas administrativas e de cliente.
- MySQL como persistencia central.
- Regras de negocio aplicadas principalmente na camada de controllers.
- Saidas operacionais por listagens e exportacao em Excel (relatorio de vendas).

Esse desenho permite manutencao incremental por modulo de negocio e facilita evolucoes futuras sem romper a estrutura principal do sistema.
