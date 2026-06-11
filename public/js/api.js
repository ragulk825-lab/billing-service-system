// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Functions
export async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication APIs
export async function login(username, password) {
    return apiCall('/auth/login', 'POST', { username, password });
}

export async function getProfile() {
    return apiCall('/auth/profile');
}

export async function logout() {
    return apiCall('/auth/logout', 'POST');
}

// Customer APIs
export async function getCustomers() {
    return apiCall('/customers');
}

export async function searchCustomers(query) {
    return apiCall(`/customers/search?query=${encodeURIComponent(query)}`);
}

export async function getCustomer(id) {
    return apiCall(`/customers/${id}`);
}

export async function createCustomer(data) {
    return apiCall('/customers', 'POST', data);
}

export async function updateCustomer(id, data) {
    return apiCall(`/customers/${id}`, 'PUT', data);
}

export async function deleteCustomer(id) {
    return apiCall(`/customers/${id}`, 'DELETE');
}

export async function getCustomerBills(customerId) {
    return apiCall(`/customers/${customerId}/bills`);
}

export async function getCustomerServices(customerId) {
    return apiCall(`/customers/${customerId}/services`);
}

// Product APIs
export async function getProducts() {
    return apiCall('/billing/products');
}

export async function searchProducts(query) {
    return apiCall(`/billing/products/search?query=${encodeURIComponent(query)}`);
}

export async function getProductByBarcode(barcode) {
    return apiCall(`/billing/products/barcode/${barcode}`);
}

export async function getLowStockProducts() {
    return apiCall('/billing/products/low-stock');
}

export async function getCategories() {
    return apiCall('/billing/categories');
}

export async function createCategory(data) {
    return apiCall('/billing/categories', 'POST', data);
}

export async function createProduct(data) {
    return apiCall('/billing/products', 'POST', data);
}

export async function updateProduct(id, data) {
    return apiCall(`/billing/products/${id}`, 'PUT', data);
}

// Billing APIs
export async function getBills() {
    return apiCall('/billing/bills');
}

export async function getBill(id) {
    return apiCall(`/billing/bills/${id}`);
}

export async function createBill(data) {
    return apiCall('/billing/bills', 'POST', data);
}

export async function updateBillStatus(id, data) {
    return apiCall(`/billing/bills/${id}`, 'PUT', data);
}

export async function cancelBill(id) {
    return apiCall(`/billing/bills/${id}`, 'DELETE');
}

// Service APIs
export async function getServices() {
    return apiCall('/services');
}

export async function getService(id) {
    return apiCall(`/services/${id}`);
}

export async function searchServices(query, searchType = 'customer') {
    return apiCall(`/services/search?query=${encodeURIComponent(query)}&searchType=${searchType}`);
}

export async function createService(data) {
    return apiCall('/services', 'POST', data);
}

export async function updateServiceStatus(id, data) {
    return apiCall(`/services/${id}/status`, 'PUT', data);
}

export async function assignTechnician(id, data) {
    return apiCall(`/services/${id}/technician`, 'PUT', data);
}

// Expense APIs
export async function getExpenses() {
    return apiCall('/expenses');
}

export async function createExpense(data) {
    return apiCall('/expenses', 'POST', data);
}

export async function deleteExpense(id) {
    return apiCall(`/expenses/${id}`, 'DELETE');
}

export async function getExpenseSummary() {
    return apiCall('/expenses/summary');
}

// User APIs
export async function getUsers() {
    return apiCall('/users');
}

export async function createUser(data) {
    return apiCall('/users', 'POST', data);
}

export async function updateUser(id, data) {
    return apiCall(`/users/${id}`, 'PUT', data);
}

export async function deleteUser(id) {
    return apiCall(`/users/${id}`, 'DELETE');
}

export async function changePassword(id, data) {
    return apiCall(`/users/${id}/change-password`, 'POST', data);
}

// Report APIs
export async function getDashboardData() {
    return apiCall('/reports/dashboard');
}

export async function getMonthlyRevenue(year) {
    return apiCall(`/reports/monthly-revenue?year=${year}`);
}

export async function getTopProducts(limit = 10) {
    return apiCall(`/reports/top-products?limit=${limit}`);
}

export async function getDailyReport(date) {
    return apiCall(`/reports/daily?date=${date}`);
}

export async function getMonthlyReport(month) {
    return apiCall(`/reports/monthly?month=${month}`);
}
