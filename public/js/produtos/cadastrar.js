document.addEventListener('DOMContentLoaded', () => {
    const cadastrar = document.getElementById('cadastrar');
    cadastrar.addEventListener('click', cadastrarProduto);

    const img = document.getElementById('img');
    img.addEventListener('change', changeImg);
});

function changeImg() {
    let arquivo = this.files[0];
    if (!arquivo) return;
    let extensao = arquivo.type.split('/')[1];
    if (extensao === 'jpeg' || extensao === 'jpg' || extensao === 'png' || extensao === 'webp') {
        let url = URL.createObjectURL(arquivo);
        document.getElementById('previaImagem').src = url;
        document.getElementById('divPrevia').style.display = 'block';
    } else {
        Swal.fire({
            title: 'Formato inválido!',
            text: 'Selecione uma imagem no formato JPG, PNG ou WebP.',
            icon: 'warning',
            confirmButtonColor: '#A31621'
        });
        document.getElementById('divPrevia').style.display = 'none';
        this.value = '';
    }
}

function cadastrarProduto() {
    const campos = ['nome', 'descricao', 'preco', 'quantidade', 'marca', 'categoria', 'fornecedor'];

    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.borderColor = '#ced4da';
    });

    const nome       = document.getElementById('nome');
    const descricao  = document.getElementById('descricao');
    const preco      = document.getElementById('preco');
    const quantidade = document.getElementById('quantidade');
    const marca      = document.getElementById('marca');
    const categoria  = document.getElementById('categoria');
    const fornecedor = document.getElementById('fornecedor');
    const img        = document.getElementById('img');

    let listaValidacao = [];
    if (!nome.value.trim())                                    listaValidacao.push('nome');
    if (!descricao.value.trim())                               listaValidacao.push('descricao');
    if (!preco.value || parseFloat(preco.value) <= 0)          listaValidacao.push('preco');
    if (!quantidade.value || parseInt(quantidade.value) < 0)   listaValidacao.push('quantidade');
    if (!marca.value.trim())                                   listaValidacao.push('marca');
    if (!categoria.value)                                      listaValidacao.push('categoria');
    if (!fornecedor.value)                                     listaValidacao.push('fornecedor');

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
    formData.append('nome', nome.value.trim());
    formData.append('descricao', descricao.value.trim());
    formData.append('preco', preco.value);
    formData.append('quantidade', quantidade.value);
    formData.append('marca', marca.value.trim());
    formData.append('categoria', categoria.value);
    formData.append('fornecedor', fornecedor.value);
    if (img.files[0]) {
        formData.append('img', img.files[0]);
    }

    fetch('/admin/produtos/cadastrar', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            Swal.fire({
                title: 'Cadastrado!',
                text: data.msg,
                icon: 'success',
                confirmButtonColor: '#A31621',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => window.location.href = '/admin/produtos/listar');
        } else {
            Swal.fire({ title: 'Erro!', text: data.msg, icon: 'error', confirmButtonColor: '#A31621' });
        }
    })
    .catch(() => {
        Swal.fire({ title: 'Erro!', text: 'Erro ao cadastrar o produto.', icon: 'error', confirmButtonColor: '#A31621' });
    });
}
