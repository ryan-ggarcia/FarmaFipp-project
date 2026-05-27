document.addEventListener("DOMContentLoaded", function () {

    /* ── Busca na tabela ── */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            document.querySelectorAll('.funcionario-row').forEach(row => {
                const nome      = row.cells[3]?.textContent.toLowerCase() || '';
                const matricula = row.cells[1]?.textContent.toLowerCase() || '';
                const cargo     = row.cells[2]?.textContent.toLowerCase() || '';
                const telefone  = row.cells[4]?.textContent.toLowerCase() || '';
                const email     = row.cells[5]?.textContent.toLowerCase() || '';
                const cpf       = row.cells[6]?.textContent.toLowerCase() || '';
                const match = !term ||
                    nome.includes(term) || matricula.includes(term) ||
                    cargo.includes(term) || telefone.includes(term) ||
                    email.includes(term) || cpf.includes(term);
                row.style.display = match ? '' : 'none';
                const id = row.querySelector('.btnDetalhes')?.dataset.id;
                if (id) {
                    const det = document.getElementById('detalhes-' + id);
                    if (det) det.style.display = 'none';
                }
            });
        });
    }

    /* ── Toggle de detalhes do endereço ── */
    document.querySelectorAll('.btnDetalhes').forEach(btn => {
        btn.addEventListener('click', function () {
            const id    = this.dataset.id;
            const linha = document.getElementById('detalhes-' + id);
            if (!linha) return;
            linha.style.display = (linha.style.display === 'none') ? 'table-row' : 'none';
        });
    });

    /* ── Exclusão ── */
    document.querySelectorAll('.btnExcluir').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            Swal.fire({
                title: 'Excluir funcionário?',
                text: 'Esta ação não poderá ser desfeita.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#A31621',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    fetch("/admin/funcionarios/excluir", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id })
                    })
                    .then(r => r.json())
                    .then(dados => {
                        if (dados.ok) {
                            Swal.fire({
                                title: 'Excluído!',
                                text: dados.msg,
                                icon: 'success',
                                confirmButtonColor: '#A31621',
                                timer: 1800,
                                timerProgressBar: true,
                                showConfirmButton: false
                            }).then(() => window.location.reload());
                        } else {
                            Swal.fire({ title: 'Erro!', text: dados.msg, icon: 'error', confirmButtonColor: '#A31621' });
                        }
                    });
                }
            });
        });
    });

});
