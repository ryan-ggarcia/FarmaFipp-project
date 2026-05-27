document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('cadastrar');

    btn.addEventListener('click', cadastrar);

    function cadastrar(){
        const nome     = document.querySelector('#nome');
        const cnpj     = document.querySelector('#cnpj');
        const telefone = document.querySelector('#telefone');
        const rua      = document.querySelector('#rua');
        const numero   = document.querySelector('#num');
        const bairro   = document.querySelector('#bairro');
        const cidade   = document.querySelector('#cidade');
        const cep      = document.querySelector('#cep');
        const estado   = document.querySelector('#estado');
        const uf       = document.querySelector('#uf');

        [nome, cnpj, telefone, rua, numero, bairro, cidade, cep, estado, uf].forEach(el => {
            if (el) el.style.borderColor = '#ced4da';
        });

        let listaValid = [];
        if (nome.value.length < 3)      listaValid.push('nome');
        if (cnpj.value.length < 14)     listaValid.push('cnpj');
        if (telefone.value.length < 10) listaValid.push('telefone');
        if (rua.value.length < 3)       listaValid.push('rua');
        if (numero.value.length < 1)    listaValid.push('num');
        if (bairro.value.length < 3)    listaValid.push('bairro');
        if (cidade.value.length < 3)    listaValid.push('cidade');
        if (cep.value.length < 8)       listaValid.push('cep');
        if (estado.value.length < 3)    listaValid.push('estado');
        if (uf.value.length < 2)        listaValid.push('uf');

        if (listaValid.length > 0) {
            listaValid.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.borderColor = 'red';
            });
            Swal.fire({
                title: 'Campos obrigatórios',
                text: 'Preencha todos os campos destacados.',
                icon: 'warning',
                confirmButtonColor: '#A31621'
            });
            return;
        }

        fetch('/admin/fornecedores/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome.value,
                cnpj: cnpj.value,
                telefone: telefone.value,
                status: document.querySelector('#status')?.value || 'ativo',
                rua: rua.value,
                numero: numero.value,
                bairro: bairro.value,
                cidade: cidade.value,
                cep: cep.value,
                uf: uf.value,
                estado: estado.value
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                Swal.fire({
                    title: 'Cadastrado!',
                    text: data.msg,
                    icon: 'success',
                    confirmButtonColor: '#A31621',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => window.location.href = '/admin/fornecedores');
            } else {
                Swal.fire({ title: 'Erro!', text: data.msg, icon: 'error', confirmButtonColor: '#A31621' });
            }
        })
        .catch(() => {
            Swal.fire({ title: 'Erro!', text: 'Erro ao cadastrar fornecedor.', icon: 'error', confirmButtonColor: '#A31621' });
        });
    }
});
