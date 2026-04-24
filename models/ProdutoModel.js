const Database = require('../utils/database')

class ProdutoModel{

    #id
    #nome
    #descricao
    #validade
    #preco
    #quantidade
    #marca
    #categoria
    #fornecedor
    #img

    get id() { return this.#id; } set id(value) { this.#id = value; }
    get nome() { return this.#nome; } set nome(value) { this.#nome = value; }
    get descricao() { return this.#descricao; } set descricao(value) { this.#descricao = value; }
    get validade() { return this.#validade; } set validade(value) { this.#validade = value; }
    get preco() { return this.#preco; } set preco(value) { this.#preco = value; }
    get quantidade() { return this.#quantidade; } set quantidade(value) { this.#quantidade = value; }
    get categoria() { return this.#categoria; } set categoria(value) { this.#categoria = value; }
    get fornecedor() { return this.#fornecedor; } set fornecedor(value) { this.#fornecedor = value; }
    get marca() { return this.#marca; } set marca(value) { this.#marca = value; }
    get img() { return this.#img; } set img(value) { this.#img = value; }


    constructor(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, img){
        this.#id = id;
        this.#nome = nome;
        this.#descricao = descricao;
        this.#validade = validade;
        this.#preco = preco;
        this.#quantidade = quantidade;
        this.#categoria = categoria;
        this.#fornecedor = fornecedor;
        this.#marca = marca;
        this.#img = img;
    }

    async Create() {
        const sql = 'insert into produto (pro_nome, descricao, pro_validade, pro_preco, pro_quantidade,  Categoria_Produto, marca, idFornecedor, pro_img) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [this.#nome, this.#descricao, this.#validade, this.#preco, this.#quantidade, this.#marca, this.#categoria, this.#fornecedor, this.#img];
        const banco = new Database();
        let result =  await banco.ExecutaComandoLastInserted(sql, values);
        return result;
    }

    async ListCategorias() {
        const sql = 'select * from categoria';
        const banco = new Database();
        let result =  await banco.ExecutaComando(sql);
        return result;
    }
}

module.exports = ProdutoModel;