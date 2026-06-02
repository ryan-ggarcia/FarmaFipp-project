document.addEventListener("DOMContentLoaded", function(){
    let btn = document.querySelectorAll(".btnExcluir");

    btn.forEach(btn =>{
        btn.addEventListener("click", removerServico);
    })

    function removerServico(){
        if(confirm("Deseja cancelar este serviço?")){
            let id = this.dataset.id;

            if(!id){
                alert("Servico invalido para cancelamento.");
                return;
            }

            fetch(`/servicos/cancelar/${id}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"}
            })
            .then(async r => {
                if(!r.ok){
                    throw new Error("Erro ao cancelar o servico.");
                }
                return r.json();
            })
            .then(data => {
                if(data.ok){
                    location.reload();
                } else {
                    alert(data.msg || "Erro ao cancelar o servico.");
                }
            })
            .catch(() => {
                alert("Erro ao cancelar o servico.");
            });
        }
        else{
            alert("Operacao cancelada.");
        }
    }
})