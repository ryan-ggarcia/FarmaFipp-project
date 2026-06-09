document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnAlterar");
    btn.addEventListener("click", alterar);

    // ── Preenchimento automático de endereço pelo CEP (ViaCEP) ──
    const cepEl = document.getElementById("endCep");
    if (cepEl) cepEl.addEventListener("blur", buscarCep);

    async function buscarCep(){
        const cep = document.getElementById("endCep").value.replace(/\D/g, '');
        if(!cep) return;
        if(!/^\d{8}$/.test(cep)){
            Swal.fire({ title: 'CEP inválido!', icon: 'warning', confirmButtonColor: '#A31621' });
            return;
        }
        try{
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if(!res.ok) throw new Error();
            const data = await res.json();
            if(data.erro){
                Swal.fire({ title: 'CEP não encontrado!', icon: 'warning', confirmButtonColor: '#A31621' });
                return;
            }
            const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ""; };
            set("endRua",    data.logradouro);
            set("endBairro", data.bairro);
            set("endCidade", data.localidade);
            set("endEstado", data.uf);
            set("endUf",     data.uf);
        } catch(e){
            Swal.fire({ title: 'Erro ao consultar CEP', text: 'Tente novamente mais tarde.', icon: 'error', confirmButtonColor: '#A31621' });
        }
    }

    function alterar(){
        let inputId       = document.getElementById("funcId").value;
        let inputMatricula= document.getElementById("funcMatricula").value;
        let inputCargo    = document.getElementById("funcCargo").value;
        let inputNome     = document.getElementById("funcNome").value;
        let inputTelefone = document.getElementById("funcTelefone").value;
        let inputEmail    = document.getElementById("funcEmail").value;
        let inputSenha    = document.getElementById("funcSenha").value;
        let inputCpf      = document.getElementById("funcCpf").value;
        let inputIdEnd    = document.getElementById("endId").value;
        let inputRua      = document.getElementById("endRua").value;
        let inputBairro   = document.getElementById("endBairro").value;
        let inputCidade   = document.getElementById("endCidade").value;
        let inputNum      = document.getElementById("endNum").value;
        let inputEstado   = document.getElementById("endEstado").value;
        let inputUf       = document.getElementById("endUf").value;
        let inputCep      = document.getElementById("endCep").value;
        let listaValidacao = [];

        if(!inputMatricula) listaValidacao.push("funcMatricula");
        if(!inputCargo)     listaValidacao.push("funcCargo");
        if(!inputNome)      listaValidacao.push("funcNome");
        if(!inputTelefone)  listaValidacao.push("funcTelefone");
        if(!inputEmail)     listaValidacao.push("funcEmail");
        if(!inputSenha)     listaValidacao.push("funcSenha");
        if(!inputCpf)       listaValidacao.push("funcCpf");
        if(!inputRua)       listaValidacao.push("endRua");
        if(!inputBairro)    listaValidacao.push("endBairro");
        if(!inputCidade)    listaValidacao.push("endCidade");
        if(!inputNum)       listaValidacao.push("endNum");
        if(!inputEstado)    listaValidacao.push("endEstado");
        if(!inputUf)        listaValidacao.push("endUf");
        if(!inputCep)       listaValidacao.push("endCep");

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

        fetch("/admin/funcionarios/alterar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: inputId, matricula: inputMatricula, cargo: inputCargo,
                nome: inputNome, telefone: inputTelefone, email: inputEmail,
                senha: inputSenha, cpf: inputCpf,
                endId: inputIdEnd, rua: inputRua, bairro: inputBairro,
                cidade: inputCidade, num: inputNum, estado: inputEstado,
                uf: inputUf, cep: inputCep
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.ok){
                Swal.fire({
                    title: 'Atualizado!',
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
        })
        .catch(() => {
            Swal.fire({ title: 'Erro!', text: 'Erro ao alterar funcionário.', icon: 'error', confirmButtonColor: '#A31621' });
        });
    }
});
