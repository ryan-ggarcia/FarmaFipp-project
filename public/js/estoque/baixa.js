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
        const idVendaEl = document.getElementById('id_venda');
        const loteIdEl = document.getElementById('loteId');
        const quantidadeEl = document.getElementById('quantidade');

        const id_venda = idVendaEl ? idVendaEl.value.trim() : '';
        const loteId = loteIdEl ? loteIdEl.value.trim() : '';
        const quantidade = quantidadeEl ? quantidadeEl.value.trim() : '';

        limparErro(idVendaEl);
        limparErro(loteIdEl);
        limparErro(quantidadeEl);

        const payload = {};

        if (id_venda) {
            payload.id_venda = id_venda;
        } else {
            if (!loteId) {
                marcarErro(loteIdEl);
                alert('Selecione um lote para baixa manual.');
                return;
            }

            const qtd = parseInt(quantidade, 10);
            if (!quantidade || Number.isNaN(qtd) || qtd <= 0) {
                marcarErro(quantidadeEl);
                alert('Informe uma quantidade válida para baixa manual.');
                return;
            }

            payload.loteId = loteId;
            payload.quantidade = qtd;
        }

        fetch('/estoque/baixa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                alert(data.msg || 'Movimentação processada.');
                if (data.ok) {
                    window.location.href = '/estoque/gerenciar';
                }
            })
            .catch(function (error) {
                console.error('Erro ao registrar baixa de estoque:', error);
                alert('Erro ao registrar baixa de estoque!');
            });
    }
});
