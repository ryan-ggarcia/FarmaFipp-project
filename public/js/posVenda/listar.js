document.addEventListener("DOMContentLoaded", function () {

    let btns = document.querySelectorAll(".btnExcluir");
    for (let i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", excluir);
    }

    function excluir() {
        let id = this.dataset.id;

        Swal.fire({
            title: 'Tem certeza?',
            text: 'Deseja excluir esta solicitação de devolução/troca?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/pos-venda/deletar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: id
                    })
                })
                .then(function (resposta) {
                    return resposta.json();
                })
                .then(function (corpo) {
                    if (corpo.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Excluído!',
                            text: corpo.msg,
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Erro', text: corpo.msg });
                    }
                });
            }
        });
    }
});
