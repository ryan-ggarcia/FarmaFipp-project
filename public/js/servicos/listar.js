document.addEventListener("DOMContentLoaded", function () {

    /* ── Busca na tabela ── */
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            const rows = document.querySelectorAll('.servico-row');
            rows.forEach(row => {
                const tipo       = row.cells[1]?.textContent.toLowerCase() || '';
                const status     = row.cells[3]?.textContent.toLowerCase() || '';
                const funcionario= row.cells[6]?.textContent.toLowerCase() || '';
                const cliente    = row.cells[7]?.textContent.toLowerCase() || '';
                const obs        = row.cells[8]?.textContent.toLowerCase() || '';
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
    document.querySelectorAll(".btnExcluir").forEach(btn => {
        btn.addEventListener("click", function () {
            const id = this.dataset.id;
            if (confirm("Tem certeza que deseja excluir o serviço?")) {
                fetch("/servicos/deletar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                })
                .then(r => r.json())
                .then(data => {
                    alert(data.msg);
                    if (data.ok) window.location.reload();
                });
            }
        });
    });

});
