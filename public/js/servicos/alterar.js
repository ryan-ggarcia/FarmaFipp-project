document.addEventListener("DOMContentLoaded", function() {

    let btn = document.getElementById("btnAlterar");

    btn.addEventListener("click", gravar);

    function gravar() {
        let inputId = document.getElementById("id");
        let inputData = document.getElementById("data");
        inputData.style.borderColor = "#ced4da";
        let inputTipo = document.getElementById("tipo");
        inputTipo.style.borderColor = "#ced4da";
        let inputHora = document.getElementById("hora");
        inputHora.style.borderColor = "#ced4da";
        let inputPreco = document.getElementById("preco");
        inputPreco.style.borderColor = "#ced4da";
        let cbStatus = document.getElementById("status");
        let inputObs = document.getElementById("obs");
        inputObs.style.borderColor = "#ced4da";
        let inputFunc = document.getElementById("func");
        inputFunc.style.borderColor = "#ced4da";
        let inputClie = document.getElementById("clie");
        inputClie.style.borderColor = "#ced4da";

        //validação dos campos
        let listaValidacao = [];
        if(inputId.value == "")
            listaValidacao.push("id");
        if(inputData.value == "")
            listaValidacao.push("data");
        if(inputTipo.value == "0")
            listaValidacao.push("tipo");
        if(inputHora.value == "")
            listaValidacao.push("hora");
        if(inputPreco.value == "")
            listaValidacao.push("preco");
        if(cbStatus.value == "0")
            listaValidacao.push("status");
        if(inputObs.value == "")
            listaValidacao.push("obs");
        if(inputFunc.value == "0")
            listaValidacao.push("func");
        if(inputClie.value == "0")
            listaValidacao.push("clie");

        const precoNum = Number(String(inputPreco.value || '').replace(',', '.'));
        const horaValida = /^([01]\d|2[0-3]):([0-5]\d)$/.test(inputHora.value);

        if (!horaValida) {
            inputHora.style.borderColor = 'red';
            Swal.fire({icon:'warning', title:'Atenção', text:'Informe uma hora válida entre 00:00 e 23:59.'});
            return;
        }

        if (Number.isNaN(precoNum) || precoNum < 0) {
            inputPreco.style.borderColor = 'red';
            Swal.fire({icon:'warning', title:'Atenção', text:'Informe um preço válido (não negativo).'});
            return;
        }
    
        if(listaValidacao.length == 0) {
            fetch("/admin/servicos/alterar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: inputId.value,
                    data: inputData.value,
                    hora: inputHora.value,
                    preco: precoNum,
                    status: cbStatus.value,
                    obs: inputObs.value,
                    tipo: inputTipo.value,
                    func: inputFunc.value,
                    clie: inputClie.value
                })
            })
            .then(function(resposta) {
                return resposta.json();
            })
            .then(function(corpo) {
                if(corpo.ok) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Sucesso',
                      text: corpo.msg,
                      timer: 1500,
                      showConfirmButton: false
                    }).then(()=>{
                                            window.location.href = "/admin/servicos";
                    });
                }
                else {
                    Swal.fire({icon:'error', title:'Erro', text: corpo.msg});
                }


            }) 
        }
        else {
            //exibe a validação através da lista;
            //trocar a cor da borda dos campos
            for(let i =0; i<listaValidacao.length; i++) {
                let campo = document.getElementById(listaValidacao[i]);
                campo.style.borderColor = "red";
            }
            Swal.fire({icon:'warning', title:'Atenção', text: 'Alguns campos não foram preenchidos corretamente, confira!'});
        }
    }
})