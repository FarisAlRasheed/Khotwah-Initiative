/* ============================================================
   KHOTWAH — script.js
   Features:
   1. Mobile menu toggle
   2. Header scroll shadow
   3. Intersection Observer scroll-reveal
   4. Scrollspy — active-link in navbar
============================================================ */

(function () {
  'use strict';

  /* ── 1. Mobile Menu ─────────────────────────────────────── */
  const menuBtn  = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!isHidden));
    });

    // Close on any link click inside the mobile menu
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 2. Header scroll shadow ─────────────────────────────── */
  const header = document.querySelector('header');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ── 3. Scroll Reveal (Intersection Observer) ───────────── */
  // Targets: every major section, section headers, card grids, and
  // individual cards / testimonials so they stagger in nicely.

  const revealTargets = document.querySelectorAll([
    'section',
    '.section-header',
    '.reveal-card',
  ].join(', '));

  // Add the hidden class to everything that should animate
  revealTargets.forEach((el) => {
    // Skip the hero section — it's always visible
    if (el.id === 'hero' || el.classList.contains('hero-gradient')) return;
    el.classList.add('reveal-hidden');
  });

  // Also stagger individual grid children (goal cards, program cards, testimonials)
  const staggerParents = document.querySelectorAll(
    '[data-stagger]'
  );

  staggerParents.forEach((parent) => {
    Array.from(parent.children).forEach((child, i) => {
      child.classList.add('reveal-hidden', `reveal-delay-${Math.min(i + 1, 4)}`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          // Once revealed, stop observing to save resources
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,        // trigger when 12 % of the element is visible
      rootMargin: '0px 0px -48px 0px', // slight offset from bottom edge
    }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  // Also observe staggered children
  staggerParents.forEach((parent) => {
    Array.from(parent.children).forEach((child) => {
      revealObserver.observe(child);
    });
  });

  /* ── 4. Scrollspy — active-link ──────────────────────────── */
  // Map each nav-link href to the corresponding section element
  const navLinks = document.querySelectorAll('nav .nav-link[href^="#"]');

  const sectionIds = Array.from(navLinks).map((a) =>
    a.getAttribute('href').slice(1)
  );

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActiveLink = (activeId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active-link', isActive);
    });
  };

  // Use an IntersectionObserver on each section for accurate detection
  // We track the "most visible" section in a Map
  const visibilityMap = new Map();

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibilityMap.set(entry.target.id, entry.intersectionRatio);
      });

      // Find the section with the highest visible ratio
      let maxRatio = 0;
      let activeId = null;

      visibilityMap.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          activeId = id;
        }
      });

      if (activeId) setActiveLink(activeId);
    },
    {
      threshold: Array.from({ length: 21 }, (_, i) => i * 0.05), // 0, 0.05 … 1
      rootMargin: '-10% 0px -10% 0px',
    }
  );

  sections.forEach((section) => {
    visibilityMap.set(section.id, 0);
    spyObserver.observe(section);
  });

  /* ── 5. Smooth stats counter animation ──────────────────── */
  // Finds elements with data-count="200" and counts up to that value
  const counterEls = document.querySelectorAll('[data-count]');

  if (counterEls.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          const duration = 1400; // ms
          const start    = performance.now();

          const tick = (now) => {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = Math.round(eased * target);
            el.textContent = `${prefix}${current}${suffix}`;

            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counterEls.forEach((el) => counterObserver.observe(el));
  }
})();
