document.addEventListener("DOMContentLoaded", function() {

    let btns = document.querySelectorAll(".btnExcluir");
    for(let i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", excluir);
    }

    function excluir() {
        let id = this.dataset.id;
        if(confirm("Tem certeza que deseja excluir o serviço?")) {

            fetch("/servicos/deletar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id
                })
            })
            .then(function(resposta) {
                return resposta.json();
            })
            .then(function(corpo) {
                alert(corpo.msg);
                if(corpo.ok) {
                    window.location.reload();
                }
            })
        }
    }
})