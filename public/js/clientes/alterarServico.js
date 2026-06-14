document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnAlterar");

    if(!btn){
        return;
    }

    btn.addEventListener("click", alterarServico);

    function obterIdServico(){
        const inputId = document.getElementById("servId");
        if(inputId && inputId.value){
            return inputId.value;
        }

        const partesPath = window.location.pathname.split("/").filter(Boolean);
        return partesPath[partesPath.length - 1] || "";
    }

    function alterarServico(){
        let id = obterIdServico();
        let hora = document.getElementById("hora").value;
        let data = document.getElementById("data").value;
        let tipo = document.getElementById("tipo").value;
        let obs = document.getElementById("obs").value;
        let erros = [];

        if(!id){
            erros.push("Não foi possível identificar o serviço para alteração.");
        }

        if(!hora || !data || !tipo){
            erros.push("Preencha todos os campos obrigatórios!");
        }

        if(erros.length == 0){
            fetch(`/servicos/alterar/${id}`,{
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
                    alert("Serviço alterado com sucesso!");
                    window.location.href = "/servicos/listar";
                } else {
                    alert("Erro ao alterar serviço: " + dados.msg);
                }
            })
        }
    }
})