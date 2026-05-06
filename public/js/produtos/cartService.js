document.addEventListener("DOMContentLoaded", function() {
    let cartList = [];

    let cart = localStorage.getItem("cart");

    if(cart){
        cartList = JSON.parse(cart);
    }

    let btns = document.querySelectorAll(".add-to-cart");

    btns.forEach(btn =>{
        btn.addEventListener("click", addToCart);
    })

    updateBadge();
    document.addEventListener("show.bs.modal", renderCart);

    function formatCurrency(value) {
        return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function updateBadge() {
        const badge = document.getElementById('cartBadgeCount');
        if (!badge) return;
        const total = cartList.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0);
        badge.textContent = String(total);
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    }

    function renderCart() {
        const stored = localStorage.getItem("cart");
        cartList = stored ? JSON.parse(stored) : [];

        const body   = document.getElementById('cartModalBody');
        const empty  = document.getElementById('cartModalEmpty');
        const items  = document.getElementById('cartModalItems');
        const footer = document.getElementById('cartModalFooter');

        if (!cartList.length) {
            if (body)   body.innerHTML = '';
            if (empty)  empty.classList.remove('d-none');
            if (items)  items.classList.add('d-none');
            if (footer) footer.classList.add('d-none');
            return;
        }

        if (empty)  empty.classList.add('d-none');
        if (items)  items.classList.remove('d-none');
        if (footer) footer.classList.remove('d-none');

        const rows = cartList.map(item => {
            const subtotal = Number(item.preco || 0) * Number(item.quantidade || 0);
            const imagem   = item.imagem || '/img/produtos/barra-de-imagem.png';
            const descricao = item.descricao || 'Sem descrição';
            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <img src="${imagem}" alt="${item.nome}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #eee;" />
                            <div>
                                <div class="fw-semibold small">${item.nome}</div>
                                <small class="text-muted">${descricao}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">${Number(item.quantidade || 0)}</td>
                    <td class="text-end small">${formatCurrency(item.preco)}</td>
                    <td class="text-end fw-semibold small">${formatCurrency(subtotal)}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger btn-modal-remove" data-id="${item.id}" type="button">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
        }).join('');

        if (body) body.innerHTML = rows;

        const totalItems = cartList.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0);
        const totalPrice = cartList.reduce((sum, item) => sum + (Number(item.preco) * Number(item.quantidade)), 0);

        const elTotalItems = document.getElementById('cartModalTotalItems');
        const elTotalPrice = document.getElementById('cartModalTotalPrice');
        if (elTotalItems) elTotalItems.textContent = String(totalItems);
        if (elTotalPrice) elTotalPrice.textContent = formatCurrency(totalPrice);

        document.querySelectorAll('.btn-modal-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                cartList = cartList.filter(item => String(item.id) !== String(btn.dataset.id));
                localStorage.setItem("cart", JSON.stringify(cartList));
                updateBadge();
                renderCart();
            });
        });

        const btnClear = document.getElementById('btnModalClearCart');
        if (btnClear) {
            btnClear.onclick = () => {
                cartList = [];
                localStorage.setItem("cart", JSON.stringify(cartList));
                updateBadge();
                renderCart();
            };
        }
    }

    function addToCart(){
        let produto = this.dataset.produto;
        let that = this;

        if(produto){
            let target = cartList.find(item => item.id == produto);
            let p = null;

        if(target){
            target.quantidade = (Number(target.quantidade) || 0) + 1;
            p = Promise.resolve();
        } else {
            p = fetch("/produtos/obter/" + produto)
            .then(res=> res.json())
            .then(data =>{
                data.produto.quantidade = 1;
                data.produto.imagem = data.produto.img;
                cartList.push(data.produto);
            })
        }
        Promise.all([p]).then(()=>{
            localStorage.setItem("cart", JSON.stringify(cartList));
            updateBadge();
            that.innerHTML = `<i class="bi bi-bag-check"></i> Adicionado`;
            setTimeout(()=>{
                that.innerHTML = `<i class="bi bi-bag-plus"></i> Adicionar ao carrinho`;
                }, 2000);
            })
        }
        else{
            alert("Produto não encontrado!");
        }
    }
})