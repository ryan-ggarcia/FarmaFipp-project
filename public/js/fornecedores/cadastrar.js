document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('cadastrar');

    // ── Máscaras ──────────────────────────────────────────────────────────────
    document.getElementById('cnpj').addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '');
        if (v.length > 14) v = v.slice(0, 14);
        if (v.length > 12)      v = v.slice(0,2)+'.'+v.slice(2,5)+'.'+v.slice(5,8)+'/'+v.slice(8,12)+'-'+v.slice(12);
        else if (v.length > 8)  v = v.slice(0,2)+'.'+v.slice(2,5)+'.'+v.slice(5,8)+'/'+v.slice(8);
        else if (v.length > 5)  v = v.slice(0,2)+'.'+v.slice(2,5)+'.'+v.slice(5);
        else if (v.length > 2)  v = v.slice(0,2)+'.'+v.slice(2);
        this.value = v;
    });

    document.getElementById('telefone').addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 7)       v = '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7);
        else if (v.length > 2)  v = '('+v.slice(0,2)+') '+v.slice(2);
        else if (v.length > 0)  v = '('+v.slice(0,2);
        this.value = v;
    });

    document.getElementById('cep').addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '');
        if (v.length > 8) v = v.slice(0, 8);
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
        this.value = v;
    });

    // ── Busca ViaCEP no blur ──────────────────────────────────────────────────
    document.getElementById('cep').addEventListener('blur', async function () {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        const campos = ['rua', 'bairro', 'cidade', 'estado', 'uf'];
        campos.forEach(id => { const el = document.getElementById(id); if (el) el.value = '...'; });
        try {
            const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (data.erro) {
                campos.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
                Swal.fire({ title: 'CEP não encontrado!', icon: 'warning', confirmButtonColor: '#A31621' });
                return;
            }
            document.getElementById('rua').value    = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro     || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf         || '';
            document.getElementById('uf').value     = data.uf         || '';
        } catch {
            campos.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            Swal.fire({ title: 'Erro ao consultar CEP', text: 'Tente novamente mais tarde.', icon: 'error', confirmButtonColor: '#A31621' });
        }
    });

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
