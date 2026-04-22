document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('cadastrar');

    btn.addEventListener('click', cadastrar);

    function cadastrar(){
        const nome = document.querySelector('#nome');
        nome.style.borderColor = '#ced4da';
        const cnpj = document.querySelector('#cnpj');
        cnpj.style.borderColor = '#ced4da';
        const telefone = document.querySelector('#telefone');
        telefone.style.borderColor = '#ced4da';
        const rua = document.querySelector('#rua');
        rua.style.borderColor = '#ced4da';
        const numero = document.querySelector('#num');
        numero.style.borderColor = '#ced4da';
        const bairro = document.querySelector('#bairro');
        bairro.style.borderColor = '#ced4da';
        const cidade = document.querySelector('#cidade');
        cidade.style.borderColor = '#ced4da';
        const cep = document.querySelector('#cep');
        cep.style.borderColor = '#ced4da';
        const estado = document.querySelector('#estado');
        estado.style.borderColor = '#ced4da';
        const uf = document.querySelector('#uf');
        uf.style.borderColor = '#ced4da';

        let listaValid = [];
        if(nome.value.length < 3){ listaValid.push('nome'); }
        if(cnpj.value.length < 14){ listaValid.push('cnpj'); }
        if(telefone.value.length < 10){ listaValid.push('telefone'); }
        if(rua.value.length < 3){ listaValid.push('rua'); }
        if(numero.value.length < 1){ listaValid.push('num'); }
        if(bairro.value.length < 3){ listaValid.push('bairro'); }
        if(cidade.value.length < 3){ listaValid.push('cidade'); }
        if(cep.value.length < 8){ listaValid.push('cep'); }
        if(estado.value.length < 3){ listaValid.push('estado'); }
        if(uf.value.length < 2){ listaValid.push('uf'); }

        if(listaValid.length == 0){
            fetch('/fornecedores/cadastrar', {
                method: "POST",
                headers:  {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome.value,
                    cnpj: cnpj.value,
                    telefone: telefone.value,
                    rua: rua.value,
                    numero: numero.value,
                    bairro: bairro.value,
                    cidade: cidade.value,
                    cep: cep.value,
                    uf: uf.value,
                    estado: estado.value
                })
            }).then((response) => {
                return response.json();
            }).then((data) => {
                alert(data.msg);
                if(data.ok){
                    window.location.href = '/fornecedores/';
                }
            })
        }else{
            alert('Preencha os campos corretamente!');
            for(let i = 0; i < listaValid.length; i++){
            let value = document.getElementById(listaValid[i]);
                value.style.borderColor = 'red';
            }
        }
    }
});