const Database = require('../utils/database');
let banco = new Database();

class FuncionarioModel {
    #funcId;
    #funcCargo;
    #funcNome;
    #funcTelefone;
    #funcEmail;
    #funcSenha;
    #funcMatricula;
    #funcCpf;
    #perfilId;

    get funcId() {
        return this.#funcId;
    }

    set funcId(value) {
        this.#funcId = value;
    }

    get funcCargo() {
        return this.#funcCargo;
    }

    set funcCargo(value) {
        this.#funcCargo = value;
    }

    get funcNome() {
        return this.#funcNome;
    }

    set funcNome(value) {
        this.#funcNome = value;
    }

    get funcTelefone() {
        return this.#funcTelefone;
    }

    set funcTelefone(value) {
        this.#funcTelefone = value;
    }

    get funcEmail() {
        return this.#funcEmail;
    }

    set funcEmail(value) {
        this.#funcEmail = value;
    }

    get funcSenha() {
        return this.#funcSenha;
    }

    set funcSenha(value) {
        this.#funcSenha = value;
    }

    get funcMatricula() {
        return this.#funcMatricula;
    }

    set funcMatricula(value) {
        this.#funcMatricula = value;
    }

    get funcCpf() {
        return this.#funcCpf;
    }

    set funcCpf(value) {
        this.#funcCpf = value;
    }

    get perfilId() {
        return this.#perfilId;
    }

    set perfilId(value) {
        this.#perfilId = value;
    }

    constructor(funcId, funcCargo, funcNome, funcTelefone, funcEmail, funcSenha, funcMatricula, funcCpf, perfilId) {
        this.#funcId = funcId;
        this.#funcCargo = funcCargo;
        this.#funcNome = funcNome;
        this.#funcTelefone = funcTelefone;
        this.#funcEmail = funcEmail;
        this.#funcSenha = funcSenha;
        this.#funcMatricula = funcMatricula;
        this.#funcCpf = funcCpf;
        this.#perfilId = perfilId;
    }

    async Create(){
        let sql = "insert into funcionario(func_cargo, func_nome, func_telefone,func_email, func_senha, func_matricula, func_cpf, perfil_id) values(?,?,?,?,?,?,?,?)";

        let values = [this.funcCargo, this.funcNome, this.funcTelefone, this.funcEmail, this.funcSenha, this.funcMatricula, this.funcCpf, this.perfilId];

        let result = await banco.ExecutaComandoLastInserted(sql, values);

        return result;
    }

    async FindByCpf(cpf){
        let sql = "select * from funcionario where func_cpf = ?";

        let values = [cpf];

        let rows = await banco.ExecutaComando(sql, values);

        if(rows.length > 0){
            let func = new FuncionarioModel(
                rows[0].idFuncionario,
                rows[0].func_cargo,
                rows[0].func_nome,
                rows[0].func_telefone,
                rows[0].func_email,
                rows[0].func_senha,
                rows[0].func_matricula,
                rows[0].func_cpf,
                rows[0].perfil_id
            )
            return func;
        }
        return null;
    }

    async FindByRegistration(matricula){
        let sql = "select * from funcionario where func_matricula = ?";

        let values = [matricula];

        let rows = await banco.ExecutaComando(sql, values);

        if(rows.length > 0){
            let func = new FuncionarioModel(
                rows[0].idFuncionario,
                rows[0].func_cargo,
                rows[0].func_nome,
                rows[0].func_telefone,
                rows[0].func_email,
                rows[0].func_senha,
                rows[0].func_matricula,
                rows[0].func_cpf,
                rows[0].perfil_id
            )
            return func;
        }
        return null;
    }

    async Get(id){
        let sql = "select * from funcionario where idFuncionario = ?";

        let values = [id];
        
        let rows = await banco.ExecutaComando(sql, values);

        if(rows.length > 0){
            let func = new FuncionarioModel(
                rows[0].idFuncionario,
                rows[0].func_cargo,
                rows[0].func_nome,
                rows[0].func_telefone,
                rows[0].func_email,
                rows[0].func_senha,
                rows[0].func_matricula,
                rows[0].func_cpf,
                rows[0].perfil_id
            )
            return func;
        }
        return null;
    }

    async Read(){
        let sql = "select * from funcionario";

        let lista = [];

        let rows = await banco.ExecutaComando(sql)

        rows.forEach(row =>{
            let func = new FuncionarioModel(
                row.idFuncionario,
                row.func_cargo,
                row.func_nome,
                row.func_telefone,
                row.func_email,
                row.func_senha,
                row.func_matricula,
                row.func_cpf,
                row.perfil_id
            )
            lista.push(func);
        })
        return lista;
    }

    async Update(id){
        let sql = "update funcionario set func_cargo = ?, func_nome = ?, func_telefone = ?, func_email = ?, func_senha = ?, func_matricula = ?, func_cpf = ?, perfil_id = ? where idFuncionario = ?";

        let values = [this.funcCargo, this.funcNome, this.funcTelefone, this.funcEmail, this.funcSenha, this.funcMatricula, this.funcCpf, this.perfilId, this.funcId];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }

    async Delete(id){
        let sql = "delete from funcionario where idFuncionario = ?";

        let values = [id];

        let result = await banco.ExecutaComandoNonQuery(sql, values);

        return result;
    }
}

module.exports = FuncionarioModel;