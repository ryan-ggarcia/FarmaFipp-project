document.addEventListener('DOMContentLoaded', function () {

    const tratarAcaoSolicitacao = (url, id, tituloSucesso) => {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                Swal.fire({
                    title: tituloSucesso,
                    text: data.msg,
                    icon: 'success',
                    confirmButtonColor: '#A31621',
                    timer: 1800,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => window.location.reload());
            } else {
                Swal.fire({ title: 'Erro!', text: data.msg, icon: 'error', confirmButtonColor: '#A31621' });
            }
        })
        .catch(() => {
            Swal.fire({ title: 'Erro!', text: 'Erro ao atualizar a solicitação.', icon: 'error', confirmButtonColor: '#A31621' });
        });
    };

    /* ── Busca na tabela ── */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            document.querySelectorAll('.servico-row').forEach(row => {
                const tipo        = row.cells[1]?.textContent.toLowerCase() || '';
                const status      = row.cells[3]?.textContent.toLowerCase() || '';
                const funcionario = row.cells[6]?.textContent.toLowerCase() || '';
                const cliente     = row.cells[7]?.textContent.toLowerCase() || '';
                const obs         = row.cells[8]?.textContent.toLowerCase() || '';
                const match = !term ||
                    tipo.includes(term) ||
                    status.includes(term) ||
                    funcionario.includes(term) ||
                    cliente.includes(term) ||
                    obs.includes(term);
                row.style.display = match ? '' : 'none';
            });
        });
    }

    /* ── Exclusão ── */
    document.querySelectorAll('.btnExcluir').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            Swal.fire({
                title: 'Excluir serviço?',
                text: 'Esta ação não poderá ser desfeita.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#A31621',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    fetch('/admin/servicos/deletar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok) {
                            Swal.fire({
                                title: 'Excluído!',
                                text: data.msg,
                                icon: 'success',
                                confirmButtonColor: '#A31621',
                                timer: 1800,
                                timerProgressBar: true,
                                showConfirmButton: false
                            }).then(() => window.location.reload());
                        } else {
                            Swal.fire({ title: 'Erro!', text: data.msg, icon: 'error', confirmButtonColor: '#A31621' });
                        }
                    })
                    .catch(() => {
                        Swal.fire({ title: 'Erro!', text: 'Erro ao excluir serviço.', icon: 'error', confirmButtonColor: '#A31621' });
                    });
                }
            });
        });
    });

    /* ── Aprovação/Reprovação de solicitações de cliente ── */
    document.querySelectorAll('.btnAprovarSolicitacao').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;

            Swal.fire({
                title: 'Aprovar solicitação?',
                text: 'O cliente verá o serviço como aprovado.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Aprovar',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    tratarAcaoSolicitacao('/admin/servicos/solicitacoes/aprovar', id, 'Solicitação aprovada!');
                }
            });
        });
    });

    document.querySelectorAll('.btnReprovarSolicitacao').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;

            Swal.fire({
                title: 'Não aprovar solicitação?',
                text: 'A solicitação será marcada como não aprovada.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#A31621',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    tratarAcaoSolicitacao('/admin/servicos/solicitacoes/reprovar', id, 'Solicitação atualizada!');
                }
            });
        });
    });

});
