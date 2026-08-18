(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- سال جاری در فوتر ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- لینک فعال نویگیشن هنگام اسکرول ---------- */
  const navLinks = document.querySelectorAll('.nav-link[data-nav]');
  const navSections = ['about', 'skills', 'work', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (navLinks.length && navSections.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('data-nav') === id);
      });
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    navSections.forEach(sec => navObserver.observe(sec));
  }

  /* ---------- منوی موبایل ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileNav.hidden = !isOpen;
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileNav.hidden = true;
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- پارالاکس هاله‌ها با حرکت موس ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const halos = [
      { el: document.getElementById('halo1'), strength: 26 },
      { el: document.getElementById('halo2'), strength: 18 },
      { el: document.getElementById('halo3'), strength: 34 },
    ].filter(h => h.el);

    const orbHalo = document.getElementById('orbHalo');
    const glassOrb = document.getElementById('glassOrb');

    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth) - 0.5;
      targetY = (e.clientY / window.innerHeight) - 0.5;
    }, { passive: true });

    function animateHalos() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      halos.forEach(({ el, strength }) => {
        el.style.transform = `translate(${curX * strength}px, ${curY * strength}px)`;
      });

      if (orbHalo) orbHalo.style.transform = `translate(${curX * 14}px, ${curY * 14}px) scale(1)`;
      if (glassOrb) glassOrb.style.transform = `translate(${curX * 8}px, ${curY * 8}px)`;

      requestAnimationFrame(animateHalos);
    }
    requestAnimationFrame(animateHalos);
  }

  /* ---------- شمارنده‌ی اعداد هیرو ---------- */
  const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  function toPersianNumber(n) {
    return String(n).split('').map(d => (/\d/.test(d) ? persianDigits[+d] : d)).join('');
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) {
      el.textContent = toPersianNumber(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = toPersianNumber(value);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- پر شدن لوله‌های مهارت ---------- */
  function fillTube(tube) {
    const level = tube.getAttribute('data-level') || '0';
    const liquid = tube.querySelector('.tube-liquid');
    if (liquid) liquid.style.setProperty('--fill', level + '%');
  }

  /* ---------- انیمیشن ظهور با اسکرول ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-head, .about-text, .mini-card, .skill-tube-item, .work-card, .contact-panel'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const counters = document.querySelectorAll('.meta-num');
  const tubes = document.querySelectorAll('.skill-tube');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterObserver.observe(el));

    const tubeObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fillTube(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    tubes.forEach(el => tubeObserver.observe(el));
  } else {
    // پشتیبان برای مرورگرهای بدون IntersectionObserver
    revealTargets.forEach(el => el.classList.add('is-visible'));
    counters.forEach(animateCount);
    tubes.forEach(fillTube);
  }

  /* ---------- فرم تماس ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = 'لطفاً همه‌ی فیلدها را پر کن.';
        status.style.color = '#ff8a80';
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        status.textContent = 'ایمیل واردشده معتبر به‌نظر نمی‌رسه.';
        status.style.color = '#ff8a80';
        return;
      }

      status.style.color = '';
      status.textContent = `ممنون ${name}! پیامت ثبت شد و به‌زودی جواب می‌دم.`;
      form.reset();
    });
  }
})();
