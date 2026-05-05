const DataBase = require('../utils/database')

class LoginModel{
    #cli_id
    #email
    #senha

    constructor(id,email,senha){
        this.#cli_id = id
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
    get cli_id(){
        return this.#cli_id
    }
    set cli_id(x){
        this.#cli_id = x
    }

    async verificar(email){
        let sql = `select * from cliente where cli_email= ?`
        let valores = [email]
        let banco = new DataBase()
        let result = await banco.ExecutaComando(sql,valores)

        if(result.length > 0){
            let hashDoBanco = new LoginModel(
                result[0]["idClinete"],
                result[0]["cli_email"],
                result[0]["cli_senha"]
            )
            return hashDoBanco
        }else{
            return null
        }
        
    }

}
module.exports = LoginModel