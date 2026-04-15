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

    async Get(id){
        let sql = "select * from cliente where idClinete = ?";

        let values = [id];

        let rows = await banco.ExecutaComando(sql, values);

        if(rows.length > 0){
            let cliente = new ClienteModel(
                rows[0]["idClinete"], 
                rows[0]["cli_nome"], 
                rows[0]["cli_status"], 
                rows[0]["cli_cpf"], 
                rows[0]["cli_email"], 
                rows[0]["cli_senha"], 
                rows[0]["cli_telefone"], 
                rows[0]["cli_nascimento"]);
                
            return cliente;
        }
        return null;
    }

    async Read(){
        let sql = "select c.idClinete, c.cli_nome, c.cli_status, c.cli_cpf, c.cli_email, c.cli_senha, c.cli_telefone, c.cli_nascimento, e.end_rua, e.end_bairro, e.end_cidade, e.end_num, e.end_estado, e.end_uf, e.end_cep from cliente c left join endereco e on c.idClinete = e.cli_id";

        let rows = await banco.ExecutaComando(sql);

        let lista = [];

        rows.forEach(rows =>{
            let c = new ClienteModel(
                rows.idClinete, 
                rows.cli_nome, 
                rows.cli_status,
                rows.cli_cpf,
                rows.cli_email,
                rows.cli_senha,
                rows.cli_telefone,
                rows.cli_nascimento
            )
            c.endRua = rows.end_rua;
            c.endBairro = rows.end_bairro;
            c.endCidade = rows.end_cidade;
            c.endNum = rows.end_num;
            c.endEstado = rows.end_estado;
            c.endUf = rows.end_uf;
            c.endCep = rows.end_cep;
            lista.push(c);
        });

        return lista;
    }

    async Update(id){
        let sql = "update cliente set cli_nome = ?, cli_status = ?, cli_cpf = ?, cli_email = ?, cli_senha = ?, cli_telefone = ?, cli_nascimento = ? where idClinete = ?";

        let values = [this.#cliNome, this.#cliStatus, this.#cliCpf, this.#cliEmail, this.#cliSenha, this.#cliTelefone, this.#cliNascimento, id];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }

    async Delete(id){
        let sql = "delete from cliente where idClinete = ? or idFuncionario = ?";

        let values = [id];

        let result = await banco.ExecutaComandoNonQuery(sql, values);
        
        return result;
    }

}

module.exports = ClienteModel;