document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");

    btn.addEventListener("click", cadastrar)

    function cadastrar(){
        //inputs de cliente
        let inputNome = document.getElementById("nome").value;
        let inputCpf = document.getElementById("cpf").value;
        let inputNascimento = document.getElementById("data").value;
        let inputTelefone = document.getElementById("telefone").value;
        let inputEmail = document.getElementById("email").value;
        let inputSenha = document.getElementById("senha").value;
        //inputs de endereço
        let inputRua = document.getElementById("rua").value;
        let inputNum = document.getElementById("num").value;
        let inputBairro = document.getElementById("bairro").value;
        let inputCidade = document.getElementById("cidade").value;
        let inputEstado = document.getElementById("estado").value;
        let inputCep = document.getElementById("cep").value;
        let inputUf = document.getElementById("uf").value;

        let listaValidacao = []

        if(inputNome == "")
            listaValidacao.push("nome");
        if(inputCpf == "")
            listaValidacao.push("cpf");
        if(inputNascimento == "")
            listaValidacao.push("data de nascimento");
        if(inputTelefone == "")
            listaValidacao.push("telefone");
        if(inputEmail == "" || !inputEmail.includes("@")) 
            listaValidacao.push("email");
        if(inputSenha == "")
            listaValidacao.push("senha");
        if(inputRua == "")
            listaValidacao.push("rua");
        if(inputNum == "")
            listaValidacao.push("número");
        if(inputBairro == "")
            listaValidacao.push("bairro");
        if(inputCidade == "")
            listaValidacao.push("cidade");
        if(inputEstado == "")
            listaValidacao.push("estado");
        if(inputCep == "")
            listaValidacao.push("cep");
        if(inputUf == "")
            listaValidacao.push("uf");


        if(listaValidacao.length == 0){
            fetch("/clientes/cadastrar", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: inputNome,
                    cpf: inputCpf,
                    data: inputNascimento,
                    telefone: inputTelefone,
                    email: inputEmail,
                    senha: inputSenha,
                    rua: inputRua,
                    numero: inputNum,
                    bairro: inputBairro,
                    cidade: inputCidade,
                    estado: inputEstado,
                    cep: inputCep,
                    uf: inputUf
                })
            })
            .then(res=>{
                return res.json();
            })
            .then(dados=>{
                alert(dados.msg)
                if(dados.ok)
                    window.location.href = "/"
            })
        }
        else{
            alert("Preencha os seguintes campos: " + listaValidacao.join(", "))
        }
    }
})