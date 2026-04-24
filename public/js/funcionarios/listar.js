document.addEventListener("DOMContentLoaded", function(){
    let btns = document.querySelectorAll('.btnExcluir');

    btns.forEach(btn =>{
        btn.addEventListener("click", excluir);
    })

    function excluir(){
        let id = this.dataset.id;

        if(confirm("Deseja realmente excluir este funcionário?")){
            fetch("/funcionarios/excluir", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    id: id
                 })
            })
            .then(res =>{
                return res.json();
            })
            .then(dados =>{
                alert(dados.msg);
                if(dados.ok){
                    window.location.reload();
                }
            })
        }
        else{
            alert("Funcionário não excluído");
        }
    }
})