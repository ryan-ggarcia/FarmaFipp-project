const Database = require('../utils/database');
let banco = new Database();

class EstoqueModel{
    #id
    #loteId
    #tipo
    #origem
    #quantidade
    #dataMov

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

    get dataMov(){
        return this.#dataMov;
    }

    set dataMov(value){
        this.#dataMov = value;
    }

    constructor(id, loteId, tipo, origem, quantidade, dataMov){
        this.#id = id;
        this.#loteId = loteId;
        this.#tipo = tipo;
        this.#origem = origem;
        this.#quantidade = quantidade;
        this.#dataMov = dataMov;
    }

    async AddToInventory(){
        let sql = 'insert into movimentacao_estoque (lote_id, tipo, origem, quantidade, data_mov) values (?, ?, ?, ?, ?)';

        const values = [this.#loteId, this.#tipo, this.#origem, this.#quantidade, this.#dataMov];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }

    async ListInventory(){
        let sql = 'select m.*, l.lot_name, l.lot_validade from movimentacao_estoque m left join Lote l on m.lote_id = l.lot_id order by m.data_mov desc';

        let rows = await banco.ExecutaComando(sql);

        let lista = [];

        rows.forEach(row =>{
            let mov = new EstoqueModel(
                row.mov_id,
                row.lote_id,
                row.tipo,
                row.origem,
                row.quantidade,
                row.data_mov
            );
            mov.lot_name = row.lot_name;
            mov.lot_validade = row.lot_validade;
            lista.push(mov);    
        })  
        return lista;
    }
}

module.exports = EstoqueModel;