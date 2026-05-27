document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");
    let inputCepEl = document.getElementById("cep");
    if(inputCepEl) inputCepEl.addEventListener("blur", buscarCep);

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
        ["rua","bairro","cidade","estado","uf"].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = "";
        });
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
            ["rua","bairro","cidade","estado","uf"].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.value = "...";
            });
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if(!res.ok) throw new Error();
            const data = await res.json();
            if(data.erro){
                limparCamposEnd();
                Swal.fire({ title: 'CEP não encontrado!', icon: 'warning', confirmButtonColor: '#A31621' });
                return;
            }
            document.getElementById("rua").value    = data.logradouro || "";
            document.getElementById("bairro").value = data.bairro     || "";
            document.getElementById("cidade").value = data.localidade || "";
            document.getElementById("estado").value = data.uf         || "";
            document.getElementById("uf").value     = data.uf         || "";
        } catch(erro){
            limparCamposEnd();
            Swal.fire({ title: 'Erro ao consultar CEP', text: 'Tente novamente mais tarde.', icon: 'error', confirmButtonColor: '#A31621' });
        }
    }

    function cadastrar(){
        let inputNome        = document.getElementById("nome").value;
        let inputCpf         = document.getElementById("cpf").value;
        let inputNascimento  = document.getElementById("data").value;
        let inputTelefone    = document.getElementById("telefone").value;
        let inputEmail       = document.getElementById("email").value;
        let inputSenha       = document.getElementById("senha").value;
        let inputRua         = document.getElementById("rua").value;
        let inputNum         = document.getElementById("num").value;
        let inputComplemento = document.getElementById("complemento").value;
        let inputBairro      = document.getElementById("bairro").value;
        let inputCidade      = document.getElementById("cidade").value;
        let inputEstado      = document.getElementById("estado").value;
        let inputCep         = document.getElementById("cep").value;
        let inputUf          = document.getElementById("uf").value;
        let listaValidacao   = [];

        if(!inputNome)                           listaValidacao.push("nome");
        if(!inputCpf)                            listaValidacao.push("CPF");
        if(!inputNascimento)                     listaValidacao.push("nascimento");
        if(!inputTelefone)                       listaValidacao.push("telefone");
        if(!inputEmail || !inputEmail.includes("@")) listaValidacao.push("e-mail");
        if(!inputSenha)                          listaValidacao.push("senha");
        if(!inputRua)                            listaValidacao.push("rua");
        if(!inputNum)                            listaValidacao.push("número");
        if(!inputBairro)                         listaValidacao.push("bairro");
        if(!inputCidade)                         listaValidacao.push("cidade");
        if(!inputEstado)                         listaValidacao.push("estado");
        if(!inputCep)                            listaValidacao.push("CEP");
        if(!inputUf)                             listaValidacao.push("UF");

        if(inputCpf !== "" && !validarCpf(inputCpf)){
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

        fetch("/admin/clientes/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: inputNome, cpf: inputCpf, data: inputNascimento,
                telefone: inputTelefone, email: inputEmail, senha: inputSenha,
                rua: inputRua, numero: inputNum, bairro: inputBairro,
                cidade: inputCidade, estado: inputEstado, cep: inputCep,
                uf: inputUf, complemento: inputComplemento
            })
        })
        .then(res => res.json())
        .then(dados => {
            if(dados.ok){
                Swal.fire({
                    title: 'Cadastrado!',
                    text: dados.msg,
                    icon: 'success',
                    confirmButtonColor: '#A31621',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => window.location.href = "/admin/clientes/listar");
            } else {
                Swal.fire({ title: 'Erro!', text: dados.msg, icon: 'error', confirmButtonColor: '#A31621' });
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
