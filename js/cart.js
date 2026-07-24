/**
 * cart.js — Asian Flavours Hub Cart Logic
 * Shared across store.html and checkout.html
 * Cart persists to localStorage under key: afh_cart
 */

const CART_KEY = 'afh_cart';

/* ============================================================
   CORE CART DATA FUNCTIONS
   ============================================================ */

/**
 * Retrieve cart array from localStorage.
 * @returns {Array} Array of cart item objects.
 */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Persist cart array to localStorage.
 * @param {Array} cart
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Cart save failed:', e);
  }
}

/**
 * Add an item to the cart or increment its quantity if already present.
 * @param {string|number} id      Unique product identifier
 * @param {string}        name    Product display name
 * @param {number}        price   Unit price (numeric)
 * @param {number}        qty     Quantity to add (default 1)
 * @param {string}        [color] Optional CSS class for the color swatch
 */
function addToCart(id, name, price, qty, color) {
  const cart = getCart();
  const existing = cart.find(item => String(item.id) === String(id));

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: String(id),
      name,
      price: parseFloat(price),
      qty: parseInt(qty, 10),
      color: color || ''
    });
  }

  saveCart(cart);
  updateCartBadge();
  renderCart();
  animateBadge();
}

/**
 * Remove an item from the cart entirely.
 * @param {string|number} id
 */
function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => String(item.id) !== String(id));
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

/**
 * Increment or decrement an item's quantity. Removes item if qty reaches 0.
 * @param {string|number} id
 * @param {number}        delta  Positive to add, negative to subtract
 */
function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => String(i.id) === String(id));

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart(cart);
  updateCartBadge();
  renderCart();
}

/**
 * Calculate delivery charge based on whether an address has been entered
 * and the total number of items in the cart.
 * Returns null if no address is entered yet.
 * @returns {number|null}
 */
function getDeliveryCharge() {
  const addressField = document.getElementById('cf-address1');
  if (!addressField || !addressField.value.trim()) return null;
  return getCartCount() > 3 ? 4.65 : 3.80;
}

/**
 * Calculate and return total price of all cart items.
 * @returns {number}
 */
function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Calculate and return total item count (sum of all quantities).
 * @returns {number}
 */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Empty the cart.
 */
function clearCart() {
  saveCart([]);
  updateCartBadge();
  renderCart();
}

/* ============================================================
   DOM RENDERING
   ============================================================ */

/**
 * Update all cart badge elements on the page.
 */
function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count === 0 ? 'none' : 'flex';
  });
}

/**
 * Trigger a brief scale animation on the badge.
 */
function animateBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
  });
}

/**
 * Re-render the cart drawer contents and footer totals.
 * Also updates the order summary inside the checkout modal if present.
 */
function renderCart() {
  const cart = getCart();
  const body = document.getElementById('cart-body');
  const subtotalEl = document.getElementById('cart-subtotal');
  const checkoutBtn = document.getElementById('btn-checkout');

  if (!body) return;

  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p>Your cart is empty.<br>Add some sauces to get started!</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '£0.00';
    if (shippingEl) shippingEl.textContent = '£0.00';
    if (totalEl) totalEl.textContent = '£0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  body.innerHTML = cart.map(item => {
    const colorHtml = item.color && item.color.includes('.')
      ? `<img src="${escapeHtml(item.color)}" alt="" class="cart-item__color cart-item__color--img" />`
      : `<div class="cart-item__color ${escapeHtml(item.color || '')}"></div>`;
    return `
    <div class="cart-item" data-id="${item.id}">
      ${colorHtml}
      <div class="cart-item__details">
        <div class="cart-item__name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
        <div class="cart-item__price">
          £${item.price.toFixed(2)} each &nbsp;·&nbsp;
          <strong>£${(item.price * item.qty).toFixed(2)}</strong>
        </div>
        <div class="cart-item__controls">
          <button class="cart-item__qty-btn" onclick="updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <span class="cart-item__qty">${item.qty}</span>
          <button class="cart-item__qty-btn" onclick="updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item" title="Remove">✕</button>
    </div>
  `;
  }).join('');

  const total = getCartTotal();
  if (subtotalEl) subtotalEl.textContent = `£${total.toFixed(2)}`;

  const delivery = getDeliveryCharge();
  if (shippingEl) shippingEl.textContent = delivery !== null ? `£${delivery.toFixed(2)}` : 'At checkout';
  if (totalEl) totalEl.textContent = `£${(total + (delivery || 0)).toFixed(2)}`;

  renderOrderSummary(cart, total);
}

/**
 * Render the order summary section inside the checkout modal.
 * @param {Array}  cart
 * @param {number} total
 */
function renderOrderSummary(cart, total) {
  const summaryItems = document.getElementById('order-summary-items');
  const summarySubtotal = document.getElementById('order-summary-subtotal');
  const summaryShipping = document.getElementById('order-summary-shipping');
  const summaryTotal = document.getElementById('order-summary-total');

  if (!summaryItems) return;

  summaryItems.innerHTML = cart.map(item => `
    <div class="order-summary__item">
      <span class="order-summary__item-name">${escapeHtml(item.name)}</span>
      <span class="order-summary__item-qty">× ${item.qty}</span>
      <span class="order-summary__item-price">£${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  const delivery = getDeliveryCharge();
  if (summarySubtotal) summarySubtotal.textContent = `£${total.toFixed(2)}`;
  if (summaryShipping) summaryShipping.textContent = delivery !== null ? `£${delivery.toFixed(2)}` : 'Enter address';
  if (summaryTotal) summaryTotal.textContent = `£${(total + (delivery || 0)).toFixed(2)}`;
}

/* ============================================================
   CART DRAWER OPEN / CLOSE
   ============================================================ */

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   CHECKOUT MODAL OPEN / CLOSE
   ============================================================ */

function openCheckout() {
  closeCart();
  const cart = getCart();
  if (cart.length === 0) return;

  renderOrderSummary(cart, getCartTotal());

  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const successSection = document.getElementById('order-success');
    const formSection = document.getElementById('checkout-form-section');
    if (successSection) successSection.classList.remove('active');
    if (formSection) formSection.style.display = '';
  }
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   CHECKOUT FORM VALIDATION & SUBMISSION
   ============================================================ */

/**
 * Validate required checkout fields.
 * Highlights empty required fields with an error class.
 * @returns {boolean} true if valid
 */
function validateCheckoutForm() {
  const required = [
    { id: 'cf-name',     label: 'Full Name' },
    { id: 'cf-email',    label: 'Email' },
    { id: 'cf-address1', label: 'Address Line 1' },
    { id: 'cf-city',     label: 'City' },
    { id: 'cf-postcode', label: 'Postcode' }
  ];

  let valid = true;

  required.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;
    const val = el.value.trim();
    if (!val) {
      el.classList.add('error');
      valid = false;
    } else {
      el.classList.remove('error');
    }
  });

  const emailEl = document.getElementById('cf-email');
  if (emailEl && emailEl.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailEl.value.trim())) {
      emailEl.classList.add('error');
      valid = false;
    }
  }

  return valid;
}

/**
 * Handle order placement: validate, show success, clear cart.
 */
function placeOrder() {
  if (!validateCheckoutForm()) {
    const firstError = document.querySelector('.form-group input.error, .form-group textarea.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const formSection = document.getElementById('checkout-form-section');
  const successSection = document.getElementById('order-success');

  if (formSection) formSection.style.display = 'none';
  if (successSection) {
    successSection.classList.add('active');
    successSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  clearCart();
}

/* ============================================================
   UTILITY
   ============================================================ */

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

/* ============================================================
   INITIALISATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();

  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }

  const cartCloseBtn = document.getElementById('cart-close');
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', closeCart);
  }

  const openCartBtns = document.querySelectorAll('[data-open-cart]');
  openCartBtns.forEach(btn => btn.addEventListener('click', openCart));

  const checkoutBtn = document.getElementById('btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckout);
  }

  const checkoutModalOverlay = document.getElementById('checkout-modal');
  if (checkoutModalOverlay) {
    checkoutModalOverlay.addEventListener('click', function (e) {
      if (e.target === this) closeCheckout();
    });
  }

  const modalCloseBtn = document.getElementById('modal-close');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeCheckout);
  }

  const placeOrderBtn = document.getElementById('btn-place-order');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }

  const continueBtn = document.getElementById('btn-continue-shopping');
  if (continueBtn) {
    continueBtn.addEventListener('click', closeCheckout);
  }

  document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });

  const addressField = document.getElementById('cf-address1');
  if (addressField) {
    addressField.addEventListener('input', () => {
      const cart = getCart();
      renderOrderSummary(cart, getCartTotal());
      renderCart();
    });
  }

  const navbar = document.querySelector('.store-nav') || document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }
});
