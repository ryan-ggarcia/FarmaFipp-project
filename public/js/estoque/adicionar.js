document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('btnAdd');
    if (!btn) return;

    btn.addEventListener('click', adicionarEstoque);

    function adicionarEstoque() {
        const loteIdEl    = document.getElementById('loteId');
        const quantidadeEl= document.getElementById('quantidade');
        const loteId      = loteIdEl.value;
        const quantidade  = quantidadeEl.value;

        loteIdEl.style.borderColor    = '#ced4da';
        quantidadeEl.style.borderColor= '#ced4da';

        let listaValidacao = [];
        if (!loteId.trim()) listaValidacao.push('loteId');
        if (!quantidade.trim() || isNaN(parseInt(quantidade)) || parseInt(quantidade) <= 0) listaValidacao.push('quantidade');

        if (listaValidacao.length > 0) {
            listaValidacao.forEach(id => {
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

        fetch('/admin/estoque/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loteId, quantidade })
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                Swal.fire({
                    title: 'Estoque atualizado!',
                    text: data.msg,
                    icon: 'success',
                    confirmButtonColor: '#A31621',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => window.location.href = '/admin/estoque/gerenciar');
            } else {
                Swal.fire({ title: 'Erro!', text: data.msg, icon: 'error', confirmButtonColor: '#A31621' });
            }
        })
        .catch(() => {
            Swal.fire({ title: 'Erro!', text: 'Erro ao adicionar estoque.', icon: 'error', confirmButtonColor: '#A31621' });
        });
    }
});
