document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('#btnCadastrar');

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
        const numero = document.querySelector('#numero');
        numero.style.borderColor = '#ced4da';
        const bairro = document.querySelector('#bairro');
        bairro.style.borderColor = '#ced4da';
        const cidade = document.querySelector('#cidade');
        cidade.style.borderColor = '#ced4da';
        const cep = document.querySelector('#cep');
        cep.style.borderColor = '#ced4da';
        const uf = document.querySelector('#uf');
        uf.style.borderColor = '#ced4da';

        let listaValid = [];
        if(nome.value.length < 3){ listaValid.push(nome.value); }
        if(cnpj.value.length < 14){ listaValid.push(cnpj.value); }
        if(telefone.value.length < 10){ listaValid.push(telefone.value); }
        if(rua.value.length < 3){ listaValid.push(rua.value); }
        if(numero.value.length < 1){ listaValid.push(numero.value); }
        if(bairro.value.length < 3){ listaValid.push(bairro.value); }
        if(cidade.value.length < 3){ listaValid.push(cidade.value); }
        if(cep.value.length < 9){ listaValid.push(cep.value); }
        if(uf.value.length < 2){ listaValid.push(uf.value); }

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
                    uf: uf.value
                })
            }).then((response) => {
                return response.json();
            }).then((data) => {
                alert(data.msg);
                if(data.ok){
                    window.location.href = '/fornecedores/listar';
                }
            })
        }else{
            alert('Preencha os campos corretamente!');
            listaValid.forEach((item) => {
                if(item == nome.value){ nome.style.borderColor = 'red'; }
                if(item == cnpj.value){ cnpj.style.borderColor = 'red'; }
                if(item == telefone.value){ telefone.style.borderColor = 'red'; }
                if(item == rua.value){ rua.style.borderColor = 'red'; }
                if(item == numero.value){ numero.style.borderColor = 'red'; }
                if(item == bairro.value){ bairro.style.borderColor = 'red'; }
                if(item == cidade.value){ cidade.style.borderColor = 'red'; }
                if(item == cep.value){ cep.style.borderColor = 'red'; }
                if(item == uf.value){ uf.style.borderColor = 'red'; }
            })
        }
    }
});