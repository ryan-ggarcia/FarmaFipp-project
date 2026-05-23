document.addEventListener("DOMContentLoaded", function () {

    let devolucaoId = document.getElementById("devolucaoId");
    if (!devolucaoId) return;

    let btnAprovar = document.getElementById("btnAprovar");
    let btnRecusar = document.getElementById("btnRecusar");

    if (btnAprovar) {
        btnAprovar.addEventListener("click", function () {
            atualizarStatus("Aprovado", "Aprovar esta solicitação?");
        });
    }

    if (btnRecusar) {
        btnRecusar.addEventListener("click", function () {
            atualizarStatus("Nao Aprovado", "Recusar esta solicitação?");
        });
    }

    function atualizarStatus(novoStatus, mensagem) {
        Swal.fire({
            title: 'Confirmação',
            text: mensagem,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, confirmar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/pos-venda/status", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: devolucaoId.value,
                        status: novoStatus,
                        observacao: ""
                    })
                })
                .then(function (resposta) {
                    return resposta.json();
                })
                .then(function (corpo) {
                    if (corpo.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucesso',
                            text: corpo.msg,
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = "/pos-venda";
                        });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Erro', text: corpo.msg });
                    }
                });
            }
        });
    }
});
