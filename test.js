    /* =========================================
       DATA
       ========================================= */
    const products = [
      { id: 1, name: "Midnight Candle", price: 1200, color: "#111", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800" },
      { id: 2, name: "Obsidian Vase", price: 3400, color: "#222", img: "https://images.unsplash.com/photo-1581783342308-f792db84d3bd?q=80&w=800" },
      { id: 3, name: "Aura Lamp", price: 8500, color: "#ccff00", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800" },
      { id: 4, name: "Concrete Bowl", price: 1800, color: "#888", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800" },
      { id: 5, name: "Moss Terrarium", price: 2100, color: "#4caf50", img: "https://images.unsplash.com/photo-1599304380614-2c0eb2dd9a50?q=80&w=800" },
      { id: 6, name: "Glass Geode", price: 4200, color: "#00e5ff", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800" }
    ];

    let cart = [];
    let cartTotal = 0;
    let wishlist = [];
    try {
      const w = JSON.parse(localStorage.getItem('wishlist'));
      if (Array.isArray(w)) wishlist = w;
    } catch(e) {}
    
    let recentlyViewed = [];
    try {
      const r = JSON.parse(localStorage.getItem('recentlyViewed'));
      if (Array.isArray(r)) recentlyViewed = r;
    } catch(e) {}

    /* =========================================
       INITIALIZATION
       ========================================= */
    document.addEventListener("DOMContentLoaded", () => {
      renderCatalog();
      renderRecentlyViewed();
      initCursor();
      initLoader();
      initScrollTrigger();
      initSocialProof();
      checkWishlistURL();
    });

    /* =========================================
       LOADER
       ========================================= */
    function initLoader() {
      const textEl = document.getElementById("typewriter");
      const phrase = "We redefine reality.";
      let i = 0;
      
      function typeWriter() {
        if (i < phrase.length) {
          textEl.innerHTML += phrase.charAt(i);
          i++;
          setTimeout(typeWriter, 50);
        } else {
          setTimeout(eraseWriter, 1000);
        }
      }
      
      function eraseWriter() {
        if (i > 0) {
          textEl.innerHTML = phrase.substring(0, i-1);
          i--;
          setTimeout(eraseWriter, 30);
        } else {
          phrase2 = "Prepare yourself.";
          i = 0;
          typeWriter2();
        }
      }
      
      let phrase2 = "";
      function typeWriter2() {
        if (i < phrase2.length) {
          textEl.innerHTML += phrase2.charAt(i);
          i++;
          setTimeout(typeWriter2, 50);
        }
      }

      typeWriter();

      setTimeout(() => {
        const loader = document.getElementById("loader");
        if (loader) {
          loader.classList.add("shatter");
          setTimeout(() => {
            loader.style.display = "none";
          }, 1500); // Give the shatter animation time to play before removing from flow
        }
      }, 3000);
    }

    /* =========================================
       CATALOG RENDER & 3D TILT
       ========================================= */
    function renderCatalog() {
      const grid = document.getElementById("product-list");
      grid.innerHTML = "";
      products.forEach(p => {
        const isWished = wishlist.includes(p.id);
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = p.id;
        
        // Small blurry placeholder image logic
        const blurImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM1NTEiLz48L3N2Zz4=";

        card.innerHTML = `
          <div class="card-spotlight"></div>
          <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="toggleWishlist(${p.id}, this)">♥</button>
          <div class="product-img-wrap cursor-hover-product" onmouseenter="recordView(${p.id})">
            <img src="${blurImg}" data-src="${p.img}" class="product-img" alt="${p.name}">
            <div class="quick-view-pill">Quick View</div>
          </div>
          <div class="product-info">
            <div>
              <div class="product-title">${p.name}</div>
              <div class="product-price price-counter" data-target="${p.price}">₹0</div>
            </div>
            <button class="add-to-cart-btn btn-active cursor-hover-add" style="width:auto; margin:0;" onclick="addToCart(${p.id})">+</button>
          </div>
        `;
        
        // 3D Tilt Logic
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          card.style.setProperty('--x', `${x}px`);
          card.style.setProperty('--y', `${y}px`);
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -10;
          const rotateY = ((x - centerX) / centerX) * 10;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          card.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${p.color}33`;
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
          card.style.boxShadow = 'none';
        });

        grid.appendChild(card);
      });

      // Lazy load images for blur-up
      setTimeout(() => {
        document.querySelectorAll('.product-img').forEach(img => {
          const src = img.getAttribute('data-src');
          const newImg = new Image();
          newImg.src = src;
          newImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
          };
        });
      }, 3500); // after loader

      // Animate prices
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateValue(entry.target, 0, parseInt(entry.target.getAttribute('data-target')), 1000);
            observer.unobserve(entry.target);
          }
        });
      });
      document.querySelectorAll('.price-counter').forEach(el => observer.observe(el));
    }

    function animateValue(obj, start, end, duration) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = "₹" + Math.floor(progress * (end - start) + start);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    /* =========================================
       CURSOR & INTERACTIONS
       ========================================= */
    function initCursor() {
      const dot = document.getElementById('cursor-dot');
      const ring = document.getElementById('cursor-ring');
      
      document.addEventListener('mousemove', (e) => {
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
        
        // Slight delay for ring
        setTimeout(() => {
          ring.style.left = e.clientX + 'px';
          ring.style.top = e.clientY + 'px';
        }, 50);

        // Vapor trail
        if (Math.random() > 0.8) {
          const trail = document.createElement('div');
          trail.className = 'vapor-trail';
          trail.style.left = e.clientX + 'px';
          trail.style.top = e.clientY + 'px';
          document.body.appendChild(trail);
          setTimeout(() => trail.remove(), 500);
        }
      });

      // Hover states based on classes
      document.addEventListener('mouseover', (e) => {
        if(e.target.closest('.cursor-hover-product')) document.body.classList.add('cursor-hover-product');
        else document.body.classList.remove('cursor-hover-product');

        if(e.target.closest('.cursor-hover-add')) document.body.classList.add('cursor-hover-add');
        else document.body.classList.remove('cursor-hover-add');
      });
    }

    // Navbar scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('navbar');
      const currentScroll = window.pageYOffset;
      
      if (currentScroll <= 50) {
        nav.classList.remove('scrolled-up', 'scrolled-down');
      } else if (currentScroll > lastScroll) {
        nav.classList.add('scrolled-down');
        nav.classList.remove('scrolled-up');
      } else {
        nav.classList.add('scrolled-up');
        nav.classList.remove('scrolled-down');
      }
      lastScroll = currentScroll;
    });

    // Easter Egg
    let typedStr = "";
    document.addEventListener('keydown', (e) => {
      typedStr += e.key.toUpperCase();
      if (typedStr.length > 6) typedStr = typedStr.slice(-6);
      if (typedStr === "WINNER") {
        document.body.style.transform = "rotate(360deg)";
        document.body.style.transition = "transform 2s var(--ease-spring)";
        setTimeout(() => { document.body.style.transform = "none"; }, 2000);
      }
    });

    /* =========================================
       MODES: VIBE & THEME
       ========================================= */
    document.getElementById('btn-browse').addEventListener('click', (e) => {
      document.body.classList.remove('vibe-mode');
      e.target.classList.add('active');
      document.getElementById('btn-vibe').classList.remove('active');
    });
    
    document.getElementById('btn-vibe').addEventListener('click', (e) => {
      document.body.classList.add('vibe-mode');
      e.target.classList.add('active');
      document.getElementById('btn-browse').classList.remove('active');
      window.scrollTo(0, document.getElementById('catalog').offsetTop);
    });

    const themes = ['dark', 'light', 'aura'];
    let currentThemeIdx = 0;
    document.getElementById('theme-toggle').addEventListener('click', () => {
      currentThemeIdx = (currentThemeIdx + 1) % themes.length;
      document.documentElement.setAttribute('data-theme', themes[currentThemeIdx]);
      document.getElementById('theme-toggle').innerText = themes[currentThemeIdx] === 'light' ? '☀️' : themes[currentThemeIdx] === 'aura' ? '✨' : '🌙';
    });

    /* =========================================
       CART LOGIC
       ========================================= */
    function addToCart(id) {
      const prod = products.find(p => p.id === id);
      cart.push(prod);
      updateCart();
      
      const badge = document.getElementById('cart-count');
      badge.style.transform = "scale(1.5)";
      setTimeout(() => badge.style.transform = "scale(1)", 300);
    }

    function toggleCart() {
      const drawer = document.getElementById('cart-drawer');
      drawer.classList.toggle('open');
      if(drawer.classList.contains('open')) {
        if(cart.length === 0) {
          document.querySelector('.cart-trigger').classList.add('empty-cart-shake');
          setTimeout(() => document.querySelector('.cart-trigger').classList.remove('empty-cart-shake'), 500);
        }
      }
    }

    function updateCart() {
      document.getElementById('cart-count').innerText = cart.length;
      cartTotal = cart.reduce((sum, p) => sum + p.price, 0);
      document.getElementById('cart-total').innerText = cartTotal;
      
      const container = document.getElementById('cart-items');
      if (cart.length === 0) {
        container.innerHTML = '<div style="opacity:0.5; text-align:center; margin-top:2rem;">Your cart is lonely 🛍️</div>';
      } else {
        container.innerHTML = cart.map((p, index) => `
          <div style="display:flex; justify-content:space-between; margin-bottom:1rem; align-items:center;">
            <div style="display:flex; gap:1rem; align-items:center;">
              <img src="${p.img}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
              <div>${p.name}</div>
            </div>
            <div>₹${p.price}</div>
          </div>
        `).join('');
      }

      checkCelebrations();
    }

    function checkCelebrations() {
      const toast = document.getElementById('toast-celebration');
      if (cartTotal > 2499 && !window.vipFired) {
        window.vipFired = true;
        document.body.style.background = "#ffd700";
        setTimeout(() => document.body.style.background = "", 200);
        toast.innerText = "You're a VIP — 10% off applied automatically ✨";
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
        fireConfetti();
      } else if (cartTotal > 999 && !window.shippingFired) {
        window.shippingFired = true;
        toast.innerText = "Free shipping unlocked! 🎉";
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
        fireConfetti();
      }
    }

    // Checkout Steps
    function nextStep(stepNum) {
      document.querySelectorAll('.checkout-step').forEach(el => {
        el.classList.remove('active', 'exit-left');
      });
      const target = document.getElementById(`step-${stepNum}`);
      target.classList.add('active');
      
      // Animate previous out left
      if(stepNum > 1) {
        document.getElementById(`step-${stepNum-1}`).classList.add('exit-left');
      }
    }

    function completeCheckout() {
      document.getElementById('celebration-overlay').classList.add('show');
      fireConfetti(true);
      cart = [];
      updateCart();
    }

    /* =========================================
       WISHLIST & RECENTLY VIEWED
       ========================================= */
    function toggleWishlist(id, btn) {
      const idx = wishlist.indexOf(id);
      if (idx > -1) {
        wishlist.splice(idx, 1);
        btn.classList.remove('active');
      } else {
        wishlist.push(id);
        btn.classList.add('active');
      }
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    function checkWishlistURL() {
      const params = new URLSearchParams(window.location.search);
      const wl = params.get('wishlist');
      if (wl) {
        wishlist = wl.split(',').map(Number);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        renderCatalog(); // Re-render to show hearts
      }
    }

    function recordView(id) {
      if (!recentlyViewed.includes(id)) {
        recentlyViewed.unshift(id);
        if (recentlyViewed.length > 5) recentlyViewed.pop();
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        renderRecentlyViewed();
      }
    }

    function renderRecentlyViewed() {
      const container = document.getElementById('recently-viewed');
      if(recentlyViewed.length === 0) {
        container.style.display = 'none';
        return;
      }
      container.style.display = 'flex';
      container.innerHTML = "<div style='opacity:0.5; align-self:center; margin-right:2rem; font-size:0.8rem;'>Recently Viewed</div>" + 
        recentlyViewed.map(id => {
          const p = products.find(prod => prod.id === id);
          return p ? `<img src="${p.img}">` : '';
        }).join('');
    }

    /* =========================================
       SOCIAL PROOF TOASTS
       ========================================= */
    function initSocialProof() {
      const messages = [
        "Arjun from Mumbai just added Midnight Candle to their cart 🔥",
        "12 people are viewing this product right now 👀",
        "Only 3 left in stock — 2 people have this in their cart ⚡",
        "Priya just purchased the Aura Lamp ✨",
        "Someone in Delhi is looking at the Obsidian Vase 🖤"
      ];
      const container = document.getElementById('social-proof');

      function showToast() {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const el = document.createElement('div');
        el.className = 'social-toast';
        el.innerText = msg;
        container.appendChild(el);
        
        setTimeout(() => el.classList.add('show'), 100);
        setTimeout(() => {
          el.classList.remove('show');
          setTimeout(() => el.remove(), 600);
        }, 4000);

        setTimeout(showToast, Math.random() * 4000 + 8000); // 8-12s
      }
      setTimeout(showToast, 5000);
    }

    /* =========================================
       AI SHOPPER (SIMULATED)
       ========================================= */
    function toggleAI() {
      document.getElementById('ai-widget').classList.toggle('open');
    }

    function handleAIInput(e) {
      if (e.key === 'Enter' && e.target.value.trim() !== '') {
        const val = e.target.value;
        const chat = document.getElementById('ai-chat');
        
        chat.innerHTML += `<div class="ai-msg user">${val}</div>`;
        e.target.value = '';
        
        // Scroll bottom
        chat.scrollTop = chat.scrollHeight;

        // Simulate thinking
        setTimeout(() => {
          let response = "I couldn't find an exact match, but everything we have is beautiful.";
          const lower = val.toLowerCase();
          
          if(lower.includes('under') && lower.includes('2000')) {
            response = "For under ₹2000, I highly recommend the **Midnight Candle** (₹1200) or the **Concrete Bowl** (₹1800). Both make excellent gifts.";
          } else if (lower.includes('gift')) {
            response = "Gifting is an art. The **Moss Terrarium** brings life to any desk, while the **Aura Lamp** is unforgettable.";
          } else if (lower.includes('vase')) {
            response = "The Obsidian Vase is crafted from a single block. It's stunning.";
          }

          chat.innerHTML += `<div class="ai-msg bot">${response}</div>`;
          chat.scrollTop = chat.scrollHeight;
        }, 1000);
      }
    }

    /* =========================================
       SCROLL STORYTELLING
       ========================================= */
    function initScrollTrigger() {
      const banner = document.getElementById('story-banner');
      const track = document.getElementById('story-track');
      
      window.addEventListener('scroll', () => {
        const rect = banner.getBoundingClientRect();
        // If banner is in view
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          const scrollProgress = Math.abs(rect.top) / (rect.height - window.innerHeight);
          const moveX = scrollProgress * 300; // 300vw
          track.style.transform = `translateX(-${moveX}vw)`;
        }
      });
    }

    /* =========================================
       CONFETTI LOGIC
       ========================================= */
    function fireConfetti(massive = false) {
      const canvas = document.getElementById('confetti-canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const pieces = [];
      const colors = ['#ccff00', '#fff', '#ff3366', '#00e5ff'];
      const count = massive ? 300 : 100;
      
      for(let i=0; i<count; i++) {
        pieces.push({
          x: canvas.width / 2,
          y: massive ? canvas.height : canvas.height / 2,
          vx: (Math.random() - 0.5) * (massive ? 30 : 20),
          vy: (Math.random() - 1) * (massive ? 30 : 15),
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rs: (Math.random() - 0.5) * 10
        });
      }

      function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        pieces.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.5; // gravity
          p.rotation += p.rs;
          
          if(p.y < canvas.height) active = true;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          ctx.restore();
        });
        
        if(active) requestAnimationFrame(render);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
      }
      render();
    }

