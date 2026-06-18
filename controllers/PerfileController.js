const ClienteModel = require("../models/ClienteModel");
const EnderecoModelCliente = require("../models/EnderecoModelCliente");
const bcrypt = require("bcrypt");

class PerfilController{

    async perfileView(req, res){
        let usuario = new ClienteModel();
        let id = req.signedCookies.usuarioLogado;
        let cliente = await usuario.Get(id);
        let user = cliente || false;
        res.render("perfil/perfile", {user: user, layout: false});
    }

    async editarView(req, res){
        let usuario = new ClienteModel();
        let id = req.signedCookies.usuarioLogado;
        let cliente = await usuario.Get(id);
        let user = cliente || false;
        res.render("perfil/editar", {user: user, layout: false});
    }

    async alterar(req, res){
        try {
            let id = req.signedCookies.usuarioLogado;
            if (!id) {
                return res.status(401).send({ ok: false, msg: "Usuário não autenticado." });
            }

            const {
                nome, 
                data, 
                telefone, 
                email, 
                senhaAtual, 
                novaSenha, 
                confirmSenha, 
                cep, 
                rua, 
                numero, 
                complemento, 
                bairro, 
                cidade, 
                estado, 
                uf, 
                endId 
            } = req.body;

            if (!nome || !data || !telefone || !email || !senhaAtual) {
                return res.send({ ok: false, msg: "Preencha todos os campos pessoais obrigatórios e sua senha atual." });
            }

            if (!cep || !rua || !numero || !bairro || !cidade || !estado || !uf) {
                return res.send({ ok: false, msg: "Preencha todos os campos do endereço." });
            }

            let usuarioModel = new ClienteModel();
            let clienteDb = await usuarioModel.Get(id);
            if (!clienteDb) {
                return res.send({ ok: false, msg: "Usuário não encontrado." });
            }

            const senhaValida = await bcrypt.compare(senhaAtual, clienteDb.cliSenha);
            if (!senhaValida) {
                return res.send({ ok: false, msg: "Senha atual incorreta!" });
            }

            let senhaFinal = clienteDb.cliSenha;
            if (novaSenha && novaSenha.trim() !== "") {
                if (novaSenha !== confirmSenha) {
                    return res.send({ ok: false, msg: "A nova senha e a confirmação de senha não coincidem." });
                }
                senhaFinal = await bcrypt.hash(novaSenha, 10);
            }

            if (email !== clienteDb.cliEmail) {
                let emailExistente = await usuarioModel.FindByEmail(email);
                if (emailExistente && emailExistente.cliId != id) {
                    return res.send({ ok: false, msg: "Este e-mail já está sendo utilizado por outra conta." });
                }
            }

            let clienteAtualizado = new ClienteModel(
                id,
                nome,
                clienteDb.cliStatus,
                clienteDb.cliCpf,
                email,
                senhaFinal,
                telefone,
                data,
                clienteDb.perfilId
            );
            let resultCliente = await clienteAtualizado.Update();

            let enderecoAtualizado = new EnderecoModelCliente(
                endId,
                rua,
                bairro,
                cidade,
                numero,
                estado,
                uf,
                cep,
                complemento,
                id
            );
            let resultEndereco = await enderecoAtualizado.Update();

            if (resultCliente && resultEndereco) {
                return res.send({ ok: true, msg: "Perfil atualizado com sucesso!" });
            } else {
                let errorMsg = !resultCliente ? "Erro ao atualizar dados pessoais." : "Erro ao atualizar endereço.";
                return res.send({ ok: false, msg: errorMsg });
            }
        } catch (error) {
            console.error("Erro no PerfilController ao alterar perfil:", error);
            return res.status(500).send({ ok: false, msg: "Erro interno no servidor ao processar atualização." });
        }
    }

    async excluir(req, res) {
        try {
            let id = req.signedCookies.usuarioLogado;
            if (!id) {
                return res.status(401).send({ ok: false, msg: "Usuário não autenticado." });
            }

            let cliente = new ClienteModel();
            let endereco = new EnderecoModelCliente();

            let resultEnd = await endereco.Delete(id);
            let result = await cliente.Delete(id);

            if (result && resultEnd) {
                res.clearCookie("usuarioLogado");
                return res.send({ ok: true, msg: "Sua conta foi excluída com sucesso!" });
            } else {
                return res.send({ ok: false, msg: "Erro ao excluir sua conta." });
            }
        } catch (error) {
            console.error("Erro no PerfilController ao excluir conta:", error);
            return res.status(500).send({ ok: false, msg: "Erro interno no servidor ao processar exclusão de conta." });
        }
    }
}

module.exports = PerfilController;