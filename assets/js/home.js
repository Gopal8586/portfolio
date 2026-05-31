// home.js — Typed.js + SVG Ring Animation + Percentage Counter

// ── Typed.js hero role text ───────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Typed.js
  const typedEl = document.querySelector('.typed');
  if (typedEl && typeof Typed !== 'undefined') {
    new Typed('.typed', {
      strings: [
        'Frontend Developer',
        'UI Designer',
        'Graphic Designer',
        'Web Developer',
      ],
      typeSpeed: 60,
      backSpeed: 35,
      backDelay: 2000,
      loop: true,
    });
  }

  // ── SVG Ring Animation ────────────────────────
  // circumference = 2π × r = 2 × π × 48 ≈ 301.6
  const CIRCUMFERENCE = 301.6;

  const rings = document.querySelectorAll('.ring-fill');
  if (!rings.length) return;

  // Count-up helper
  function animateCount(el, target, duration) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + '%';
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const ring = entry.target;
      const pct  = parseInt(ring.dataset.pct, 10);
      const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

      // Animate stroke
      ring.style.strokeDashoffset = offset;

      // Animate percentage counter in center
      const card   = ring.closest('.skill-adv-card');
      const pctEl  = card && card.querySelector('.skill-ring-pct');
      if (pctEl) animateCount(pctEl, pct, 1300);

      ringObserver.unobserve(ring);
    });
  }, { threshold: 0.3 });

  rings.forEach(r => ringObserver.observe(r));

});
