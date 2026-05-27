document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");
    let inputCepEl = document.getElementById("cep");
    inputCepEl.addEventListener("blur", buscarCep);

    let inputCpfEl = document.getElementById("cpf");

    btn.addEventListener("click", cadastrar);

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
        if(!cep){ limparCamposEnd(); return; }
        if(!/^\d{8}$/.test(cep)){
            limparCamposEnd();
            Swal.fire({ title: 'CEP inválido!', icon: 'warning', confirmButtonColor: '#A31621' });
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
            if(data.erro){
                limparCamposEnd();
                Swal.fire({ title: 'CEP não encontrado!', icon: 'warning', confirmButtonColor: '#A31621' });
                return;
            }
            document.getElementById("rua").value = data.logradouro || "";
            document.getElementById("bairro").value = data.bairro || "";
            document.getElementById("cidade").value = data.localidade || "";
            document.getElementById("estado").value = data.uf || "";
            document.getElementById("uf").value = data.uf || "";
        } catch(erro){
            limparCamposEnd();
            Swal.fire({ title: 'Erro ao consultar CEP', text: 'Tente novamente mais tarde.', icon: 'error', confirmButtonColor: '#A31621' });
        }
    }

    function cadastrar(){
        let nome      = document.getElementById("nome").value;
        let cargo     = document.getElementById("cargo").value;
        let cpf       = document.getElementById("cpf").value;
        let telefone  = document.getElementById("telefone").value;
        let email     = document.getElementById("email").value;
        let senha     = document.getElementById("senha").value;
        let matricula = document.getElementById("matricula").value;
        let rua       = document.getElementById("rua").value;
        let num       = document.getElementById("num").value;
        let complemento = document.getElementById("complemento").value;
        let bairro    = document.getElementById("bairro").value;
        let cidade    = document.getElementById("cidade").value;
        let estado    = document.getElementById("estado").value;
        let cep       = document.getElementById("cep").value;
        let uf        = document.getElementById("uf").value;
        let listaValidacao = [];

        if(!nome)      listaValidacao.push("nome");
        if(!cargo)     listaValidacao.push("cargo");
        if(!telefone)  listaValidacao.push("telefone");
        if(!email)     listaValidacao.push("e-mail");
        if(!senha)     listaValidacao.push("senha");
        if(!matricula) listaValidacao.push("matrícula");
        if(!rua)       listaValidacao.push("rua");
        if(!num)       listaValidacao.push("número");
        if(!bairro)    listaValidacao.push("bairro");
        if(!cidade)    listaValidacao.push("cidade");
        if(!estado)    listaValidacao.push("estado");
        if(!cep)       listaValidacao.push("CEP");
        if(!uf)        listaValidacao.push("UF");

        if(cpf !== "" && !validarCpf(cpf)){
            Swal.fire({ title: 'CPF inválido!', text: 'Informe um CPF válido.', icon: 'warning', confirmButtonColor: '#A31621' });
            return;
        }

        if(listaValidacao.length > 0){
            Swal.fire({
                title: 'Campos obrigatórios',
                text: 'Preencha: ' + listaValidacao.join(', '),
                icon: 'warning',
                confirmButtonColor: '#A31621'
            });
            return;
        }

        fetch("/admin/funcionarios/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, cargo, cpf, telefone, email, senha, matricula, rua, num, complemento, bairro, cidade, estado, cep, uf })
        })
        .then(res => res.json())
        .then(data => {
            if(data.ok){
                Swal.fire({
                    title: 'Cadastrado!',
                    text: data.msg,
                    icon: 'success',
                    confirmButtonColor: '#A31621',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => window.location.href = "/admin/funcionarios/listar");
            } else {
                Swal.fire({ title: 'Erro!', text: data.msg, icon: 'error', confirmButtonColor: '#A31621' });
            }
        });
    }

    function validarCpf(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if(cpf.length !== 11) return false;
        if(/^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0;
        for(let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        let resto = (soma * 10) % 11;
        if(resto === 10) resto = 0;
        if(resto !== parseInt(cpf.charAt(9))) return false;
        soma = 0;
        for(let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = (soma * 10) % 11;
        if(resto === 10) resto = 0;
        if(resto !== parseInt(cpf.charAt(10))) return false;
        return true;
    }
});
