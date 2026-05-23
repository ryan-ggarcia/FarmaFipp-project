document.addEventListener("DOMContentLoaded", function () {

    let btn = document.getElementById("btnEnviar");
    btn.addEventListener("click", enviar);

    function enviar() {
        let inputTipo = document.getElementById("tipo");
        inputTipo.style.borderColor = "#ced4da";
        let inputDataCompra = document.getElementById("dataCompra");
        inputDataCompra.style.borderColor = "#ced4da";
        let inputProduto = document.getElementById("produtoId");
        inputProduto.style.borderColor = "#ced4da";
        let inputQuantidade = document.getElementById("quantidade");
        inputQuantidade.style.borderColor = "#ced4da";
        let inputNome = document.getElementById("nomeCliente");
        inputNome.style.borderColor = "#ced4da";
        let inputContato = document.getElementById("contato");
        inputContato.style.borderColor = "#ced4da";
        let inputMotivo = document.getElementById("motivo");
        inputMotivo.style.borderColor = "#ced4da";

        // Validação dos campos obrigatórios
        let listaValidacao = [];
        if (inputTipo.value === "") listaValidacao.push("tipo");
        if (inputDataCompra.value === "") listaValidacao.push("dataCompra");
        if (inputProduto.value === "") listaValidacao.push("produtoId");
        if (inputQuantidade.value === "" || inputQuantidade.value <= 0) listaValidacao.push("quantidade");
        if (inputNome.value.trim() === "") listaValidacao.push("nomeCliente");
        if (inputContato.value.trim() === "") listaValidacao.push("contato");
        if (inputMotivo.value.trim() === "") listaValidacao.push("motivo");

        // Validação da data da compra
        if (inputDataCompra.value !== "") {
            let dataCompra = new Date(inputDataCompra.value);
            let hoje = new Date();
            let diffDias = Math.floor((hoje - dataCompra) / (1000 * 60 * 60 * 24));

            if (diffDias < 0) {
                Swal.fire({ icon: 'warning', title: 'Atenção', text: 'A data da compra não pode ser uma data futura!' });
                inputDataCompra.style.borderColor = "red";
                return;
            }

            if (diffDias > 30) {
                Swal.fire({ icon: 'warning', title: 'Atenção', text: 'O prazo de devolução é de no máximo 30 dias após a compra.' });
                inputDataCompra.style.borderColor = "red";
                return;
            }
        }

        if (listaValidacao.length === 0) {
            fetch("/pos-venda/online", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tipo: inputTipo.value,
                    produtoId: inputProduto.value,
                    dataCompra: inputDataCompra.value,
                    quantidade: inputQuantidade.value,
                    motivo: inputMotivo.value,
                    nomeCliente: inputNome.value,
                    contato: inputContato.value
                })
            })
            .then(function (resposta) {
                return resposta.json();
            })
            .then(function (corpo) {
                if (corpo.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Solicitação Enviada!',
                        text: corpo.msg,
                        confirmButtonColor: '#3085d6'
                    }).then(() => {
                        // Limpar formulário após envio
                        document.getElementById("formOnline").reset();
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
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha todos os campos obrigatórios!' });
        }
    }
});
