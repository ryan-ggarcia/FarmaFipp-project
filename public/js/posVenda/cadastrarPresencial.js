document.addEventListener("DOMContentLoaded", function () {

    let btn = document.getElementById("btnGravar");
    btn.addEventListener("click", gravar);

    // Inicializar Select2 no campo de produto (se disponível)
    if (typeof $ !== 'undefined' && $.fn.select2) {
        $('.select2-produto').select2({
            placeholder: '--Selecione--',
            allowClear: true
        });
    }

    function gravar() {
        let inputTipo = document.getElementById("tipo");
        inputTipo.style.borderColor = "#ced4da";
        let inputCliente = document.getElementById("clienteId");
        inputCliente.style.borderColor = "#ced4da";
        let inputDataCompra = document.getElementById("dataCompra");
        inputDataCompra.style.borderColor = "#ced4da";
        let inputProduto = document.getElementById("produtoId");
        inputProduto.style.borderColor = "#ced4da";
        let inputQuantidade = document.getElementById("quantidade");
        inputQuantidade.style.borderColor = "#ced4da";
        let inputMotivo = document.getElementById("motivo");
        inputMotivo.style.borderColor = "#ced4da";

        // Validação dos campos obrigatórios
        let listaValidacao = [];
        if (inputTipo.value === "") listaValidacao.push("tipo");
        if (inputCliente.value === "") listaValidacao.push("clienteId");
        if (inputDataCompra.value === "") listaValidacao.push("dataCompra");
        if (inputProduto.value === "") listaValidacao.push("produtoId");
        if (inputQuantidade.value === "" || inputQuantidade.value <= 0) listaValidacao.push("quantidade");
        if (inputMotivo.value === "") listaValidacao.push("motivo");

        if (listaValidacao.length === 0) {
            let observacao = document.getElementById("observacao").value;

            fetch("/admin/pos-venda/presencial", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tipo: inputTipo.value,
                    clienteId: inputCliente.value,
                    dataCompra: inputDataCompra.value,
                    produtoId: inputProduto.value,
                    quantidade: inputQuantidade.value,
                    motivo: inputMotivo.value,
                    observacao: observacao
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
                        window.location.href = "/admin/pos-venda";
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Erro', text: corpo.msg });
                }
            });
        } else {
            for (let i = 0; i < listaValidacao.length; i++) {
                let campo = document.getElementById(listaValidacao[i]);
                campo.style.borderColor = "red";
            }
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Alguns campos não foram preenchidos corretamente, confira!' });
        }
    }
});
