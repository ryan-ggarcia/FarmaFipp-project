document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelectorAll('.btnExluir');

    btn.addEventListener('click', deletar);

    function deletar(){
        const id = this.dataset.id;
        if(confirm('Tem verteza que deseja excluir esse fornecedor?')){

            fetch('/fornecedores/deletar', {
                method: "POST",
                headers:  {
                    "Content-Type": "application/json"
                },
                body: {
                    id: id
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                alert(data.msg);
                if(data.ok){
                    window.location.reload();
                }
            })
        }
    }
})