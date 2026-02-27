/**
 * TuKam Camera - API Layer
 * Menghubungkan frontend ke Laravel Backend API
 */

// ─── Production Base URL Configuration ───
// Gunakan window.location.origin jika frontend dan backend di domain yang sama, 
// atau ubah ke URL production khusus (misalnya https://api.tukam.com)
// const ENVIRONMENT_URL = 'https://api.domain-website.com/api';
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api'
    : '/api'; // Ganti ini jika backend berada di domain terpisah

const TOKEN_KEY = 'tukam_admin_token';

const API = {

    // ─── Auth ───────────────────────────────────────────────────────────────
    async login(email, password) {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login gagal');
        return data; // { token, user }
    },

    async logout() {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;
        await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        localStorage.removeItem(TOKEN_KEY);
    },

    // ─── Public Products ─────────────────────────────────────────────────────
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.brand) params.set('brand', filters.brand);
        if (filters.category) params.set('category', filters.category);
        if (filters.branch) params.set('branch', filters.branch);
        if (filters.status) params.set('status', filters.status);
        if (filters.grade) params.set('grade', filters.grade);
        if (filters.min_price) params.set('min_price', filters.min_price);
        if (filters.max_price) params.set('max_price', filters.max_price);
        if (filters.page) params.set('page', filters.page);
        if (filters.per_page) params.set('per_page', filters.per_page);

        const res = await fetch(`${BASE_URL}/products?${params}`, {
            headers: { 'Accept': 'application/json' }
        });
        return res.json();
    },

    async getProductBySlug(slug) {
        const res = await fetch(`${BASE_URL}/products/${slug}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return null;
        return res.json();
    },

    // ─── Public Lookups (Brands, Categories, Branches) ───────────────────────
    async getBrands() {
        const res = await fetch(`${BASE_URL}/brands`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('Failed to fetch brands');
        return res.json();
    },

    async getCategories() {
        const res = await fetch(`${BASE_URL}/categories`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    async getBranches() {
        const res = await fetch(`${BASE_URL}/branches`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('Failed to fetch branches');
        return res.json();
    },

    // ─── Admin Products ──────────────────────────────────────────────────────
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    async getAdminProducts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.brand) params.set('brand', filters.brand);
        if (filters.branch) params.set('branch', filters.branch);
        if (filters.page) params.set('page', filters.page);
        if (filters.per_page) params.set('per_page', filters.per_page);

        const token = this.getToken();
        const res = await fetch(`${BASE_URL}/admin/products?${params}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (res.status === 401) { AdminAuth.forceLogout(); return null; }
        return res.json();
    },

    async createProduct(data) {
        const token = this.getToken();
        // data can be FormData (with image) or plain object
        const isFormData = data instanceof FormData;
        const res = await fetch(`${BASE_URL}/admin/products`, {
            method: 'POST',
            headers: isFormData
                ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: isFormData ? data : JSON.stringify(data)
        });
        const body = await res.json();
        if (!res.ok) throw body;
        return body;
    },

    async updateProduct(id, data) {
        const token = this.getToken();
        const isFormData = data instanceof FormData;
        // For FormData with PUT, Laravel needs _method spoofing
        if (isFormData) {
            data.append('_method', 'PUT');
            const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
                method: 'POST', // Laravel handles PUT via _method
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: data
            });
            const body = await res.json();
            if (!res.ok) throw body;
            return body;
        }
        const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
        });
        const body = await res.json();
        if (!res.ok) throw body;
        return body;
    },

    async deleteProduct(id) {
        const token = this.getToken();
        const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('Gagal menghapus produk');
        return res.json();
    },

    // ─── Admin Orders ────────────────────────────────────────────────────────
    async getAdminOrders(filters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.page) params.set('page', filters.page);

        const token = this.getToken();
        const res = await fetch(`${BASE_URL}/admin/orders?${params}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (res.status === 401) { AdminAuth.forceLogout(); return null; }
        return res.json();
    },

    async updateAdminOrderStatus(id, status, tracking_number = null) {
        const token = this.getToken();
        const payload = { status };
        if (tracking_number) payload.tracking_number = tracking_number;

        const res = await fetch(`${BASE_URL}/admin/orders/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        });
        const body = await res.json();
        if (!res.ok) throw body;
        return body;
    },

    // ─── SEO Pages ────────────────────────────────────────────────────────────
    async getBranchPage(slug) {
        const res = await fetch(`${BASE_URL}/branches/${slug}`, { headers: { 'Accept': 'application/json' } });
        return res.json();
    },

    async getBrandPage(slug) {
        const res = await fetch(`${BASE_URL}/brands/${slug}`, { headers: { 'Accept': 'application/json' } });
        return res.json();
    },

    async getCategoryPage(slug) {
        const res = await fetch(`${BASE_URL}/categories/${slug}`, { headers: { 'Accept': 'application/json' } });
        return res.json();
    },

    // ─── Lookup Helpers ──────────────────────────────────────────────────────
    // Map brand/category/branch NAME to ID from a cached product list
    _lookupCache: null,

    async getLookupData() {
        if (this._lookupCache) return this._lookupCache;
        // Fetch all brands, categories, branches from existing admin product list
        const res = await fetch(`${BASE_URL}/admin/products?per_page=1`, {
            headers: { 'Authorization': `Bearer ${this.getToken()}`, 'Accept': 'application/json' }
        });
        // Use separate endpoints to get IDs
        const [brands, categories, branches] = await Promise.all([
            fetch(`${BASE_URL}/brands/sony`, { headers: { 'Accept': 'application/json' } }).then(() => true), // test
        ]);
        return null;
    },

    // Fetch id data via dedicated simple endpoints
    async getBrands() {
        const res = await fetch(`${BASE_URL}/brands`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return [];
        return res.json();
    },

    async getCategories() {
        const res = await fetch(`${BASE_URL}/categories`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return [];
        return res.json();
    },

    async getBranches() {
        const res = await fetch(`${BASE_URL}/branches`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return [];
        return res.json();
    }
};

// ─── Admin Auth (API-based) ───────────────────────────────────────────────────
const AdminAuth = {
    async login(email, password) {
        try {
            const data = await API.login(email, password);
            localStorage.setItem('tukam_admin_token', data.token);
            localStorage.setItem('tukam_admin_user', JSON.stringify(data.user));
            // Also set the old key format so existing dashboard/settings pages still work
            localStorage.setItem('olsop_admin_session', JSON.stringify({ loggedIn: true, username: data.user.name, loginTime: Date.now() }));
            return true;
        } catch (e) {
            return false;
        }
    },

    logout() {
        API.logout();
        localStorage.removeItem('tukam_admin_token');
        localStorage.removeItem('tukam_admin_user');
        localStorage.removeItem('olsop_admin_session');
    },

    forceLogout() {
        this.logout();
        window.location.href = '/admin/index.html';
    },

    isLoggedIn() {
        return !!localStorage.getItem('tukam_admin_token');
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/admin/index.html';
            return false;
        }
        return true;
    }
};

// --- Public User Auth (API-based) ---------------------------------------------
const UserAuth = {
    getToken() {
        return localStorage.getItem('user_token');
    },

    getUser() {
        try {
            return JSON.parse(localStorage.getItem('user_data'));
        } catch {
            return null;
        }
    },

    logout() {
        const token = this.getToken();
        if (token) {
            fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            }).catch(e => console.error(e)); // Fire and forget
        }
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        window.location.reload();
    },

    checkAuthState() {
        // Now handled dynamically by Utils.renderAuthMenu()
    }
};

// --- Orders API ---------------------------------------------------------------
const Orders = {
    async getUserOrders() {
        const token = UserAuth.getToken();
        const res = await fetch(`${BASE_URL}/user/orders`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },

    async get(orderNumber) {
        const res = await fetch(`${BASE_URL}/orders/${orderNumber}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('Order not found');
        return res.json();
    },

    async track(orderNumber) {
        const res = await fetch(`${BASE_URL}/orders/${orderNumber}/track`, {
            headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Tracking error');
        return data; // returns {status, message, data: {...}} 
    }
};

window.API = API;
window.AdminAuth = AdminAuth;
window.UserAuth = UserAuth;
window.Orders = Orders;

// Auto check auth state when page loads
document.addEventListener('DOMContentLoaded', () => {
    UserAuth.checkAuthState();
});
