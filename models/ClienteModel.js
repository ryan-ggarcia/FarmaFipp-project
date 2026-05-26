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
    #perfilId;

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

    get perfilId(){
        return this.#perfilId;
    }

    set perfilId(value){
        this.#perfilId = value;
    }

    constructor(cliId, cliNome, cliStatus, cliCpf, cliEmail, cliSenha, cliTelefone, cliNascimento, perfilId){
        this.#cliId = cliId;
        this.#cliNome = cliNome;
        this.#cliStatus = cliStatus;
        this.#cliCpf = cliCpf;
        this.#cliEmail = cliEmail;
        this.#cliSenha = cliSenha;
        this.#cliTelefone = cliTelefone;
        this.#cliNascimento = cliNascimento;
        this.#perfilId = perfilId;
    }

    async Create(){
        let sql = "insert into cliente (cli_nome, cli_status, cli_cpf, cli_email, cli_senha, cli_telefone, cli_nascimento, perfil_id) values (?, ?, ?, ?, ?, ?, ?, ?)";

        let values = [this.#cliNome, this.#cliStatus, this.#cliCpf, this.#cliEmail, this.#cliSenha, this.#cliTelefone, this.#cliNascimento, this.#perfilId];

        let result = await banco.ExecutaComandoLastInserted(sql, values);

        return result;
    }

    async Get(id){
        let sql = "select c.*, e.* from cliente c left join endereco_cliente e on c.idClinete = e.cli_id where c.idClinete = ?";

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
                rows[0]["cli_nascimento"],
                rows[0]["perfil_id"]);
                cliente.endId = rows[0]["end_id"];
                cliente.endRua = rows[0]["end_rua"];
                cliente.endBairro = rows[0]["end_bairro"];
                cliente.endCidade = rows[0]["end_cidade"];
                cliente.endNum = rows[0]["end_num"];
                cliente.endEstado = rows[0]["end_estado"];
                cliente.endUf = rows[0]["end_uf"];
                cliente.endCep = rows[0]["end_cep"];
                cliente.endComplemento = rows[0]["end_complemento"];
                
            return cliente;
        }
        return null;
    }

    async FindByCpf(cpf){
        let sql = "select * from cliente where cli_cpf =?";

        let values = [cpf];

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
                rows[0]["cli_nascimento"],
                rows[0]["perfil_id"]
            );
            return cliente;
        }
        return null;
    }

    async FindByEmail(email){
        let sql = "select * from cliente where cli_email = ?";

        let values = [email];

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
                rows[0]["cli_nascimento"],
                rows[0]["perfil_id"]
            );
            return cliente; 
        }
        return null;
    }

    async Read(){
    
    let sql = "select c.idClinete, c.cli_nome, c.cli_status, c.cli_cpf, c.cli_email, c.cli_senha, c.cli_telefone, c.cli_nascimento, c.perfil_id, e.end_id, e.end_rua, e.end_bairro, e.end_cidade, e.end_num, e.end_estado, e.end_uf, e.end_cep from cliente c left join endereco_cliente e on c.idClinete = e.cli_id";

    let rows = await banco.ExecutaComando(sql);
    let lista = [];

    rows.forEach(row => { 
        let c = new ClienteModel(
            row.idClinete, 
            row.cli_nome, 
            row.cli_status,
            row.cli_cpf,
            row.cli_email,
            row.cli_senha,
            row.cli_telefone,
            row.cli_nascimento,
            row.perfil_id
        );
        c.endId = row.end_id; 
        c.endRua = row.end_rua;
        c.endBairro = row.end_bairro;
        c.endCidade = row.end_cidade;
        c.endNum = row.end_num;
        c.endEstado = row.end_estado;
        c.endUf = row.end_uf;
        c.endCep = row.end_cep;
        lista.push(c);
    });

    return lista;
}

    async Update(id){
        let sql = "update cliente set cli_nome = ?, cli_status = ?, cli_cpf = ?, cli_email = ?, cli_senha = ?, cli_telefone = ?, cli_nascimento = ?, perfil_id = ? where idClinete = ?";

        let values = [this.#cliNome, this.#cliStatus, this.#cliCpf, this.#cliEmail, this.#cliSenha, this.#cliTelefone, this.#cliNascimento, this.#perfilId, this.#cliId];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
        
    }

    async Delete(id){
        let sql = "delete from cliente where idClinete = ?";

        let values = [id];

        let result = await banco.ExecutaComandoNonQuery(sql, values);
        
        return result;
    }

}

module.exports = ClienteModel;