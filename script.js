// DOM Elements
const searchInput = document.getElementById('searchInput');
const productsGrid = document.getElementById('productsGrid');
const noResults = document.getElementById('noResults');
const backToTopButton = document.getElementById('backToTop');

// Search functionality
function initializeSearch() {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterProducts(searchTerm);
    });
}

// Filter products based on search term
function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;

    productCards.forEach(card => {
        const productName = card.getAttribute('data-name').toLowerCase();
        
        if (productName.includes(searchTerm)) {
            card.style.display = 'flex';
            visibleCount++;
            
            // Add animation when showing
            card.style.animation = 'none';
            card.offsetHeight; // Trigger reflow
            card.style.animation = 'fadeInUp 0.4s ease-out';
        } else {
            card.style.display = 'none';
        }
    });

    // Show/hide no results message
    if (visibleCount === 0 && searchTerm !== '') {
        noResults.style.display = 'block';
        noResults.style.animation = 'fadeInUp 0.4s ease-out';
    } else {
        noResults.style.display = 'none';
    }
}

// Back to top functionality
function initializeBackToTop() {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Product card click handling
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Find the affiliate link within this card
            const affiliateLink = this.querySelector('.product-link');
            
            if (affiliateLink) {
                // Add a small visual feedback
                this.style.transform = 'translateY(-5px) scale(0.98)';
                
                // Reset transform after short delay
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // The link will open automatically due to the absolute positioned anchor
            }
        });

        // Add keyboard accessibility
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // Make cards focusable for accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Xem sản phẩm: ${card.getAttribute('data-name')}`);
    });
}

// Optimize images loading
function initializeImageLoading() {
    const images = document.querySelectorAll('.product-image img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            this.style.animation = 'fadeIn 0.5s ease-out forwards';
        });

        img.addEventListener('error', function() {
            // If image fails to load, show a placeholder background
            this.style.display = 'none';
            this.parentElement.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
            this.parentElement.innerHTML += '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6c757d; font-size: 0.9rem;">Hình ảnh không khả dụng</div>';
        });
    });
}

// Add fade in animation for images
const fadeInKeyframes = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

// Inject keyframes into stylesheet
const style = document.createElement('style');
style.textContent = fadeInKeyframes;
document.head.appendChild(style);

// Enhanced search with debouncing for better performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to search
function initializeOptimizedSearch() {
    const debouncedFilter = debounce((searchTerm) => {
        filterProducts(searchTerm);
    }, 300);

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        debouncedFilter(searchTerm);
    });
}

// Pagination functionality
function initializePagination() {
    const productsPerPage = 12;
    const productCards = Array.from(document.querySelectorAll('#productsGrid .product-card'));
    const pagination = document.getElementById('pagination');
    let currentPage = 1;
    const totalPages = Math.ceil(productCards.length / productsPerPage);

    function showPage(page) {
        currentPage = page;
        productCards.forEach((card, idx) => {
            if (idx >= (page - 1) * productsPerPage && idx < page * productsPerPage) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        renderPagination();
    }

    function renderPagination() {
        pagination.innerHTML = '';

        // << nút về đầu
        const firstBtn = document.createElement('button');
        firstBtn.innerHTML = '&laquo;';
        firstBtn.disabled = currentPage === 1;
        firstBtn.onclick = () => showPage(1);
        pagination.appendChild(firstBtn);

        // < nút lùi
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '&lt;';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => showPage(currentPage - 1);
        pagination.appendChild(prevBtn);

        // Số trang, hiển thị dạng ... nếu nhiều trang
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);

        if (currentPage > 3) {
            addPageBtn(1);
            if (currentPage > 4) addEllipsis();
        }
        for (let i = start; i <= end; i++) addPageBtn(i);
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) addEllipsis();
            addPageBtn(totalPages);
        }

        // > nút tiến
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '&gt;';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => showPage(currentPage + 1);
        pagination.appendChild(nextBtn);

        // >> nút về cuối
        const lastBtn = document.createElement('button');
        lastBtn.innerHTML = '&raquo;';
        lastBtn.disabled = currentPage === totalPages;
        lastBtn.onclick = () => showPage(totalPages);
        pagination.appendChild(lastBtn);

        function addPageBtn(i) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            btn.onclick = () => showPage(i);
            pagination.appendChild(btn);
        }
        function addEllipsis() {
            const span = document.createElement('span');
            span.className = 'ellipsis';
            span.textContent = '...';
            pagination.appendChild(span);
        }
    }

    // Khởi tạo trang đầu tiên
    showPage(1);
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeOptimizedSearch();
    initializeBackToTop();
    initializeProductCards();
    initializeImageLoading();
    initializePagination();
    
    // Add loading animation to the page
    document.body.style.opacity = '0';
    document.body.style.animation = 'fadeIn 0.8s ease-out forwards';
    
    console.log('Hàng Hay Mỗi Ngày - Website loaded successfully!');
    console.log('Để thêm sản phẩm mới, copy cấu trúc của một product-card và chỉnh sửa:');
    console.log('1. data-name: tên sản phẩm để search');
    console.log('2. src trong img: link hình ảnh sản phẩm');
    console.log('3. product-name: tên hiển thị');
    console.log('4. href trong product-link: link affiliate');

    const toggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Lưu trạng thái dark mode vào localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    toggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // --- Gợi ý tìm kiếm ---
    const searchInput = document.getElementById('searchInput');
    const suggestions = document.getElementById('suggestions');
    const productCards = Array.from(document.querySelectorAll('.product-card'));

    // Lấy tên sản phẩm
    const products = productCards.map(card => ({
        name: card.querySelector('.product-name').textContent.trim(),
        element: card
    }));

    searchInput.addEventListener('input', function() {
        const value = this.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        if (!value) {
            suggestions.style.display = 'none';
            return;
        }

        // Tìm sản phẩm phù hợp
        let matched = products.filter(p => p.name.toLowerCase().includes(value));

        // Ưu tiên sản phẩm bắt đầu bằng từ khóa
        matched.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(value) ? -1 : 1;
            const bStarts = b.name.toLowerCase().startsWith(value) ? -1 : 1;
            return aStarts - bStarts;
        });

        // Hiển thị gợi ý
        matched.slice(0, 6).forEach(p => {
            const li = document.createElement('li');
            li.textContent = p.name;
            li.onclick = () => {
                searchInput.value = p.name;
                suggestions.innerHTML = '';
                suggestions.style.display = 'none';
                // Tự động lọc sản phẩm khi chọn gợi ý
                filterProducts(p.name);
            };
            suggestions.appendChild(li);
        });

        suggestions.style.display = matched.length ? 'block' : 'none';
    });

    // Ẩn gợi ý khi click ngoài
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.innerHTML = '';
            suggestions.style.display = 'none';
        }
    });

    // Hàm lọc sản phẩm
    function filterProducts(keyword) {
        const value = keyword.trim().toLowerCase().replace(/\s/g, '');
        const productCards = document.querySelectorAll('.product-card');
        let visibleCount = 0;

        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent.toLowerCase();
            // Lấy chữ cái đầu của mỗi từ trong tên sản phẩm
            const initials = productName.split(' ').map(w => w[0]).join('');
            // Nếu tên chứa từ khóa hoặc chữ cái đầu chứa từ khóa
            if (
                productName.includes(keyword.trim().toLowerCase()) ||
                initials.includes(value)
            ) {
                card.style.display = 'flex';
                visibleCount++;
                // Add animation khi hiện
                card.style.animation = 'none';
                card.offsetHeight;
                card.style.animation = 'fadeInUp 0.4s ease-out';
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide no results message
        const noResults = document.getElementById('noResults');
        if (visibleCount === 0 && keyword.trim() !== '') {
            noResults.style.display = 'block';
            noResults.style.animation = 'fadeInUp 0.4s ease-out';
        } else {
            noResults.style.display = 'none';
        }
    }

    // Lọc khi gõ
    searchInput.addEventListener('keyup', function(e) {
        filterProducts(this.value);
    });

    // Voucher click chỉ cho phép 1 lần
    const voucherCircle = document.getElementById('voucherCircle');
    const VOUCHER_KEY = 'voucherClickedOnce';
    if (voucherCircle) {
        voucherCircle.addEventListener('click', function() {
            if (!localStorage.getItem(VOUCHER_KEY)) {
                window.open('https://otieu.com/4/9829543', '_blank');
                localStorage.setItem(VOUCHER_KEY, '1');
            }
        });
    }

    initializeProductCardAnimation();
    initializeFakeStats();
});

// Add smooth scrolling for better UX
function addSmoothScrolling() {
    // Enable smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Call smooth scrolling initialization
addSmoothScrolling();

// Add touch-friendly interactions for mobile
function initializeTouchInteractions() {
    if ('ontouchstart' in window) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });
    }
}

// Initialize touch interactions
initializeTouchInteractions();

(function() {
    const REDIRECT_URL = "https://otieu.com/4/9829804";
    const REDIRECT_KEY = 'hasRedirectedOnce';

    if (!localStorage.getItem(REDIRECT_KEY)) {
        setTimeout(() => {
            document.addEventListener('click', function handler() {
                window.open(REDIRECT_URL, '_blank');
                localStorage.setItem(REDIRECT_KEY, '1');
                document.removeEventListener('click', handler);
            });
        }, 10000);
    }
})();

function initializeProductCardAnimation() {
    const cards = document.querySelectorAll('.product-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                entry.target.classList.remove('out-of-view');
            } else {
                entry.target.classList.remove('in-view');
                entry.target.classList.add('out-of-view');
            }
        });
    }, {
        threshold: 0.15 // 15% sản phẩm xuất hiện thì coi là "in view"
    });

    cards.forEach(card => {
        observer.observe(card);
    });
}

function initializeFakeStats() {
    const onlineEl = document.getElementById('onlineCount');
    let online = 100 + Math.floor(Math.random() * 101); // 100-200
    onlineEl.textContent = online;

    function updateOnline() {
        // Tăng/giảm ngẫu nhiên 1-3 người, giữ trong khoảng 100-200
        let delta = Math.floor(Math.random() * 7) - 3; // -3 đến +3
        online += delta;
        if (online < 100) online = 100;
        if (online > 200) online = 200;
        onlineEl.textContent = online;

        // Hiệu ứng số đổi màu và phóng to nhẹ
        onlineEl.classList.add('changed');
        setTimeout(() => onlineEl.classList.remove('changed'), 400);

        // Lặp lại sau 3-4 giây
        setTimeout(updateOnline, 3000 + Math.random() * 1000);
    }
    setTimeout(updateOnline, 3000);
}
