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
        return Number(value || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function getItemKey(item) {
        var lote = item.id_lote || item.idLote || '';
        return item.id + '::' + lote;
    }

    function getTotalItems() {
        loadCart();
        return cartList.reduce(function (sum, item) {
            return sum + (Number(item.quantidade) || 0);
        }, 0);
    }

    // ── Badge ───────────────────────────────────────────────
    function updateBadge() {
        loadCart();
        var total = cartList.reduce(function (sum, item) {
            return sum + (Number(item.quantidade) || 0);
        }, 0);
        ['cartBadgeCount', 'cartBadgeCountMobile'].forEach(function (id) {
            var badge = document.getElementById(id);
            if (!badge) return;
            badge.textContent = String(total);
            badge.style.display = total > 0 ? 'inline-block' : 'none';
        });
    }

    // ── Public: addToCart ────────────────────────────────────
    function addToCart(produto) {
        // Usa o preço promocional vigente quando houver (alinhado ao que o servidor cobra).
        var precoEfetivo = Number(produto.precoPromocional) > 0
            ? Number(produto.precoPromocional)
            : Number(produto.preco);

        // Estoque disponível (mesmo valor exibido na vitrine) para limitar a quantidade.
        var estoque = Number(produto.quantidade);
        var temEstoque = !Number.isNaN(estoque) && estoque > 0;

        var existing = cartList.find(function (item) {
            return String(item.id) === String(produto.id);
        });

        if (existing) {
            if (temEstoque && (Number(existing.quantidade) || 0) >= estoque) {
                return false; // já atingiu o estoque disponível
            }
            existing.quantidade = (Number(existing.quantidade) || 0) + 1;
            existing.preco = precoEfetivo;
            if (temEstoque) existing.estoque = estoque;
        } else {
            cartList.push({
                id: produto.id,
                nome: produto.nome,
                preco: precoEfetivo,
                quantidade: 1,
                descricao: produto.descricao,
                imagem: produto.imagem || produto.img,
                id_lote: produto.id_lote || produto.idLote || null,
                estoque: temEstoque ? estoque : undefined
            });
        }

        saveCart();
        updateBadge();
        return true;
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
            if (body) body.innerHTML = '';
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

        document.querySelectorAll('.btn-modal-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                cartList = cartList.filter(item => getItemKey(item) !== String(btn.dataset.key));
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
                    var estoqueT = Number(target.estoque);
                    if (!Number.isNaN(estoqueT) && (Number(target.quantidade) || 0) >= estoqueT) {
                        return; // não passa do estoque disponível
                    }
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
                    cartList = cartList.filter(item => Number(item.quantidade) > 0);
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

    return {
        addToCart,
        removeFromCart,
        getTotalItems,
        loadCart,
        updateBadge,
        renderCart
    };
}


const cartService = CartService();
window.cartService = cartService;

function updateCartBadge() {
    var total = cartService.getTotalItems();
    ['cartBadgeCount', 'cartBadgeCountMobile'].forEach(function (id) {
        var badge = document.getElementById(id);
        if (!badge) return;
        badge.textContent = String(total);
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    });
}
window.updateCartBadge = updateCartBadge;

// ── DOMContentLoaded: wire up add-to-cart buttons ───────────
document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();

    document.querySelectorAll('.add-to-cart').forEach(btn =>{
        btn.addEventListener('click', function(){
            const produtoId = this.dataset.produto;
            const loteId = this.dataset.lote || null;

            if(!produtoId){
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Produto não encontrado!',
                    confirmButtonColor: '#A31621'
                });
                return;
            }

            fetch('/produtos/obter/' + produtoId)
                .then(res => res.json())
                .then(data => {
                    if(!data || !data.produto){
                        throw new Error('Produto inválido');
                    }

                    const produto = {
                        ...data.produto,
                        imagem: data.produto.imagem || data.produto.img,
                        id_lote: loteId || data.produto.id_lote || data.produto.idLote || null
                    };

                    const adicionado = cartService.addToCart(produto);
                    updateCartBadge();

                    if (!adicionado) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Estoque máximo',
                            text: `Você já adicionou todo o estoque disponível de "${produto.nome}".`,
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true
                        });
                        return;
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Adicionado!',
                        text: `"${produto.nome}" foi adicionado ao carrinho.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true
                    });
                })
                .catch(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ops!',
                        text: 'Não foi possível adicionar o produto ao carrinho.',
                        confirmButtonColor: '#A31621'
                    });
                });
        })
    })
})
