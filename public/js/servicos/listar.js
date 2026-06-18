document.addEventListener('DOMContentLoaded', function () {

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

    document.querySelectorAll('.btnAceitar').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            Swal.fire({
                title: 'Aceitar serviço?',
                text: 'O serviço será aprovado.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, aceitar!',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    fetch('/admin/servicos/aceitar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok) {
                            Swal.fire({
                                title: 'Aceito!',
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
                        Swal.fire({ title: 'Erro!', text: 'Erro ao aceitar serviço.', icon: 'error', confirmButtonColor: '#A31621' });
                    });
                }
            });
        });
    });

    document.querySelectorAll('.btnCancelar').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            Swal.fire({
                title: 'Cancelar serviço?',
                text: 'O serviço será marcado como não aprovado.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#A31621',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, cancelar!',
                cancelButtonText: 'Voltar'
            }).then(result => {
                if (result.isConfirmed) {
                    fetch('/admin/servicos/cancelar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok) {
                            Swal.fire({
                                title: 'Cancelado!',
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
                        Swal.fire({ title: 'Erro!', text: 'Erro ao cancelar serviço.', icon: 'error', confirmButtonColor: '#A31621' });
                    });
                }
            });
        });
    });

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

});
