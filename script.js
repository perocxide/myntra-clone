document.addEventListener('DOMContentLoaded', () => {
  initProfileAndWishlistModals();
  initWishlistClicks();
  initHomeLink();
  bagCount();
});

function bagCount() {
  const wcount = document.querySelector('.wcount');
  const bcount = document.querySelector('.bcount');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  let cartCount = cart.length;
  let wishlistCount = wishlist.length;

  if (wcount) {
    wcount.textContent = wishlistCount > 0 ? wishlistCount : wcount.style.display = 'none';
  }
  if (bcount) {
    bcount.textContent = cartCount > 0 ? cartCount : bcount.style.display = 'none';
  }
}

function initHomeLink() {
  const homeLink = document.querySelector('.logo');
  if (homeLink) {
     homeLink.addEventListener('click', () => {
       window.location.href = 'index.html';
     });
   }
}

// ----------------------------
// Profile, Wishlist, Cart Modal Logic
// ----------------------------
function initProfileAndWishlistModals() {
  const profileIcon = document.querySelectorAll('.icon-container img')[0];
  const modal = document.getElementById('profileModal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');

  if (profileIcon && modal && modalBody && closeBtn) {
    profileIcon.addEventListener('click', openModal);
    
    closeBtn.addEventListener('click', closeModal);
  }

  function openModal() {
    const user = JSON.parse(localStorage.getItem('user'));
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    modal.className = '';
    modal.classList.add(user ? 'modal_visible_topright' : 'modal_visible_center');

    if (user) {
      let orderListHTML = `<h3>Your Orders</h3>`;
      orderListHTML += orders.length > 0
        ? orders.map(order => `
            <div class="order-item">
              <strong>${order.item}</strong><br>
              Qty: ${order.quantity} | ₹${order.price}
            </div>`).join('')
        : `<p>No orders yet.</p>`;

      modalBody.innerHTML = `
        <h3>Welcome, ${user.name}</h3>
        <p>Email: ${user.email}</p>
        ${orderListHTML}
        <button onclick="logout()">Logout</button>
      `;
    } else {
      modalBody.innerHTML = `
        <h2>Login</h2>
        <input type="text" id="name" placeholder="Name">
        <input type="email" id="email" placeholder="Email">
        <button onclick="login()">Login</button>
      `;
    }
  }

  function closeModal() {
    modal.className = '';
    modal.classList.add('modal_hidden');
  }

  window.login = function () {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if (!name || !email) {
      alert("Please enter name and email");
      return;
    }

    localStorage.setItem('user', JSON.stringify({ name, email }));
    localStorage.setItem('orders', JSON.stringify([]));
    openModal();
  };

  window.logout = function () {
    localStorage.clear();
    closeModal();
  };

  // ----------------------------
  // Wishlist Modal Logic
  // ----------------------------
  const wishlistIcon = document.querySelectorAll('.icon-container img')[1];
  const wishlistModal = document.getElementById('wishlistModal');
  const wishlistItemsDiv = document.getElementById('wishlist-items');
  const closeWishlistBtn = document.querySelector('.close-wishlist');

  if (wishlistIcon && wishlistModal && wishlistItemsDiv && closeWishlistBtn) {
    closeWishlistBtn.addEventListener('click', () => {
      wishlistModal.className = 'modal_hidden';
    });

    // Register clear-wishlist event listener ONCE
    const clearWishlist = document.querySelector('.clear-wishlist');
    if (clearWishlist && !clearWishlist.dataset.listenerAdded) {
      clearWishlist.addEventListener('click', () => {
        localStorage.removeItem('wishlist');
        wishlistIcon.click();
      });
      clearWishlist.dataset.listenerAdded = "true";
    }

    wishlistIcon.addEventListener('click', () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

      wishlistItemsDiv.innerHTML = wishlist.length === 0
        ? '<p>No items in wishlist.</p>'
        : wishlist.map(item => `
            <div style="margin-bottom: 1rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
              <img src="${item.img}" style="height: 70px; width:60px; margin-right: 10px; float: left;" />
              <div>
                <strong>${item.name}</strong><br>
                <small>${item.detail}</small><br>
                <span>${item.price}</span><br><br>
                <button class="removeFrom-wl" style="margin-right: 10px;">Remove</button>
                <button class="move-to-bag">Move to Bag</button>
              </div>
              <div style="clear: both;"></div>
            </div>
        `).join('');

      // Remove from Wishlist
      wishlistItemsDiv.querySelectorAll('.removeFrom-wl').forEach((btn, index) => {
        btn.addEventListener('click', () => {
          let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
          wishlist.splice(index, 1);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          wishlistIcon.click(); // Refresh modal
        });
      });

      // Move to Bag
      wishlistItemsDiv.querySelectorAll('.move-to-bag').forEach((btn, index) => {
        btn.addEventListener('click', () => {
          const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
          const cart = JSON.parse(localStorage.getItem('cart')) || [];
          const item = wishlist[index];

          if (!cart.some(cartItem => cartItem.name === item.name)) {
            cart.push(item);
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Item added to your bag');
          } else {
            alert('This item already exists in your bag');
          }

          wishlist.splice(index, 1);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          wishlistIcon.click();
        });
      });

      wishlistModal.className = 'modal_visible_topright';
    });
  }

  // ----------------------------
  // Cart Modal Logic
  // ----------------------------
  const cartIcon = document.querySelectorAll('.icon-container img')[2];
  const cartModal = document.getElementById('cart-modal');
  const cartItemsDiv = document.getElementById('cart-items');
  const priceSummary = document.querySelector('.price-summary');
  const totalAmt = document.querySelector('.total');
  const closecartBtn = document.querySelector('.close-cart');

  cartModal.className = 'modal_hidden';
  if (cartIcon && cartItemsDiv && cartModal && closecartBtn) {
    closecartBtn.addEventListener('click', () => {
      cartModal.className = 'modal_hidden';
    });

    const placeOrder = document.querySelector('.place-order-btn');
    if (placeOrder && !placeOrder.dataset.listenerAdded) {
      placeOrder.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;
        let totalAct = 0;
        cart.forEach(item => {
          const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
          total += price;
          totalAct += parseFloat(item.actualPrice.replace(/[^0-9.]/g, '')) || 0;
        });
        let discounted = totalAct - total;
        let discount = (discounted / totalAct) * 100;
        if (total === 0) return;
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        cart.forEach(item => {
          orders.push({
            item: item.name,
            quantity: 1, // Assuming quantity is 1 for simplicity
            price: item.price
          });
        });
        alert('Order placed successfully!');
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.removeItem('cart');
        cartIcon.click();
      });
      placeOrder.dataset.listenerAdded = "true";
    }

    cartIcon.addEventListener('click', () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];

      let total = 0;
      let totalAct = 0;
      cart.forEach(item => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        const actPrice = parseFloat(item.actualPrice?.replace(/[^0-9.]/g, '')) || 0;
        total += price;
        totalAct += actPrice;
      });

      cartItemsDiv.innerHTML = cart.length === 0
        ? `<p>Your bag is empty</p>`
        : cart.map((item, index) => `
            <div class="cart-item" data-index="${index}" style="margin-bottom: 1rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
              <img src="${item.img}" style="height: 70px; width:60px; margin-right: 10px; float: left;" />
              <div>
                <strong>${item.name}</strong><br>
                <small>${item.detail}</small><br>
                <span>${item.price}</span><br><br>
                <button class="removeFromCart">Remove</button>
              </div>
              <div style="clear: both;"></div>
            </div>
        `).join('');

      if (cart.length === 0) {
        priceSummary.innerHTML = `<p>Your total cart value will be shown here.</p>`;
      } else {
        let discount = 0, discounted = 0;
        if (totalAct > 0) {
          discounted = totalAct - total;
          discount = totalAct ? Math.round((discounted / totalAct) * 100) : 0;
        }
        priceSummary.innerHTML = cart.map(item => `<div class="itemPrice">${item.price} <span style="color: orange">(<del>${item.actualPrice}</del>)</span></div>`).join('');
        if (discounted > 0) {
          priceSummary.innerHTML += `<p style="color: orange">You will save Rs${discounted} with this order, total discount applied is ${discount}%.</p>`;
        }
      }

      totalAmt.innerHTML = `<strong>Total Payable: ₹${total}</strong>`;

      document.querySelectorAll('.removeFromCart').forEach((btn, index) => {
        btn.addEventListener('click', () => {
          cart.splice(index, 1);
          localStorage.setItem('cart', JSON.stringify(cart));
          cartIcon.click();
        });
      });

      cartModal.className = 'modal_visible_topright';
    });
  }
}

// ----------------------------
// Wishlist Add Logic
// ----------------------------
function initWishlistClicks() {
  const wishItems = document.querySelectorAll('.wishlist');

  if (wishItems.length === 0) return;

  wishItems.forEach(item => {
    item.addEventListener('click', () => {
      const productCard = item.closest('.img-con');
      if (!productCard) return;

      const name = productCard.querySelector('.name')?.innerText.trim();
      const detail = productCard.querySelector('.detail')?.innerText.trim();
      const price = productCard.querySelector('.d-price')?.innerText.trim();
      const img = productCard.querySelector('img')?.getAttribute('src');
      const actualPrice = productCard.querySelector('.a-price')?.innerText.trim();

      if (!name || !img) return;

      const product = { name, detail, price, img, actualPrice };

      let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

      if (!wishlist.some(entry => entry.name === product.name)) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        alert('Item added to your wishlist');
      } else {
        alert('This item is already in your wishlist');
      }
    });
  });
}
