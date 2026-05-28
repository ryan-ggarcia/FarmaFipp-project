document.addEventListener("DOMContentLoaded", function() {

    let listaCarrinho = [];

    let carrinho = localStorage.getItem("cart") || localStorage.getItem("carrinho");

    if(carrinho) {
        listaCarrinho = JSON.parse(carrinho);
    }

    atualizarTela();
    inicializarFormaPagamento();

    document.getElementById("btnConfirmOrder").addEventListener("click", gravarPedido);
    document.getElementById("btnCheckoutClear").addEventListener("click", limparCarrinho);

    function salvarCarrinho() {
        localStorage.setItem("cart", JSON.stringify(listaCarrinho));
    }

    function inicializarFormaPagamento() {
        let opcoes = document.querySelectorAll(".payment-option");
        for(let i = 0; i < opcoes.length; i++) {
            opcoes[i].addEventListener("click", function() {
                for(let j = 0; j < opcoes.length; j++) {
                    opcoes[j].classList.remove("active");
                }
                this.classList.add("active");
            });
        }
    }

    function calcularValorTotal() {
        let valorTotal = 0;
        for(let i = 0; i < listaCarrinho.length; i++) {
            valorTotal += listaCarrinho[i].quantidade * listaCarrinho[i].preco;
        }
        return valorTotal;
    }

    function atualizarContador() {
        let badge = document.getElementById("cartBadgeCount");
        if(!badge) return;
        let total = 0;
        for(let i = 0; i < listaCarrinho.length; i++) {
            total += Number(listaCarrinho[i].quantidade) || 0;
        }
        badge.textContent = total;
        badge.style.display = total > 0 ? "inline-block" : "none";
    }

    function atualizarResumo() {
        let valorTotal = calcularValorTotal();
        let totalItens = 0;
        for(let i = 0; i < listaCarrinho.length; i++) {
            totalItens += Number(listaCarrinho[i].quantidade) || 0;
        }

        let checkoutItemsLabel = document.getElementById("checkoutItemsLabel");
        let checkoutSubtotal = document.getElementById("checkoutSubtotal");
        let checkoutShipping = document.getElementById("checkoutShipping");
        let checkoutDiscount = document.getElementById("checkoutDiscount");
        let checkoutTotal = document.getElementById("checkoutTotal");

        let frete = valorTotal > 0 ? 12.0 : 0;
        let desconto = valorTotal >= 200 ? valorTotal * 0.05 : 0;
        let total = valorTotal + frete - desconto;

        if(checkoutItemsLabel) checkoutItemsLabel.textContent = totalItens + " item" + (totalItens !== 1 ? "s" : "");
        if(checkoutSubtotal) checkoutSubtotal.textContent = "R$ " + valorTotal.toFixed(2);
        if(checkoutShipping) checkoutShipping.textContent = "R$ " + frete.toFixed(2);
        if(checkoutDiscount) checkoutDiscount.textContent = "- R$ " + desconto.toFixed(2);
        if(checkoutTotal) checkoutTotal.textContent = "R$ " + total.toFixed(2);
    }

    function abrirCarrinho() {
        let checkoutContent = document.getElementById("checkoutContent");
        let checkoutEmptyState = document.getElementById("checkoutEmptyState");
        let checkoutItemsList = document.getElementById("checkoutItemsList");

        if(!checkoutItemsList) return;

        if(listaCarrinho.length === 0) {
            checkoutItemsList.innerHTML = "";
            if(checkoutContent) checkoutContent.classList.add("d-none");
            if(checkoutEmptyState) checkoutEmptyState.classList.remove("d-none");
            return;
        }

        if(checkoutContent) checkoutContent.classList.remove("d-none");
        if(checkoutEmptyState) checkoutEmptyState.classList.add("d-none");

        let html = "";
        for(let i = 0; i < listaCarrinho.length; i++) {
            let item = listaCarrinho[i];
            let imagem = item.imagem || item.img || "/img/produtos/barra-de-imagem.png";
            let subtotal = item.quantidade * item.preco;

            html += `<article class="checkout-item">
                        <img class="checkout-item-img" src="${imagem}" alt="${item.nome}" />
                        <div>
                            <h4 class="checkout-item-name">${item.nome}</h4>
                            <p class="checkout-item-meta">${item.descricao || ""}</p>
                            <div class="checkout-item-controls">
                                <button type="button" class="qty-btn btn-diminuir" data-produto="${item.id}">-</button>
                                <span class="qty-value">${item.quantidade}</span>
                                <button type="button" class="qty-btn btn-aumentar" data-produto="${item.id}">+</button>
                            </div>
                        </div>
                        <div class="item-price-block">
                            <span class="line-price">R$ ${Number(item.preco).toFixed(2)} cada</span>
                            <span class="line-subtotal">R$ ${subtotal.toFixed(2)}</span>
                            <button type="button" class="btn-remove-item excluirCarrinho" data-produto="${item.id}">
                                <i class="bi bi-trash me-1"></i>Remover
                            </button>
                        </div>
                    </article>`;
        }

        checkoutItemsList.innerHTML = html;

        let btnsExcluir = document.querySelectorAll(".excluirCarrinho");
        let btnsAumentar = document.querySelectorAll(".btn-aumentar");
        let btnsDiminuir = document.querySelectorAll(".btn-diminuir");

        for(let i = 0; i < btnsExcluir.length; i++) {
            btnsExcluir[i].addEventListener("click", excluirProdutoCarrinho);
        }

        btnsAumentar.forEach(function(btn) {
            btn.addEventListener("click", aumentarQuantidade);
        });

        btnsDiminuir.forEach(function(btn) {
            btn.addEventListener("click", diminuirQuantidade);
        });
    }

    function excluirProdutoCarrinho() {
        let produtoId = this.dataset.produto;
        listaCarrinho = listaCarrinho.filter(function(item) {
            return String(item.id) !== String(produtoId);
        });
        salvarCarrinho();
        atualizarTela();
    }

    function aumentarQuantidade() {
        let produtoId = this.dataset.produto;
        for(let i = 0; i < listaCarrinho.length; i++) {
            if(String(listaCarrinho[i].id) === String(produtoId)) {
                listaCarrinho[i].quantidade += 1;
                break;
            }
        }
        salvarCarrinho();
        atualizarTela();
    }

    function diminuirQuantidade() {
        let produtoId = this.dataset.produto;
        listaCarrinho = listaCarrinho.map(function(item) {
            if(String(item.id) === String(produtoId)) {
                item.quantidade--;
            }
            return item;
        }).filter(function(item) { return item.quantidade > 0; });

        salvarCarrinho();
        atualizarTela();
    }

    function limparCarrinho() {
        listaCarrinho = [];
        localStorage.removeItem("cart");
        localStorage.removeItem("carrinho");
        atualizarTela();
    }

    function gravarPedido() {
        if(listaCarrinho.length === 0) {
            alert("Nenhum produto adicionado ao carrinho!");
            return;
        }

        let itens = [];
        for(let i = 0; i < listaCarrinho.length; i++) {
            let item = listaCarrinho[i];
            itens.push({
                id_produto: item.id,
                id_lote: item.id_lote || item.idLote || null,
                quantidade: item.quantidade
            });
        }

        fetch("/venda/confirmar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ itens: itens })
        })
        .then(function(resposta) {
            return resposta.json();
        })
        .then(function(corpo) {
            alert(corpo.msg);
            if(corpo.ok) {
                limparCarrinho();
                window.location.href = "/shop";
            }
        })
        .catch(function(erro) {
            console.error("Erro ao confirmar venda:", erro);
            alert("Não foi possível concluir a venda. Tente novamente.");
        });
    }

    function atualizarTela() {
        abrirCarrinho();
        atualizarContador();
        atualizarResumo();
    }
});
