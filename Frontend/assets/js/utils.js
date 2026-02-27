/**
 * OLSOP Camera - Utility Functions
 */

const Utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    },

    formatDate(isoString) {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    },

    generateSlug(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    },

    getQueryParam(key) {
        const params = new URLSearchParams(window.location.search);
        return params.get(key);
    },

    setQueryParam(key, value) {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.pushState({}, '', newUrl);
    },

    getGlobalSettings() {
        try {
            const data = localStorage.getItem('tukam_settings');
            if (data) return JSON.parse(data);
        } catch (e) {
            console.error('Error reading settings', e);
        }
        return {
            whatsapp: '6281234567890',
            description: 'Toko perlengkapan kamera dan aksesoris terlengkap dan terpercaya.'
        };
    },

    saveGlobalSettings(settings) {
        localStorage.setItem('tukam_settings', JSON.stringify(settings));
    },

    deleteReview(productId, reviewIndex) {
        try {
            const data = localStorage.getItem('tukam_reviews');
            if (!data) return false;

            let reviewsObj = JSON.parse(data);
            if (reviewsObj[productId] && reviewsObj[productId][reviewIndex]) {
                reviewsObj[productId].splice(reviewIndex, 1);
                // If no reviews left for this product, delete the key
                if (reviewsObj[productId].length === 0) {
                    delete reviewsObj[productId];
                }
                localStorage.setItem('tukam_reviews', JSON.stringify(reviewsObj));
                return true;
            }
        } catch (e) {
            console.error('Error deleting review', e);
        }
        return false;
    },

    getAllReviewsFromStorage() {
        let allReviewsList = [];
        try {
            const data = localStorage.getItem('tukam_reviews');
            if (data) {
                const reviewsObj = JSON.parse(data);
                for (const productId in reviewsObj) {
                    reviewsObj[productId].forEach((review, index) => {
                        allReviewsList.push({
                            productId: productId,
                            reviewIndex: index,
                            ...review
                        });
                    });
                }
            }
        } catch (e) {
            console.error('Error reading all reviews', e);
        }
        return allReviewsList;
    },



    getStatusBadge(status) {
        const badges = {
            available: '<span class="badge badge-available">Tersedia</span>',
            sold: '<span class="badge badge-sold">Terjual</span>',
            archived: '<span class="badge badge-archived">Diarsipkan</span>'
        };
        return badges[status] || '';
    },


    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    renderProductCard(product, showWishlist = true) {
        const isWishlisted = wishlist.has(product.id);
        const isSold = product.status === 'sold';
        const isArchived = product.status === 'archived';

        return `
      <article class="product-card ${isSold ? 'product-card--sold' : ''}" data-id="${product.id}">
        <a href="/kamera/product.html?slug=${product.slug}" class="product-card__link">
          <div class="product-card__image-wrap">
            <img src="${product.images[0]}" alt="${product.title}" class="product-card__image" loading="lazy">
            ${isSold ? '<div class="product-card__sold-overlay"><span>TERJUAL</span></div>' : ''}
            ${isArchived ? '<div class="product-card__sold-overlay product-card__archived-overlay"><span>DIARSIPKAN</span></div>' : ''}

            ${showWishlist ? `
            <button class="product-card__wishlist ${isWishlisted ? 'active' : ''}" 
                    data-product-id="${product.id}" 
                    onclick="event.preventDefault(); toggleWishlist(this, '${product.id}')"
                    aria-label="Tambah ke wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>` : ''}
          </div>
          <div class="product-card__info">
            <p class="product-card__brand">${product.brand} · ${product.branch}</p>
            <h3 class="product-card__title">${product.title}</h3>
            <p class="product-card__price">${Utils.formatPrice(product.price)}</p>
            <div class="product-card__meta">
              <span class="product-card__category">${product.category}</span>
            </div>
          </div>
        </a>
      </article>
    `;
    },

    renderPagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';
        if (currentPage > 1) {
            html += `<button class="pagination__btn" onclick="${onPageChange}(${currentPage - 1})">‹ Prev</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="pagination__btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += '<span class="pagination__dots">...</span>';
            }
        }

        if (currentPage < totalPages) {
            html += `<button class="pagination__btn" onclick="${onPageChange}(${currentPage + 1})">Next ›</button>`;
        }

        html += '</div>';
        return html;
    },

    renderAuthMenu() {
        const wraps = document.querySelectorAll('.nav-account-wrap');
        if (wraps.length === 0) return;

        const token = localStorage.getItem('user_token');
        const userStr = localStorage.getItem('user_data');

        wraps.forEach((wrap, index) => {
            const toggleId = 'navAccountBtnToggle_' + index;
            if (token && userStr) {
                // Logged in user
                let user;
                try { user = JSON.parse(userStr); } catch { user = { name: 'User', email: '' }; }

                wrap.innerHTML = `
                    <button class="navbar__wishlist-btn" id="${toggleId}" aria-label="Akun" style="cursor: pointer; border: none; padding: 0; background: transparent;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                    <div class="nav-account-dropdown">
                        <div class="nav-account-header">
                            <div class="nav-account-name">${user.name}</div>
                            <div class="nav-account-email">${user.email || ''}</div>
                        </div>
                        <a href="/orders.html" class="nav-account-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Pesanan Saya
                        </a>
                        <div class="nav-account-sep"></div>
                        <a href="#" class="nav-account-link" onclick="event.preventDefault(); if(typeof UserAuth !== 'undefined') { UserAuth.logout(); } else { alert('UserAuth script not loaded!'); }">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </a>
                    </div>
                `;
            } else {
                // Guest
                wrap.innerHTML = `
                    <button class="navbar__wishlist-btn" id="${toggleId}" aria-label="Akun" style="cursor: pointer; border: none; padding: 0; background: transparent;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                    <div class="nav-account-dropdown">
                        <div class="nav-account-header">
                            <div class="nav-account-name">Guest</div>
                            <div class="nav-account-email" style="color:#FF0000; font-weight:500;">Silakan login dulu</div>
                        </div>
                        <div class="nav-account-sep"></div>
                        <a href="/login.html" class="nav-account-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                <polyline points="10 17 15 12 10 7"></polyline>
                                <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                            Login / Daftar
                        </a>
                    </div>
                `;
            }

            // Add click listener to toggle dropdown
            const toggleBtn = document.getElementById(toggleId);
            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // prevent document click from firing

                    // Close other open wraps first
                    document.querySelectorAll('.nav-account-wrap.active').forEach(w => {
                        if (w !== wrap) w.classList.remove('active');
                    });

                    wrap.classList.toggle('active');
                });
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-account-wrap.active').forEach(w => {
                if (!w.contains(e.target)) {
                    w.classList.remove('active');
                }
            });
        });
    }
};

// ==============================================
// CART LOGIC
// ==============================================
const Cart = {
    get() {
        try {
            const data = localStorage.getItem('tukam_cart');
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    },
    save(cart) {
        localStorage.setItem('tukam_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },
    add(product, qty = 1) {
        const cart = this.get();
        const existing = cart.find(i => i.id === product.id);
        const stockLimit = parseInt(product.stock) || 0;

        if (existing) {
            const newTotalQty = parseInt(existing.qty) + parseInt(qty);
            if (newTotalQty > stockLimit && stockLimit > 0) {
                alert(`Maaf, stok hanya tersisa ${stockLimit}`);
                existing.qty = stockLimit;
            } else {
                existing.qty = newTotalQty;
            }
        } else {
            const initialQty = parseInt(qty);
            if (initialQty > stockLimit && stockLimit > 0) {
                alert(`Maaf, stok hanya tersisa ${stockLimit}`);
                cart.push({ ...product, qty: stockLimit });
            } else {
                cart.push({ ...product, qty: initialQty });
            }
        }
        this.save(cart);
        Utils.showToast('Berhasil ditambahkan ke keranjang');
    },
    remove(id) {
        let cart = this.get();
        cart = cart.filter(i => String(i.id) !== String(id));
        this.save(cart);
    },
    updateQuantity(id, qty) {
        const cart = this.get();
        const existing = cart.find(i => String(i.id) === String(id));
        if (existing) {
            const stockLimit = parseInt(existing.stock) || 0;
            let targetQty = parseInt(qty);

            if (targetQty > stockLimit && stockLimit > 0) {
                alert(`Maaf, stok hanya tersisa ${stockLimit}`);
                targetQty = stockLimit;
            }

            existing.qty = targetQty;
            if (existing.qty <= 0) this.remove(id);
            else this.save(cart);
        }
    },
    clear() {
        localStorage.removeItem('tukam_cart');
        window.dispatchEvent(new Event('cartUpdated'));
    },
    count() {
        return this.get().reduce((acc, i) => acc + i.qty, 0);
    },
    getTotal() {
        return this.get().reduce((acc, i) => acc + (Number(i.price) * Number(i.qty)), 0);
    }
};

// ==============================================
// WISHLIST LOGIC
// ==============================================
const wishlist = {
    get() {
        try {
            const data = localStorage.getItem('tukam_wishlist');
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    },
    save(list) {
        localStorage.setItem('tukam_wishlist', JSON.stringify(list));
        this.updateHeaderCount();
    },
    add(id) {
        let list = this.get();
        id = String(id);
        if (!list.includes(id)) {
            list.push(id);
            this.save(list);
            Utils.showToast('Berhasil ditambahkan ke wishlist');
        }
    },
    remove(id) {
        let list = this.get();
        list = list.filter(i => String(i) !== String(id));
        this.save(list);
    },
    has(id) {
        return this.get().includes(String(id));
    },
    count() {
        return this.get().length;
    },
    updateHeaderCount() {
        document.querySelectorAll('.nav-wishlist-count').forEach(el => {
            el.textContent = this.count();
        });
    }
};

// Global function for product cards
window.toggleWishlist = function (btn, id) {
    if (wishlist.has(id)) {
        wishlist.remove(id);
        btn.classList.remove('active');
        const icon = btn.querySelector('svg');
        if (icon) icon.setAttribute('fill', 'none');
    } else {
        wishlist.add(id);
        btn.classList.add('active');
        const icon = btn.querySelector('svg');
        if (icon) icon.setAttribute('fill', 'currentColor');
    }
};