const Database = require('../utils/database')
const fs = require('fs')
const path = require('path')

function resolverImagem(raw){
    const FALLBACK = '/img/produtos/barra-de-imagem.png';
    if(raw == null) return FALLBACK;
    let nome = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
    nome = nome.trim().replace(/^.*[\\/]/, '');
    if(!nome) return FALLBACK;
    const baseAbs = global.CAMINHO_IMG_ABS || (path.join(__dirname, '..', 'public', 'img', 'produtos') + path.sep);
    if(!fs.existsSync(baseAbs + nome)) return FALLBACK;
    return '/img/produtos/' + nome;
}

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
    #lote
    #id_lote
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
    get id_lote() { return this.#id_lote; } set id_lote(value) { this.#id_lote = value; }
    get img() { return this.#img; } set img(value) { this.#img = value; }


    constructor(id, nome, descricao, validade, preco, quantidade, categoria, fornecedor, marca, lote, img, id_lote = null){
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
        this.#id_lote = id_lote;
    }

    async #discardProductsExpired(){
        const banco = new Database();
        const sql = `SELECT l.lot_id, l.lot_qnt, l.prod_id,
                            (SELECT pl.produto_idProduto FROM produto_lote pl WHERE pl.lote_lot_id = l.lot_id LIMIT 1) AS produto_vinculo
                     FROM Lote l
                     WHERE l.lot_validade < CURDATE()
                       AND l.lot_qnt > 0`;
        const lotes = await banco.ExecutaComando(sql);
        if(!lotes || lotes.length === 0) { return false; }

        const sqlZerar = `UPDATE Lote SET lot_qnt = 0 WHERE lot_id = ? AND lot_qnt > 0`;
        const sqlInserted = `INSERT INTO efetuar_descarte (des_date, des_quantidade, Produto_Descarte, Funcionario_Descarte) VALUES (?, ?, ?, ?)`;
        for (const lote of lotes) {
            const produtoId = lote.produto_vinculo || lote.prod_id;
            if (!produtoId) { continue; }
            const zerado = await banco.ExecutaComandoNonQuery(sqlZerar, [lote.lot_id]);
            if (zerado) {
                await banco.ExecutaComandoNonQuery(sqlInserted, [new Date(), lote.lot_qnt, produtoId, 1]);
            }
        }
        return true;
    }

    async Create(transactionConnection = null) {
        const sql = 'insert into produto (pro_nome, descricao,  pro_preco, pro_quantidade,  Categoria_Produto, marca, idFornecedor, pro_img) values (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [this.#nome, this.#descricao, this.#preco, this.#quantidade, this.#categoria, this.#marca,  this.#fornecedor, this.#img];
        const banco = new Database();
        
        let result;
        if(transactionConnection){
            result = await banco.ExecutaComandoLastInsertedTransacao(sql, values, transactionConnection);
        } else {
            result = await banco.ExecutaComandoLastInserted(sql, values);
        }
        return result;
    }

    async ListCategorias() {
        const sql = 'select * from categoria';
        const banco = new Database();
        await this.#discardProductsExpired();
        let result =  await banco.ExecutaComando(sql);
        return result;
    }

    async ListNomesCategorias() {
        const sql = "select distinct cat_nome from categoria where cat_nome is not null and cat_nome <> '' order by cat_nome";
        const banco = new Database();
        let result = await banco.ExecutaComando(sql);
        return result.map(r => r.cat_nome);
    }

    async ListNomesMarcas() {
        const sql = "select distinct marca from produto where marca is not null and marca <> '' and coalesce(prod_status, 'Ativo') = 'Ativo' order by marca";
        const banco = new Database();
        let result = await banco.ExecutaComando(sql);
        return result.map(r => r.marca);
    }

    async GetLote(){
        const sql = `SELECT l.* FROM Lote l
                     INNER JOIN produto_lote pl ON l.lot_id = pl.lote_lot_id
                     WHERE pl.produto_idProduto = ?`;
        const values = [this.#id];
        const banco = new Database();
        let result = await banco.ExecutaComando(sql, values);
        return result;
    }


    async Read(){
        const sql = `SELECT p.*, c.cat_nome, l.lot_id, l.lot_name, l.lot_validade, l.lot_qnt, f.forn_nome
                    FROM produto p
                    LEFT JOIN categoria c ON p.Categoria_Produto = c.idCategoria
                    left join produto_lote pl on p.idProduto = pl.produto_idProduto
                    left join Lote l on pl.lote_lot_id = l.lot_id
                    left join fornecedor f on p.idFornecedor = f.idFornecedor
                    where coalesce(p.prod_status, 'Ativo') = 'Ativo'`;
        const banco = new Database()
        let result = await banco.ExecutaComando(sql)
        let lista = []
        for(let i=0;i < result.length; i++){

            let imagem = resolverImagem(result[i]['pro_img'])

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
                result[i]['lot_id'] || null,
            )
            lista.push(produtos)
        }
        return lista
    }

    async Get(id){
        const sql = "select * from produto where idProduto = ? and coalesce(prod_status, 'Ativo') = 'Ativo'";

        let values = [id];
        const banco = new Database();

        let rows = await banco.ExecutaComando(sql, values);

        if(rows.length > 0){
            let produto = null;

            rows.forEach(row =>{
                let img = resolverImagem(row.pro_img)

                produto = new ProdutoModel(
                    row.idProduto,
                    row.pro_nome,
                    row.descricao,
                    row.pro_validade,
                    row.pro_preco,
                    row.pro_quantidade,
                    row.Categoria_Produto,
                    row.idFornecedor,
                    row.marca,
                    null,
                    img
                )
            })
            return produto;
        }

        return false;
    }

    async Update(){
        let sql = "update produto set pro_nome = ?, descricao = ?, pro_preco = ?, pro_quantidade = ?, Categoria_Produto = ?, marca = ?, idFornecedor = ?";
        let values = [this.#nome, this.#descricao, this.#preco, this.#quantidade, this.#categoria, this.#marca, this.#fornecedor];

        if(this.#img != null && this.#img !== ""){
            sql += ", pro_img = ?";
            values.push(this.#img);
        }

        sql += " where idProduto = ?";
        values.push(this.#id);

        const banco = new Database();

        return await banco.ExecutaComando(sql, values);
    }

    async Delete(id){
        let sql = "update produto set prod_status = 'Inativo' where idProduto = ?";
        let values = [id];
        const banco = new Database();
        return await banco.ExecutaComando(sql, values);
    }

    async DecreaseStock(idProduto, quantidade, transactionConnection = null) {
        const qtdNum = Number(quantidade || 0);
        if (!idProduto || Number.isNaN(qtdNum) || qtdNum <= 0) {
            return false;
        }

        const sql = `
            update produto
            set pro_quantidade = pro_quantidade - ?
            where idProduto = ?
              and coalesce(prod_status, 'Ativo') = 'Ativo'
              and pro_quantidade >= ?`;
        const values = [qtdNum, idProduto, qtdNum];
        const banco = new Database();

        if (transactionConnection) {
            return await banco.ExecutaComandoNonQueryTransacao(sql, values, transactionConnection);
        }
        return await banco.ExecutaComandoNonQuery(sql, values);
    }

    toJSON(){
        return {
            id: this.#id,
            nome: this.#nome,
            descricao: this.#descricao,
            validade: this.#validade,
            preco: this.#preco,
            quantidade: this.#quantidade,
            categoria: this.#categoria,
            fornecedor: this.#fornecedor,
            marca: this.#marca,
            lote: this.#lote,
            id_lote: this.#id_lote,
            img: this.#img
        }
    }
}

module.exports = ProdutoModel;