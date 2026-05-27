document.addEventListener('DOMContentLoaded', function () {
    let btn = document.getElementById('btnAlterar');
    btn.addEventListener('click', alterarProduto);

    let inputFile = document.getElementById('img');
    inputFile.addEventListener('change', adicionarImagem);
});

function adicionarImagem() {
    let arq = this.files[0];
    if (!arq) return;
    let ext = arq.type.split('/')[1];
    if (ext === 'jpeg' || ext === 'jpg' || ext === 'png' || ext === 'webp') {
        let url = URL.createObjectURL(arq);
        document.getElementById('previaImg').src = url;
        document.getElementById('divPrevia').style.display = 'block';
    } else {
        Swal.fire({
            title: 'Formato inválido!',
            text: 'Selecione uma imagem válida (JPG, PNG ou WebP).',
            icon: 'warning',
            confirmButtonColor: '#A31621'
        });
        document.getElementById('img').value = '';
    }
}

function alterarProduto() {
    const inputId        = document.getElementById('id');
    const inputNome      = document.getElementById('nome');
    const inputDescricao = document.getElementById('descricao');
    const inputPreco     = document.getElementById('preco');
    const inputQuantidade= document.getElementById('quantidade');
    const inputMarca     = document.getElementById('marca');
    const selectCategoria= document.getElementById('categoria');
    const selectFornecedor=document.getElementById('fornecedor');
    const inputImg       = document.getElementById('img');

    const campos = ['nome', 'descricao', 'preco', 'quantidade', 'marca', 'categoria', 'fornecedor'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.borderColor = '#ced4da';
    });

    let listaValidacao = [];
    if (!inputNome.value.trim())                                                              listaValidacao.push('nome');
    if (!inputDescricao.value.trim())                                                         listaValidacao.push('descricao');
    if (!inputPreco.value.trim() || isNaN(parseFloat(inputPreco.value)) || parseFloat(inputPreco.value) <= 0)   listaValidacao.push('preco');
    if (!inputQuantidade.value.trim() || isNaN(parseInt(inputQuantidade.value)) || parseInt(inputQuantidade.value) < 0) listaValidacao.push('quantidade');
    if (!inputMarca.value.trim())                                                             listaValidacao.push('marca');
    if (!selectCategoria.value)                                                               listaValidacao.push('categoria');
    if (!selectFornecedor.value)                                                              listaValidacao.push('fornecedor');

    if (listaValidacao.length > 0) {
        listaValidacao.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.borderColor = 'red';
        });
        Swal.fire({
            title: 'Campos obrigatórios',
            text: 'Preencha todos os campos destacados.',
            icon: 'warning',
            confirmButtonColor: '#A31621'
        });
        return;
    }

    let formData = new FormData();
    formData.append('id', inputId.value);
    formData.append('nome', inputNome.value);
    formData.append('descricao', inputDescricao.value);
    formData.append('preco', inputPreco.value);
    formData.append('quantidade', inputQuantidade.value);
    formData.append('marca', inputMarca.value);
    formData.append('categoria', selectCategoria.value);
    formData.append('fornecedor', selectFornecedor.value);
    if (inputImg.files[0]) {
        formData.append('img', inputImg.files[0]);
    }

    fetch('/admin/produtos/alterar', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            Swal.fire({
                title: 'Atualizado!',
                text: data.msg,
                icon: 'success',
                confirmButtonColor: '#A31621',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => window.location.href = '/admin/produtos/listar');
        } else {
            Swal.fire({ title: 'Erro!', text: data.msg || 'Erro ao alterar produto.', icon: 'error', confirmButtonColor: '#A31621' });
        }
    })
    .catch(() => {
        Swal.fire({ title: 'Erro!', text: 'Erro ao alterar o produto.', icon: 'error', confirmButtonColor: '#A31621' });
    });
}
