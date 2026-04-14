document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnAlterar");

    btn.addEventListener("click", alterar)

    function alterar(){
        let inputId = document.getElementById("cliId").value;
        let inputNome = document.getElementById("cliNome").value;
        let inputStatus = document.getElementById("cliStatus").value;
        let inputCpf = document.getElementById("cliCpf").value;
        let inputData = document.getElementById("cliNascimento").value;
        let inputTelefone = document.getElementById("cliTelefone").value;
        let inputEmail = document.getElementById("cliEmail").value;
        let inputSenha = document.getElementById("cliSenha").value;
        let listaValidacao = []

        if(inputNome == "")
            listaValidacao.push("cliNome");
        if(inputStatus == "")
            listaValidacao.push("cliStatus");
        if(inputCpf == "")
            listaValidacao.push("cliCpf");
        if(inputData == "")
            listaValidacao.push("cliNascimento");
        if(inputTelefone == "")
            listaValidacao.push("cliTelefone");
        if(inputEmail == "")
            listaValidacao.push("cliEmail");
        if(inputSenha == "")
            listaValidacao.push("cliSenha");

        if(listaValidacao.length == 0){
            fetch("/clientes/alterar",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: inputId,
                    nome: inputNome,
                    cpf: inputCpf,
                    data: inputData,
                    telefone: inputTelefone,
                    email: inputEmail,
                    senha: inputSenha,
                    status: inputStatus
                })
            })
            .then(res=>{
                return res.json();
            })
            .then(dados =>{
                if(dados.ok){
                    alert(dados.msg);
                    window.location.href = "/clientes/listar";
                }
            })
        }
        else{
            return alert("Preencha os campos: " + listaValidacao.join(", "));
        }
    }
})