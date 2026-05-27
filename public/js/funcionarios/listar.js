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
                /* oculta também a linha de detalhes ao filtrar */
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
            const id   = this.dataset.id;
            const linha = document.getElementById('detalhes-' + id);
            if (!linha) return;
            linha.style.display = (linha.style.display === 'none') ? 'table-row' : 'none';
        });
    });

    /* ── Exclusão ── */
    document.querySelectorAll('.btnExcluir').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            if (confirm("Deseja realmente excluir este funcionário?")) {
                fetch("/funcionarios/excluir", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                })
                .then(r => r.json())
                .then(dados => {
                    alert(dados.msg);
                    if (dados.ok) {
                        window.location.reload();
                    }
                });
            }
        });
    });

});
