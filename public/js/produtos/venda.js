document.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("btnConfirmOrder");

    btn.addEventListener("click", efetuarVenda);

    function efetuarVenda() {
        let cart = localStorage.getItem("cart");
        if (!cart) {
            alert("O carrinho está vazio!");
            return;
        }

        cart = JSON.parse(cart);

        if (cart.length === 0) {
            alert("O carrinho está vazio!");
            return;
        }

        fetch('/venda/confirmar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cart })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert("Venda confirmada com sucesso!");
                localStorage.removeItem("cart");
            } else {
                alert("Erro ao confirmar a venda.");
            }
        })
        .catch(error => {
            console.error("Erro ao confirmar a venda:", error);
            alert("Erro ao confirmar a venda.");
        });
    }
})