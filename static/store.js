let storeProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
});

async function fetchProducts() {
    try {
        const res = await fetch('/api/store_products');
        storeProducts = await res.json();
        renderProducts();
    } catch (e) {
        console.error("Error fetching products", e);
    }
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = storeProducts.map(p => {
        
        let priceHtml = '';
        let discountHtml = '';
        
        if (p.discount_percent > 0) {
            const discountedPrice = p.price * (1 - p.discount_percent / 100);
            priceHtml = `
                <span class="product-price">₹${discountedPrice.toFixed(2)}</span>
                <span class="product-original-price">₹${p.price.toFixed(2)}</span>
            `;
            discountHtml = `<span class="product-discount-badge">-${p.discount_percent}%</span>`;
        } else {
            priceHtml = `<span class="product-price">₹${p.price.toFixed(2)}</span>`;
        }

        return `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}" class="product-img">
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-desc">${p.description || ''}</p>
                    <div class="product-meta">
                        <div class="product-rating">★ ${p.rating.toFixed(1)}</div>
                        ${discountHtml}
                    </div>
                    <div class="product-price-container" style="margin-bottom: 15px;">
                        ${priceHtml}
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

function addToCart(productId) {
    const product = storeProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    toggleCart(true); // Open cart to show it was added
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalCount;

    // Render items
    const cartItemsDiv = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="color:var(--text-muted); text-align:center; margin-top:20px;">Your cart is empty.</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => {
            const finalPrice = item.price * (1 - item.discount_percent / 100);
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.quantity} x ₹${finalPrice.toFixed(2)}</p>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                    <div class="cart-item-price">
                        ₹${(item.quantity * finalPrice).toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscountAmount = 0;

    cart.forEach(item => {
        const itemTotalOriginal = item.price * item.quantity;
        const discountAmount = itemTotalOriginal * (item.discount_percent / 100);
        
        subtotal += itemTotalOriginal;
        totalDiscountAmount += discountAmount;
    });

    const finalTotal = subtotal - totalDiscountAmount;

    document.getElementById('cart-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-discount').innerText = `-₹${totalDiscountAmount.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `₹${finalTotal.toFixed(2)}`;
}

function toggleCart(forceOpen = false) {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    
    if (forceOpen) {
        modal.classList.add('active');
        overlay.classList.add('active');
    } else {
        modal.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function checkout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    alert("Checkout successful! Thank you for your purchase.");
    cart = [];
    saveCart();
    updateCartUI();
    toggleCart();
}
