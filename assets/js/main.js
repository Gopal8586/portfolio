/* =============================================
   MAIN.JS — Shared: Cursor, Navbar, Scroll,
             Active Link, Reveal Observer
   ============================================= */

// ── Custom Cursor ──────────────────────────
const cursor     = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');

let ringX = 0, ringY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', e => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
});

// Smooth ring follow
(function animateRing() {
  ringX += (cursorX - ringX) * 0.12;
  ringY += (cursorY - ringY) * 0.12;
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
  }
  requestAnimationFrame(animateRing);
})();

document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
document.addEventListener('mouseup',   () => cursor.classList.remove('clicked'));

// Hide cursor when it leaves window
document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  if (cursorRing) cursorRing.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1';
  if (cursorRing) cursorRing.style.opacity = '1';
});

// ── Navbar: Scroll & Active Link ───────────
const navbar  = document.querySelector('.navbar');
const scrollBar = document.querySelector('.scroll-bar');

window.addEventListener('scroll', () => {
  // Scrolled class
  if (window.scrollY > 40) navbar.classList.add('scrolled');
  else                      navbar.classList.remove('scrolled');

  // Progress bar
  if (scrollBar) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = ((window.scrollY / total) * 100) + '%';
  }
});

// Active nav link — detect current page
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === page || (page === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── Mobile Nav Toggle ──────────────────────
const navToggle  = document.querySelector('.nav-toggle');
const mobileNav  = document.querySelector('.mobile-nav');
const mobileClose = document.querySelector('.mobile-close');

if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => mobileNav.classList.add('open'));
  if (mobileClose) mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  // Close when a link is clicked
  document.querySelectorAll('.mobile-nav .nav-link, .mobile-nav .nav-cta').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

// ── Scroll Reveal ──────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── Premium Skill Bar Animation (About Page) ────
function countUp(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const card = entry.target;

    // New premium bars (about page) — data-w attribute
    card.querySelectorAll('.skill-pro-fill[data-w]').forEach(fill => {
      const w = parseInt(fill.dataset.w, 10);
      fill.style.width = w + '%';
      // Trigger shimmer after fill
      const shine = fill.querySelector('.bar-shine');
      if (shine) setTimeout(() => shine.classList.add('animate'), 400);
    });

    // Count up percentages
    card.querySelectorAll('.skill-pro-pct[data-target]').forEach(el => {
      countUp(el, parseInt(el.dataset.target, 10), 1300);
    });

    // Old-style bars (data-width) — backward compat
    card.querySelectorAll('[data-width]').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });

    barObserver.unobserve(card);
  });
}, { threshold: 0.2 });

// Observe all skill card variants
document.querySelectorAll('.skill-pro-card, .skill-category-card').forEach(c => barObserver.observe(c));

// ── Certificate Modal Logic ────────────────
const certModal = document.querySelector('.cert-modal');
const certModalImg = document.getElementById('cert-modal-img');
const certModalClose = document.querySelector('.cert-modal-close');
const certModalBackdrop = document.querySelector('.cert-modal-backdrop');
const viewCertBtns = document.querySelectorAll('.view-cert-btn');

if (certModal && certModalImg) {
  const openModal = (src) => {
    certModalImg.src = src;
    certModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    certModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { certModalImg.src = ''; }, 300); // Clear after transition
  };

  viewCertBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const src = btn.getAttribute('data-cert-src');
      if (src) openModal(src);
    });
  });

  certModalClose?.addEventListener('click', closeModal);
  certModalBackdrop?.addEventListener('click', closeModal);
}

// ── Go To Top Button ───────────────────────
const goToTopBtn = document.createElement('button');
goToTopBtn.className = 'go-to-top';
goToTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
goToTopBtn.setAttribute('aria-label', 'Go to top');
document.body.appendChild(goToTopBtn);

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    goToTopBtn.classList.add('visible');
  } else {
    goToTopBtn.classList.remove('visible');
  }
});

goToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ── Contact Form Submission Logic ──────────
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

if (contactForm && submitBtn) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get button text element
    const submitText = submitBtn.querySelector('.submit-text');
    const originalText = submitText.innerText;
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.innerText = 'Sending...';

    // Gather form data
    const projectType = document.querySelector('input[name="project_type"]:checked')?.value || '';
    
    const formData = {
      project_type: projectType,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      budget: document.getElementById('budget').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };

    try {
      const response = await fetch('send_mail.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('Thank you! Your message has been sent successfully.');
        contactForm.reset();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('An error occurred while sending the message. Please try again later.');
      console.error('Mail Error:', error);
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitText.innerText = originalText;
    }
  });
}
