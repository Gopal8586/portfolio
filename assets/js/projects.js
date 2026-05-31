/**
 * projects.js — Random Shuffle Animation Filter System
 * Each card gets a DIFFERENT random enter + exit animation every time
 */

document.addEventListener('DOMContentLoaded', () => {

  const grid    = document.querySelector('.projects-grid');
  const cards   = [...document.querySelectorAll('.proj-card')];
  const btns    = document.querySelectorAll('.filter-btn');
  const countEl = document.querySelector('.projects-count span');
  const tabs    = document.querySelector('.filter-tabs');

  // ── Animation pools ──────────────────────────
  const ENTER_ANIMS = [
    { name: 'enterFromBottom', dur: 580, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    { name: 'enterFromLeft',   dur: 520, ease: 'cubic-bezier(0.34, 1.4, 0.64, 1)'  },
    { name: 'enterFromRight',  dur: 520, ease: 'cubic-bezier(0.34, 1.4, 0.64, 1)'  },
    { name: 'enterZoom',       dur: 550, ease: 'cubic-bezier(0.22, 1, 0.36, 1)'     },
    { name: 'enterFlip',       dur: 600, ease: 'cubic-bezier(0.22, 1, 0.36, 1)'     },
    { name: 'enterBounce',     dur: 700, ease: 'linear'                              },
  ];

  const EXIT_ANIMS = [
    { name: 'exitLeft',   dur: 260, ease: 'cubic-bezier(0.4, 0, 1, 1)' },
    { name: 'exitRight',  dur: 260, ease: 'cubic-bezier(0.4, 0, 1, 1)' },
    { name: 'exitShrink', dur: 220, ease: 'ease-in'                     },
    { name: 'exitTop',    dur: 240, ease: 'cubic-bezier(0.4, 0, 1, 1)' },
  ];

  // Guaranteed shuffle — no two adjacent cards get same animation
  function shuffledPool(pool, count) {
    const result = [];
    let last = -1;
    for (let i = 0; i < count; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * pool.length); } while (idx === last && pool.length > 1);
      result.push(pool[idx]);
      last = idx;
    }
    return result;
  }

  // Random stagger — organic, not perfectly linear
  function randomStagger(index) {
    const base = index * 70;
    const jitter = Math.floor(Math.random() * 50) - 20; // ±20ms jitter
    return Math.max(0, base + jitter);
  }

  // ── Sliding pill indicator ────────────────────
  function movePill(btn) {
    if (!tabs || window.innerWidth <= 640) return;
    const tr = tabs.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    tabs.style.setProperty('--pill-x', (br.left - tr.left + 5) + 'px');
    tabs.style.setProperty('--pill-w', br.width + 'px');
  }

  // Init pill
  const firstActive = document.querySelector('.filter-btn.active');
  if (firstActive) setTimeout(() => movePill(firstActive), 60);

  // ── Count update ──────────────────────────────
  function updateCount(filter) {
    if (!countEl) return;
    const visible = filter === 'all'
      ? cards
      : cards.filter(c => c.classList.contains(filter));
    countEl.textContent = visible.length;
  }
  updateCount('all');

  // ── Main filter function ──────────────────────
  let isAnimating = false;

  btns.forEach(btn => {
    btn.addEventListener('click', function () {
      if (isAnimating || this.classList.contains('active')) return;
      isAnimating = true;

      // Update active pill
      btns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      movePill(this);

      const filter = this.dataset.filter;
      updateCount(filter);

      // Split cards into leaving and entering groups
      const leaving  = cards.filter(c => !(filter === 'all' || c.classList.contains(filter)));
      const entering = cards.filter(c =>   filter === 'all' || c.classList.contains(filter));

      // Pick unique random animations for each group
      const exitPool  = shuffledPool(EXIT_ANIMS,  leaving.length);
      const enterPool = shuffledPool(ENTER_ANIMS, entering.length);

      // Longest exit duration (to know when to start enters)
      const maxExitDur = leaving.length > 0
        ? Math.max(...exitPool.map(a => a.dur))
        : 0;

      // ── Phase 1: Exit leaving cards ─────────────
      leaving.forEach((card, i) => {
        const anim = exitPool[i];
        card.classList.add('is-animating');
        // Small stagger on exits too (feels more natural)
        const delay = Math.floor(Math.random() * 80);
        card.style.animation = `${anim.name} ${anim.dur}ms ${anim.ease} ${delay}ms both`;
      });

      // ── Phase 2: After exits done, show entering ─
      setTimeout(() => {

        // Hide all leaving cards
        leaving.forEach(card => {
          card.classList.add('card-gone');
          card.classList.remove('is-animating');
          card.style.animation = '';
        });

        // Ensure entering cards are visible
        entering.forEach(card => {
          card.classList.remove('card-gone');
          card.style.opacity = '0';
          card.style.animation = '';
        });

        // Force reflow so animation restarts cleanly
        grid.getBoundingClientRect();

        // ── Phase 3: Animate entering cards ─────────
        let maxEnterEnd = 0;

        entering.forEach((card, i) => {
          const anim   = enterPool[i];
          const delay  = randomStagger(i);
          const total  = anim.dur + delay;
          if (total > maxEnterEnd) maxEnterEnd = total;

          card.classList.add('is-animating');
          card.style.opacity  = '';
          card.style.animation = `${anim.name} ${anim.dur}ms ${anim.ease} ${delay}ms both`;
        });

        // Cleanup after all enters complete
        setTimeout(() => {
          entering.forEach(card => {
            card.classList.remove('is-animating');
            card.style.animation = '';
          });
          isAnimating = false;
        }, maxEnterEnd + 80);

      }, maxExitDur + 60); // small buffer after exits
    });
  });

  // ── Ripple on filter buttons ──────────────────
  btns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r = document.createElement('span');
      const rect = this.getBoundingClientRect();
      Object.assign(r.style, {
        position: 'absolute',
        width: '0', height: '0',
        left: (e.clientX - rect.left) + 'px',
        top: (e.clientY - rect.top) + 'px',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255,255,255,0.18)',
        borderRadius: '50%',
        animation: 'projRipple 0.55s ease-out forwards',
        pointerEvents: 'none',
      });
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });

});

// Inject ripple keyframe once
const _s = document.createElement('style');
_s.textContent = `@keyframes projRipple { to { width: 220px; height: 220px; opacity: 0; } }`;
document.head.appendChild(_s);

/* ════════════════════════════════════════════════
   IMPACT ORBIT — Scroll-triggered animations
   ════════════════════════════════════════════════ */
(function initImpactOrbit() {

  const CIRCUMFERENCE = 427; // 2π × 68

  /* ── Inject SVG gradient defs ── */
  const svgNS = 'http://www.w3.org/2000/svg';
  const defsEl = document.createElementNS(svgNS, 'svg');
  defsEl.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  defsEl.innerHTML = `
    <defs>
      <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
      <linearGradient id="orbitGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#4ade80"/>
      </linearGradient>
    </defs>`;
  document.body.prepend(defsEl);

  /* ── Animated counter ── */
  function animateCount(el, target, suffix, duration) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Animate orbit ring fill ── */
  function animateRing(fillEl, pct) {
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    fillEl.style.strokeDashoffset = offset;
  }

  /* ── IntersectionObserver ── */
  const cards = document.querySelectorAll('.impact-orbit-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const delay = parseInt(card.dataset.delay || 0);

      setTimeout(() => {
        card.classList.add('orbit-visible');

        /* Ring */
        const fill = card.querySelector('.orbit-fill, .orbit-fill-real');
        if (fill) {
          const pct = parseFloat(fill.dataset.pct || 0);
          animateRing(fill, pct);
        }

        /* Number counter */
        const counter = card.querySelector('.impact-count');
        if (counter) {
          const target = parseInt(counter.dataset.target || 0);
          const suffix = counter.dataset.suffix || '';
          animateCount(counter, target, suffix, 1800);
        }
      }, delay);

      observer.unobserve(card);
    });
  }, { threshold: 0.25 });

  cards.forEach(c => observer.observe(c));

})();
