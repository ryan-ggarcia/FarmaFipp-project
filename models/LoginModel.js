const DataBase = require('../utils/database')

class LoginModel{
    #email
    #senha

    constructor(email,senha){
        this.#email = email
        this.#senha = senha
    }
    get email(){
        return this.#email
    }
    set email(x){
        this.#email = x
    }
    get senha(){
        return this.#senha
    }
    set senha(x){
        this.#senha = x
    }

    async verificar(email,senha){
        let sql = `select * from cliente where cli_email= '?' and cli_senha= '?'`
        let valores = [email,senha]
        let banco = new DataBase()
        let result = banco.ExecutaComando(sql,valores)
        return result
    }

}
module.exports = LoginModel