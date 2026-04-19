

document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");

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

    function cadastrar(){
        let nome = document.getElementById("nome").value;
        let cargo = document.getElementById("cargo").value;
        let cpf = document.getElementById("cpf").value;
        let telefone = document.getElementById("telefone").value;
        let email = document.getElementById("email").value;
        let senha = document.getElementById("senha").value;
        let matricula = document.getElementById("matricula").value;
        let listaValidacao = []

        if(!nome){
            listaValidacao.push("Preencha o nome")
        }
        if(!cargo){
            listaValidacao.push("Preencha o cargo")
        }
        if(!cpf){
            listaValidacao.push("Preencha o CPF")
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
                matricula
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