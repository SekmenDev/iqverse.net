// IQVerse Tools — script.js

// ── Intersection Observer for scroll reveals ──────────────────────────────

const revealEls = document.querySelectorAll('.tool-card, .idea-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Stagger children of idea grid
      const el = entry.target;
      const delay = el.classList.contains('idea-card')
        ? Array.from(el.parentElement.children).indexOf(el) * 60
        : Array.from(el.parentElement.querySelectorAll('.tool-card')).indexOf(el) * 120;

      setTimeout(() => {
        el.classList.add('visible');
      }, delay);

      observer.unobserve(el);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => observer.observe(el));

// ── Nav scroll state ──────────────────────────────────────────────────────

const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.style.borderBottomColor = 'rgba(255,255,255,0.1)';
  } else {
    nav.style.borderBottomColor = 'rgba(255,255,255,0.07)';
  }
}, { passive: true });

// ── Smooth scroll for anchor links ────────────────────────────────────────

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Subtle cursor glow follow on tool cards ───────────────────────────────

document.querySelectorAll('.tool-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const glow = card.querySelector('.tool-card__glow');
    if (glow) {
      glow.style.left = `${x - 150}px`;
      glow.style.top  = `${y - 150}px`;
      glow.style.transform = 'none';
    }
  });

  card.addEventListener('mouseleave', () => {
    const glow = card.querySelector('.tool-card__glow');
    if (glow) {
      glow.style.left = '';
      glow.style.top  = '';
      glow.style.transform = 'translate(50%, -50%)';
    }
  });
});
