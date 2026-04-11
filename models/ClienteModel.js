let Database = require('../utils/database');
let banco = new Database();

class ClienteModel{
    #cliId;
    #cliNome;
    #cliStatus;
    #cliCpf;
    #cliEmail;
    #cliSenha;
    #cliTelefone;
    #cliNascimento;

    get cliId(){
        return this.#cliId;
    }

    set cliId(value){
        this.#cliId = value;
    }

    get cliNome(){
        return this.#cliNome;
    }

    set cliNome(value){
        this.#cliNome = value;
    }

    get cliStatus(){
        return this.#cliStatus;
    }

    set cliStatus(value){
        this.#cliStatus = value;
    }

    get cliCpf(){
        return this.#cliCpf;
    }

    set cliCpf(value){
        this.#cliCpf = value;
    }

    get cliEmail(){
        return this.#cliEmail;
    }

    set cliEmail(value){
        this.#cliEmail = value;
    }

    get cliSenha(){
        return this.#cliSenha;
    }

    set cliSenha(value){
        this.#cliSenha = value;
    }

    get cliTelefone(){
        return this.#cliTelefone;
    }

    set cliTelefone(value){
        this.#cliTelefone = value;
    }

    get cliNascimento(){
        return this.#cliNascimento;
    }

    set cliNascimento(value){
        this.#cliNascimento = value;
    }

    constructor(cliId, cliNome, cliStatus, cliCpf, cliEmail, cliSenha, cliTelefone, cliNascimento){
        this.#cliId = cliId;
        this.#cliNome = cliNome;
        this.#cliStatus = cliStatus;
        this.#cliCpf = cliCpf;
        this.#cliEmail = cliEmail;
        this.#cliSenha = cliSenha;
        this.#cliTelefone = cliTelefone;
        this.#cliNascimento = cliNascimento;
    }

    async Create(){
        let sql = "insert into cliente (cli_nome, cli_status, cli_cpf, cli_email, cli_senha, cli_telefone, cli_nascimento) values (?, ?, ?, ?, ?, ?, ?)";

        let values = [this.#cliNome, this.#cliStatus, this.#cliCpf, this.#cliEmail, this.#cliSenha, this.#cliTelefone, this.#cliNascimento];

        let result = await banco.ExecutaComandoLastInserted(sql, values);

        return result;
    }
}

module.exports = ClienteModel;