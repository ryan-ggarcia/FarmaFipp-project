document.addEventListener("DOMContentLoaded", function(){
    const btn = document.getElementById("btnAdd");

    if (!btn) return;

    btn.addEventListener("click", adicionarEstoque);

    function adicionarEstoque(){
        const loteIdEl = document.getElementById("loteId");
        const quantidadeEl = document.getElementById("quantidade");
        const loteId = loteIdEl.value;
        const quantidade = quantidadeEl.value;
        let listaValidacao = [];

        loteIdEl.style.borderColor = "#ced4da";
        quantidadeEl.style.borderColor = "#ced4da";

        if(!loteId.trim()){
            listaValidacao.push("loteId");
        }
        if(!quantidade.trim() || isNaN(parseInt(quantidade)) || parseInt(quantidade) <= 0){
            listaValidacao.push("quantidade");
        }

        if(listaValidacao.length === 0){
            fetch("/estoque/adicionar", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    loteId,
                    quantidade
                })
            })
            .then(res =>{
                return res.json();
            })
            .then(data =>{
                alert(data.msg);
                if(data.ok){
                    window.location.href = "/estoque/gerenciar";
                }
            })
            .catch(e =>{
                console.log(e);
                alert("Erro ao adicionar estoque!");
            });
        }
        else{
            alert("Preencha os dados corretamente!");  
            for (let i = 0; i < listaValidacao.length; i++) {
                let campo = document.getElementById(listaValidacao[i]);
                if (campo) campo.style.borderColor = "red";
            }
        }
    }
})