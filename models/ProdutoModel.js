const Database = require('../utils/database')

class ProdutoModel{

    #id
    #nome
    #descricao
    #validade
    #preco
    #quantidade
    #marca
    #lote
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
    get lote() { return this.#lote; } set lote(value) { this.#lote = value; }
    get img() { return this.#img; } set img(value) { this.#img = value; }


    constructor(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, lote, img){
        this.#id = id;
        this.#nome = nome;
        this.#descricao = descricao;
        this.#validade = validade;
        this.#preco = preco;
        this.#quantidade = quantidade;
        this.#categoria = categoria;
        this.#fornecedor = fornecedor;
        this.#marca = marca;
        this.#lote = lote;
        this.#img = img;
    }

    async #CreateLote(id){
        const sql = 'insert into Lote (lot_qnt, prod_id, lot_name, lot_validade) values (?, ?, ?, ?)';
        const values = [this.#quantidade, id, this.#lote, this.#validade];
        const banco = new Database();
        let result =  await banco.ExecutaComandoLastInserted(sql, values);
        return result;
    }

    async GetLote(){
        const sql = 'select * from Lote where prod_id = ?';
        const values = [id];
        const banco = new Database();
        let result =  await banco.ExecutaComando(sql, values);
        return result;
    }

    async Create() {
        const sql = 'insert into produto (pro_nome, descricao,  pro_preco, pro_quantidade,  Categoria_Produto, marca, idFornecedor, pro_img) values (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [this.#nome, this.#descricao, this.#preco, this.#quantidade, this.#categoria, this.#marca,  this.#fornecedor, this.#img];
        const banco = new Database();
        let result =  await banco.ExecutaComandoLastInserted(sql, values);
        let resultLote = await this.#CreateLote(result);
        if(!resultLote) {
            return 'Erro ao criar o lote do produto!';
        }
        return result;
    }

    async ListCategorias() {
        const sql = 'select * from categoria';
        const banco = new Database();
        let result =  await banco.ExecutaComando(sql);
        return result;
    }
    async Read(){
        const sql = `SELECT p.*, c.cat_nome, l.lot_name, l.lot_validade, l.lot_qnt, f.forn_nome
                    FROM produto p
                    LEFT JOIN categoria c ON p.Categoria_Produto = c.idCategoria
                    left join produto_lote pl on p.idProduto = pl.produto_idProduto
                    left join Lote l on pl.lote_lot_id = l.lot_id
                    left join fornecedor f on p.idFornecedor = f.idFornecedor`;
        const banco = new Database()
        let result = await banco.ExecutaComando(sql)
        let lista = []
        for(let i=0;i < result.length; i++){

            let imagem = '/img/produtos/barra-de-imagem.png'

            if(result[i]['pro_img'] != null){
                imagem = '/img/produtos/' + result[i]['pro_img']
            }
            
            let produtos = new ProdutoModel(
                result[i]['idProduto'],
                result[i]['pro_nome'],
                result[i]['descricao'],
                result[i]['lot_validade'] || result[i]['pro_validade'],
                result[i]['pro_preco'],
                result[i]['pro_quantidade'],
                result[i]['cat_nome'] || result[i]['Categoria_Produto'],
                result[i]['forn_nome'],
                result[i]['marca'],
                result[i]['lot_name'],
                imagem,
            )
            lista.push(produtos)
        }
        return lista
    }

    async AddNewLot(id){
        let resultLote = await this.#CreateLote(id);
        return resultLote;
    }
}

module.exports = ProdutoModel;