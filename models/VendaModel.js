const Database = require('../utils/database')
const banco = new Database()

class VendaModel{
    #id
    #data
    #status
    #tipo
    #quantidade
    #valorFinal
    #funcionarioId

    get id(){
        return this.#id
    }

    set id(value){
        this.#id = value
    }

    get data(){
        return this.#data
    }

    set data(value){
        this.#data = value
    }

    get status(){
        return this.#status
    }

    set status(value){
        this.#status = value
    }

    get tipo(){
        return this.#tipo
    }

    set tipo(value){
        this.#tipo = value
    }

    get quantidade(){
        return this.#quantidade
    }

    set quantidade(value){
        this.#quantidade = value
    }

    get valorFinal(){
        return this.#valorFinal
    }

    set valorFinal(value){
        this.#valorFinal = value
    }

    get funcionarioId(){
        return this.#funcionarioId
    }

    set funcionarioId(value){
        this.#funcionarioId = value
    }

    constructor(id, data, status, tipo, quantidade, valorFinal, funcionarioId){
        this.id = id
        this.data = data
        this.status = status
        this.tipo = tipo
        this.quantidade = quantidade
        this.valorFinal = valorFinal
        this.funcionarioId = funcionarioId
    }

    async RegistrarVenda(){
        let sql = `INSERT INTO efetuar_venda 
            (vend_dataEfetivar, vend_status, vend_tipo, vend_quantidade, vend_valorFinal, Funcionario_EfetuarVenda) 
            VALUES (NOW(), ?, ?, ?, ?, ?)`

        let values = [this.status, this.tipo, this.quantidade, this.valorFinal, this.funcionarioId]

        let result = await banco.ExecutaComandoLastInserted(sql, values)
        
        this.id = result;

        return result
    }

    async ListarVendas(){
        let sql = `SELECT ev.*, f.func_nome 
                   FROM efetuar_venda ev
                   LEFT JOIN funcionario f ON ev.Funcionario_EfetuarVenda = f.idFuncionario
                   ORDER BY ev.idEfetuar_Venda DESC`

        let result = await banco.ExecutaComando(sql)

        let lista = []

        for (let item of result){
            let venda = new VendaModel(
                item.idEfetuar_Venda, 
                item.vend_dataEfetivar, 
                item.vend_status, 
                item.vend_tipo, 
                item.vend_quantidade,
                item.vend_valorFinal,
                item.Funcionario_EfetuarVenda
            )
            venda.funcNome = item.func_nome || null
            lista.push(venda)
        }
        return lista
    }

    async Get(id){
        let sql = "SELECT * FROM efetuar_venda WHERE idEfetuar_Venda = ?"
        
        let values = [id]

        let rows = await banco.ExecutaComando(sql, values)

        if(rows.length > 0){
            let item = rows[0]
            let venda = new VendaModel(
                item.idEfetuar_Venda, 
                item.vend_dataEfetivar, 
                item.vend_status, 
                item.vend_tipo, 
                item.vend_quantidade,
                item.vend_valorFinal,
                item.Funcionario_EfetuarVenda
            )
            return venda
        }
        return null
    }

    async AtualizarVenda(){
        let sql = "UPDATE efetuar_venda SET vend_valorFinal = ?, vend_status = ? WHERE idEfetuar_Venda = ?"

        let values = [this.valorFinal, this.status, this.id]

        let result = await banco.ExecutaComandoNonQuery(sql, values)

        return result
    }
}

module.exports = VendaModel