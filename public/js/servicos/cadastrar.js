document.addEventListener("DOMContentLoaded", function () {

    let btn = document.getElementById("btnGravar");

    btn.addEventListener("click", gravar);

    // Preenche o Preço automaticamente com o valor do tipo de serviço selecionado
    let selTipo = document.getElementById("tipo");
    let inputPrecoAuto = document.getElementById("preco");
    if (selTipo && inputPrecoAuto) {
        selTipo.addEventListener("change", function () {
            let opt = selTipo.options[selTipo.selectedIndex];
            let valor = opt ? opt.getAttribute("data-valor") : "";
            if (valor && valor !== "") {
                inputPrecoAuto.value = Number(valor).toFixed(2);
            }
        });
    }

    function gravar() {

        let inputData = document.getElementById("data");
        inputData.style.borderColor = "#ced4da";
        let inputTipo = document.getElementById("tipo");
        inputTipo.style.borderColor = "#ced4da";
        let inputObs = document.getElementById("obs");
        inputObs.style.borderColor = "#ced4da";
        let inputHora = document.getElementById("hora");
        inputHora.style.borderColor = "#ced4da";
        let inputPreco = document.getElementById("preco");
        inputPreco.style.borderColor = "#ced4da";
        let inputFunc = document.getElementById("func");
        inputFunc.style.borderColor = "#ced4da";
        let inputClie = document.getElementById("clie");
        inputClie.style.borderColor = "#ced4da";
        let selectStatus = document.getElementById("status");
        selectStatus.style.borderColor = "#ced4da";

        //validação dos campos
        let listaValidacao = [];
        if (inputData.value == "")
            listaValidacao.push("data");
        if (inputTipo.value == "0")
            listaValidacao.push("tipo");
        if (inputObs.value == "")
            listaValidacao.push("obs");
        if (inputHora.value == "")
            listaValidacao.push("hora");
        if (inputPreco.value == "")
            listaValidacao.push("preco");
        if (inputFunc.value == "")
            listaValidacao.push("func");
        if (inputClie.value == "")
            listaValidacao.push("clie");
        if (selectStatus.value == "0")
            listaValidacao.push("status");

        const precoNum = Number(String(inputPreco.value || '').replace(',', '.'));
        const horaValida = /^([01]\d|2[0-3]):([0-5]\d)$/.test(inputHora.value);

        if (!horaValida) {
            inputHora.style.borderColor = 'red';
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Informe uma hora válida entre 00:00 e 23:59.' });
            return;
        }

        if (Number.isNaN(precoNum) || precoNum < 0) {
            inputPreco.style.borderColor = 'red';
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Informe um preço válido (não negativo).' });
            return;
        }

        if (listaValidacao.length == 0) {
            //segue com o envio dos dados para o backend
            fetch("/admin/servicos/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: inputData.value,
                    hora: inputHora.value,
                    preco: precoNum,
                    status: selectStatus.value,
                    obs: inputObs.value,
                    tipo: inputTipo.value,
                    func: inputFunc.value,
                    clie: inputClie.value
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
                            window.location.href = "/admin/servicos";
                        });
                    }
                    else {
                        Swal.fire({ icon: 'error', title: 'Erro', text: corpo.msg });
                    }


                })
        }
        else {
            //exibe a validação através da lista;
            //trocar a cor da borda dos campos
            for (let i = 0; i < listaValidacao.length; i++) {
                let campo = document.getElementById(listaValidacao[i]);
                campo.style.borderColor = "red";
            }
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Alguns campos não foram preenchidos corretamente, confira!' });
        }
    }
})