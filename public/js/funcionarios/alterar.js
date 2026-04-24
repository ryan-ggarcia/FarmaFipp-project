document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnAlterar");

    btn.addEventListener("click", alterar)

    function alterar(){
        let inputId = document.getElementById("funcId").value;
        let inputMatricula = document.getElementById("funcMatricula").value;
        let inputCargo = document.getElementById("funcCargo").value;
        let inputNome = document.getElementById("funcNome").value;
        let inputTelefone = document.getElementById("funcTelefone").value;
        let inputEmail = document.getElementById("funcEmail").value;
        let inputSenha = document.getElementById("funcSenha").value;
        let inputCpf = document.getElementById("funcCpf").value;
        //inputs de endereço
        let inputIdEnd = document.getElementById("endId").value;
        let inputRua = document.getElementById("endRua").value;
        let inputBairro = document.getElementById("endBairro").value;
        let inputCidade = document.getElementById("endCidade").value;
        let inputNum = document.getElementById("endNum").value;
        let inputEstado = document.getElementById("endEstado").value;
        let inputUf = document.getElementById("endUf").value;
        let inputCep = document.getElementById("endCep").value;
        let listaValidacao = []        

        if(inputMatricula == "")
            listaValidacao.push("funcMatricula");
        if(inputCargo == "")
            listaValidacao.push("funcCargo");
        if(inputNome == "")
            listaValidacao.push("funcNome");
        if(inputTelefone == "")
            listaValidacao.push("funcTelefone");
        if(inputEmail == "")
            listaValidacao.push("funcEmail");
        if(inputSenha == "")
            listaValidacao.push("funcSenha");
        if(inputCpf == "")
            listaValidacao.push("funcCpf");
        if(inputRua == "")
            listaValidacao.push("endRua");
        if(inputBairro == "")
            listaValidacao.push("endBairro");
        if(inputCidade == "")
            listaValidacao.push("endCidade");
        if(inputNum == "")
            listaValidacao.push("endNum");
        if(inputEstado == "")
            listaValidacao.push("endEstado");
        if(inputUf == "")
            listaValidacao.push("endUf");
        if(inputCep == "")
            listaValidacao.push("endCep");

        console.log("Dados:", { inputIdEnd });
        console.log("Dados que vou enviar:", { inputId, inputIdEnd, inputRua, inputBairro, inputCidade, inputNum, inputEstado, inputUf, inputCep });


        if(listaValidacao.length == 0){
            fetch("/funcionarios/alterar",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: inputId,
                    matricula: inputMatricula,
                    cargo: inputCargo,
                    nome: inputNome,
                    telefone: inputTelefone,
                    email: inputEmail,
                    senha: inputSenha,
                    cpf: inputCpf,
                    //dados de endereço
                    endId: inputIdEnd,
                    rua: inputRua,
                    bairro: inputBairro,
                    cidade: inputCidade,
                    num: inputNum,
                    estado: inputEstado,
                    uf: inputUf,
                    cep: inputCep
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.msg);
                if(data.ok){
                    window.location.href = "/funcionarios/listar";
                } else {
                    alert("Erro ao alterar funcionário.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
            });
        }
    }
})