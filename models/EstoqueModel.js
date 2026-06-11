const Database = require('../utils/database');
let banco = new Database();

class EstoqueModel{
    #id
    #loteId
    #produtoId
    #tipo
    #origem
    #quantidade
    #itensId

    get id(){
        return this.#id;
    }

    set id(value){
        this.#id = value;
    }

    get loteId(){
        return this.#loteId;
    }

    set loteId(value){
        this.#loteId = value;
    }

    get tipo(){
        return this.#tipo;
    }

    set tipo(value){
        this.#tipo = value;
    }

    get origem(){
        return this.#origem;
    }

    set origem(value){
        this.#origem = value;
    }

    get quantidade(){
        return this.#quantidade;
    }

    set quantidade(value){
        this.#quantidade = value;
    }

    get produtoId(){
        return this.#produtoId;
    }

    set produtoId(value){
        this.#produtoId = value;
    }

    get itensId(){
        return this.#itensId;
    }

    set itensId(value){
        this.#itensId = value;
    }

    constructor(id, loteId, tipo, origem, quantidade, produtoId, itensId){
        this.#id = id;
        this.#loteId = loteId;
        this.#tipo = tipo;
        this.#origem = origem;
        this.#quantidade = quantidade;
        this.#produtoId = produtoId;
        this.#itensId = itensId;
    }

    async AddToInventory(transactionConnection = null){
        let sql = 'insert into movimentacao_estoque (prd_id, lote_id, tipo, origem, quantidade) values (?, ?, ?, ?, ?)';

        const values = [this.#produtoId, this.#loteId, this.#tipo, this.#origem, this.#quantidade];

        let result;
        if(transactionConnection){
            result = await banco.ExecutaComandoLastInsertedTransacao(sql, values, transactionConnection);
        } else {
            result = await banco.ExecutaComandoLastInserted(sql, values);
        }
        
        this.#id = result;

        return result;
    }

    async existeMovimentacaoPorOrigem(origem){
        let sql = 'select 1 from movimentacao_estoque where origem = ? limit 1';
        let rows = await banco.ExecutaComando(sql, [origem]);
        return rows.length > 0;
    }

    async ListInventory(){
        let sql = 'select m.*, l.lot_name, l.lot_validade from movimentacao_estoque m left join Lote l on m.lote_id = l.lot_id order by m.mov_id desc';

        let rows = await banco.ExecutaComando(sql);

        let lista = [];

        rows.forEach(row =>{
            let mov = new EstoqueModel(
                row.mov_id,
                row.lote_id,
                row.tipo,
                row.origem,
                row.quantidade,
                row.prd_id,
                row.itens_id
            );
            mov.dataMov = row.data_mov || row.mov_data || null;
            mov.lot_name = row.lot_name;
            mov.lot_validade = row.lot_validade;
            lista.push(mov);    
        })  
        return lista;
    }

    async ExitFromInventory(){
        let sql = "insert into movimentacao_estoque (lote_id, tipo, origem, quantidade) values (?, ?, ?, ?)";

        let values = [this.#loteId, this.#tipo, this.#origem, this.#quantidade];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }
}

module.exports = EstoqueModel;