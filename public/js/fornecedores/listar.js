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

    /* ── Exclusão ── */
    document.querySelectorAll('.btnExcluir').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                fetch('/fornecedores/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                })
                .then(r => r.json())
                .then(data => {
                    alert(data.msg);
                    if (data.ok) {
                        window.location.reload();
                    }
                });
            }
        });
    });

});
