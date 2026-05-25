const DataBase = require('../utils/database')

class LoginModel{
    #cli_id
    #email
    #senha
    #cli_status

    constructor(id, email, senha, cli_status){
        this.#cli_id = id
        this.#email = email
        this.#senha = senha
        this.#cli_status = cli_status
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
    get cli_status(){
        return this.#cli_status
    }
    set cli_status(x){
        this.#cli_status = x
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
                result[0]["cli_senha"],
                result[0]["perfil_id"]
            )
            return hashDoBanco
        }else{
            return null
        }
        
    }

}
module.exports = LoginModel