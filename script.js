/**
 * Portfolio JavaScript - Unified & Optimized
 * Fixes: Duplicate code, performance, accessibility
 */
(function() {
  'use strict';
  
  // ===== Utilities =====
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fine = matchMedia('(pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Throttle function for performance
  function throttle(fn, wait) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }
  
  // ===== Loading Animation =====
  const loader = $('#loader');

  function hideLoader() {
    if (loader) {
      loader.classList.add('loaded');
      document.body.classList.add('loaded');
    }
  }

  // Hide loader when page is fully loaded
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', () => {
      // Minimum display time for loader
      setTimeout(hideLoader, 1800);
    });
  }

  // ===== Year in Footer =====
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // ===== Global Spotlight =====
  const updateSpotlight = throttle((e) => {
    document.documentElement.style.setProperty('--spot-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--spot-y', e.clientY + 'px');

    // Section-specific spotlight
    const sec = document.elementFromPoint(e.clientX, e.clientY)?.closest('.section');
    if (sec) {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--mx', `${e.clientX - r.left}px`);
      sec.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
  }, 16); // ~60fps

  window.addEventListener('pointermove', updateSpotlight, { passive: true });
  
  // ===== JWST Cursor (Desktop Only) =====
  const cursor = $('#jwst-cursor');
  if (cursor && fine && !reduced) {
    const ring = $('.ring', cursor);
    const hexes = $$('.hex', cursor);
    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { x: target.x, y: target.y };
    let rafId;
    
    function animateCursor() {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      
      if (ring) {
        ring.style.left = pos.x + 'px';
        ring.style.top = pos.y + 'px';
      }
      
      hexes.forEach((h, i) => {
        const dx = (i % 2 ? 1 : -1) * (i + 1) * 0.25;
        const dy = (i % 3 ? 1 : -1) * (i + 1) * 0.15;
        h.style.left = (pos.x + dx) + 'px';
        h.style.top = (pos.y + dy) + 'px';
        h.style.transform = `translate(-50%,-50%) rotate(${(pos.x + pos.y) / 250}deg)`;
      });
      
      rafId = requestAnimationFrame(animateCursor);
    }
    
    window.addEventListener('mousemove', (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(animateCursor);
    }, { passive: true });
    
    window.addEventListener('pointerdown', () => {
      if (ring) {
        ring.style.transform = 'translate(-50%,-50%) scale(0.9)';
        setTimeout(() => ring.style.transform = 'translate(-50%,-50%)', 120);
      }
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }
  
  // ===== Magnetic Hover (Desktop Only) =====
  if (fine && !reduced) {
    $$('[data-magnet]').forEach(el => {
      const strength = 12;
      
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
      });
      
      el.addEventListener('pointerleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }
  
  // ===== Tilt Effect on Hero Card =====
  const tiltEl = $('[data-tilt]');
  if (tiltEl && fine && !reduced) {
    tiltEl.addEventListener('mousemove', (e) => {
      const r = tiltEl.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      tiltEl.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    
    tiltEl.addEventListener('mouseleave', () => {
      tiltEl.style.transform = '';
    });
  }
  
  // ===== Scroll Reveal (IntersectionObserver) =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal, .t-item, .drift').forEach(el => revealObserver.observe(el));

  // ===== Animated Statistics Counter =====
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 seconds
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (isDecimal) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.floor(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure final value is exact
        el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // Observe stat values and animate when visible
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('.stat-value[data-count]').forEach(el => statsObserver.observe(el));

  // ===== Skills Progress Bar Animation =====
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.getAttribute('data-width') || 0;
        fill.style.setProperty('--target-width', width + '%');
        fill.classList.add('animated');
        skillsObserver.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  $$('.skill-fill[data-width]').forEach(el => skillsObserver.observe(el));

  // ===== Tabs (Projects) =====
  const tabs = $$('.tabs .tab');
  const panels = $$('.panels .panel-card');
  
  function setActiveTab(index) {
    tabs.forEach((t, i) => {
      const isActive = i === index;
      t.setAttribute('aria-selected', isActive);
      t.tabIndex = isActive ? 0 : -1;
    });
    
    panels.forEach((p, i) => {
      p.classList.toggle('show', i === index);
    });
  }
  
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setActiveTab(i));
    
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveTab((i + 1) % tabs.length);
        tabs[(i + 1) % tabs.length].focus();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveTab((i - 1 + tabs.length) % tabs.length);
        tabs[(i - 1 + tabs.length) % tabs.length].focus();
      }
    });
  });
  
  // ===== Accordion (Auto-Close Others) =====
  const accordions = $$('.acc');
  
  accordions.forEach(btn => {
    const panel = btn.nextElementSibling;
    
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      
      // Close all other accordions
      accordions.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.style.display = 'none';
        }
      });
      
      // Toggle current
      btn.setAttribute('aria-expanded', !isOpen);
      panel.style.display = isOpen ? 'none' : 'block';
    });
  });
  
  // ===== Minimap Active State =====
  const minimapLinks = $$('.minimap a');
  const sections = minimapLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  
  const minimapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = sections.indexOf(entry.target);
      if (idx >= 0) {
        minimapLinks[idx].classList.toggle('active', entry.isIntersecting);
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });
  
  sections.forEach(s => minimapObserver.observe(s));
  
  // ===== Smooth Scroll for Hash Links =====
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    
    e.preventDefault();
    const target = $(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', id);
    }
  });
  
  // ===== Mobile Hamburger Menu =====
  const hamburger = $('.hamburger');
  const navLinks = $('.links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isOpen);
      navLinks.classList.toggle('open', !isOpen);
    });
    
    // Close menu when clicking a link
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      }
    });
    
    // Close menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        hamburger.focus();
      }
    });
  }
  
  // ===== Command Palette =====
  const kbar = $('#kbar');
  const kinput = $('#kinput');
  const klist = $('#klist');
  const kbarOpen = $('#kbar-open');
  
  const actions = [
    { label: 'Go to Projects', href: '#projects' },
    { label: 'Go to About', href: '#about' },
    { label: 'Go to Experience', href: '#experience' },
    { label: 'Go to Leadership', href: '#leadership' },
    { label: 'Go to Research', href: '#research' },
    { label: 'Go to Achievements', href: '#achievements' },
    { label: 'Go to Certifications', href: '#certifications' },
    { label: 'Go to Writing', href: '#writing' },
    { label: 'Go to Contact', href: '#contact' },
    { label: 'Download Résumé (PDF)', run: () => window.open('Divyanshu_Kumar_Resume.pdf', '_blank') },
    { label: 'Email Divyanshu', run: () => location.href = 'mailto:divyanshu@nova-cosmos.com' },
    { label: 'Open LinkedIn', run: () => window.open('https://linkedin.com/in/divyanshukumar27', '_blank') },
    { label: 'View Cosmos Project', run: () => window.open('https://cosmos-e42b5.web.app/', '_blank') },
  ];
  
  let selectedIndex = 0;
  
  function showKbar() {
    kbar.classList.add('open');
    setTimeout(() => kinput.focus(), 50);
    renderKbar('');
    selectedIndex = 0;
    
    // Trap focus
    document.addEventListener('keydown', kbarKeyHandler);
  }
  
  function hideKbar() {
    kbar.classList.remove('open');
    kinput.value = '';
    document.removeEventListener('keydown', kbarKeyHandler);
  }
  
  function fuzzyScore(query, str) {
    query = query.toLowerCase();
    str = str.toLowerCase();
    let i = 0, j = 0, score = 0;
    while (i < query.length && j < str.length) {
      if (query[i] === str[j]) { score += 2; i++; }
      j++;
    }
    return i === query.length ? score - (str.length - query.length) : -1;
  }
  
  function renderKbar(query) {
    const items = actions
      .map(a => ({ action: a, score: query ? fuzzyScore(query, a.label) : 0 }))
      .filter(x => query ? x.score >= 0 : true)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    klist.innerHTML = items.map((x, i) => `
      <div class="kitem${i === selectedIndex ? ' selected' : ''}" data-idx="${actions.indexOf(x.action)}">
        <span>${x.action.label}</span>
        <span>↵</span>
      </div>
    `).join('');
  }
  
  function executeAction(idx) {
    const action = actions[idx];
    hideKbar();
    if (action.run) {
      action.run();
    } else if (action.href) {
      const target = $(action.href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', action.href);
      }
    }
  }
  
  function kbarKeyHandler(e) {
    if (!kbar.classList.contains('open')) return;
    
    const items = $$('.kitem', klist);
    
    if (e.key === 'Escape') {
      e.preventDefault();
      hideKbar();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      renderKbar(kinput.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      renderKbar(kinput.value);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[selectedIndex];
      if (selected) {
        executeAction(+selected.getAttribute('data-idx'));
      }
    }
  }
  
  // Global shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      showKbar();
    }
  });
  
  if (kbarOpen) kbarOpen.addEventListener('click', showKbar);
  
  if (kbar) {
    kbar.addEventListener('click', (e) => {
      if (e.target === kbar) hideKbar();
    });
  }
  
  if (klist) {
    klist.addEventListener('click', (e) => {
      const item = e.target.closest('.kitem');
      if (item) executeAction(+item.getAttribute('data-idx'));
    });
  }
  
  if (kinput) {
    kinput.addEventListener('input', () => {
      selectedIndex = 0;
      renderKbar(kinput.value);
    });
  }
  
  // ===== Theme Toggle =====
  const themeBtn = $('#theme-toggle');
  const themes = ['dark', 'noir', 'blue-haze', 'light'];
  const themeLabels = {
    'dark': 'Dark',
    'noir': 'Noir',
    'blue-haze': 'Blue Haze',
    'light': 'Light'
  };

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
    updateThemeButton();
  }

  function updateThemeButton() {
    if (!themeBtn) return;
    const theme = getCurrentTheme();
    themeBtn.textContent = themeLabels[theme] || 'Dark';
  }
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = getCurrentTheme();
      const nextIndex = (themes.indexOf(current) + 1) % themes.length;
      setTheme(themes[nextIndex]);
    });
  }
  
  // ===== Progress Bar =====
  const progressBar = $('.progress');
  let progressTicking = false;
  
  if (progressBar) {
    window.addEventListener('scroll', () => {
      if (progressTicking) return;
      progressTicking = true;
      
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        progressBar.style.width = max > 0 ? (h.scrollTop / max * 100) + '%' : '0%';
        progressTicking = false;
      });
    }, { passive: true });
  }
  
  // ===== Copy to Clipboard =====
  $$('[data-copy]').forEach(btn => {
    const originalText = btn.textContent;
    
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 1200);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  });
  
  // ===== Performance Monitor =====
  let perfDrops = 0;
  let lastPerfTime = performance.now();
  
  function monitorPerformance() {
    const now = performance.now();
    const delta = now - lastPerfTime;
    lastPerfTime = now;
    
    if (delta > 50) {
      perfDrops++;
    } else {
      perfDrops = Math.max(0, perfDrops - 1);
    }
    
    // If too many frame drops, reduce effects
    if (perfDrops > 100) {
      document.body.classList.add('reduced');
      return; // Stop monitoring
    }
    
    requestAnimationFrame(monitorPerformance);
  }
  
  if (!reduced) {
    requestAnimationFrame(monitorPerformance);
  } else {
    document.body.classList.add('reduced');
  }
  
})();
