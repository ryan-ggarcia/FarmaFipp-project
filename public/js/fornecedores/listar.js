document.addEventListener('DOMContentLoaded', () => {

    /* ── Busca na tabela ── */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            document.querySelectorAll('.fornecedor-row').forEach(row => {
                const nome     = row.cells[1]?.textContent.toLowerCase() || '';
                const cnpj     = row.cells[2]?.textContent.toLowerCase() || '';
                const telefone = row.cells[3]?.textContent.toLowerCase() || '';
                const match = !term ||
                    nome.includes(term) || cnpj.includes(term) || telefone.includes(term);
                row.style.display = match ? '' : 'none';
            });
        });
    }

    /* ── Ativar / Desativar ── */
    document.querySelectorAll('.btnToggleStatus').forEach(btn => {
        btn.addEventListener('click', function () {
            const id     = this.dataset.id;
            const status = this.dataset.status;
            const acao   = status === 'ativo' ? 'ativar' : 'desativar';
            const titulo = status === 'ativo' ? 'Ativar fornecedor?' : 'Desativar fornecedor?';
            const texto  = status === 'ativo'
                ? 'O fornecedor voltará a aparecer nos formulários.'
                : 'O fornecedor não aparecerá mais nos formulários de cadastro.';

            Swal.fire({
                title: titulo,
                text: texto,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: status === 'ativo' ? '#16a34a' : '#A31621',
                cancelButtonColor: '#6c757d',
                confirmButtonText: `Sim, ${acao}!`,
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    fetch('/admin/fornecedores/status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, status })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok) {
                            Swal.fire({
                                title: status === 'ativo' ? 'Ativado!' : 'Desativado!',
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
                    });
                }
            });
        });
    });

});
