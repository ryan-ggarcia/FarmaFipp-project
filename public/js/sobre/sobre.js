const form = document.getElementById("supportForm");

form.addEventListener("submit", function(event){

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const assunto = document.getElementById("assunto").value.trim();
    const comentario = document.getElementById("comentario").value.trim();

    const mensagemRetorno = document.getElementById("mensagemRetorno");

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // limpar alertas anteriores
    mensagemRetorno.classList.add("d-none");

    // VALIDAÇÕES

    if(nome.length < 3){

        mostrarErro("Digite um nome válido com pelo menos 3 caracteres.");

        return;
    }

    if(!regexEmail.test(email)){

        mostrarErro("Digite um email válido.");

        return;
    }

    if(assunto.length < 5){

        mostrarErro("O assunto precisa ter pelo menos 5 caracteres.");

        return;
    }

    if(comentario.length < 10){

        mostrarErro("O comentário precisa ter pelo menos 10 caracteres.");

        return;
    }

    // SUCESSO

    const sucessoVisual = document.getElementById("sucessoVisual");

    // esconder formulário
    form.classList.add("d-none");

    // mostrar mensagem visual
    sucessoVisual.classList.remove("d-none");

    // limpar formulário
    form.reset();

    // após 5 segundos voltar tudo
    setTimeout(() => {

        sucessoVisual.classList.add("d-none");

        form.classList.remove("d-none");

    }, 5000);

});

function mostrarErro(texto){

    const mensagemRetorno = document.getElementById("mensagemRetorno");

    mensagemRetorno.innerText = texto;

    mensagemRetorno.classList.remove(
        "d-none",
        "alert-success"
    );

    mensagemRetorno.classList.add("alert-danger");

}