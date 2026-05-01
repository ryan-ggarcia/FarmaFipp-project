document.addEventListener("DOMContentLoaded", function(){

    var listaBtns = document.querySelectorAll(".btnExcluir");

    for(var i = 0; i < listaBtns.length; i++) {
        listaBtns[i].addEventListener("click", excluirProduto);
    }
    
});

function excluirProduto() {
    let id = this.dataset.id;

    if(confirm("Tem certeza que deseja excluir")) {
        if(id != ""){
            let data = {
                id: id
            };

            fetch("/produtos/excluir", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(function(r){
                return r.json();
            })
            .then(function(r){
                if(r.ok){
                    window.location.reload();
                }
                else{
                    alert("Erro ao excluir produto");
                }
            })
            .catch(function(e){
                console.log(e);
            });
        }
    }
}