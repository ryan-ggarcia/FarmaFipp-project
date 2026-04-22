document.addEventListener('DOMContentLoaded', () => {
    const btns = document.querySelectorAll('.btnExcluir');

    btns.forEach(btn => {
        btn.addEventListener("click", excluir);
    })

    function excluir(){
        const id = this.dataset.id;
        if(confirm('Tem verteza que deseja excluir esse fornecedor?')){

            fetch('/fornecedores/delete', {
                method: "DELETE",
                headers:  {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id
                })
            }).then((response) => {
                return response.json();
            }).then((data) => {
                alert(data.msg);
                if(data.ok){
                    window.location.reload();
                }else{
                    alert("Erro ao excluir fornecedor!");
                }
            })
        }
    }
})