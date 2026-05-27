document.addEventListener('DOMContentLoaded', () => {
    const cadastrarLote = document.getElementById('cadastrarLote');
    cadastrarLote.addEventListener('click', cadastrarLoteProduto);

    function cadastrarLoteProduto() {
        const nome      = document.getElementById('nome');
        const validade  = document.getElementById('validade');
        const quantidade= document.getElementById('quantidade');
        const fornecedor= document.getElementById('fornecedor');
        const produtoVal= $('#produto').val();

        [nome, validade, quantidade, fornecedor].forEach(el => {
            if (el) el.style.borderColor = '#ced4da';
        });

        let listaValidacao = [];
        if (!nome.value)                                  listaValidacao.push('nome');
        if (!validade.value)                              listaValidacao.push('validade');
        if (!quantidade.value || quantidade.value < 0)   listaValidacao.push('quantidade');
        if (!produtoVal || produtoVal.length === 0)       listaValidacao.push('produto');
        if (!fornecedor.value)                            listaValidacao.push('fornecedor');

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

        fetch('/admin/produtos/cadastrarLote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome.value,
                validade: validade.value,
                quantidade: quantidade.value,
                produto: produtoVal,
                fornecedor: fornecedor.value
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                Swal.fire({
                    title: 'Lote cadastrado!',
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
            Swal.fire({ title: 'Erro!', text: 'Erro ao cadastrar lote.', icon: 'error', confirmButtonColor: '#A31621' });
        });
    }

    $(document).ready(function () {
        $('#produto').select2({
            placeholder: 'Selecione um produto',
            width: '100%'
        });
        $('#fornecedor').select2({
            placeholder: 'Selecione um fornecedor',
            width: '100%'
        });
    });
});
