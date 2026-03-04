/**
 * search-popup.js — Live Search Dropdown for TuKam
 * 
 * Attach to any .navbar__search-wrap that contains an input[type=search].
 * Shows a live dropdown with matching products from db.getAll().
 * 
 * Usage: just include this script after data.js on any page.
 */
(function () {
    'use strict';

    const MAX_RESULTS = 6;

    /* ── Styles ────────────────────────────────────────────── */
    const css = `
    .sp-wrap { position: relative; }

    .sp-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 340px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        overflow: hidden;
        z-index: 9999;
        animation: sp-fade-in 0.15s ease;
        border: 1px solid #f0f0f0;
    }

    @keyframes sp-fade-in {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    .sp-dropdown__header {
        padding: 10px 14px 6px;
        font-family: 'Instrument Sans', sans-serif;
        font-size: 11px;
        font-weight: 600;
        color: #AAAAAA;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #f5f5f5;
    }

    .sp-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
        transition: background 0.12s;
        border-bottom: 1px solid #f9f9f9;
    }

    .sp-item:hover { background: #fafafa; }

    .sp-item:last-child { border-bottom: none; }

    .sp-item__img {
        width: 44px;
        height: 44px;
        border-radius: 6px;
        object-fit: cover;
        background: #f0f0f0;
        flex-shrink: 0;
    }

    .sp-item__img-placeholder {
        width: 44px;
        height: 44px;
        border-radius: 6px;
        background: #f0f0f0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .sp-item__body {
        flex: 1;
        min-width: 0;
    }

    .sp-item__name {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
        margin-bottom: 2px;
    }

    .sp-item__name mark {
        background: none;
        color: #FF0000;
        font-weight: 700;
    }

    .sp-item__price {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 500;
        color: #AAAAAA;
    }

    .sp-item__oos {
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        font-weight: 600;
        color: #fff;
        background: rgba(0,0,0,0.65);
        border-radius: 4px;
        padding: 1px 6px;
        flex-shrink: 0;
    }

    .sp-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 14px;
        background: #f9f9f9;
        font-family: 'Instrument Sans', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: #000;
        cursor: pointer;
        transition: background 0.12s;
        text-decoration: none;
    }

    .sp-footer:hover { background: #f0f0f0; color: #FF0000; }

    .sp-empty {
        padding: 20px 14px;
        text-align: center;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: #AAAAAA;
    }
    `;

    /* inject styles once */
    if (!document.getElementById('sp-styles')) {
        const s = document.createElement('style');
        s.id = 'sp-styles';
        s.textContent = css;
        document.head.appendChild(s);
    }

    /* ── Helpers ───────────────────────────────────────────── */
    function fmtPrice(price) {
        try { return window.Utils ? Utils.formatPrice(price) : 'Rp' + Number(price).toLocaleString('id-ID'); }
        catch (e) { return 'Rp' + Number(price).toLocaleString('id-ID'); }
    }

    function getAllProducts() {
        try {
            // Highest priority: Live API data loaded by kamera/index.html
            if (window.allApiProducts && Array.isArray(window.allApiProducts)) {
                return window.allApiProducts;
            }
            // Primary local: db.getAll() from ProductDB class in data.js
            if (window.db && typeof db.getAll === 'function') {
                return db.getAll();
            }
            // Fallback: try direct localStorage read
            const raw = localStorage.getItem('olsop_products');
            if (raw) return JSON.parse(raw).filter(p => p.status !== 'archived');
        } catch (e) { }
        return [];
    }

    // Safely get product name from any possible field
    function getName(p) {
        return p.title || p.name || p.nama || p.product_name || 'Produk';
    }

    // Safely get product image
    function getImg(p) {
        if (p.image_url) return p.image_url;
        if (p.images && Array.isArray(p.images) && p.images[0]) return p.images[0];
        if (p.image) return p.image;
        if (p.foto) return p.foto;
        return '';
    }

    function highlight(text, query) {
        if (!query) return escHtml(text);
        const escaped = escHtml(text);
        const re = new RegExp('(' + escRe(query) + ')', 'gi');
        return escaped.replace(re, '<mark>$1</mark>');
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escRe(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function productUrl(p) {
        const id = p.id || p.slug || '';
        return '/kamera/product.html?id=' + encodeURIComponent(id);
    }

    /* ── Build dropdown HTML ───────────────────────────────── */
    function buildDropdown(results, query) {
        if (results.length === 0) {
            return `<div class="sp-dropdown">
                      <div class="sp-empty">Tidak ada produk untuk "<strong>${escHtml(query)}</strong>"</div>
                    </div>`;
        }

        const items = results.slice(0, MAX_RESULTS).map(p => {
            const name = getName(p);
            const img = getImg(p);
            const isOOS = p.status && p.status !== 'available';
            const imgEl = img
                ? `<img class="sp-item__img" src="${escHtml(img)}" alt="${escHtml(name)}" onerror="this.style.opacity='0.3'">`
                : `<div class="sp-item__img-placeholder">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                           <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                           <circle cx="12" cy="13" r="4"/>
                       </svg>
                   </div>`;

            return `<a href="${productUrl(p)}" class="sp-item">
                        ${imgEl}
                        <div class="sp-item__body">
                            <div class="sp-item__name">${highlight(name, query)}</div>
                            <div class="sp-item__price">${fmtPrice(p.price)}</div>
                        </div>
                        ${isOOS ? '<span class="sp-item__oos">Habis</span>' : ''}
                    </a>`;
        }).join('');

        const moreUrl = '/kamera/?search=' + encodeURIComponent(query);
        const total = results.length;
        const label = total > MAX_RESULTS
            ? `Lihat semua ${total} hasil untuk "${escHtml(query)}"`
            : `Lihat hasil di halaman Produk`;

        return `<div class="sp-dropdown">
                    <div class="sp-dropdown__header">Hasil Pencarian</div>
                    ${items}
                    <a href="${moreUrl}" class="sp-footer">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        ${label}
                    </a>
                </div>`;
    }

    /* ── Init on each .navbar__search-wrap ─────────────────── */
    function initSearchPopup(wrap) {
        if (wrap.dataset.spInit) return;
        wrap.dataset.spInit = '1';
        wrap.classList.add('sp-wrap');

        const input = wrap.querySelector('input[type=search], input[type=text]');
        if (!input) return;

        let dropdown = null;
        let debounceTimer = null;

        function openDropdown(html) {
            closeDropdown();
            const div = document.createElement('div');
            div.innerHTML = html;
            dropdown = div.firstElementChild;
            wrap.appendChild(dropdown);
        }

        function closeDropdown() {
            if (dropdown) { dropdown.remove(); dropdown = null; }
        }

        function search(query) {
            query = query.trim();
            if (!query) { closeDropdown(); return; }

            // If the real API is available, query it directly for accurate results
            if (window.API && typeof API.getProducts === 'function') {
                API.getProducts({ search: query, per_page: 6 }).then(data => {
                    const results = (data && Array.isArray(data.data)) ? data.data :
                        (Array.isArray(data) ? data : []);
                    openDropdown(buildDropdown(results, query));
                }).catch(() => {
                    // Fallback to local data on error
                    _searchLocal(query);
                });
                return;
            }
            _searchLocal(query);
        }

        function _searchLocal(query) {
            const products = getAllProducts();
            const q = query.toLowerCase();
            const results = products.filter(p => {
                const name = getName(p).toLowerCase();
                const brand = (p.brand || '').toLowerCase();
                const cat = (p.category || '').toLowerCase();
                return name.includes(q) || brand.includes(q) || cat.includes(q);
            });
            openDropdown(buildDropdown(results, query));
        }

        /* debounced input event */
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => search(input.value), 180);
        });

        /* Enter: go to full search page */
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && input.value.trim()) {
                closeDropdown();
                window.location.href = '/kamera/?search=' + encodeURIComponent(input.value.trim());
            }
            if (e.key === 'Escape') closeDropdown();
        });

        /* Click outside = close */
        document.addEventListener('mousedown', (e) => {
            if (!wrap.contains(e.target)) closeDropdown();
        });

        /* Search button click */
        const btn = wrap.querySelector('.navbar__search-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (input.value.trim()) {
                    closeDropdown();
                    window.location.href = '/kamera/?search=' + encodeURIComponent(input.value.trim());
                }
            });
        }
    }

    /* ── Run after DOM ready ───────────────────────────────── */
    function run() {
        document.querySelectorAll('.navbar__search-wrap').forEach(initSearchPopup);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

})();
