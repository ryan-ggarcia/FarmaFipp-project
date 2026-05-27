document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnAlterar");
    btn.addEventListener("click", alterar);

    function alterar(){
        let inputId      = document.getElementById("cliId").value;
        let inputNome    = document.getElementById("cliNome").value;
        let inputStatus  = document.getElementById("cliStatus").value;
        let inputCpf     = document.getElementById("cliCpf").value;
        let inputData    = document.getElementById("cliNascimento").value;
        let inputTelefone= document.getElementById("cliTelefone").value;
        let inputEmail   = document.getElementById("cliEmail").value;
        let inputSenha   = document.getElementById("cliSenha").value;
        let inputIdEnd   = document.getElementById("endId").value;
        let inputRua     = document.getElementById("endRua").value;
        let inputBairro  = document.getElementById("endBairro").value;
        let inputCidade  = document.getElementById("endCidade").value;
        let inputNum     = document.getElementById("endNum").value;
        let inputEstado  = document.getElementById("endEstado").value;
        let inputUf      = document.getElementById("endUf").value;
        let inputCep     = document.getElementById("endCep").value;
        let listaValidacao = [];

        if(!inputNome)     listaValidacao.push("cliNome");
        if(!inputStatus)   listaValidacao.push("cliStatus");
        if(!inputCpf)      listaValidacao.push("cliCpf");
        if(!inputData)     listaValidacao.push("cliNascimento");
        if(!inputTelefone) listaValidacao.push("cliTelefone");
        if(!inputEmail)    listaValidacao.push("cliEmail");
        if(!inputSenha)    listaValidacao.push("cliSenha");
        if(!inputRua)      listaValidacao.push("endRua");
        if(!inputBairro)   listaValidacao.push("endBairro");
        if(!inputCidade)   listaValidacao.push("endCidade");
        if(!inputNum)      listaValidacao.push("endNum");
        if(!inputEstado)   listaValidacao.push("endEstado");
        if(!inputUf)       listaValidacao.push("endUf");
        if(!inputCep)      listaValidacao.push("endCep");

        if(listaValidacao.length > 0){
            listaValidacao.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.style.borderColor = 'red';
            });
            Swal.fire({
                title: 'Campos obrigatórios',
                text: 'Preencha todos os campos destacados.',
                icon: 'warning',
                confirmButtonColor: '#A31621'
            });
            return;
        }

        fetch("/admin/clientes/alterar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: inputId, nome: inputNome, cpf: inputCpf, data: inputData,
                telefone: inputTelefone, email: inputEmail, senha: inputSenha,
                status: inputStatus, endId: inputIdEnd, rua: inputRua,
                bairro: inputBairro, cidade: inputCidade, num: inputNum,
                estado: inputEstado, uf: inputUf, cep: inputCep
            })
        })
        .then(res => res.json())
        .then(dados => {
            if(dados.ok){
                Swal.fire({
                    title: 'Atualizado!',
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
});
