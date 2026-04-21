document.addEventListener('DOMContentLoaded', () => {
    const cadastrar = document.getElementById('cadastrar');

    cadastrar.addEventListener('click', cadastrarProduto);

    const img = document.getElementById('img');
    img.addEventListener('change', changeImg);
});

function changeImg() {
    let arquivo = this.files[0];
    let extensao = arquivo.type.split('/')[1];
    if (extensao == 'jpeg' || extensao == 'jpg' || extensao == 'png') {
        let url = URL.createObjectURL(arquivo);
        document.getElementById("previaImagem").src = url;
        document.getElementById("divPrevia").style.display = "block";
    }else{
        alert("Imagem com formato inválido! Selecione JPG ou PNG");
        document.getElementById("divPrevia").style.display = "none";
    }
}

function cadastrarProduto() {
        const nome = document.getElementById('nome');
        nome.style.borderColor = '#ced4da';
        const descricao = document.getElementById('descricao');
        descricao.style.borderColor = '#ced4da';
        const validade = document.getElementById('validade');
        validade.style.borderColor = '#ced4da';
        const preco = document.getElementById('preco');
        preco.style.borderColor = '#ced4da';
        const quantidade = document.getElementById('quantidade');
        quantidade.style.borderColor = '#ced4da';
        const marca = document.getElementById('marca');
        marca.style.borderColor = '#ced4da';
        const categoria = document.getElementById('categoria');
        categoria.style.borderColor = '#ced4da';
        const fornecedor = document.getElementById('fornecedor');
        fornecedor.style.borderColor = '#ced4da';
        const img = document.getElementById('img');
        img.style.borderColor = '#ced4da';

        let listaValidacao = [];

        if (nome.value == '') listaValidacao.push('nome');
        if (descricao.value == '') listaValidacao.push('descrição');
        if (validade.value == '') listaValidacao.push('validade');
        if (preco.value == '' || preco.value <= 0) listaValidacao.push('preço');
        if (quantidade.value == '' || quantidade.value < 0) listaValidacao.push('quantidade');
        if (categoria.value == '') listaValidacao.push('categoria');
        if (fornecedor.value == '') listaValidacao.push('fornecedor');

        let formData = new FormData();
        formData.append('nome', nome.value);
        formData.append('descricao', descricao.value);
        formData.append('validade', validade.value);
        formData.append('preco', preco.value);
        formData.append('quantidade', quantidade.value);
        formData.append('marca', marca.value);
        formData.append('categoria', categoria.value);
        formData.append('fornecedor', fornecedor.value);
        formData.append('img', img.files[0]);

        if(listaValidacao.length == 0) {
            fetch('/produtos/cadastrar', {
                method: 'POST',
                body: formData
            }).then(response => {
                return response.json();
            }).then(data => {
                alert(data.msg);
            }). catch(error => {
                console.error('Erro:', error);
            });
        }else{
            alert('Preencha os dados corretamente!');
            for (let i = 0; i < listaValidacao.length; i++) {
                let campo = document.getElementById(listaValidacao[i]);
                campo.style.borderColor = 'red';
            }
        }
    }