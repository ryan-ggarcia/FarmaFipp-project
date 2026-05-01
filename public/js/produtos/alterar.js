document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnAlterar");

    btn.addEventListener("click", alterarProduto);

    let inputFile = document.getElementById("img");

    inputFile.addEventListener("change", adicionarImagem);
})

function adicionarImagem(){
    let arq = this.files[0];
    if(!arq){
        return;
    }
    let ext = arq.type.split("/")[1];
    if(ext == "jpeg" || ext == "jpg" || ext == "png" || ext == "webp"){
        let url = URL.createObjectURL(arq);
        document.getElementById("previaImg").src = url;
        document.getElementById("divPrevia").style.display = "block";
    }
    else{
        alert("Selecione um arquivo de imagem válido (jpeg, jpg, png ou webp).");
        document.getElementById("img").value = "";
    }
}

function alterarProduto(){
    let inputId = document.getElementById("id");
    let inputNome = document.getElementById("nome");
    let inputDescricao = document.getElementById("descricao");
    let inputPreco = document.getElementById("preco");
    let inputQuantidade = document.getElementById("quantidade");
    let inputMarca = document.getElementById("marca");
    let selectCategoria = document.getElementById("categoria");
    let selectFornecedor = document.getElementById("fornecedor");
    let inputImg = document.getElementById("img");
    let listaValidacao = []

    if(!inputNome.value.trim()){
        listaValidacao.push("O campo nome é obrigatório.");
    }
    if(!inputDescricao.value.trim()){
        listaValidacao.push("O campo descrição é obrigatório.");
    }
    if(!inputPreco.value.trim() || isNaN(parseFloat(inputPreco.value)) || parseFloat(inputPreco.value) <= 0){
        listaValidacao.push("O campo preço é obrigatório e deve ser um número maior que zero.");
    }
    if(!inputQuantidade.value.trim() || isNaN(parseInt(inputQuantidade.value)) || parseInt(inputQuantidade.value) < 0){
        listaValidacao.push("O campo quantidade é obrigatório e deve ser um número inteiro maior ou igual a zero.");
    }
    if(!inputMarca.value.trim()){
        listaValidacao.push("O campo marca é obrigatório.");
    }
    if(!selectCategoria.value){
        listaValidacao.push("O campo categoria é obrigatório.");
    }
    if(!selectFornecedor.value){
        listaValidacao.push("O campo fornecedor é obrigatório.");
    }

    let formData = new FormData();
    formData.append("id", inputId.value);
    formData.append("nome", inputNome.value);
    formData.append("descricao", inputDescricao.value);
    formData.append("preco", inputPreco.value);
    formData.append("quantidade", inputQuantidade.value);
    formData.append("marca", inputMarca.value);
    formData.append("categoria", selectCategoria.value);
    formData.append("fornecedor", selectFornecedor.value);
    if(inputImg.files[0]){
        formData.append("img", inputImg.files[0]);
    }

    fetch("/produtos/alterar",{
        method: "POST",
        body: formData
    })
    .then(res =>{
        return res.json();
    })
    .then(data =>{
        if(data.ok){
            alert(data.msg);
            window.location.href = "/produtos";
        }
    })
    .catch(err =>{
        console.error("Erro ao alterar o produto:", err);
        alert("Ocorreu um erro ao alterar o produto. Por favor, tente novamente.");
    })
}