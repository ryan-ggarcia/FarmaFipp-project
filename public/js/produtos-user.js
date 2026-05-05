// ════════════════════════════════
//  PRODUTOS PAGE – USER VIEW JS
// ════════════════════════════════

// Tab switching
function switchTab(tab) {
    // Toggle sections
    document.getElementById('tab-todos').style.display = tab === 'todos' ? '' : 'none';
    document.getElementById('tab-promocao').style.display = tab === 'promocao' ? '' : 'none';

    // Toggle active tab button
    document.querySelectorAll('.produto-tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    // Reset filters when switching
    resetFilters();
}

// Populate category filter dynamically
(function () {
    const cards = document.querySelectorAll('[data-product]');
    const categories = new Set();
    cards.forEach(c => {
        const cat = c.getAttribute('data-category');
        if (cat) categories.add(cat);
    });
    const select = document.getElementById('categoryFilter');
    if (select) {
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
    }
})();

function filterProducts() {
    const search = (document.getElementById('searchInput').value || '').toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const cards = document.querySelectorAll('[data-product]');
    let visible = 0;

    cards.forEach(card => {
        const name = card.getAttribute('data-name');
        const cat = card.getAttribute('data-category');
        const matchSearch = !search || name.includes(search);
        const matchCat = !category || cat === category;

        if (matchSearch && matchCat) {
            card.style.display = '';
            visible++;
        } else {
            card.style.display = 'none';
        }
    });

    const countEl = document.getElementById('visibleCount');
    if (countEl) countEl.textContent = visible;

    const noResults = document.getElementById('noFilterResults');
    const grid = document.getElementById('productsGrid');
    if (noResults && grid) {
        noResults.style.display = visible === 0 ? '' : 'none';
    }
}

function sortProducts() {
    const sort = document.getElementById('sortFilter').value;
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('[data-product]'));

    cards.sort((a, b) => {
        if (sort === 'name') return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
        if (sort === 'name-desc') return b.getAttribute('data-name').localeCompare(a.getAttribute('data-name'));
        if (sort === 'price-asc') return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
        if (sort === 'price-desc') return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
        return 0;
    });

    cards.forEach(card => grid.appendChild(card));
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortFilter').value = 'name';
    filterProducts();
}

// Wishlist toggle
document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const icon = this.querySelector('i');
        icon.classList.toggle('bi-heart');
        icon.classList.toggle('bi-heart-fill');
        this.style.color = icon.classList.contains('bi-heart-fill') ? 'var(--primary-red)' : '';
    });
});

// Add to cart feedback
document.querySelectorAll('.btn-add:not([disabled])').forEach(btn => {
    btn.addEventListener('click', function () {
        const orig = this.innerHTML;
        this.innerHTML = '<i class="bi bi-check-circle me-1"></i>Adicionado!';
        this.style.background = '#2D6A4F';
        setTimeout(() => {
            this.innerHTML = orig;
            this.style.background = '';
        }, 1500);
    });
});
