document.addEventListener('DOMContentLoaded', () => {
    const adicionarBtn = document.getElementById('adicionar');

    adicionarBtn.addEventListener('click', adicionarProduto);

    function adicionarProduto() {
        let id = dataset.id;
        const lote = document.getElementById('Lote');
        lote.style.borderColor = '#ced4da';
        const validade = document.getElementById('validade');
        validade.style.borderColor = '#ced4da';
        const quantidade = document.getElementById('quantidade');
        quantidade.style.borderColor = '#ced4da';

        const listaValidacao = [];

        if (lote.value == '') listaValidacao.push('lote');
        if (validade.value == '') listaValidacao.push('validade');
        if (quantidade.value == '' || quantidade.value < 0) listaValidacao.push('quantidade');

        if (listaValidacao.length == 0) {
            fetch('/produtos/adicionar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    lote: lote.value,
                    validade: validade.value,
                    quantidade: quantidade.value
                })
            }).then(response => {
                return response.json();
            }).then(data => {
                alert(data.msg);
                if (data.ok) {
                    window.location.href = '/produtos/listar';
                }
            }).catch(error => {
                console.error('Erro:', error);
                alert('Ocorreu um erro ao adicionar o produto.');
            });
        } else{
            alert('Por favor, preencha os campos obrigatórios corretamente.');
            for (let i = 0; i < listaValidacao.length; i++) {
                let campo = document.getElementById(listaValidacao[i]);
                campo.style.borderColor = 'red';
            }
        }
    }
});