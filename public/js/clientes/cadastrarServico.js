document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");

    btn.addEventListener("click", cadastrarServico);

    function cadastrarServico(){
        let hora = document.getElementById("hora").value;
        let data = document.getElementById("data").value;
        let tipo = document.getElementById("tipo").value;
        let obs = document.getElementById("obs").value;
        let erros = [];

        if(!hora || !data || !tipo){
            erros.push("Preencha todos os campos obrigatórios!");
        }

        if(erros.length == 0){
            fetch("/servicos/cadastrar",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    hora: hora,
                    data: data,
                    tipo: tipo,
                    obs: obs
                })
            })
            .then(res =>{
                return res.json();
            })
            .then(dados =>{
                if(dados.ok){
                    alert("Serviço cadastrado com sucesso!");
                } else {
                    alert("Erro ao cadastrar serviço: " + dados.msg);
                }
            })
        }
    }
})