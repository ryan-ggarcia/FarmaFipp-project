document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");
    let inputCepEl = document.getElementById("cep");
    if(inputCepEl){
        inputCepEl.addEventListener("blur", buscarCep);
    }

    let inputCpfEl = document.getElementById("cpf");

    btn.addEventListener("click", cadastrar)

    inputCpfEl.addEventListener("input", function(e){
        let valor = e.target.value.replace(/\D/g, ''); 
        
        if(valor.length > 11) valor = valor.substring(0, 11);

        if(valor.length > 9){
            valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        } else if(valor.length > 6){
            valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if(valor.length > 3){
            valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        }

        e.target.value = valor;
    });

    function limparCamposEnd(){
        document.getElementById("rua").value = "";
        document.getElementById("bairro").value = "";
        document.getElementById("cidade").value = "";
        document.getElementById("estado").value = "";
        document.getElementById("uf").value = "";
    }

    async function buscarCep(){
        let cep = document.getElementById("cep").value.replace(/\D/g, '');

        if(!cep){
            limparCamposEnd();
            return;
        }

        if(!/^\d{8}$/.test(cep)){
            limparCamposEnd();
            alert("CEP inválido!");
            return;
        }

        try{
            document.getElementById("rua").value = "...";
            document.getElementById("bairro").value = "...";
            document.getElementById("cidade").value = "...";
            document.getElementById("estado").value = "...";
            document.getElementById("uf").value = "...";

            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if(!res.ok) throw new Error("Erro ao consultar CEP");
            
            const data = await res.json();

            if (data.erro){
                limparCamposEnd();
                alert("CEP não encontrado!");
                return;
            }

            document.getElementById("rua").value = data.logradouro || "";
            document.getElementById("bairro").value = data.bairro || "";
            document.getElementById("cidade").value = data.localidade || "";
            document.getElementById("estado").value = data.uf || "";
            document.getElementById("uf").value = data.uf || "";
        } catch(erro){
            limparCamposEnd();
            alert("Erro ao consultar CEP. Tente novamente mais tarde.");
            console.log(erro);
        }
    }

    function cadastrar(){
        //inputs de cliente
        let inputNome = document.getElementById("nome").value;
        let inputCpf = document.getElementById("cpf").value;
        let inputNascimento = document.getElementById("data").value;
        let inputTelefone = document.getElementById("telefone").value;
        let inputEmail = document.getElementById("email").value;
        let inputSenha = document.getElementById("senha").value;
        //inputs de endereço
        let inputRua = document.getElementById("rua").value;
        let inputNum = document.getElementById("num").value;
        let inputComplemento = document.getElementById("complemento").value;
        let inputBairro = document.getElementById("bairro").value;
        let inputCidade = document.getElementById("cidade").value;
        let inputEstado = document.getElementById("estado").value;
        let inputCep = document.getElementById("cep").value;
        let inputUf = document.getElementById("uf").value;
        
        let listaValidacao = []

        if(inputNome == "")
            listaValidacao.push("nome");
        if(inputCpf == "")
            listaValidacao.push("cpf");
        if(inputNascimento == "")
            listaValidacao.push("data de nascimento");
        if(inputTelefone == "")
            listaValidacao.push("telefone");
        if(inputEmail == "" || !inputEmail.includes("@")) 
            listaValidacao.push("email");
        if(inputSenha == "")
            listaValidacao.push("senha");
        if(inputRua == "")
            listaValidacao.push("rua");
        if(inputNum == "")
            listaValidacao.push("número");
        if(inputBairro == "")
            listaValidacao.push("bairro");
        if(inputCidade == "")
            listaValidacao.push("cidade");
        if(inputEstado == "")
            listaValidacao.push("estado");
        if(inputCep == "")
            listaValidacao.push("cep");
        if(inputUf == "")
            listaValidacao.push("uf");

        if(inputCpf != "" && !validarCpf(inputCpf)){
            alert("Informe um CPF válido!");
            return;
        }

        if(listaValidacao.length == 0){
            fetch("/clientes/cadastrar", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: inputNome,
                    cpf: inputCpf,
                    data: inputNascimento,
                    telefone: inputTelefone,
                    email: inputEmail,
                    senha: inputSenha,
                    rua: inputRua,
                    numero: inputNum,
                    bairro: inputBairro,
                    cidade: inputCidade,
                    estado: inputEstado,
                    cep: inputCep,
                    uf: inputUf,
                    complemento: inputComplemento
                })
            })
            .then(res=>{
                return res.json();
            })
            .then(dados=>{
                alert(dados.msg)
                if(dados.ok)
                    window.location.href = "/"
            })
        }
        else{
            alert("Preencha os seguintes campos: " + listaValidacao.join(", "))
        }
    }

    function validarCpf(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');

        if (cpf.length !== 11) return false;

        
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;

        return true;
    }
})
