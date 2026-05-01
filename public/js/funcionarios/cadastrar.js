document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");
    let inputCepEl = document.getElementById("cep");
    inputCepEl.addEventListener("blur", buscarCep);

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
        let nome = document.getElementById("nome").value;
        let cargo = document.getElementById("cargo").value;
        let cpf = document.getElementById("cpf").value;
        let telefone = document.getElementById("telefone").value;
        let email = document.getElementById("email").value;
        let senha = document.getElementById("senha").value;
        let matricula = document.getElementById("matricula").value;
        //input de endereço
        //inputs de endereço
        let rua = document.getElementById("rua").value;
        let num = document.getElementById("num").value;
        let complemento = document.getElementById("complemento").value;
        let bairro = document.getElementById("bairro").value;
        let cidade = document.getElementById("cidade").value;
        let estado = document.getElementById("estado").value;
        let cep = document.getElementById("cep").value;
        let uf = document.getElementById("uf").value;
        let listaValidacao = []

        if(!nome){
            listaValidacao.push("Preencha o nome")
        }
        if(!cargo){
            listaValidacao.push("Preencha o cargo")
        }
        if(!telefone){
            listaValidacao.push("Preencha o telefone")
        }
        if(!email){
            listaValidacao.push("Preencha o email")
        }
        if(!senha){
            listaValidacao.push("Preencha a senha")
        }
        if(!matricula){
            listaValidacao.push("Preencha a matrícula")
        }
        if(!rua){
            listaValidacao.push("Preencha a rua")
        }
        if(!num){
            listaValidacao.push("Preencha o número")
        }
        if(!bairro){
            listaValidacao.push("Preencha o bairro")
        }
        if(!cidade){
            listaValidacao.push("Preencha a cidade")
        }
        if(!estado){
            listaValidacao.push("Preencha o estado")
        }
        if(!cep){
            listaValidacao.push("Preencha o CEP")
        }
        if(!uf){
            listaValidacao.push("Preencha a UF")
        }

        if(cpf != "" && !validarCpf(cpf)){
            alert("Informe um CPF válido!");
            return;
        }


        if(listaValidacao.length == 0){
        fetch("/funcionarios/cadastrar",{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                cargo,
                cpf,
                telefone,
                email,
                senha,
                matricula,
                rua,
                num,
                complemento,
                bairro,
                cidade,
                estado,
                cep,
                uf
            })
        })
        .then(res =>{
            return res.json()
        })
        .then(data =>{
            alert(data.msg)
             if(data.ok){
                window.location.href = "/funcionarios/listar"
             }
        })
        }
        else{
            alert("Preencha os seguintes campos:\n" + listaValidacao.join("\n"))
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