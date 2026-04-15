const FornecedorModel = require("../models/FornecedorModel");
const { isValidCnpj, 
    formatCnpj, 
    isValidCep, 
    formatCep, 
    isValidPhone, 
    formatPhone } = require('@brazilian-utils/brazilian-utils');
const EnderecoModel = require("../models/EnderecoModel");


class FornecedorController{

    async listaView(req, res){
        const fornecedor = new FornecedorModel();
        const fornecedores = await fornecedor.List();
        res.render('fornecedores/listar', {fornecedores: fornecedores});
    }

    async cadastrarView(req, res){
        res.render('fornecedores/cadastrar');
    }

    async cadastrar(req, res){
        const { nome, telefone, status, cnpj} = req.body;
        const { rua, numero, bairro, cidade, cep, uf } = req.body;

        let validCnpj = isValidCnpj(cnpj);
        let validCep = isValidCep(cep);
        let validPhone = isValidPhone(telefone);

        if(validCnpj && validCep && validPhone){
            
        }
        
    }

    async delete(req, res){
        const id = req.params.id;
        if(id && id != '0'){
            const fornecedor = new FornecedorModel();
            let endereco = new EnderecoModel();
            let resultEnd = await endereco.Delete(id);
            const result = await fornecedor.delete(id);
            if(result && resultEnd){
                res.send({
                    ok: true,
                    msg: "Fornecedor deletado com sucesso!"
                })
            }else{
                res.send({
                    ok: false,
                    msg: "Erro ao deletar fornecedor!"
                })
            }
        }else{
            res.send({
                ok: false,
                msg: "ID do fornecedor inválido!"
            })
        }
    }

}

module.exports = FornecedorController;