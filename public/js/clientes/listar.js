document.addEventListener("DOMContentLoaded", function () {

    /* ── Busca na tabela ── */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            document.querySelectorAll('.cliente-row').forEach(row => {
                const nome     = row.cells[1]?.textContent.toLowerCase() || '';
                const cpf      = row.cells[3]?.textContent.toLowerCase() || '';
                const email    = row.cells[4]?.textContent.toLowerCase() || '';
                const telefone = row.cells[5]?.textContent.toLowerCase() || '';
                const match = !term ||
                    nome.includes(term) || cpf.includes(term) ||
                    email.includes(term) || telefone.includes(term);
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
            if (confirm("Deseja realmente excluir este cliente?")) {
                fetch("/clientes/deletar", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                })
                .then(r => r.json())
                .then(dados => {
                    if (dados.ok) {
                        alert(dados.msg);
                        window.location.reload();
                    }
                });
            }
        });
    });

});
