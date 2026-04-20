let cart = [];
let total = 0;
let currentCustomer = null;

function addToCart(name, price) {
    cart.push({name: name, price: price});
    total += price;
    updateCart();
}

// Open Explore section
function openExplore() {
    const flavorsSection = document.getElementById('flavors');
    flavorsSection.style.display = 'block';
    loadFlavors();
    setTimeout(() => {
        flavorsSection.scrollIntoView({behavior: 'smooth'});
    }, 100);
}

// Load flavors
async function loadFlavors() {
let res = await fetch("http://127.0.0.1:5000/flavors");
let data = await res.json();

let container = document.getElementById("flavor-list");
if (!container) return;
container.innerHTML = "";

data.forEach(item => {
const isSeasonal = item.seasonal || false;
container.innerHTML += `
<div class="card ${isSeasonal ? 'seasonal' : ''}">
<img src="${item.image}" alt="${item.name}" style="width:100%; height:150px; object-fit:cover; border-radius:10px 10px 0 0;">
<h3>${item.name} ${isSeasonal ? '<span class="seasonal-badge">Seasonal</span>' : ''}</h3>
<p>₹${item.price}</p>
<div class="card-buttons">
<button onclick="addToCart('${item.name}',${item.price})">Add</button>
<button onclick="showNutrition('${item.name}')" class="nutrition-btn">Nutrition</button>
</div>
</div>
`;
});

animateCards();
}

// Load seasonal flavors
async function loadSeasonalFlavors() {
try {
const res = await fetch("http://127.0.0.1:5000/seasonal-flavors");
const data = await res.json();

let container = document.getElementById("seasonal-flavors");
if (container) {
container.innerHTML = "<h3>Current Seasonal Specials</h3>";

data.forEach(item => {
container.innerHTML += `
<div class="card seasonal">
<img src="${item.image}" alt="${item.name}" style="width:100%; height:150px; object-fit:cover; border-radius:10px 10px 0 0;">
<h3>${item.name} <span class="seasonal-badge">Seasonal</span></h3>
<p>₹${item.price}</p>
<p class="description">${item.description}</p>
<div class="card-buttons">
<button onclick="addToCart('${item.name}',${item.price})">Add</button>
<button onclick="showNutrition('${item.name}')" class="nutrition-btn">Nutrition</button>
</div>
</div>
`;
});
}

// Load weather recommendations
loadWeatherRecommendations();

} catch (error) {
console.error('Error loading seasonal flavors:', error);
}
}

// Load weather recommendations
async function loadWeatherRecommendations() {
try {
const res = await fetch("http://127.0.0.1:5000/weather-recommendations");
const data = await res.json();

const container = document.getElementById("weather-recommendations");
if (container) {
container.innerHTML = `
<div class="weather-banner">
<h3>🌤️ ${data.message}</h3>
<div class="weather-flavors">
${data.recommended_flavors.map(flavor => `<span class="weather-flavor">${flavor}</span>`).join('')}
</div>
</div>
`;
}
} catch (error) {
console.error('Error loading weather recommendations:', error);
}
}

// Show nutrition information
async function showNutrition(flavorName) {
try {
const res = await fetch(`http://127.0.0.1:5000/nutrition/${encodeURIComponent(flavorName)}`);
const data = await res.json();

alert(`${flavorName} Nutrition Info:
• Calories: ${data.calories}
• Fat: ${data.fat}g
• Carbs: ${data.carbs}g
• Protein: ${data.protein}g
• Allergens: ${data.allergens.join(', ')}`);
} catch (error) {
console.error('Error loading nutrition info:', error);
alert('Nutrition information not available');
}
}

// Load reviews
async function loadReviews() {
try {
const res = await fetch("http://127.0.0.1:5000/reviews");
const reviews = await res.json();

const container = document.getElementById("reviews-list");
if (container) {
container.innerHTML = "<h3>What Our Customers Say</h3>";

reviews.forEach(review => {
const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
container.innerHTML += `
<div class="review-card">
<div class="review-header">
<h4>${review.flavor}</h4>
<div class="rating">${stars}</div>
</div>
<p class="review-text">"${review.review}"</p>
<p class="review-author">- ${review.customer}</p>
<p class="review-date">${review.date}</p>
</div>
`;
});
}

// Populate flavor dropdown for reviews
populateFlavorDropdown(reviews);

} catch (error) {
console.error('Error loading reviews:', error);
}
}

// Populate flavor dropdown
function populateFlavorDropdown(reviews) {
const select = document.getElementById("review-flavor");
if (!select) return;
const flavors = [...new Set(reviews.map(r => r.flavor))];

select.innerHTML = '<option value="">Select a flavor</option>';
flavors.forEach(flavor => {
select.innerHTML += `<option value="${flavor}">${flavor}</option>`;
});
}

// Submit review
async function submitReview() {
const flavor = document.getElementById("review-flavor").value;
const customer = document.getElementById("review-customer").value;
const rating = document.querySelector('.star.selected')?.dataset.rating || 0;
const review = document.getElementById("review-text").value;

if (!flavor || !customer || !rating || !review) {
alert("Please fill in all fields");
return;
}

try {
const response = await fetch("http://127.0.0.1:5000/reviews", {
method: "POST",
headers: {"Content-Type": "application/json"},
body: JSON.stringify({flavor, customer, rating: parseInt(rating), review})
});

if (response.ok) {
alert("Thank you for your review!");
document.getElementById("review-customer").value = "";
document.getElementById("review-text").value = "";
document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
loadReviews(); // Reload reviews
} else {
alert("Error submitting review");
}
} catch (error) {
console.error('Error submitting review:', error);
alert("Error submitting review");
}
}

// Star rating functionality
document.addEventListener('DOMContentLoaded', function() {
document.querySelectorAll('.star').forEach(star => {
star.addEventListener('click', function() {
const rating = this.dataset.rating;
document.querySelectorAll('.star').forEach(s => {
s.classList.toggle('selected', s.dataset.rating <= rating);
});
});
});
});

// Login modal functions
function showLoginModal() {
const modal = document.getElementById('login-modal');
if (modal) modal.style.display = 'block';
}

function closeLoginModal() {
const modal = document.getElementById('login-modal');
if (modal) modal.style.display = 'none';
const status = document.getElementById('login-status');
if (status) status.innerHTML = '';
}

function showLoginTab(tab) {
document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
document.querySelectorAll('.login-form').forEach(form => form.style.display = 'none');

if (event && event.target) {
event.target.classList.add('active');
}
const tabEl = document.getElementById(`${tab}-login`);
if (tabEl) tabEl.style.display = 'block';
}

// Customer login
async function customerLogin(method) {
const emailEl = document.getElementById('login-email');
const phoneEl = document.getElementById('login-phone');
const value = method === 'email' ? (emailEl ? emailEl.value : '') : (phoneEl ? phoneEl.value : '');

const statusEl = document.getElementById('login-status');

if (!value) {
if (statusEl) statusEl.innerHTML = '<p style="color: red;">Please enter your information</p>';
return;
}

try {
const response = await fetch("http://127.0.0.1:5000/customer/login", {
method: "POST",
headers: {"Content-Type": "application/json"},
body: JSON.stringify(method === 'email' ? {email: value} : {phone: value})
});

const data = await response.json();

if (data.status === 'success') {
currentCustomer = data.customer;
closeLoginModal();
alert(`Welcome back, ${data.customer.name}!`);
// Redirect to profile page
window.location.href = `/profile?id=${data.customer.id}`;
} else {
if (statusEl) statusEl.innerHTML = '<p style="color: red;">Customer not found. Please check your information.</p>';
}
} catch (error) {
console.error('Login error:', error);
if (statusEl) statusEl.innerHTML = '<p style="color: red;">Login failed. Please try again.</p>';
}
}

// Load business information
async function loadBusinessInfo() {
try {
const res = await fetch("http://127.0.0.1:5000/business-info");
const data = await res.json();

const addressEl = document.getElementById('business-address');
if (addressEl) addressEl.textContent = data.address;

const phoneEl = document.getElementById('business-phone');
if (phoneEl) phoneEl.textContent = data.phone;

const emailEl = document.getElementById('business-email');
if (emailEl) emailEl.textContent = data.email;

const hoursContainer = document.getElementById('business-hours');
if (hoursContainer) {
hoursContainer.innerHTML = '';
for (const [day, hours] of Object.entries(data.hours)) {
hoursContainer.innerHTML += `<p><strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${hours}</p>`;
}
}

const socialContainer = document.getElementById('social-media');
if (socialContainer) {
socialContainer.innerHTML = `
<a href="#" onclick="alert('Follow us on Instagram: ${data.social_media.instagram}')">📷 Instagram</a><br>
<a href="#" onclick="alert('Like us on Facebook: ${data.social_media.facebook}')">📘 Facebook</a><br>
<a href="#" onclick="alert('Follow us on Twitter: ${data.social_media.twitter}')">🐦 Twitter</a>
`;
}

} catch (error) {
console.error('Error loading business info:', error);
}
}

// Update cart UI
function updateCart() {
let container = document.getElementById("cart-items");
if (!container) return;
container.innerHTML = "";

cart.forEach(item => {
container.innerHTML += `<p>${item.name} - ₹${item.price}</p>`;
});

const totalEl = document.getElementById("total");
if (totalEl) totalEl.innerText = total;
}

// Builder
function calculateBuildPrice() {
let containerEl = document.getElementById("container");
let scoopsEl = document.getElementById("scoops");
let flavorEl = document.getElementById("flavor");
let topping1El = document.getElementById("topping1");
let topping2El = document.getElementById("topping2");
let addonEl = document.getElementById("addon");

if (!containerEl || !scoopsEl || !flavorEl || !topping1El || !topping2El || !addonEl) return;

let container = parseInt(containerEl.value);
let scoops = parseInt(scoopsEl.value);
let flavor = parseInt(flavorEl.value);
let topping1 = parseInt(topping1El.value);
let topping2 = parseInt(topping2El.value);
let addon = parseInt(addonEl.value);

let t = container + scoops + flavor + topping1 + topping2 + addon;

let buildTotalEl = document.getElementById("build-total");
if (buildTotalEl) buildTotalEl.innerText = t;
}

function buildIcecream() {
let containerEl = document.getElementById("container");
let scoopsEl = document.getElementById("scoops");
let flavorEl = document.getElementById("flavor");
let topping1El = document.getElementById("topping1");
let topping2El = document.getElementById("topping2");
let addonEl = document.getElementById("addon");
let buildTotalEl = document.getElementById("build-total");

if (!containerEl || !scoopsEl || !flavorEl || !topping1El || !topping2El || !addonEl || !buildTotalEl) return;

let container = containerEl.options[containerEl.selectedIndex].text.split(' (')[0];
let scoops = scoopsEl.options[scoopsEl.selectedIndex].text.split(' ')[0];
let flavor = flavorEl.dataset.name;
let topping1 = topping1El.value > 0 ? topping1El.options[topping1El.selectedIndex].text.split(' (')[0] : '';
let topping2 = topping2El.value > 0 ? topping2El.options[topping2El.selectedIndex].text.split(' (')[0] : '';
let addon = addonEl.value > 0 ? addonEl.options[addonEl.selectedIndex].text.split(' (')[0] : '';

let price = parseInt(buildTotalEl.innerText);

let description = `${scoops} Scoop ${flavor}`;
if (container !== 'Cup') description += ` in ${container}`;
if (topping1) description += ` with ${topping1}`;
if (topping2) description += ` and ${topping2}`;
if (addon) description += ` on ${addon}`;

addToCart(description, price);
}

// Checkout
async function checkout() {
if (cart.length === 0) {
alert("Your cart is empty!");
return;
}

const checkoutData = {
cart: cart,
total: total,
customer_id: currentCustomer ? currentCustomer.id : null
};

try {
const response = await fetch("http://127.0.0.1:5000/checkout", {
method: "POST",
headers: {"Content-Type": "application/json"},
body: JSON.stringify(checkoutData)
});

const data = await response.json();

if (currentCustomer) {
alert(`Order placed successfully! You earned ${data.points_earned} loyalty points. Total: ₹${data.total_amount}`);
} else {
alert(`Order placed successfully! Total: ₹${data.total_amount}`);
}

cart = [];
total = 0;
updateCart();

} catch (error) {
console.error('Checkout error:', error);
alert("Error placing order. Please try again.");
}
}

// GSAP Animation
function animateCards(){
if (typeof gsap !== 'undefined') {
  gsap.from(".card", {
  y:100,
  opacity:0,
  duration:1,
  stagger:0.2
  });
}
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
loadSeasonalFlavors();
loadReviews();
loadBusinessInfo();


// Star rating functionality
document.querySelectorAll('.star').forEach(star => {
star.addEventListener('click', function() {
const rating = this.dataset.rating;
document.querySelectorAll('.star').forEach(s => {
s.classList.toggle('selected', s.dataset.rating <= rating);
});
});
});

// Close modal when clicking outside
window.onclick = function(event) {
const loginModal = document.getElementById('login-modal');
if (loginModal && event.target == loginModal) {
closeLoginModal();
}
}

// Custom dropdown logic
const btn = document.querySelector(".dropdown-btn");
const list = document.querySelector(".dropdown-list");
const hiddenInput = document.getElementById("flavor");

if (btn && list && hiddenInput) {
  btn.onclick = () => {
    list.style.display = list.style.display === "block" ? "none" : "block";
  };

  document.querySelectorAll(".dropdown-item").forEach(item => {
    item.onclick = () => {
      btn.innerHTML = item.innerHTML;
      list.style.display = "none";
      hiddenInput.value = item.dataset.value;
      hiddenInput.dataset.name = item.dataset.name;
      calculateBuildPrice();
    };
  });
}
});

