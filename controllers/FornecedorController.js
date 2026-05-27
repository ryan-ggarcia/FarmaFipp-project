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
        const fonecedoresAtivos = fornecedores.filter(f => f.status === 'ativo');
        res.render('fornecedores/listar', { fornecedores: fonecedoresAtivos, active: 'fornecedores' });
    }

    async cadastrarView(req, res){
        res.render('fornecedores/cadastrar', { active: 'fornecedores' });
    }

    async alterarView(req, res){
        const fornecedor = new FornecedorModel();
        const fornecedorModel = await fornecedor.Get(req.params.id);
        const endereco = new EnderecoModel();
        const enderecoModel = await endereco.GetByFornecedor(req.params.id);
        res.render('fornecedores/alterar', { fornecedor: fornecedorModel, endereco: enderecoModel, active: 'fornecedores' });
    }

    async alterar(req, res){
        const {id, nome, telefone, cnpj} = req.body;
        const { rua, num, bairro, estado, cidade, cep, uf } = req.body;

        if(!id || !nome || !telefone || !cnpj){
            return res.send({
                ok: false,
                msg: "Preencha os dados do fornecedor!"
            })
        }
        if(!rua || !num || !bairro || !cidade || !cep || !uf || !estado){
            return res.send({
                ok: false,
                msg: "Preencha os dados do endereço do fornecedor!"
            })
        }

        if(!isValidCnpj(cnpj)){
            return res.send({
                ok: false,
                msg: "CNPJ inválido!"
            })
        }

        if(!isValidCep(cep)){
            return res.send({
                ok: false,
                msg: "CEP inválido!"
            })
        }

        if(!isValidPhone(telefone)){
            return res.send({
                ok: false,
                msg: "Telefone inválido!"
            })
        }

        try{
            const fornecedorModel = new FornecedorModel(id, nome, formatPhone(telefone), formatCnpj(cnpj), 'ativo');
            const fornecedorId = await fornecedorModel.Update();

            if(!fornecedorId){
                return res.send({
                    ok: false,
                    msg: "Erro ao cadastrar o Fornecedor"
                })
            }

            const enderecoModel = new EnderecoModel(0, rua, bairro, cidade, num, estado, uf, cep, null, id);
            const resultEnd = await enderecoModel.UpdateFornecedorEndereço();

            if(resultEnd){
                return res.send({
                    ok: true,
                    msg: "Fornecedor alterado com sucesso"
                })
            }

            return res.send({
                ok: false,
                msg: "Erro ao alterar o endereço do fornecedor!"
            })

        }catch(error){
            console.log(error);
            return res.send({
                ok: false,
                msg: "Erro interno ao alterar fornecedor!"
            })
        }
    }

    async cadastrar(req, res){
        const { nome, telefone, cnpj } = req.body;
        const { rua, numero, bairro, estado, cidade, cep, uf } = req.body;

        // Validação dos dados do fornecedor
        if(!nome || !telefone || !cnpj){
            return res.send({
                ok: false,
                msg: "Preencha os dados do fornecedor!"
            })
        }
        
        // Validação dos dados do endereço
        if(!rua || !numero || !bairro || !cidade || !cep || !uf || !estado){
            return res.send({
                ok: false,
                msg: "Preencha os dados do endereço do fornecedor!"
            })
        }

        if(!isValidCnpj(cnpj)){
            return res.send({
                ok: false,
                msg: "CNPJ inválido!"
            })
        }

        if(!isValidCep(cep)){
            return res.send({
                ok: false,
                msg: "CEP inválido!"
            })
        }

        if(!isValidPhone(telefone)){
            return res.send({
                ok: false,
                msg: "Telefone inválido!"
            })
        }

        try {
            // Instância criada ANTES de ser usada
            const fornecedorModel = new FornecedorModel();
            const cnpjFormatado = formatCnpj(cnpj);

            // Busca apenas fornecedores INATIVOS para reativação
            const fornecedoresInativos = await fornecedorModel.ValidateByCnpjInativo(cnpjFormatado);

            if(fornecedoresInativos.length > 0){
                const resultReativar = await fornecedorModel.AtiveFornecedor(cnpjFormatado);

                if(resultReativar){
                    return res.send({
                        ok: true,
                        msg: "Fornecedor reativado com sucesso!"
                    })
                }

                return res.send({
                    ok: false,
                    msg: "Erro ao reativar fornecedor!"
                })
            }

            // Variável com nome diferente para evitar conflito
            const novoFornecedor = new FornecedorModel(
                0, nome, formatPhone(telefone), cnpjFormatado, 'ativo'
            );
            const fornecedorId = await novoFornecedor.Create();
            
            if(!fornecedorId){
                return res.send({
                    ok: false,
                    msg: "Erro ao cadastrar fornecedor!"
                })
            }

            const endereco = new EnderecoModel(
                0, rua, bairro, cidade, numero, estado, uf, formatCep(cep), null, fornecedorId
            );
            const resultEndereco = await endereco.Create();

            if(resultEndereco){
                return res.send({
                    ok: true,
                    msg: "Fornecedor cadastrado com sucesso!"
                })
            }

            return res.send({
                ok: false,
                msg: "Erro ao cadastrar endereço do fornecedor!"
            })

        } catch (error) {
            console.log("Erro ao cadastrar fornecedor:", error);

            if(error.code === 'ER_DUP_ENTRY'){
                return res.send({
                    ok: false,
                    msg: "CNPJ já cadastrado no sistema!"
                })
            }

            return res.send({
                ok: false,
                msg: "Erro interno ao cadastrar fornecedor!"
            })
        }
    }

    async delete(req, res){
        const { id } = req.body;

        if(!id || id === '0'){
            return res.send({
                ok: false,
                msg: "ID do fornecedor inválido!"
            })
        }

        try{
            const endereco = new EnderecoModel();
            //const resultEnd = await endereco.DeleteByFornecedor(id);

            const fornecedor = new FornecedorModel();
            const result = await fornecedor.Delete(id);

            if(result){
                return res.send({
                    ok: true,
                    msg: "Fornecedor deletado com sucesso!"
                })
            }

            return res.send({
                ok: false,
                msg: "Erro ao deletar fornecedor!"
            })
        }
        catch(error){
            console.log("Erro ao deletar:", error);
            return res.send({
                ok: false,
                msg: "Erro ao deletar fornecedor!"
            })
        }
    }

}

module.exports = FornecedorController;