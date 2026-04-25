document.addEventListener("DOMContentLoaded", function(){
    
    // ── Search functionality ──
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            const rows = document.querySelectorAll('.produto-row');
            let visible = 0;
            
            rows.forEach(row => {
                const nome = row.querySelector('.prod-name')?.textContent.toLowerCase() || '';
                const marca = row.querySelector('.marca-badge')?.textContent.toLowerCase() || '';
                const cat = row.querySelector('.cat-badge')?.textContent.toLowerCase() || '';
                const lote = row.querySelector('.lote-badge')?.textContent.toLowerCase() || '';
                
                const match = nome.includes(term) || marca.includes(term) || cat.includes(term) || lote.includes(term);
                row.style.display = match ? '' : 'none';
                if(match) visible++;
            });
        });
    }

    // ── Image preview modal ──
    const modalBackdrop = document.getElementById('imgModalBackdrop');
    const modalImg = document.getElementById('imgModalImg');
    const modalClose = document.getElementById('imgModalClose');

    document.querySelectorAll('.prev-img').forEach(btn => {
        btn.addEventListener('click', function() {
            const imgSrc = this.dataset.img || this.querySelector('img')?.src;
            if(imgSrc && modalImg) {
                modalImg.src = imgSrc;
                modalBackdrop.classList.add('show');
            }
        });
    });

    if(modalClose) {
        modalClose.addEventListener('click', function() {
            modalBackdrop.classList.remove('show');
        });
    }

    if(modalBackdrop) {
        modalBackdrop.addEventListener('click', function(e) {
            if(e.target === modalBackdrop) {
                modalBackdrop.classList.remove('show');
            }
        });
    }

    // ── Close modal with Escape ──
    document.addEventListener('keydown', function(e) {
        if(e.key === 'Escape' && modalBackdrop?.classList.contains('show')) {
            modalBackdrop.classList.remove('show');
        }
    });
})