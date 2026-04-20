// Base URL for API
const API_BASE = '/api';

// --- Login Logic ---
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    
    // Simple client-side check for demonstration
    if (user === 'admin' && pass === 'admin') {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-dashboard').style.display = 'block';
        showSection('welcome-sec');
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function handleLogout() {
    document.getElementById('main-dashboard').style.display = 'none';
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('login-form').reset();
    document.getElementById('login-error').style.display = 'none';
}

// --- Navigation Logic ---
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // Load data based on section
    if (sectionId === 'cust-form-sec') resetCustomerForm();
    if (sectionId === 'cat-form-sec') resetCategoryForm();
    if (sectionId === 'prod-form-sec') { loadCategoriesForDropdown('prod-category'); resetProductForm(); }
    if (sectionId === 'sup-form-sec') resetSupplierForm();
    
    if (sectionId === 'purchase-sec') { loadProductsForDropdown('purch-product'); loadSuppliersForDropdown('purch-supplier'); }
    if (sectionId === 'sales-sec') { 
        loadCustomersForDropdown('bill-customer'); 
        loadProductsForDropdown('bill-product'); 
        document.getElementById('bill-date').valueAsDate = new Date();
    }
    
    if (sectionId === 'cust-view-sec') loadCustomers();
    if (sectionId === 'cat-view-sec') loadCategories();
    if (sectionId === 'prod-view-sec') loadProducts();
    if (sectionId === 'sup-view-sec') loadSuppliers();
    if (sectionId === 'stock-sec') loadStock();
    if (sectionId === 'bills-view-sec') loadBills();
}

async function fetchJSON(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    return res.json();
}

function padId(prefix, id) {
    return prefix + id.toString().padStart(3, '0');
}

// --- Customer Logic ---
let customersData = [];
async function loadCustomers() {
    customersData = await fetchJSON(`${API_BASE}/customers`);
    const tbody = document.getElementById('customer-table-body');
    tbody.innerHTML = customersData.map(c => `
        <tr>
            <td>${padId('C', c.id)}</td><td>${c.name}</td><td>${c.address || '-'}</td><td>${c.phone}</td>
            <td>
                <button class="btn-primary" style="padding:6px 12px; font-size:12px;" onclick="editCustomer(${c.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function resetCustomerForm() {
    document.getElementById('customer-form').reset();
    document.getElementById('cust-id').value = '';
    document.getElementById('cust-disp-id').value = '';
}

function editCustomer(id) {
    const c = customersData.find(x => x.id === id);
    if(c) {
        showSection('cust-form-sec');
        document.getElementById('cust-id').value = c.id;
        document.getElementById('cust-disp-id').value = padId('C', c.id);
        document.getElementById('cust-name').value = c.name;
        document.getElementById('cust-phone').value = c.phone;
        document.getElementById('cust-email').value = c.email || '';
        document.getElementById('cust-address').value = c.address || '';
    }
}

async function saveCustomer(e) {
    e.preventDefault();
    const id = document.getElementById('cust-id').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/customers/${id}` : `${API_BASE}/customers`;
    
    await fetchJSON(url, {
        method: method,
        body: JSON.stringify({
            name: document.getElementById('cust-name').value,
            phone: document.getElementById('cust-phone').value,
            email: document.getElementById('cust-email').value,
            address: document.getElementById('cust-address').value
        })
    });
    alert(id ? "Record Updated" : "One Record Inserted");
    resetCustomerForm();
}

async function deleteCustomer() {
    const id = document.getElementById('cust-id').value;
    if(!id) return alert("Select a customer to delete");
    if(confirm("Are you sure?")) {
        await fetchJSON(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
        resetCustomerForm();
        alert("Record Deleted");
    }
}

// --- Category Logic ---
let categoriesData = [];
async function loadCategories() {
    categoriesData = await fetchJSON(`${API_BASE}/categories`);
    const tbody = document.getElementById('category-table-body');
    tbody.innerHTML = categoriesData.map(c => `
        <tr>
            <td>${padId('CT', c.id)}</td><td>${c.name}</td>
            <td><button class="btn-primary" style="padding:6px 12px; font-size:12px;" onclick="editCategory(${c.id})">Edit</button></td>
        </tr>
    `).join('');
}

function resetCategoryForm() {
    document.getElementById('category-form').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-disp-id').value = '';
}

function editCategory(id) {
    const c = categoriesData.find(x => x.id === id);
    if(c) {
        showSection('cat-form-sec');
        document.getElementById('cat-id').value = c.id;
        document.getElementById('cat-disp-id').value = padId('CT', c.id);
        document.getElementById('cat-name').value = c.name;
    }
}

async function saveCategory(e) {
    e.preventDefault();
    const id = document.getElementById('cat-id').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
    await fetchJSON(url, {
        method: method,
        body: JSON.stringify({ name: document.getElementById('cat-name').value })
    });
    alert(id ? "Record Updated" : "One Record Inserted");
    resetCategoryForm();
}

async function deleteCategory() {
    const id = document.getElementById('cat-id').value;
    if(!id) return alert("Select a category to delete");
    if(confirm("Are you sure?")) {
        await fetchJSON(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
        resetCategoryForm();
        alert("Record Deleted");
    }
}

function loadCategoriesForDropdown(elementId) {
    fetchJSON(`${API_BASE}/categories`).then(data => {
        document.getElementById(elementId).innerHTML = `<option value="">Select Category</option>` + 
            data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    });
}

// --- Product Logic ---
let productsData = [];
async function loadProducts() {
    productsData = await fetchJSON(`${API_BASE}/products`);
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = productsData.map(p => `
        <tr>
            <td>${padId('P', p.id)}</td><td>${p.name}</td><td>${p.category}</td>
            <td>${p.mfd || '-'}</td><td>${p.price}</td>
            <td><button class="btn-primary" style="padding:6px 12px; font-size:12px;" onclick="editProduct(${p.id})">Edit</button></td>
        </tr>
    `).join('');
}

function resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-disp-id').value = '';
}

function editProduct(id) {
    const p = productsData.find(x => x.id === id);
    if(p) {
        showSection('prod-form-sec');
        loadCategoriesForDropdown('prod-category');
        setTimeout(() => { // wait for dropdown to populate
            document.getElementById('prod-id').value = p.id;
            document.getElementById('prod-disp-id').value = padId('P', p.id);
            document.getElementById('prod-name').value = p.name;
            
            let catOptions = Array.from(document.getElementById('prod-category').options);
            let catOpt = catOptions.find(o => o.text === p.category);
            if(catOpt) document.getElementById('prod-category').value = catOpt.value;
            
            document.getElementById('prod-price').value = p.price;
            document.getElementById('prod-mfd').value = p.mfd || '';
        }, 100);
    }
}

async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
    await fetchJSON(url, {
        method: method,
        body: JSON.stringify({
            name: document.getElementById('prod-name').value,
            category_id: document.getElementById('prod-category').value,
            price: document.getElementById('prod-price').value,
            mfd: document.getElementById('prod-mfd').value
        })
    });
    alert(id ? "Record Updated" : "One Record Inserted");
    resetProductForm();
}

async function deleteProduct() {
    const id = document.getElementById('prod-id').value;
    if(!id) return alert("Select a product to delete");
    if(confirm("Are you sure?")) {
        await fetchJSON(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        resetProductForm();
        alert("Record Deleted");
    }
}

function loadProductsForDropdown(elementId) {
    fetchJSON(`${API_BASE}/products`).then(data => {
        window.productsData = data; 
        document.getElementById(elementId).innerHTML = `<option value="">Select Product ID</option>` + 
            data.map(p => `<option value="${p.id}">${padId('P', p.id)}</option>`).join('');
    });
}

// --- Supplier Logic ---
let suppliersData = [];
async function loadSuppliers() {
    suppliersData = await fetchJSON(`${API_BASE}/suppliers`);
    const tbody = document.getElementById('supplier-table-body');
    tbody.innerHTML = suppliersData.map(s => `
        <tr>
            <td>${padId('S', s.id)}</td><td>${s.name}</td><td>${s.address}</td><td>${s.phone}</td>
            <td><button class="btn-primary" style="padding:6px 12px; font-size:12px;" onclick="editSupplier(${s.id})">Edit</button></td>
        </tr>
    `).join('');
}

function resetSupplierForm() {
    document.getElementById('supplier-form').reset();
    document.getElementById('sup-id').value = '';
    document.getElementById('sup-disp-id').value = '';
}

function editSupplier(id) {
    const s = suppliersData.find(x => x.id === id);
    if(s) {
        showSection('sup-form-sec');
        document.getElementById('sup-id').value = s.id;
        document.getElementById('sup-disp-id').value = padId('S', s.id);
        document.getElementById('sup-name').value = s.name;
        document.getElementById('sup-address').value = s.address;
        document.getElementById('sup-phone').value = s.phone;
    }
}

async function saveSupplier(e) {
    e.preventDefault();
    const id = document.getElementById('sup-id').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/suppliers/${id}` : `${API_BASE}/suppliers`;
    await fetchJSON(url, {
        method: method,
        body: JSON.stringify({
            name: document.getElementById('sup-name').value,
            phone: document.getElementById('sup-phone').value,
            address: document.getElementById('sup-address').value
        })
    });
    alert(id ? "Record Updated" : "One Record Inserted");
    resetSupplierForm();
}

async function deleteSupplier() {
    const id = document.getElementById('sup-id').value;
    if(!id) return alert("Select a supplier to delete");
    if(confirm("Are you sure?")) {
        await fetchJSON(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
        resetSupplierForm();
        alert("Record Deleted");
    }
}

function loadSuppliersForDropdown(elementId) {
    fetchJSON(`${API_BASE}/suppliers`).then(data => {
        window.suppliersData = data;
        document.getElementById(elementId).innerHTML = `<option value="">Select Supplier ID</option>` + 
            data.map(s => `<option value="${s.id}">${padId('S', s.id)}</option>`).join('');
    });
}

// --- Purchase Logic ---
function updatePurchaseProductInfo() {
    const id = document.getElementById('purch-product').value;
    const p = window.productsData?.find(x => x.id == id);
    if(p) {
        document.getElementById('purch-prod-name').value = p.name;
        document.getElementById('purch-prod-cat').value = p.category;
        document.getElementById('purch-prod-mfd').value = p.mfd || '';
        document.getElementById('purch-prod-mrp').value = p.price;
    } else {
        document.getElementById('purch-prod-name').value = '';
        document.getElementById('purch-prod-cat').value = '';
        document.getElementById('purch-prod-mfd').value = '';
        document.getElementById('purch-prod-mrp').value = '';
    }
}

function updatePurchaseSupplierInfo() {
    const id = document.getElementById('purch-supplier').value;
    const s = window.suppliersData?.find(x => x.id == id);
    if(s) {
        document.getElementById('purch-sup-name').value = s.name;
        document.getElementById('purch-sup-address').value = s.address;
        document.getElementById('purch-sup-phone').value = s.phone;
    } else {
        document.getElementById('purch-sup-name').value = '';
        document.getElementById('purch-sup-address').value = '';
        document.getElementById('purch-sup-phone').value = '';
    }
}

async function addPurchase(e) {
    e.preventDefault();
    await fetchJSON(`${API_BASE}/purchases`, {
        method: 'POST',
        body: JSON.stringify({
            product_id: document.getElementById('purch-product').value,
            supplier_id: document.getElementById('purch-supplier').value,
            quantity: document.getElementById('purch-qty').value,
            purchase_price: document.getElementById('purch-price').value
        })
    });
    alert("Record Inserted");
    e.target.reset();
}

// --- Sales (Billing) Logic ---
let billItems = [];

function loadCustomersForDropdown(elementId) {
    fetchJSON(`${API_BASE}/customers`).then(data => {
        window.customersData = data;
        document.getElementById(elementId).innerHTML = `<option value="">Walk-in Customer</option>` + 
            data.map(c => `<option value="${c.id}">${padId('C', c.id)}</option>`).join('');
    });
}

function updateBillCustomerInfo() {
    const id = document.getElementById('bill-customer').value;
    const c = window.customersData?.find(x => x.id == id);
    if(c) {
        document.getElementById('bill-cust-name').value = c.name;
        document.getElementById('bill-cust-address').value = c.address || '';
        document.getElementById('bill-cust-phone').value = c.phone || '';
    } else {
        document.getElementById('bill-cust-name').value = '';
        document.getElementById('bill-cust-address').value = '';
        document.getElementById('bill-cust-phone').value = '';
    }
}

function updateBillProductPrice() {
    const prodId = document.getElementById('bill-product').value;
    const product = window.productsData?.find(p => p.id == prodId);
    if (product) {
        document.getElementById('bill-price').value = product.price;
        document.getElementById('bill-prod-cat').value = product.category;
    } else {
        document.getElementById('bill-price').value = '';
        document.getElementById('bill-prod-cat').value = '';
    }
}

function addBillItem() {
    const prodSelect = document.getElementById('bill-product');
    const qtyInput = document.getElementById('bill-qty');
    const priceInput = document.getElementById('bill-price');
    const catInput = document.getElementById('bill-prod-cat');

    if (!prodSelect.value || !qtyInput.value) return alert("Select product and quantity");

    const product = window.productsData.find(p => p.id == prodSelect.value);
    const item = {
        product_id: parseInt(prodSelect.value),
        name: product.name,
        category: catInput.value,
        quantity: parseInt(qtyInput.value),
        price: parseFloat(priceInput.value),
        total: parseInt(qtyInput.value) * parseFloat(priceInput.value)
    };

    billItems.push(item);
    renderBillItems();
    
    prodSelect.value = '';
    qtyInput.value = '1';
    priceInput.value = '';
    catInput.value = '';
}

function renderBillItems() {
    const tbody = document.getElementById('bill-items-body');
    tbody.innerHTML = billItems.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td><button class="btn-danger" style="padding:4px 8px; font-size:12px;" onclick="billItems.splice(${index},1); renderBillItems();">X</button></td>
        </tr>
    `).join('');
    calculateNetBill();
}

function calculateNetBill() {
    const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0);
    const gst = totalAmount * 0.18;
    const discount = parseFloat(document.getElementById('bill-discount').value) || 0;
    const netBill = totalAmount + gst - discount;

    document.getElementById('bill-total').value = totalAmount.toFixed(2);
    document.getElementById('bill-gst').value = gst.toFixed(2);
    document.getElementById('bill-net').value = netBill.toFixed(2);
}

async function generateBill() {
    if (billItems.length === 0) return alert("Add items to the bill first");

    const payload = {
        customer_id: document.getElementById('bill-customer').value || null,
        total_amount: parseFloat(document.getElementById('bill-total').value),
        gst: parseFloat(document.getElementById('bill-gst').value),
        discount: parseFloat(document.getElementById('bill-discount').value) || 0,
        net_bill: parseFloat(document.getElementById('bill-net').value),
        items: billItems
    };

    const res = await fetchJSON(`${API_BASE}/bills`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    alert(res.message + "\nBill No: " + res.bill_no);
    document.getElementById('bill-disp-no').value = res.bill_no;
    
    // Reset
    billItems = [];
    renderBillItems();
    document.getElementById('bill-customer').value = '';
    updateBillCustomerInfo();
    document.getElementById('bill-discount').value = '0';
    loadProductsForDropdown('bill-product'); 
}

// --- Views Logic ---
async function loadStock() {
    const stock = await fetchJSON(`${API_BASE}/stock`);
    const tbody = document.getElementById('stock-table-body');
    tbody.innerHTML = stock.map(s => `
        <tr><td>${s.category}</td><td>${s.product_name}</td>
        <td><strong>${s.stock}</strong></td></tr>
    `).join('');
}

async function loadBills() {
    const bills = await fetchJSON(`${API_BASE}/bills`);
    const tbody = document.getElementById('bills-table-body');
    tbody.innerHTML = bills.map(b => {
        let dispCust = b.customer === 'Walk-in' ? '-' : b.customer;
        return `
        <tr>
            <td>${b.bill_no}</td><td>${b.date}</td><td>${dispCust}</td>
            <td>${(b.net_bill / 1.18).toFixed(2)}</td>
            <td>${(b.net_bill - (b.net_bill / 1.18)).toFixed(2)}</td>
            <td>-</td>
            <td>${b.net_bill.toFixed(2)}</td>
        </tr>
    `}).join('');
}
