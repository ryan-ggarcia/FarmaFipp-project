document.addEventListener("DOMContentLoaded", function(){
    let btns = document.querySelectorAll('.btnExcluir');

    btns.forEach(btn => {
        btn.addEventListener("click", excluir);
    })

    function excluir(){
        let id = this.dataset.id;

        if(confirm("Deseja realmente excluir este cliente?")){
            fetch("/clientes/deletar", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: id
                 })
            })
            .then(res=>{
                return res.json();
            })
            .then(dados =>{
                if(dados.ok){
                    alert(dados.msg);
                    window.location.reload();
                }
            })
        } 
    }
})