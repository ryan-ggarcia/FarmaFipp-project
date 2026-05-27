document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('btnBaixa');
    if (!btn) return;

    btn.addEventListener('click', registrarBaixa);

    function marcarErro(campo) {
        if (campo) campo.style.borderColor = 'red';
    }

    function limparErro(campo) {
        if (campo) campo.style.borderColor = '#ced4da';
    }

    function registrarBaixa() {
        const idVendaEl   = document.getElementById('id_venda');
        const loteIdEl    = document.getElementById('loteId');
        const quantidadeEl= document.getElementById('quantidade');

        const id_venda  = idVendaEl    ? idVendaEl.value.trim()    : '';
        const loteId    = loteIdEl     ? loteIdEl.value.trim()     : '';
        const quantidade= quantidadeEl ? quantidadeEl.value.trim() : '';

        limparErro(idVendaEl);
        limparErro(loteIdEl);
        limparErro(quantidadeEl);

        const payload = {};

        if (id_venda) {
            payload.id_venda = id_venda;
        } else {
            if (!loteId) {
                marcarErro(loteIdEl);
                Swal.fire({
                    title: 'Lote obrigatório',
                    text: 'Selecione um lote para baixa manual.',
                    icon: 'warning',
                    confirmButtonColor: '#A31621'
                });
                return;
            }

            const qtd = parseInt(quantidade, 10);
            if (!quantidade || Number.isNaN(qtd) || qtd <= 0) {
                marcarErro(quantidadeEl);
                Swal.fire({
                    title: 'Quantidade inválida',
                    text: 'Informe uma quantidade válida para baixa manual.',
                    icon: 'warning',
                    confirmButtonColor: '#A31621'
                });
                return;
            }

            payload.loteId   = loteId;
            payload.quantidade = qtd;
        }

        fetch('/admin/estoque/baixa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                Swal.fire({
                    title: 'Baixa registrada!',
                    text: data.msg || 'Movimentação processada.',
                    icon: 'success',
                    confirmButtonColor: '#A31621',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => window.location.href = '/admin/estoque/gerenciar');
            } else {
                Swal.fire({ title: 'Erro!', text: data.msg || 'Erro ao registrar baixa.', icon: 'error', confirmButtonColor: '#A31621' });
            }
        })
        .catch(() => {
            Swal.fire({ title: 'Erro!', text: 'Erro ao registrar baixa de estoque.', icon: 'error', confirmButtonColor: '#A31621' });
        });
    }
});
