document.addEventListener('DOMContentLoaded', function () {
    const STORAGE_KEY = 'cart';
    const EMPTY_IMG = '/img/produtos/barra-de-imagem.png';
    const SHIPPING_FEE = 12.0;

    const checkoutEmptyState = document.getElementById('checkoutEmptyState');
    const checkoutContent = document.getElementById('checkoutContent');
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutItemsLabel = document.getElementById('checkoutItemsLabel');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutShipping = document.getElementById('checkoutShipping');
    const checkoutDiscount = document.getElementById('checkoutDiscount');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const btnCheckoutClear = document.getElementById('btnCheckoutClear');
    const btnConfirmOrder = document.getElementById('btnConfirmOrder');
    const btnSimulateBack = document.getElementById('btnSimulateBack');

    let cartList = getCart();

    function getCart() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn('Carrinho inválido no localStorage:', error);
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartList));
    }

    function formatCurrency(value) {
        return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function sanitizeQty(value) {
        const qty = Number(value || 0);
        if (Number.isNaN(qty) || qty < 1) return 1;
        return qty;
    }

    function updateBadge() {
        const badge = document.getElementById('cartBadgeCount');
        if (!badge) return;

        const total = cartList.reduce(function (sum, item) {
            return sum + sanitizeQty(item.quantidade);
        }, 0);

        badge.textContent = String(total);
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    }

    function changeQty(productId, delta) {
        cartList = cartList
            .map(function (item) {
                if (String(item.id) !== String(productId)) return item;
                const nextQty = sanitizeQty(item.quantidade) + delta;
                return { ...item, quantidade: nextQty };
            })
            .filter(function (item) {
                return sanitizeQty(item.quantidade) > 0;
            });

        saveCart();
        render();
        updateBadge();
    }

    function removeItem(productId) {
        cartList = cartList.filter(function (item) {
            return String(item.id) !== String(productId);
        });

        saveCart();
        render();
        updateBadge();
    }

    function clearCart() {
        cartList = [];
        saveCart();
        render();
        updateBadge();
    }

    function getTotals() {
        const subtotal = cartList.reduce(function (sum, item) {
            const price = Number(item.preco || 0);
            const qty = sanitizeQty(item.quantidade);
            return sum + price * qty;
        }, 0);

        const discount = subtotal >= 200 ? subtotal * 0.05 : 0;
        const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
        const total = subtotal + shipping - discount;
        const itemCount = cartList.reduce(function (sum, item) {
            return sum + sanitizeQty(item.quantidade);
        }, 0);

        return { subtotal, discount, shipping, total, itemCount };
    }

    function bindActions() {
        document.querySelectorAll('[data-action="qty-minus"]').forEach(function (button) {
            button.addEventListener('click', function () {
                changeQty(button.dataset.id, -1);
            });
        });

        document.querySelectorAll('[data-action="qty-plus"]').forEach(function (button) {
            button.addEventListener('click', function () {
                changeQty(button.dataset.id, 1);
            });
        });

        document.querySelectorAll('[data-action="remove-item"]').forEach(function (button) {
            button.addEventListener('click', function () {
                removeItem(button.dataset.id);
            });
        });
    }

    function render() {
        if (!checkoutItemsList) return;

        if (!cartList.length) {
            if (checkoutContent) checkoutContent.classList.add('d-none');
            if (checkoutEmptyState) checkoutEmptyState.classList.remove('d-none');
            return;
        }

        if (checkoutContent) checkoutContent.classList.remove('d-none');
        if (checkoutEmptyState) checkoutEmptyState.classList.add('d-none');

        const itemsHtml = cartList
            .map(function (item) {
                const qty = sanitizeQty(item.quantidade);
                const price = Number(item.preco || 0);
                const image = item.imagem || item.img || EMPTY_IMG;
                const subtotal = price * qty;
                const description = item.descricao || 'Produto sem descrição';

                return '<article class="checkout-item">'
                    + '<img class="checkout-item-img" src="' + image + '" alt="' + (item.nome || 'Produto') + '" />'
                    + '<div>'
                    + '<h4 class="checkout-item-name">' + (item.nome || 'Produto sem nome') + '</h4>'
                    + '<p class="checkout-item-meta">' + description + '</p>'
                    + '<div class="checkout-item-controls">'
                    + '<button type="button" class="qty-btn" data-action="qty-minus" data-id="' + item.id + '">-</button>'
                    + '<span class="qty-value">' + qty + '</span>'
                    + '<button type="button" class="qty-btn" data-action="qty-plus" data-id="' + item.id + '">+</button>'
                    + '</div>'
                    + '</div>'
                    + '<div class="item-price-block">'
                    + '<span class="line-price">' + formatCurrency(price) + ' cada</span>'
                    + '<span class="line-subtotal">' + formatCurrency(subtotal) + '</span>'
                    + '<button type="button" class="btn-remove-item" data-action="remove-item" data-id="' + item.id + '">'
                    + '<i class="bi bi-trash me-1"></i>Remover</button>'
                    + '</div>'
                    + '</article>';
            })
            .join('');

        checkoutItemsList.innerHTML = itemsHtml;

        const totals = getTotals();
        if (checkoutItemsLabel) checkoutItemsLabel.textContent = totals.itemCount + ' item' + (totals.itemCount !== 1 ? 's' : '');
        if (checkoutSubtotal) checkoutSubtotal.textContent = formatCurrency(totals.subtotal);
        if (checkoutShipping) checkoutShipping.textContent = formatCurrency(totals.shipping);
        if (checkoutDiscount) checkoutDiscount.textContent = '- ' + formatCurrency(totals.discount);
        if (checkoutTotal) checkoutTotal.textContent = formatCurrency(totals.total);

        bindActions();
    }

    document.querySelectorAll('.payment-option').forEach(function (button) {
        button.addEventListener('click', function () {
            document.querySelectorAll('.payment-option').forEach(function (opt) {
                opt.classList.remove('active');
            });
            button.classList.add('active');
        });
    });

    if (btnCheckoutClear) {
        btnCheckoutClear.addEventListener('click', function () {
            clearCart();
        });
    }

    if (btnConfirmOrder) {
        btnConfirmOrder.addEventListener('click', function () {
            if (!cartList.length) {
                window.alert('Seu carrinho está vazio.');
                return;
            }

            const selectedPayment = document.querySelector('.payment-option.active');
            const paymentCode = selectedPayment ? selectedPayment.dataset.payment : 'pix';
            const paymentText = selectedPayment ? selectedPayment.textContent.trim() : 'PIX';
            const totals = getTotals();

            const itens = cartList.map(function (item) {
                return {
                    id_produto: item.id,
                    id_lote: item.id_lote || item.idLote || null,
                    quantidade: sanitizeQty(item.quantidade),
                    preco_unitario: Number(item.preco || 0),
                    subtotal: Number(item.preco || 0) * sanitizeQty(item.quantidade)
                };
            });

            btnConfirmOrder.disabled = true;
            btnConfirmOrder.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processando...';

            fetch('/venda/confirmar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: new Date().toISOString(),
                    status: 'PENDENTE',
                    pagamento: paymentCode,
                    total: totals.total,
                    subtotal: totals.subtotal,
                    frete: totals.shipping,
                    desconto: totals.discount,
                    itens
                })
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    if (!data.ok) {
                        window.alert(data.msg || 'Erro ao registrar venda.');
                        return;
                    }

                    clearCart();
                    window.alert('Venda #' + data.vendaId + ' confirmada com sucesso! Pagamento: ' + paymentText + '.');
                    window.location.href = '/usuario/shop';
                })
                .catch(function (error) {
                    console.error('Erro ao confirmar venda:', error);
                    window.alert('Não foi possível concluir a venda. Tente novamente.');
                })
                .finally(function () {
                    btnConfirmOrder.disabled = false;
                    btnConfirmOrder.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Finalizar pagamento';
                });
        });
    }

    if (btnSimulateBack) {
        btnSimulateBack.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    render();
    updateBadge();
});
    