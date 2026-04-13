document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnCadastrar");

    btn.addEventListener("click", cadastrar)

    function cadastrar(){
        //inputs de cliente
        let inputNome = document.getElementById("nome");
        inputNome.style.borderColor = "#ced4da";
        let inputCpf = document.getElementById("cpf");
        inputCpf.style.borderColor = "#ced4da";
        let inputNascimento = document.getElementById("data");
        inputNascimento.style.borderColor = "#ced4da";
        let inputTelefone = document.getElementById("telefone");
        inputTelefone.style.borderColor = "#ced4da";
        let inputEmail = document.getElementById("email");
        inputEmail.style.borderColor = "#ced4da";
        let inputSenha = document.getElementById("senha");
        inputSenha.style.borderColor = "#ced4da";
        //inputs de endereço
        let inputRua = document.getElementById("rua");
        inputRua.style.borderColor = "#ced4da";
        let inputNum = document.getElementById("num");
        inputNum.style.borderColor = "#ced4da";
        let inputBairro = document.getElementById("bairro");
        inputBairro.style.borderColor = "#ced4da";
        let inputCidade = document.getElementById("cidade");
        inputCidade.style.borderColor = "#ced4da";
        let inputEstado = document.getElementById("estado");
        inputEstado.style.borderColor = "#ced4da";
        let inputCep = document.getElementById("cep");
        inputCep.style.borderColor = "#ced4da";
        let inputUf = document.getElementById("uf");
        inputUf.style.borderColor = "#ced4da";

        let listaValidacao = []

        if(inputNome.value == "")
            listaValidacao.push("nome");
        if(inputCpf.value == "" || inputCpf.value.length < 14)
            listaValidacao.push("cpf");
        if(inputNascimento.value == "")
            listaValidacao.push("data de nascimento");
        if(inputTelefone.value == "")
            listaValidacao.push("telefone");
        if(inputEmail.value == "" || !inputEmail.value.includes("@")) 
            listaValidacao.push("email");
        if(inputSenha.value == "")
            listaValidacao.push("senha");
        if(inputRua.value == "")
            listaValidacao.push("rua");
        if(inputNum.value == "")
            listaValidacao.push("número");
        if(inputBairro.value == "")
            listaValidacao.push("bairro");
        if(inputCidade.value == "")
            listaValidacao.push("cidade");
        if(inputEstado.value == "")
            listaValidacao.push("estado");
        if(inputCep.value == "")
            listaValidacao.push("cep");
        if(inputUf.value == "")
            listaValidacao.push("uf");


        if(listaValidacao.length == 0){
            fetch("/clientes/cadastrar", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: inputNome.value,
                    cpf: inputCpf.value,
                    data: inputNascimento.value,
                    telefone: inputTelefone.value,
                    email: inputEmail.value,
                    senha: inputSenha.value,
                    rua: inputRua.value,
                    numero: inputNum.value,
                    bairro: inputBairro.value,
                    cidade: inputCidade.value,
                    estado: inputEstado.value,
                    cep: inputCep.value,
                    uf: inputUf.value
                })
            })
            .then(res=>{
                return res.json();
            })
            .then(dados=>{
                if(dados.ok){
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso',
                        text: dados.msg,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(()=>{
                        window.location.href = "/clientes/listar";
                    });
                }else{
                    Swal.fire({icon: 'error', title: 'Erro', text: dados.msg});
                }
                    
            })
        }else{
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: "Preencha os seguintes campos: " + listaValidacao.join(", ")
            });
            for (let i = 0; i < listaValidacao.length; i++) {
                let campo = document.getElementById(listaValidacao[i]);
                campo.style.borderColor = "red";
            }
        }
    }
})
function coresMask(t) {
	var l = t.value;
	var m = l.length;
	var x = t.maxLength;
	if (m == 0) {
		t.style.borderColor = "red";
		//t.style.backgroundColor = "red";
	}
	else if (m < x) {
		t.style.borderColor = corIncompleta;
		//t.style.backgroundColor = corIncompleta;
	} else {
		t.style.borderColor = corCompleta;
		//t.style.backgroundColor = corCompleta;
	}
}
// Função para aplicar a máscaras nos campos
function mascara(m, t, e, c) {
	var cursor = t.selectionStart;
	var texto = t.value;
	texto = texto.replace(/\D/g, '');
	var l = texto.length;
	var lm = m.length;
	if (window.event) {
		id = e.keyCode;
	} else if (e.which) {
		id = e.which;
	}
	cursorfixo = false;
	if (cursor < l) cursorfixo = true;
	var livre = false;
	if (id == 16 || id == 19 || (id >= 33 && id <= 40)) livre = true;
	ii = 0;
	mm = 0;
	if (!livre) {
		if (id != 8) {
			t.value = "";
			j = 0;
			for (i = 0; i < lm; i++) {
				if (m.substr(i, 1) == "#") {
					t.value += texto.substr(j, 1);
					j++;
				} else if (m.substr(i, 1) != "#") {
					t.value += m.substr(i, 1);
				}
				if (id != 8 && !cursorfixo) cursor++;
				if ((j) == l + 1) break;

			}
		}
		if (c) coresMask(t);
	}
	if (cursorfixo && !livre) cursor--;
	t.setSelectionRange(cursor, cursor);
}