function CartService(){
    const CART_KEY = "cart";

    function loadCart(){
        try{
            const data = localStorage.getItem(CART_KEY);
            return data ? JSON.parse(data) : [];
        }
        catch{
            return [];
        }
    }

    function saveCart(cart){
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function addToCart(produto){
        const cart = loadCart();

        const item = cart.find(item => String(item.id) === String(produto.id));

        if(item){
            item.quantidade = Number(item.quantidade || 0) + 1;
        }
        else{
            cart.push({
                id: produto.id,
                nome: produto.nome,
                preco: Number(produto.preco),
                quantidade: 1,
                descricao: produto.descricao,
                imagem: produto.imagem
            })
        }
        saveCart(cart);
    }

    function removeFromCart(id){
        const cart = loadCart().filter(item => String(item.id) !== String(id));
        saveCart(cart);
        return cart;
    }

    function clearCart(){
        saveCart([]);
    }

    function getTotalItems(){
        return loadCart().reduce((total, item) => total + (item.quantidade || 0), 0);
    }

    function getTotalPrice(){
        return loadCart().reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }

    return{
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        loadCart
    }
}

const cartService = CartService();
window.cartService = cartService;

function updateCartBadge() {
    const badge = document.getElementById('cartBadgeCount');
    if (!badge) {
        return;
    }

    const total = cartService.getTotalItems();
    badge.textContent = String(total);
    badge.style.display = total > 0 ? 'inline-block' : 'none';
}
window.updateCartBadge = updateCartBadge;


document.addEventListener('DOMContentLoaded', function(){
    updateCartBadge();

    document.querySelectorAll('.add-to-cart').forEach(btn =>{
        btn.addEventListener('click', function(){
            const produto = {
                id: this.dataset.id,
                nome: this.dataset.nome,
                preco: Number(this.dataset.preco),
                quantidade: Number(this.dataset.quantidade),
                descricao: this.dataset.descricao,
                imagem: this.dataset.imagem
            }
        
            cartService.addToCart(produto);
            updateCartBadge();

            alert(`Produto "${produto.nome}" adicionado ao carrinho!`);
        })
    })
})