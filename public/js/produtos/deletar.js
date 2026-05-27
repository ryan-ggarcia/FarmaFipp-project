document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('.btnExcluir').forEach(btn => {
        btn.addEventListener('click', excluirProduto);
    });

});

function excluirProduto() {
    const id = this.dataset.id;

    Swal.fire({
        title: 'Excluir produto?',
        text: 'Esta ação não poderá ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#A31621',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed && id) {
            fetch('/admin/produtos/excluir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            .then(r => r.json())
            .then(data => {
                if (data.ok) {
                    Swal.fire({
                        title: 'Excluído!',
                        text: data.msg || 'Produto excluído com sucesso.',
                        icon: 'success',
                        confirmButtonColor: '#A31621',
                        timer: 1800,
                        timerProgressBar: true,
                        showConfirmButton: false
                    }).then(() => window.location.reload());
                } else {
                    Swal.fire({ title: 'Erro!', text: data.msg || 'Erro ao excluir produto.', icon: 'error', confirmButtonColor: '#A31621' });
                }
            })
            .catch(() => {
                Swal.fire({ title: 'Erro!', text: 'Erro ao excluir produto.', icon: 'error', confirmButtonColor: '#A31621' });
            });
        }
    });
}
