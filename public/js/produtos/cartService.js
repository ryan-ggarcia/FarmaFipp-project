/**
 * CartService — Serviço de carrinho de compras (localStorage)
 *
 * Expõe uma API pública via window.cartService:
 *   addToCart(produto), removeFromCart(id), getTotalItems(),
 *   loadCart(), renderCart(), updateBadge()
 */
function CartService() {
    const CART_KEY = "cart";

    // ── Estado interno ──────────────────────────────────────
    var cartList = [];

    try {
        var stored = localStorage.getItem(CART_KEY);
        cartList = stored ? JSON.parse(stored) : [];
    } catch (_e) {
        cartList = [];
    }

    // ── Helpers ─────────────────────────────────────────────
    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cartList));
    }

    function loadCart() {
        try {
            var data = localStorage.getItem(CART_KEY);
            cartList = data ? JSON.parse(data) : [];
        } catch (_e) {
            cartList = [];
        }
        return cartList;
    }

    function formatCurrency(value) {
        return 'R$ ' + Number(value || 0).toFixed(2).replace('.', ',');
    }

    function getItemKey(item) {
        var lote = item.id_lote || item.idLote || '';
        return item.id + '::' + lote;
    }

    // ── Badge ───────────────────────────────────────────────
    function updateBadge() {
        var badge = document.getElementById('cartBadgeCount');
        if (!badge) return;
        var total = cartList.reduce(function (sum, item) {
            return sum + (Number(item.quantidade) || 0);
        }, 0);
        badge.textContent = String(total);
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    }

    // ── Public: addToCart ────────────────────────────────────
    function addToCart(produto) {
        var existing = cartList.find(function (item) {
            return String(item.id) === String(produto.id);
        });

        if (existing) {
            existing.quantidade = (Number(existing.quantidade) || 0) + 1;
        } else {
            cartList.push({
                id: produto.id,
                nome: produto.nome,
                preco: Number(produto.preco),
                quantidade: 1,
                descricao: produto.descricao,
                imagem: produto.imagem || produto.img,
                id_lote: produto.id_lote || produto.idLote || null
            });
        }

        saveCart();
        updateBadge();
    }

    // ── Public: removeFromCart ───────────────────────────────
    function removeFromCart(id) {
        cartList = cartList.filter(function (item) {
            return String(item.id) !== String(id);
        });
        saveCart();
        updateBadge();
        return cartList;
    }

    // ── Public: getTotalItems ───────────────────────────────
    function getTotalItems() {
        return cartList.reduce(function (total, item) {
            return total + (Number(item.quantidade) || 0);
        }, 0);
    }

    // ── Public: renderCart (modal) ──────────────────────────
    function renderCart() {
        var empty  = document.getElementById('cartModalEmpty');
        var items  = document.getElementById('cartModalItems');
        var footer = document.getElementById('cartModalFooter');
        var body   = document.getElementById('cartModalBody');

        loadCart();

        if (cartList.length === 0) {
            if (empty)  empty.classList.remove('d-none');
            if (items)  items.classList.add('d-none');
            if (footer) footer.classList.add('d-none');
            return;
        }

        if (empty)  empty.classList.add('d-none');
        if (items)  items.classList.remove('d-none');
        if (footer) footer.classList.remove('d-none');

        var rows = cartList.map(function (item) {
            var subtotal  = Number(item.preco || 0) * Number(item.quantidade || 0);
            var imagem    = item.imagem || '/img/produtos/barra-de-imagem.png';
            var descricao = item.descricao || 'Sem descrição';
            var itemKey   = getItemKey(item);
            return '' +
                '<tr>' +
                '    <td>' +
                '        <div class="d-flex align-items-center gap-2">' +
                '            <img src="' + imagem + '" alt="' + item.nome + '" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #eee;" />' +
                '            <div>' +
                '                <div class="fw-semibold small">' + item.nome + '</div>' +
                '                <small class="text-muted">' + descricao + '</small>' +
                '            </div>' +
                '        </div>' +
                '    </td>' +
                '    <td class="text-center">' +
                '        <div class="d-flex align-items-center justify-content-center gap-1">' +
                '            <button class="btn btn-sm btn-outline-secondary btn-modal-decrease" data-key="' + itemKey + '" type="button">-</button>' +
                '            <span class="px-2">' + Number(item.quantidade || 0) + '</span>' +
                '            <button class="btn btn-sm btn-outline-secondary btn-modal-increase" data-key="' + itemKey + '" type="button">+</button>' +
                '        </div>' +
                '    </td>' +
                '    <td class="text-end small">' + formatCurrency(item.preco) + '</td>' +
                '    <td class="text-end fw-semibold small">' + formatCurrency(subtotal) + '</td>' +
                '    <td class="text-end">' +
                '        <button class="btn btn-sm btn-outline-danger btn-modal-remove" data-key="' + itemKey + '" type="button">' +
                '            <i class="bi bi-trash"></i>' +
                '        </button>' +
                '    </td>' +
                '</tr>';
        }).join('');

        if (body) body.innerHTML = rows;

        var totalItems = cartList.reduce(function (sum, item) { return sum + (Number(item.quantidade) || 0); }, 0);
        var totalPrice = cartList.reduce(function (sum, item) { return sum + (Number(item.preco) * Number(item.quantidade)); }, 0);

        var elTotalItems = document.getElementById('cartModalTotalItems');
        var elTotalPrice = document.getElementById('cartModalTotalPrice');
        if (elTotalItems) elTotalItems.textContent = String(totalItems);
        if (elTotalPrice) elTotalPrice.textContent = formatCurrency(totalPrice);

        // ── Event: Remove ──
        document.querySelectorAll('.btn-modal-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                cartList = cartList.filter(function (item) {
                    return getItemKey(item) !== String(btn.dataset.key);
                });
                saveCart();
                updateBadge();
                renderCart();
            });
        });

        // ── Event: Increase ──
        document.querySelectorAll('.btn-modal-increase').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var target = cartList.find(function (item) {
                    return getItemKey(item) === String(btn.dataset.key);
                });
                if (target) {
                    target.quantidade = (Number(target.quantidade) || 0) + 1;
                    saveCart();
                    updateBadge();
                    renderCart();
                }
            });
        });

        // ── Event: Decrease ──
        document.querySelectorAll('.btn-modal-decrease').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var target = cartList.find(function (item) {
                    return getItemKey(item) === String(btn.dataset.key);
                });
                if (target) {
                    target.quantidade = (Number(target.quantidade) || 0) - 1;
                    cartList = cartList.filter(function (item) {
                        return Number(item.quantidade) > 0;
                    });
                    saveCart();
                    updateBadge();
                    renderCart();
                }
            });
        });

        // ── Event: Clear cart ──
        var btnClear = document.getElementById('btnModalClearCart');
        if (btnClear) {
            btnClear.onclick = function () {
                cartList = [];
                saveCart();
                updateBadge();
                renderCart();
            };
        }
    }

    // ── Return public API ───────────────────────────────────
    return {
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        getTotalItems: getTotalItems,
        loadCart: loadCart,
        renderCart: renderCart,
        updateBadge: updateBadge
    };
}

// ── Singleton instance ──────────────────────────────────────
var cartService = CartService();
window.cartService = cartService;

function updateCartBadge() {
    var badge = document.getElementById('cartBadgeCount');
    if (!badge) return;
    var total = cartService.getTotalItems();
    badge.textContent = String(total);
    badge.style.display = total > 0 ? 'inline-block' : 'none';
}
window.updateCartBadge = updateCartBadge;

// ── DOMContentLoaded: wire up add-to-cart buttons ───────────
document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();

    // Buttons on the /shop page use data-produto and data-lote attributes
    document.querySelectorAll('.add-to-cart, .btn-cart-add').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var produtoId = this.dataset.produto || this.dataset.id;
            var loteId    = this.dataset.lote || '';
            var that      = this;

            if (!produtoId) {
                alert('Produto não encontrado!');
                return;
            }

            // Check if the product is already in the cart
            var existing = cartService.loadCart().find(function (item) {
                return String(item.id) === String(produtoId);
            });

            if (existing) {
                // Just increment quantity
                cartService.addToCart({ id: produtoId });
                updateCartBadge();
                that.innerHTML = '<i class="bi bi-bag-check"></i> Adicionado';
                setTimeout(function () {
                    that.innerHTML = '<i class="bi bi-bag-plus"></i> Adicionar ao carrinho';
                }, 2000);
            } else {
                // Fetch full product data from server
                fetch('/produtos/obter/' + produtoId)
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        if (data.ok && data.produto) {
                            cartService.addToCart({
                                id: data.produto.id,
                                nome: data.produto.nome,
                                preco: data.produto.preco,
                                descricao: data.produto.descricao,
                                imagem: data.produto.img,
                                id_lote: loteId || data.produto.id_lote || null
                            });
                            updateCartBadge();
                            that.innerHTML = '<i class="bi bi-bag-check"></i> Adicionado';
                            setTimeout(function () {
                                that.innerHTML = '<i class="bi bi-bag-plus"></i> Adicionar ao carrinho';
                            }, 2000);
                        } else {
                            alert('Produto não encontrado no servidor!');
                        }
                    })
                    .catch(function (err) {
                        console.error('Erro ao buscar produto:', err);
                        alert('Erro ao adicionar produto ao carrinho.');
                    });
            }
        });
    });
});