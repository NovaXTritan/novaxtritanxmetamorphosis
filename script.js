/**
 * Portfolio JavaScript - Cosmos Design System
 * Clean, minimal functionality: command palette, scroll reveal, navigation
 */
(function() {
  'use strict';

  // ===== Utilities =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ===== Footer Year =====
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Mobile Navigation =====
  const hamburger = $('.hamburger');
  const navLinks = $('.nav-links');

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

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        hamburger.focus();
      }
    });
  }

  // ===== Smooth Scroll for Anchor Links =====
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = $(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    }
  });

  // ===== Scroll Progress Bar =====
  const progressBar = $('#progress-bar');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // ===== Scroll Reveal (IntersectionObserver) =====
  const fadeElements = $$('.fade-in');
  const staggerElements = $$('.stagger-children');

  if (fadeElements.length || staggerElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => revealObserver.observe(el));
    staggerElements.forEach(el => revealObserver.observe(el));
  }

  // ===== Skills Progress Bars =====
  const skillFills = $$('.skill-fill[data-width]');

  if (skillFills.length) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.getAttribute('data-width') || 0;
          fill.style.width = width + '%';
          skillsObserver.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });

    skillFills.forEach(el => skillsObserver.observe(el));
  }

  // ===== Accordion =====
  const accordionBtns = $$('.accordion-btn');

  accordionBtns.forEach(btn => {
    const panel = btn.nextElementSibling;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all other accordions
      accordionBtns.forEach(otherBtn => {
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

  // ===== Copy to Clipboard =====
  $$('[data-copy]').forEach(btn => {
    const originalText = btn.textContent;

    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 1500);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => btn.textContent = originalText, 1500);
      }
    });
  });

  // ===== Command Palette =====
  const cmdPalette = $('#command-palette');
  const cmdInput = $('#command-input');
  const cmdList = $('#command-list');
  const cmdBtn = $('#cmd-btn');

  const commands = [
    { label: 'Go to About', href: '#about' },
    { label: 'Go to Projects', href: '#projects' },
    { label: 'Go to Experience', href: '#experience' },
    { label: 'Go to Leadership', href: '#leadership' },
    { label: 'Go to Research', href: '#research' },
    { label: 'Go to Skills', href: '#skills' },
    { label: 'Go to Contact', href: '#contact' },
    { label: 'Download Resume', run: () => window.open('Divyanshu_Kumar_Resume.pdf', '_blank') },
    { label: 'Email Divyanshu', run: () => location.href = 'mailto:divyanshu@nova-cosmos.com' },
    { label: 'Open LinkedIn', run: () => window.open('https://linkedin.com/in/divyanshukumar27', '_blank') },
    { label: 'Open GitHub', run: () => window.open('https://github.com/NovaXTritan', '_blank') },
    { label: 'View Cosmos', run: () => window.open('https://cosmos-e42b5.web.app/', '_blank') },
  ];

  let selectedIdx = 0;

  function openPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add('open');
    cmdInput.value = '';
    selectedIdx = 0;
    renderCommands('');
    setTimeout(() => cmdInput.focus(), 50);
  }

  function closePalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('open');
  }

  function fuzzyMatch(query, str) {
    query = query.toLowerCase();
    str = str.toLowerCase();
    let qi = 0;
    for (let si = 0; si < str.length && qi < query.length; si++) {
      if (query[qi] === str[si]) qi++;
    }
    return qi === query.length;
  }

  function renderCommands(query) {
    const filtered = commands.filter(cmd => !query || fuzzyMatch(query, cmd.label));

    cmdList.innerHTML = filtered.map((cmd, i) => `
      <div class="command-item${i === selectedIdx ? ' selected' : ''}" data-idx="${commands.indexOf(cmd)}">
        <span>${cmd.label}</span>
        <span>Enter</span>
      </div>
    `).join('');
  }

  function executeCommand(idx) {
    const cmd = commands[idx];
    closePalette();

    if (cmd.run) {
      cmd.run();
    } else if (cmd.href) {
      const target = $(cmd.href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', cmd.href);
      }
    }
  }

  // Command palette events
  if (cmdPalette && cmdInput && cmdList) {
    // Open with button
    if (cmdBtn) cmdBtn.addEventListener('click', openPalette);

    // Global shortcut Cmd/Ctrl + K
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      }
    });

    // Close on backdrop click
    cmdPalette.addEventListener('click', (e) => {
      if (e.target === cmdPalette) closePalette();
    });

    // Input handling
    cmdInput.addEventListener('input', () => {
      selectedIdx = 0;
      renderCommands(cmdInput.value);
    });

    // Keyboard navigation
    cmdInput.addEventListener('keydown', (e) => {
      const items = $$('.command-item', cmdList);

      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % items.length;
        renderCommands(cmdInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + items.length) % items.length;
        renderCommands(cmdInput.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = items[selectedIdx];
        if (selected) executeCommand(+selected.getAttribute('data-idx'));
      }
    });

    // Click on item
    cmdList.addEventListener('click', (e) => {
      const item = e.target.closest('.command-item');
      if (item) executeCommand(+item.getAttribute('data-idx'));
    });
  }

})();
