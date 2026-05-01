# 📦 Documentação — Módulo Fornecedor (FarmaFipp)

> **Projeto:** FarmaFipp  
> **Data:** 15/04/2026  
> **Módulo:** Gerenciamento de Fornecedores (CRUD)  
> **Stack:** Node.js · Express · EJS · MySQL · AdminLTE

---

## 📐 Arquitetura do Módulo

O módulo de fornecedores segue o padrão **MVC (Model-View-Controller)** e se comunica entre o frontend e o backend usando a **Fetch API** com JSON.

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                │
│                                                      │
│  cadastrar.ejs ──► cadastrar.js ──► fetch('/cadastrar')
│  listar.ejs    ──► listar.js    ──► fetch('/delete')  
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (JSON)
                       ▼
┌──────────────────────────────────────────────────────┐
│                     BACKEND (Express)                 │
│                                                       │
│  server.js ──► FornecedorRoute.js ──► FornecedorController.js
│                                            │
│                                    FornecedorModel.js
│                                    EnderecoModel.js
│                                            │
│                                     database.js (MySQL)
└──────────────────────────────────────────────────────┘
```

### Estrutura de Arquivos

| Camada | Arquivo | Responsabilidade |
|--------|---------|------------------|
| **Servidor** | `server.js` | Configuração do Express, middlewares e rotas |
| **Rota** | `routes/FornecedorRoute.js` | Definição dos endpoints HTTP |
| **Controller** | `controllers/FornecedorController.js` | Lógica de negócio e validação |
| **Model** | `models/FornecedorModel.js` | Operações no banco de dados |
| **Model** | `models/EnderecoModel.js` | ⚠️ Deveria ser o model de Endereço |
| **View** | `views/fornecedores/cadastrar.ejs` | Formulário de cadastro |
| **View** | `views/fornecedores/listar.ejs` | Tabela de listagem |
| **Script** | `public/js/fornecedores/cadastrar.js` | Fetch API para cadastro |
| **Script** | `public/js/fornecedores/listar.js` | Fetch API para exclusão |
| **Utilitário** | `utils/database.js` | Pool de conexões MySQL |

---

## 🔄 Fluxo de Dados — Cadastrar Fornecedor

### Como funciona (passo a passo)

```
1. Usuário preenche o formulário em cadastrar.ejs
       ↓
2. Clica no botão "Cadastrar"
       ↓
3. cadastrar.js captura os valores dos inputs
       ↓
4. Validação no frontend (comprimento mínimo dos campos)
       ↓
5. fetch() envia POST para /fornecedores/cadastrar com JSON
       ↓
6. Express recebe a requisição (express.json() faz o parse)
       ↓
7. FornecedorRoute.js direciona para ctrl.cadastrar
       ↓
8. FornecedorController.js valida os dados (CNPJ, CEP, telefone)
       ↓
9. FornecedorModel.Create() insere no banco e retorna o ID
       ↓
10. EnderecoModel.Create() insere o endereço vinculado
       ↓
11. Controller envia resposta JSON { ok: true/false, msg: "..." }
       ↓
12. cadastrar.js recebe a resposta e exibe alert()
```

---

## 🐛 Bugs Encontrados e Correções

### Bug 1 — Erro de Sintaxe no Controller (`x` solto)

**Arquivo:** `controllers/FornecedorController.js`  
**Linha:** 27 (versão original)  
**Status:** ✅ Corrigido

#### O que era
```javascript
async cadastrar(req, res){
    const { nome, telefone, cnpj} = req.body;
    const { rua, numero, bairro, cidade, cep, uf } = req.body;

x   // ← caractere solto que causa SyntaxError

    if(nome != '' && telefone != '' ...
```

#### Por que dava erro
O `x` é tratado como uma variável não declarada. Como não há `let`, `const` ou `var`, o JavaScript tenta interpretar como uma expressão, gerando um `ReferenceError` em tempo de execução. O servidor cai ao processar qualquer POST para `/fornecedores/cadastrar`.

#### Correção
Remover o `x` da linha 27.

#### O que aconteceria se não fosse corrigido
- `ReferenceError: x is not defined` no console do servidor
- O servidor retornaria um erro 500 para todas as requisições de cadastro
- O `fetch()` no frontend receberia HTML de erro ao invés de JSON, causando falha no `.json()`

---

### Bug 2 — Lógica de Validação Invertida

**Arquivo:** `controllers/FornecedorController.js`  
**Linhas:** 29-43 (versão original)  
**Status:** ✅ Corrigido

#### O que era
```javascript
// ❌ ERRADO — rejeita quando os campos ESTÃO preenchidos
if(nome != '' && telefone != '' && status != '' && cnpj != '' ){
    return res.send({ ok: false, msg: "Preencha os dados do fornecedor!" })
}

// ❌ ERRADO — só rejeita se TODOS estão vazios simultaneamente
if(rua == '' && numero == '' && bairro == '' && cidade == '' &&
    cep == '' && uf == ''){
    return res.send({ ok: false, msg: "Preencha os dados do endereço..." })
}
```

#### Por que dava erro
**Primeiro `if`:** A condição `!=` com `&&` significa "se nome NÃO é vazio E telefone NÃO é vazio E...". Ou seja, **quando tudo está preenchido**, o `if` é `true` e retorna erro. É a lógica **contrária** do desejado.

**Segundo `if`:** A condição `==` com `&&` significa "se rua É vazia E numero É vazio E...". Ou seja, **só rejeita se absolutamente todos** os campos estiverem vazios. Se o usuário preencher apenas "rua" e deixar todo o resto vazio, o `if` retorna `false` e aceita dados incompletos.

#### Correção
```javascript
// ✅ CORRETO — rejeita quando QUALQUER campo está vazio
if(nome == '' || telefone == '' || cnpj == '' ){
    return res.send({ ok: false, msg: "Preencha os dados do fornecedor!" })
}

// ✅ CORRETO — rejeita quando QUALQUER campo está vazio
if(rua == '' || numero == '' || bairro == '' || cidade == '' ||
    cep == '' || uf == ''){
    return res.send({ ok: false, msg: "Preencha os dados do endereço..." })
}
```

#### Regra para lembrar

| Objetivo | Operador de comparação | Operador lógico |
|----------|----------------------|-----------------|
| "Todos devem estar preenchidos" (rejeitar se algum vazio) | `== ''` | `\|\|` (OR) |
| "Todos devem estar vazios" (rejeitar se todos vazios) | `== ''` | `&&` (AND) |
| "Nenhum pode estar preenchido" (rejeitar se algum preenchido) | `!= ''` | `\|\|` (OR) |

> [!tip] Dica
> Quando quiser **validar que campos obrigatórios foram preenchidos**, use:
> `if(campo == '' || campo2 == '' || ...)` — "se algum estiver vazio, rejeite"

#### O que aconteceria se não fosse corrigido
- Dados válidos seriam **sempre rejeitados** com a mensagem "Preencha os dados"
- Dados incompletos poderiam ser **aceitos** e causar erros no banco de dados (inserir `NULL` em colunas `NOT NULL`)

---

### Bug 3 — Campo `status` Ausente

**Arquivos:** `views/fornecedores/cadastrar.ejs` e `public/js/fornecedores/cadastrar.js`  
**Status:** ✅ Corrigido (hardcoded como `'ativo'`)

#### O que era
O formulário HTML não possuía nenhum campo `<input>` ou `<select>` para `status`. O JavaScript do frontend também não enviava `status` no `body` do `fetch()`. Porém o controller original fazia:

```javascript
const { nome, telefone, status, cnpj } = req.body;
// status seria undefined
```

#### Correção aplicada
O `status` foi removido do `req.body` e hardcoded como `'ativo'` no controller:

```javascript
const fornecedor = new FornecedorModel(0, nome, formatPhone(telefone), formatCnpj(cnpj), 'ativo');
```

#### Alternativa (se quiser dar a opção ao usuário)
Adicionar um `<select>` no formulário:

```html
<label for="status">Status:</label>
<select id="status" name="status">
    <option value="ativo">Ativo</option>
    <option value="inativo">Inativo</option>
</select>
```

E incluir no `body` do fetch:

```javascript
body: JSON.stringify({
    // ... outros campos
    status: document.querySelector('#status').value
})
```

#### O que aconteceria se não fosse corrigido
- `status` seria `undefined` no banco de dados
- A validação original (`status != ''`) com `undefined` retornaria `true` para `undefined != ''`, mas o dado no banco ficaria inválido
- A listagem mostraria `undefined` na coluna de status

---

### Bug 4 — `List()` Não Retornava Dados

**Arquivo:** `models/FornecedorModel.js`  
**Linhas:** 35-52 (versão original)  
**Status:** ✅ Corrigido

#### O que era
```javascript
async List(){
    const sql = `select * from fornecedor`;
    let database = new Database();
    let rows = await database.ExecutaComando(sql);
    let fornecedores = [];
    rows.forEach(value => {
        value = new FornecedorModel(/* ... */);
        fornecedores.push(value);
    });
    // ❌ Faltava o return!
}
```

#### Por que dava erro
Em JavaScript, uma função `async` sem `return` explícito retorna `Promise<undefined>`. Então:

```javascript
// No controller:
const fornecedores = await fornecedor.List();
// fornecedores === undefined

res.render('fornecedores/listar', { fornecedores: fornecedores });
// Passa undefined para a view
```

Na view, o `fornecedores.forEach(...)` sobre `undefined` gera:
```
TypeError: Cannot read properties of undefined (reading 'forEach')
```

#### Correção
```javascript
async List(){
    // ... mesmo código ...
    return fornecedores; // ← adicionado
}
```

#### O que aconteceria se não fosse corrigido
- A página de listagem **crasharia** com `TypeError`
- O servidor retornaria um erro 500
- Nenhum fornecedor seria exibido na tabela

---

### Bug 5 — Argumentos do Construtor na Ordem Errada

**Arquivo:** `models/FornecedorModel.js`  
**Linhas:** 41-48 (versão original)  
**Status:** ✅ Corrigido

#### O que era
```javascript
// Assinatura do construtor:
constructor(id, nome, telefone, cnpj, status)

// No List(), os argumentos estavam trocados:
value = new FornecedorModel(
    value.idFornecedor,
    value.forn_nome,
    value.forn_telefone,
    value.forn_endereco,   // ← isso ia para cnpj!
    value.forn_status,
    value.forn_cnpj         // ← 6º argumento, ignorado!
);
```

#### Por que dava erro
O JavaScript **não valida** o número de argumentos. O 6º parâmetro (`value.forn_cnpj`) era simplesmente descartado. E `forn_endereco` era atribuído ao campo `cnpj`, gerando dados completamente misturados na view:

| Campo no Objeto | Valor Real Atribuído |
|-----------------|---------------------|
| `this.#cnpj` | `forn_endereco` (endereço!) |
| `this.#status` | `forn_status` (correto, por coincidência) |
| `this.#cnpj` real | perdido (nunca atribuído) |

#### Correção
```javascript
value = new FornecedorModel(
    value.idFornecedor,
    value.forn_nome,
    value.forn_telefone,
    value.forn_cnpj,      // ← agora na posição correta
    value.forn_status
);
```

#### O que aconteceria se não fosse corrigido
- A tabela de listagem exibiria o endereço na coluna de CNPJ
- O CNPJ real nunca apareceria
- Qualquer operação futura baseada no CNPJ (busca, validação) usaria dados errados

---

### Bug 6 — Botão Dentro do `<form>` Sem `type="button"`

**Arquivo:** `views/fornecedores/cadastrar.ejs`  
**Linha:** 53 (versão original)  
**Status:** ✅ Corrigido

#### O que era
```html
<form>
    <!-- inputs... -->
    <button id="cadastrar">Cadastrar</button>
</form>
```

#### Por que dava erro
O tipo padrão de um `<button>` dentro de um `<form>` é `type="submit"`. Ao clicar:

1. O evento de `click` do JavaScript é disparado → o `fetch()` começa a enviar o POST
2. **Imediatamente** o formulário faz o submit HTML padrão (GET para a mesma URL)
3. A página recarrega **antes** do fetch receber a resposta
4. O fetch é **cancelado** pelo navegador

Resultado: o usuário vê a página recarregar sem nenhum feedback (sem alert, sem redirecionamento).

#### Correção
```html
<button type="button" id="cadastrar">Cadastrar</button>
```

Ou, alternativamente, com `preventDefault`:
```javascript
function cadastrar(event){
    event.preventDefault();
    // ... resto do código
}
```

#### O que aconteceria se não fosse corrigido
- O `fetch()` seria **sempre cancelado** pelo submit do formulário
- O cadastro nunca seria efetivado
- O usuário não receberia nenhuma mensagem de sucesso ou erro

> [!important] Regra de Ouro
> Se você vai usar `fetch()` para enviar dados de um formulário, **SEMPRE** use `type="button"` no botão OU `event.preventDefault()` na função. Caso contrário, o formulário HTML e o fetch vão **competir** pelo controle da navegação.

---

### Bug 7 — HTML Completo Dentro de View com Layout

**Arquivo:** `views/fornecedores/cadastrar.ejs` (versão original)  
**Status:** ✅ Corrigido

#### O que era
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <h1>Cadastrar Fornecedor</h1>
    <!-- conteúdo -->
</body>
</html>
<script src="/js/fornecedores/cadastrar.js"></script>
```

#### Por que dava erro
O projeto usa `express-ejs-layouts` com um `layout.ejs`. Isso significa que o conteúdo de cada view é **injetado** dentro do `<%- body %>` do layout:

```html
<!-- layout.ejs (simplificado) -->
<!DOCTYPE html>
<html>
<head>...</head>
<body>
    <!-- header, sidebar -->
    <section>
        <%- body %>  <!-- ← o conteúdo do cadastrar.ejs entra AQUI -->
    </section>
    <!-- scripts jQuery, Bootstrap -->
</body>
</html>
```

Se o `cadastrar.ejs` tem seu próprio `<!DOCTYPE>`, `<html>`, `<head>` e `<body>`, o HTML renderizado fica:

```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
    <section>
        <!DOCTYPE html>   <!-- ❌ DOCTYPE dentro do body! -->
        <html>            <!-- ❌ html dentro do html! -->
        <head>...</head>  <!-- ❌ head dentro do body! -->
        <body>            <!-- ❌ body dentro do body! -->
            <h1>Cadastrar</h1>
        </body>
        </html>
    </section>
</body>
</html>
```

#### Correção
A view deve conter **APENAS** o conteúdo da página, sem estrutura HTML:

```html
<h1>Cadastrar Fornecedor</h1>
<label for="nome">Nome:</label>
<input type="text" id="nome" name="nome" required><br>
<!-- ... mais inputs ... -->
<button type="button" id="cadastrar">Cadastrar</button>
<script src="/js/fornecedores/cadastrar.js"></script>
```

#### O que aconteceria se não fosse corrigido
- O navegador tentaria "corrigir" o HTML inválido, com resultados imprevisíveis
- Scripts poderiam não carregar na ordem correta
- O CSS do AdminLTE/Bootstrap poderia não se aplicar ao conteúdo
- O `<script>` fora do `</html>` poderia não ser executado em alguns navegadores

> [!warning] Atenção
> A `listar.ejs` **ainda tem** esse problema (contém `<!DOCTYPE html>`, `<html>`, etc.). Precisa ser corrigida também.

---

### Bug 8 — `EnderecoModel.js` Contém a Classe Errada

**Arquivo:** `models/EnderecoModel.js`  
**Status:** ❌ Ainda não corrigido

#### O que é
O arquivo `EnderecoModel.js` contém a classe `ClienteModel` (modelo de **cliente**), não um modelo de endereço:

```javascript
// models/EnderecoModel.js
class ClienteModel {      // ← deveria ser EnderecoModel!
    #cliId;
    #cliNome;
    // ... campos de cliente, não de endereço
}
module.exports = ClienteModel;
```

#### Por que dá erro
No `FornecedorController.js`:

```javascript
const EnderecoModel = require("../models/EnderecoModel");
// EnderecoModel é na verdade ClienteModel!

const endereco = new EnderecoModel(0, rua, bairro, cidade, numero, uf, formatCep(cep), resultFornecedor);
// Está passando dados de endereço para um construtor de CLIENTE
// rua → cliNome, bairro → cliStatus, cidade → cliCpf...

const resultEndereco = await endereco.Create();
// Vai executar INSERT INTO cliente(...) com dados de endereço!!!
```

#### O que precisa ser feito
Criar um `EnderecoModel.js` **real** com os campos corretos:

```javascript
const Database = require('../utils/database');

class EnderecoModel {
    #id; #rua; #bairro; #cidade; #numero; #uf; #cep; #fornecedorId;

    constructor(id, rua, bairro, cidade, numero, uf, cep, fornecedorId){
        this.#id = id;
        this.#rua = rua;
        this.#bairro = bairro;
        this.#cidade = cidade;
        this.#numero = numero;
        this.#uf = uf;
        this.#cep = cep;
        this.#fornecedorId = fornecedorId;
    }

    async Create(){
        const sql = `INSERT INTO endereco (end_rua, end_bairro, end_cidade, end_num, end_uf, end_cep, forn_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [this.#rua, this.#bairro, this.#cidade, this.#numero, this.#uf, this.#cep, this.#fornecedorId];
        let database = new Database();
        let result = await database.ExecutaComandoNonQuery(sql, values);
        return result;
    }

    async Delete(fornecedorId){
        const sql = `DELETE FROM endereco WHERE forn_id = ?`;
        const values = [fornecedorId];
        let database = new Database();
        let result = await database.ExecutaComandoNonQuery(sql, values);
        return result;
    }
}

module.exports = EnderecoModel;
```

> [!caution] Cuidado
> Ajustar os nomes das colunas SQL (`end_rua`, `end_bairro`, `forn_id`, etc.) de acordo com a estrutura real da tabela `endereco` no seu banco de dados.

#### O que acontece sem correção
- O `Create()` do "EnderecoModel" **insere dados na tabela `cliente`** ao invés da tabela `endereco`
- Dados de rua/bairro vão parar em colunas de nome/CPF do cliente
- O `Delete()` tenta deletar da tabela `cliente`, não do `endereco`

---

### Bug 9 — Problemas no Script de Exclusão (listar.js)

**Arquivo:** `public/js/fornecedores/listar.js`  
**Status:** ❌ Ainda não corrigido

#### Problema 9.1 — `querySelectorAll` + `addEventListener`
```javascript
const btn = document.querySelectorAll('.btnExluir');
btn.addEventListener('click', deletar); // ❌ TypeError!
```

`querySelectorAll` retorna uma **NodeList** (coleção), não um elemento individual. Você não pode chamar `addEventListener` diretamente numa NodeList.

**Correção:**
```javascript
const btns = document.querySelectorAll('.btnExcluir');
btns.forEach(btn => {
    btn.addEventListener('click', deletar);
});
```

#### Problema 9.2 — Nome da classe CSS inconsistente

| Local | Classe usada |
|-------|-------------|
| `listar.ejs` (HTML) | `btnExcluir` (com **c**) |
| `listar.js` (selector) | `.btnExluir` (sem **c**) |

O seletor `.btnExluir` nunca encontra nenhum elemento porque a classe no HTML é `btnExcluir`. A NodeList retorna vazia.

**Correção:** Usar `.btnExcluir` (com `c`) no JavaScript.

#### Problema 9.3 — Body não serializado
```javascript
body: {
    id: id  // ❌ Objeto JavaScript, não é string JSON!
}
```

O `fetch()` espera que o `body` seja uma **string**. Passar um objeto resulta em `[object Object]` sendo enviado como corpo da requisição.

**Correção:**
```javascript
body: JSON.stringify({ id: id })
```

#### Problema 9.4 — Método HTTP incorreto
```javascript
fetch('/fornecedores/delete', {
    method: "POST",  // ❌ A rota espera DELETE
```

A rota definida é `router.delete('/delete', ...)`, mas o fetch envia como `POST`. O Express não encontra a rota e retorna 404.

**Correção:**
```javascript
method: "DELETE"
```

#### Problema 9.5 — ID no body vs. params
No controller:
```javascript
const id = req.params.id; // ← espera URL como /delete/123
```
Mas o cliente envia no `body`, não na URL. E a rota é `/delete` (sem `:id`).

**Correção (opção A — usar body):**
```javascript
// Controller
const id = req.body.id;
```

**Correção (opção B — usar params):**
```javascript
// Rota
router.delete('/delete/:id', ctrl.delete);

// Fetch
fetch(`/fornecedores/delete/${id}`, { method: "DELETE" })
```

---

### Bug 10 — `listar.ejs` Chama `fornecedor.status()` como Função

**Arquivo:** `views/fornecedores/listar.ejs`  
**Linha:** 37  
**Status:** ❌ Ainda não corrigido

#### O que é
```html
<% if(fornecedor.status() == 'Ativo') { %>
```

`status` é um **getter** (propriedade), não um **método**. Usar `()` causa `TypeError: fornecedor.status is not a function`.

#### Correção
```html
<% if(fornecedor.status == 'Ativo') { %>
```

---

### Bug 11 — View Exibe `fornecedor.endereco` (Inexistente)

**Arquivo:** `views/fornecedores/listar.ejs`  
**Linha:** 34  
**Status:** ❌ Ainda não corrigido

#### O que é
```html
<td><%= fornecedor.endereco %></td>
```

O `FornecedorModel` **não possui** campo `endereco`. Os únicos campos são: `id`, `nome`, `telefone`, `cnpj` e `status`. O endereço está em uma **tabela separada**.

#### Resultado
A coluna "Endereço" exibirá `undefined` para todos os fornecedores.

#### Correção possível
Fazer um JOIN no `List()` para trazer os dados de endereço junto, ou remover a coluna da tabela.

---

## 🔧 Configuração do Servidor

### Middlewares Importantes

```javascript
// server.js
server.use(express.urlencoded({ extended: true })); // Parse de formulários HTML
server.use(express.json());                          // Parse de JSON (Fetch API)
```

> [!important] Importância do `express.json()`
> **Sem `express.json()`**, o `req.body` estaria `undefined` para todas as requisições com `Content-Type: application/json`. Este middleware é **obrigatório** quando usamos Fetch API com JSON.

### Ordem dos middlewares

A ordem no `server.js` importa:

```javascript
server.use(express.static("public"));     // 1° - Arquivos estáticos
server.use(express.urlencoded({...}));     // 2° - Parser URL-encoded
server.use(express.json());                // 3° - Parser JSON
server.use("/fornecedores", FornecedorRouter); // 4° - Rotas
```

Se `express.json()` estivesse **depois** das rotas, o body não seria parseado a tempo.

---

## 📡 Fetch API — Boas Práticas

### Estrutura correta de um fetch POST com JSON

```javascript
fetch('/endpoint', {
    method: "POST",
    headers: {
        "Content-Type": "application/json"  // ← obrigatório!
    },
    body: JSON.stringify({                   // ← serializar como string!
        campo1: valor1,
        campo2: valor2
    })
})
.then(response => response.json())          // ← parse da resposta
.then(data => {
    // tratar os dados retornados
})
.catch(error => {
    // tratar erros de rede
});
```

### Erros comuns e consequências

| Erro | Consequência |
|------|-------------|
| Não usar `JSON.stringify()` no body | O servidor recebe `[object Object]` como string |
| Não incluir `Content-Type: application/json` | O `express.json()` não faz o parse; `req.body` fica `undefined` |
| Não ter `express.json()` no servidor | `req.body` é `undefined` para todas as requisições JSON |
| Usar método HTTP errado (POST vs DELETE) | Express retorna 404 (rota não encontrada) |
| Não usar `event.preventDefault()` em forms | O formulário e o fetch competem; o fetch é cancelado |

---

## 🏗️ Padrão MVC — Como Cada Camada Funciona

### Model (Modelo)
- **Responsabilidade:** Interação com o banco de dados
- **Encapsulamento:** Campos privados com `#` (ES2022)
- **Métodos:** `Create()`, `List()`, `delete()`
- **Retorno:** Dados do banco ou resultado da operação

```javascript
// Exemplo de encapsulamento correto
class FornecedorModel {
    #id       // campo privado
    #nome

    get id() { return this.#id; }      // getter público
    set id(value) { this.#id = value; } // setter público
}
```

> [!note] Por que campos privados?
> Campos com `#` não podem ser acessados/modificados diretamente de fora da classe. Isso previne alterações acidentais e força o uso dos getters/setters, que podem incluir validação.

### Controller (Controlador)
- **Responsabilidade:** Receber requisições, validar dados, chamar o Model, enviar respostas
- **Validação:** Dupla (frontend + backend) para segurança
- **Biblioteca:** `@brazilian-utils` para validação de CNPJ, CEP, telefone

### View (Visão)
- **Template Engine:** EJS (Embedded JavaScript)
- **Layout:** AdminLTE com `express-ejs-layouts`
- **Importante:** Views **não devem** conter `<!DOCTYPE html>`, `<html>`, `<head>` ou `<body>` quando usam layout

### Route (Rota)
- **Padrão REST:** GET para leitura, POST para criação, DELETE para exclusão
- **Prefixo:** `/fornecedores` definido no `server.js`

---

## ✅ Checklist de Verificação para Novos CRUDs

Use esta lista ao criar novos módulos para evitar os mesmos erros:

- [ ] O `<button>` tem `type="button"` ou usa `preventDefault()`?
- [ ] O `fetch()` usa `JSON.stringify()` no body?
- [ ] O `fetch()` inclui `Content-Type: application/json` nos headers?
- [ ] O método HTTP do fetch (`POST`, `DELETE`, `PUT`) corresponde à rota?
- [ ] O Model retorna os dados no final dos métodos (`return`)?
- [ ] Os argumentos do construtor estão na ordem correta?
- [ ] A view **não** contém tags `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` quando usa layout?
- [ ] Os nomes de classes CSS estão iguais no HTML e no JavaScript?
- [ ] O `querySelectorAll` é iterado com `forEach` antes de usar `addEventListener`?
- [ ] O controller lê o ID de `req.body` ou `req.params` conforme o design da rota?
- [ ] O arquivo do Model exporta a classe **correta** (não outra copiada)?
- [ ] O `express.json()` está configurado no `server.js` **antes** das rotas?

---

## 📝 Resumo das Alterações

| # | Bug | Arquivo | Status |
|---|-----|---------|--------|
| 1 | `x` solto (SyntaxError) | `FornecedorController.js` | ✅ Corrigido |
| 2 | Lógica de validação invertida | `FornecedorController.js` | ✅ Corrigido |
| 3 | Campo `status` ausente | `cadastrar.js` / Controller | ✅ Corrigido (hardcoded) |
| 4 | `List()` sem `return` | `FornecedorModel.js` | ✅ Corrigido |
| 5 | Argumentos do construtor trocados | `FornecedorModel.js` | ✅ Corrigido |
| 6 | `<button>` sem `type="button"` | `cadastrar.ejs` | ✅ Corrigido |
| 7 | HTML completo dentro de view com layout | `cadastrar.ejs` | ✅ Corrigido |
| 8 | `EnderecoModel.js` com classe errada | `EnderecoModel.js` | ❌ Pendente |
| 9 | Múltiplos erros no script de exclusão | `listar.js` | ❌ Pendente |
| 10 | `status()` chamado como função | `listar.ejs` | ❌ Pendente |
| 11 | `fornecedor.endereco` inexistente | `listar.ejs` | ❌ Pendente |
