document.addEventListener("DOMContentLoaded", function() {
  
    let btn = document.getElementById("btnGravar");

    btn.addEventListener("click", gravar);

    console.log(document.getElementById("btnGravar"));

    function gravar() {
        
        let inputData = document.getElementById("data");
        inputData.style.borderColor = "#ced4da";
        let inputTipo = document.getElementById("tipo");
        inputTipo.style.borderColor = "#ced4da";
        let cbStatus = document.getElementById("status");
        let inputDesc = document.getElementById("desc");
        inputDesc.style.borderColor = "#ced4da";

        //validação dos campos
        let listaValidacao = [];
        if(inputData.value == "")
            listaValidacao.push("data");
        if(inputTipo.value == "")
            listaValidacao.push("tipo");
        if(inputDesc.value == "")
            listaValidacao.push("desc");
    
        if(listaValidacao.length == 0) {
            //segue com o envio dos dados para o backend
            fetch("/servicos/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: inputData.value,
                    tipo: inputTipo.value,
                    descricao: inputDesc.value,
                    status: cbStatus.checked
                })
            })
            .then(function(resposta) {
                return resposta.json();
            })
            .then(function(corpo) {
                if(corpo.ok) {
                    alert(corpo.msg);
                    //redireciona
                    window.location.href = "/servicos";
                }
                else {
                    alert(corpo.msg);
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
            alert("Alguns campos não foram preenchidos corretamente, confira!");
        }
    }
})