document.addEventListener('DOMContentLoaded', () => {
    const cadastrarLote = document.getElementById('cadastrarLote');
    cadastrarLote.addEventListener('click', cadastrarLoteProduto);

    function cadastrarLoteProduto() {
        const nome = document.getElementById('nome');
        nome.style.borderColor = '#ced4da';
        const validade = document.getElementById('validade');
        validade.style.borderColor = '#ced4da';
        const quantidade = document.getElementById('quantidade');
        quantidade.style.borderColor = '#ced4da';
        const produtoVal = $('#produto').val();
        // Remove style update on the hidden select, handled via select2 containers if needed.
        const fornecedor = document.getElementById('fornecedor');
        fornecedor.style.borderColor = '#ced4da';
        
        let listaValidacao = [];
        if (nome.value == '') listaValidacao.push('nome');
        if (validade.value == '') listaValidacao.push('validade');
        if (quantidade.value == '' || quantidade.value < 0) listaValidacao.push('quantidade');
        if (!produtoVal || produtoVal.length === 0) listaValidacao.push('produto');
        if (fornecedor.value == '') listaValidacao.push('fornecedor');
        if(listaValidacao.length == 0) {
            fetch('/produtos/cadastrarLote',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome.value,
                    validade: validade.value,
                    quantidade: quantidade.value,
                    produto: produtoVal,
                    fornecedor: fornecedor.value
                })
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                alert(data.msg);
                if(data.ok) {
                    window.location.href = '/produtos/';
                }
            }).catch(error => {
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

    $(document).ready(function() {
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