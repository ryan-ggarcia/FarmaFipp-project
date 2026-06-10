document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById("btnAgendar");
    if (!btn) return;

    btn.addEventListener("click", agendar);

    // Atualiza o valor exibido conforme o tipo de serviço escolhido
    const selTipo = document.getElementById("tipo");
    const valorServico = document.getElementById("valorServico");
    if (selTipo && valorServico) {
        selTipo.addEventListener("change", function () {
            const opt = selTipo.options[selTipo.selectedIndex];
            const valor = opt ? opt.getAttribute("data-valor") : "";
            valorServico.value = (valor && valor !== "")
                ? "R$ " + Number(valor).toFixed(2).replace(".", ",")
                : "—";
        });
    }

    function agendar() {
        const inputTipo = document.getElementById("tipo");
        const inputFunc = document.getElementById("func");
        const inputData = document.getElementById("data");
        const inputHora = document.getElementById("hora");
        const inputObs = document.getElementById("obs");

        [inputTipo, inputFunc, inputData, inputHora].forEach(el => { el.style.borderColor = "#ced4da"; });

        // Validação dos campos obrigatórios
        const listaValidacao = [];
        if (inputTipo.value === "0" || inputTipo.value === "") listaValidacao.push(inputTipo);
        if (inputFunc.value === "") listaValidacao.push(inputFunc);
        if (inputData.value === "") listaValidacao.push(inputData);
        if (inputHora.value === "") listaValidacao.push(inputHora);

        if (listaValidacao.length > 0) {
            listaValidacao.forEach(el => { el.style.borderColor = "red"; });
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha o tipo de serviço, o profissional, a data e a hora.' });
            return;
        }

        const horaValida = /^([01]\d|2[0-3]):([0-5]\d)$/.test(inputHora.value);
        if (!horaValida) {
            inputHora.style.borderColor = 'red';
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Informe uma hora válida entre 00:00 e 23:59.' });
            return;
        }

        const hoje = new Date().toISOString().split('T')[0];
        if (inputData.value < hoje) {
            inputData.style.borderColor = 'red';
            Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Não é possível agendar em uma data anterior à de hoje.' });
            return;
        }

        fetch("/servicos/agendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: inputTipo.value,
                func: inputFunc.value,
                data: inputData.value,
                hora: inputHora.value,
                obs: inputObs.value
            })
        })
            .then(resposta => resposta.json())
            .then(corpo => {
                if (corpo.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Agendado!',
                        text: corpo.msg,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => { window.location.href = "/"; });
                } else {
                    Swal.fire({ icon: 'error', title: 'Erro', text: corpo.msg });
                }
            })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha na comunicação. Tente novamente.' });
            });
    }
});
