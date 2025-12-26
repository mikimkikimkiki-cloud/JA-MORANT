// Initialize Animate On Scroll
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// --- AUTHENTICATION LOGIC ---

// Check Auth State on Load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAuthForms();
    updateCartBadge();

    // Check if we are on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
});

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('jaCurrentUser'));
    const navLinks = document.querySelector('.nav-links');

    if (!navLinks) return;

    // Remove existing auth links to prevent duplicates
    const authItems = document.querySelectorAll('.auth-item');
    authItems.forEach(item => item.remove());

    if (currentUser) {
        // User is logged in
        const userLi = document.createElement('li');
        userLi.className = 'auth-item';
        userLi.innerHTML = `<a href="#" style="color: var(--highlight-color);"><i class="fas fa-user-circle"></i> ${currentUser.username}</a>`;

        const logoutLi = document.createElement('li');
        logoutLi.className = 'auth-item';
        logoutLi.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;

        navLinks.appendChild(userLi);
        navLinks.appendChild(logoutLi);
    } else {
        // User is NOT logged in
        const loginLi = document.createElement('li');
        loginLi.className = 'auth-item';
        loginLi.innerHTML = `<a href="login.html">Login</a>`;

        const registerLi = document.createElement('li');
        registerLi.className = 'auth-item';
        registerLi.innerHTML = `<a href="register.html" class="btn btn-primary" style="padding: 5px 15px; color: white;">Register</a>`;

        navLinks.appendChild(loginLi);
        navLinks.appendChild(registerLi);
    }
}

function setupAuthForms() {
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-msg');

            // Simple validation
            if (password.length < 6) {
                showError(errorMsg, 'Password must be at least 6 characters');
                return;
            }

            // Get existing users
            const users = JSON.parse(localStorage.getItem('jaUsers')) || [];

            // Check if email exists
            if (users.find(u => u.email === email)) {
                showError(errorMsg, 'Email already registered');
                return;
            }

            // Create new user
            const newUser = { username, email, password };
            users.push(newUser);
            localStorage.setItem('jaUsers', JSON.stringify(users));

            // Auto - Login
            localStorage.setItem('jaCurrentUser', JSON.stringify(newUser));

            // Redirect
            window.location.href = 'index.html';
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-msg');

            const users = JSON.parse(localStorage.getItem('jaUsers')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('jaCurrentUser', JSON.stringify(user));
                window.location.href = 'index.html';
            } else {
                showError(errorMsg, 'Invalid credentials');
            }
        });
    }
}

function logout() {
    localStorage.removeItem('jaCurrentUser');
    window.location.reload();
}

function showError(element, message) {
    if (element) {
        element.innerText = message;
        element.style.display = 'block';
    }
}

// --- SHOP FUNCTIONALITY ---

// Add to Cart
const cartBtns = document.querySelectorAll('.add-to-cart');
if (cartBtns.length > 0) {
    cartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Get product data
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');

            if (!id) {
                // Fallback for buttons without data (if any left)
                console.error("No product data found on button");
                return;
            }

            const item = { id, name, price, img };

            // Add to localStorage
            const cart = JSON.parse(localStorage.getItem('jaCart')) || [];
            cart.push(item);
            localStorage.setItem('jaCart', JSON.stringify(cart));

            updateCartBadge();

            // Animation effect
            const originalText = e.target.innerText;
            e.target.innerText = 'Added!';
            e.target.style.background = '#fff';
            e.target.style.color = '#000';

            setTimeout(() => {
                e.target.innerText = originalText;
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary-color)';
            }, 1000);
        });
    });
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('jaCart')) || [];
    const count = cart.length;

    // Update all badge instances (mobile/desktop)
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(badge => badge.innerText = count);
}

// Render Cart Page
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('empty-cart');
    const summary = document.getElementById('cart-summary');
    const totalEl = document.getElementById('cart-total');

    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem('jaCart')) || [];

    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        summary.style.display = 'none';
        emptyMsg.style.display = 'block';
    } else {
        cartItemsContainer.style.display = 'flex';
        summary.style.display = 'block';
        emptyMsg.style.display = 'none';

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <span class="item-price">$${item.price.toFixed(2)}</span>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        totalEl.innerText = '$' + total.toFixed(2);
    }
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('jaCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('jaCart', JSON.stringify(cart));

    updateCartBadge();
    renderCart();
}

function checkout() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('jaCurrentUser'));
    if (!currentUser) {
        alert("Please login to complete your purchase.");
        window.location.href = 'login.html';
        return;
    }

    // Clear cart
    localStorage.removeItem('jaCart');
    updateCartBadge();

    // UI Updates
    document.getElementById('cart-items').style.display = 'none';
    document.getElementById('cart-summary').style.display = 'none';

    // Show Modal
    const modal = document.getElementById('success-modal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.style.display = 'none';
    window.location.href = 'index.html';
}

// --- EXISTING MISC ---

// Navbar Toggle (Mobile)
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    // Skip special onclick links
    if (link.getAttribute('onclick')) return;

    link.addEventListener('click', () => {
        if (navLinks) navLinks.classList.remove('active');
    });
});

// Sticky Navbar Background
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(13, 13, 13, 1)';
            navbar.style.padding = '1rem 5%';
        } else {
            navbar.style.background = 'rgba(13, 13, 13, 0.95)';
            navbar.style.padding = '1.5rem 5%';
        }
    });
}

// Highlights Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const videos = document.querySelectorAll('.video-card');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            videos.forEach(video => {
                if (filterValue === 'all' || video.classList.contains(filterValue)) {
                    video.style.display = 'block';
                } else {
                    video.style.display = 'none';
                }
            });
        });
    });
}

// Cart Icon Navigation
const cartIcon = document.querySelector('.cart-icon');
if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
}
