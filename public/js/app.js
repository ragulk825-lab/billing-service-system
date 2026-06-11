import { getToken, saveToken, saveUserInfo, removeToken, removeUserInfo, isAuthenticated, getUserInfo } from './auth.js';
import { showToast, formatCurrency, formatDate, formatDateTime, initDarkMode, toggleDarkMode, updateCurrentTime } from './utils.js';
import * as api from './api.js';

// ===== PAGE NAVIGATION =====
function setupPageNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = item.dataset.page;
            
            // Update active menu item
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            
            // Update page title
            document.getElementById('pageTitle').textContent = item.textContent.trim();
            
            // Show appropriate page
            showPage(pageName);
        });
    });
}

function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page specific content
        loadPageContent(pageName);
    }
}

async function loadPageContent(pageName) {
    try {
        switch (pageName) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'customers':
                await loadCustomers();
                break;
            case 'billing':
                await loadBilling();
                break;
            case 'inventory':
                await loadInventory();
                break;
            case 'services':
                await loadServices();
                break;
            case 'expenses':
                await loadExpenses();
                break;
            case 'reports':
                await loadReports();
                break;
            case 'users':
                await loadUsers();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${pageName}:`, error);
        showToast(`Error loading ${pageName}`, 'error');
    }
}

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const data = await api.getDashboardData();
        
        // Update stats
        document.getElementById('todayIncome').textContent = formatCurrency(data.data.todayRevenue);
        document.getElementById('todayExpenses').textContent = formatCurrency(data.data.todayExpenses);
        document.getElementById('todayProfit').textContent = formatCurrency(data.data.todayProfit);
        document.getElementById('pendingServices').textContent = data.data.pendingServices;
        
        // Load recent bills
        const billsHtml = data.data.recentBills.map(bill => `
            <tr>
                <td>${bill.invoiceNumber}</td>
                <td>${bill.customerName}</td>
                <td>${formatCurrency(bill.totalAmount)}</td>
                <td>${formatDate(bill.billDate)}</td>
            </tr>
        `).join('');
        document.getElementById('recentBillsTable').innerHTML = billsHtml || '<tr><td colspan="4">No recent bills</td></tr>';
        
        // Load recent services
        const servicesHtml = data.data.recentServices.map(service => `
            <tr>
                <td>${service.serviceId}</td>
                <td>${service.customerName}</td>
                <td>${service.deviceType}</td>
                <td><span class="status-badge ${service.status}">${service.status}</span></td>
            </tr>
        `).join('');
        document.getElementById('recentServicesTable').innerHTML = servicesHtml || '<tr><td colspan="4">No recent services</td></tr>';
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// ===== CUSTOMERS PAGE =====
async function loadCustomers() {
    try {
        const response = await api.getCustomers();
        const customers = response.data;
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Balance</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        if (customers.length > 0) {
            customers.forEach(customer => {
                html += `<tr>
                    <td>${customer.name}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.email || '-'}</td>
                    <td>${customer.city || '-'}</td>
                    <td>${formatCurrency(customer.outstandingBalance)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editCustomer('${customer.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${customer.id}')">Delete</button>
                    </td>
                </tr>`;
            });
        } else {
            html += '<tr><td colspan="6" style="text-align: center;">No customers found</td></tr>';
        }
        
        html += '</tbody></table>';
        document.getElementById('customersList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Failed to load customers', 'error');
    }
}

// ===== BILLING PAGE =====
async function loadBilling() {
    try {
        const response = await api.getBills();
        const bills = response.data;
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        if (bills.length > 0) {
            bills.forEach(bill => {
                html += `<tr>
                    <td>${bill.invoiceNumber}</td>
                    <td>${bill.customerName}</td>
                    <td>${formatCurrency(bill.totalAmount)}</td>
                    <td><span class="status-badge ${bill.paymentStatus}">${bill.paymentStatus}</span></td>
                    <td>${formatDate(bill.billDate)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewBill('${bill.id}')">View</button>
                        <button class="btn btn-danger btn-sm" onclick="cancelBill('${bill.id}')">Cancel</button>
                    </td>
                </tr>`;
            });
        } else {
            html += '<tr><td colspan="6" style="text-align: center;">No bills found</td></tr>';
        }
        
        html += '</tbody></table>';
        document.getElementById('billsList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading bills:', error);
        showToast('Failed to load bills', 'error');
    }
}

// ===== INVENTORY PAGE =====
async function loadInventory() {
    try {
        const response = await api.getProducts();
        const products = response.data;
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Product</th><th>SKU</th><th>Price</th><th>Quantity</th><th>Stock Level</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        if (products.length > 0) {
            products.forEach(product => {
                const stockClass = product.quantity <= product.reorderLevel ? 'warning' : 'success';
                html += `<tr>
                    <td>${product.name}</td>
                    <td>${product.sku || '-'}</td>
                    <td>${formatCurrency(product.sellingPrice)}</td>
                    <td>${product.quantity}</td>
                    <td><span class="status-badge ${stockClass}">${product.quantity}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editProduct('${product.id}')">Edit</button>
                    </td>
                </tr>`;
            });
        } else {
            html += '<tr><td colspan="6" style="text-align: center;">No products found</td></tr>';
        }
        
        html += '</tbody></table>';
        document.getElementById('inventoryList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading inventory:', error);
        showToast('Failed to load inventory', 'error');
    }
}

// ===== SERVICES PAGE =====
async function loadServices() {
    try {
        const response = await api.getServices();
        const services = response.data;
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Service ID</th><th>Customer</th><th>Device</th><th>Status</th><th>Date</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        if (services.length > 0) {
            services.forEach(service => {
                html += `<tr>
                    <td>${service.serviceId}</td>
                    <td>${service.customerName}</td>
                    <td>${service.deviceType}</td>
                    <td><span class="status-badge ${service.status}">${service.status}</span></td>
                    <td>${formatDate(service.createdAt)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewService('${service.id}')">View</button>
                    </td>
                </tr>`;
            });
        } else {
            html += '<tr><td colspan="6" style="text-align: center;">No services found</td></tr>';
        }
        
        html += '</tbody></table>';
        document.getElementById('servicesList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading services:', error);
        showToast('Failed to load services', 'error');
    }
}

// ===== EXPENSES PAGE =====
async function loadExpenses() {
    try {
        const response = await api.getExpenses();
        const expenses = response.data;
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        if (expenses.length > 0) {
            expenses.forEach(expense => {
                html += `<tr>
                    <td>${expense.category}</td>
                    <td>${expense.description}</td>
                    <td>${formatCurrency(expense.amount)}</td>
                    <td>${formatDate(expense.expenseDate)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteExpense('${expense.id}')">Delete</button>
                    </td>
                </tr>`;
            });
        } else {
            html += '<tr><td colspan="5" style="text-align: center;">No expenses found</td></tr>';
        }
        
        html += '</tbody></table>';
        document.getElementById('expensesList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading expenses:', error);
        showToast('Failed to load expenses', 'error');
    }
}

// ===== REPORTS PAGE =====
async function loadReports() {
    try {
        const dashData = await api.getDashboardData();
        const data = dashData.data;
        
        let html = '<div class="dashboard-section">';
        html += '<h3>Financial Summary</h3>';
        html += '<div class="stats-container">';
        html += `<div class="stat-card"><div class="stat-content"><div class="stat-label">Total Revenue</div><div class="stat-value">${formatCurrency(data.todayRevenue)}</div></div></div>`;
        html += `<div class="stat-card"><div class="stat-content"><div class="stat-label">Total Expenses</div><div class="stat-value">${formatCurrency(data.todayExpenses)}</div></div></div>`;
        html += `<div class="stat-card"><div class="stat-content"><div class="stat-label">Net Profit</div><div class="stat-value">${formatCurrency(data.todayProfit)}</div></div></div>`;
        html += '</div></div>';
        
        document.getElementById('reportsList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Failed to load reports', 'error');
    }
}

// ===== USERS PAGE =====
async function loadUsers() {
    try {
        const response = await api.getUsers();
        const users = response.data;
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Username</th><th>Email</th><th>Full Name</th><th>Role</th><th>Status</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        if (users.length > 0) {
            users.forEach(user => {
                html += `<tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.fullName}</td>
                    <td>${user.role}</td>
                    <td><span class="status-badge ${user.status}">${user.status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editUser('${user.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">Delete</button>
                    </td>
                </tr>`;
            });
        } else {
            html += '<tr><td colspan="6" style="text-align: center;">No users found</td></tr>';
        }
        
        html += '</tbody></table>';
        document.getElementById('usersList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Failed to load users', 'error');
    }
}

// ===== INITIALIZATION =====
async function initApp() {
    try {
        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }
        
        // Initialize theme
        initDarkMode();
        
        // Setup page navigation
        setupPageNavigation();
        
        // Load user info
        const user = getUserInfo();
        document.getElementById('userInfo').textContent = `${user.fullName} (${user.role})`;
        
        // Update time every second
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
        
        // Load dashboard by default
        await loadDashboard();
        
        // Setup event listeners
        setupEventListeners();
        
        showToast('Welcome back!', 'success');
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Error initializing application', 'error');
    }
}

function setupEventListeners() {
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        removeToken();
        removeUserInfo();
        window.location.href = '/login.html';
    });
    
    // Modal close
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('modal').classList.remove('active');
    });
    
    // Sidebar toggle on mobile
    document.querySelector('.sidebar-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Make functions globally available
window.viewBill = (id) => console.log('View bill:', id);
window.cancelBill = (id) => console.log('Cancel bill:', id);
window.editCustomer = (id) => console.log('Edit customer:', id);
window.deleteCustomer = (id) => console.log('Delete customer:', id);
window.viewService = (id) => console.log('View service:', id);
window.deleteExpense = (id) => console.log('Delete expense:', id);
window.editProduct = (id) => console.log('Edit product:', id);
window.editUser = (id) => console.log('Edit user:', id);
window.deleteUser = (id) => console.log('Delete user:', id);
