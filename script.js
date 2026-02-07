/**
 * Portfolio JavaScript - Operations Dashboard
 * Cosmos Design System Implementation
 */
(function() {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    github: { username: 'NovaXTritan' },
    email: 'divyanshu@nova-cosmos.com',
    social: {
      linkedin: 'https://linkedin.com/in/divyanshukumar27',
      github: 'https://github.com/NovaXTritan',
      cosmos: 'https://cosmos-e42b5.web.app/'
    },
    fetchTimeout: 8000,
    activityRefreshInterval: 300000,
    greetingRefreshInterval: 60000
  };

  // ===== Utilities =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function fetchWithTimeout(url, options = {}, timeout = CONFIG.fetchTimeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(id));
  }

  function throttleRAF(fn) {
    let ticking = false;
    return function(...args) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn.apply(this, args);
        ticking = false;
      });
    };
  }

  // ===== Footer Year =====
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Cursor Spotlight =====
  const spotlight = $('#spotlight');
  if (spotlight && !('ontouchstart' in window)) {
    document.addEventListener('mousemove', throttleRAF((e) => {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top = e.clientY + 'px';
    }));
  } else if (spotlight) {
    spotlight.style.display = 'none';
  }

  // ===== Scroll Progress Bar =====
  const progressBar = $('#scrollProgress');
  const navbar = $('#navbar');

  if (progressBar || navbar) {
    window.addEventListener('scroll', throttleRAF(() => {
      const scrollTop = window.scrollY;
      if (progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
      }
      if (navbar) {
        navbar.classList.toggle('scrolled', scrollTop > 50);
      }
    }), { passive: true });
  }

  // ===== Mobile Navigation =====
  const mobileToggle = $('#mobileToggle');
  const mobileMenu = $('#mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isOpen);
      mobileMenu.classList.toggle('open', !isOpen);
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
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

  // ===== Scroll Reveal (IntersectionObserver) =====
  const revealElements = $$('.scroll-reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ===== 3D Card Tilt Effect =====
  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', throttleRAF((e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `
        perspective(1000px)
        rotateY(${x * 8}deg)
        rotateX(${-y * 8}deg)
        scale(1.02)
      `;
    }));

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    });
  });

  // ===== Magnetic Buttons =====
  $$('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', throttleRAF((e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    }));

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ===== Time-Aware Greeting =====
  let greetingTimer = null;

  function setTimeGreeting() {
    const hour = new Date().getHours();
    const greetingEl = $('#timeGreeting');
    const timeEl = $('#currentTime');

    let greeting;
    if (hour < 6) greeting = "You're up late";
    else if (hour < 12) greeting = "Good morning";
    else if (hour < 17) greeting = "Good afternoon";
    else if (hour < 21) greeting = "Good evening";
    else greeting = "Working late?";

    if (greetingEl) greetingEl.textContent = greeting;
    if (timeEl) {
      timeEl.textContent = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    }
  }

  setTimeGreeting();
  greetingTimer = setInterval(setTimeGreeting, CONFIG.greetingRefreshInterval);

  // Clean up on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(greetingTimer);
      clearInterval(activityTimer);
    } else {
      setTimeGreeting();
      greetingTimer = setInterval(setTimeGreeting, CONFIG.greetingRefreshInterval);
      activityTimer = setInterval(fetchGitHubActivity, CONFIG.activityRefreshInterval);
    }
  });

  // ===== Returning Visitor Detection =====
  function handleReturningVisitor() {
    try {
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
      localStorage.setItem('visitCount', (visitCount + 1).toString());
      localStorage.setItem('lastVisit', new Date().toISOString());

      if (visitCount > 2) {
        const greetingEl = $('#timeGreeting');
        if (greetingEl) greetingEl.textContent = "Welcome back";
      }
    } catch (_) {
      // localStorage unavailable (private browsing, quota exceeded)
    }
  }

  handleReturningVisitor();

  // ===== GitHub Activity Feed =====
  async function fetchGitHubActivity() {
    const feedContainer = $('#githubFeed');
    if (!feedContainer) return;

    try {
      const response = await fetchWithTimeout(
        `https://api.github.com/users/${CONFIG.github.username}/events/public?per_page=10`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const events = await response.json();

      if (!Array.isArray(events) || events.length === 0) {
        feedContainer.innerHTML = `
          <div class="activity-error">
            No recent activity. <a href="${CONFIG.social.github}" target="_blank" rel="noopener">View on GitHub</a>
          </div>
        `;
        return;
      }

      const activityHTML = events.slice(0, 6).map(event => {
        const time = new Date(event.created_at);
        const timeAgo = getTimeAgo(time);
        const icon = getEventIcon(event.type);
        const description = getEventDescription(event);

        return `
          <div class="activity-item">
            <span class="activity-icon">${icon}</span>
            <div class="activity-content">
              <span class="activity-text">${description}</span>
              <span class="activity-time">${escapeHTML(timeAgo)}</span>
            </div>
          </div>
        `;
      }).join('');

      feedContainer.innerHTML = activityHTML;

    } catch (_) {
      feedContainer.innerHTML = `
        <div class="activity-error">
          Unable to fetch activity. <a href="${CONFIG.social.github}" target="_blank" rel="noopener">View on GitHub</a>
        </div>
      `;
    }
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  }

  function getEventIcon(type) {
    const icons = {
      PushEvent: '\u2B06',
      CreateEvent: '\u2728',
      PullRequestEvent: '\uD83D\uDD00',
      IssuesEvent: '\uD83C\uDFAF',
      WatchEvent: '\u2B50',
      ForkEvent: '\uD83C\uDF74',
      default: '\uD83D\uDCCC'
    };
    return icons[type] || icons.default;
  }

  function getEventDescription(event) {
    const repoName = event.repo && event.repo.name ? event.repo.name.split('/')[1] : 'unknown';
    const repo = escapeHTML(repoName);
    switch (event.type) {
      case 'PushEvent': {
        const commits = (event.payload && event.payload.commits) ? event.payload.commits.length : 0;
        return `Pushed ${commits} commit${commits > 1 ? 's' : ''} to <strong>${repo}</strong>`;
      }
      case 'CreateEvent':
        return `Created ${escapeHTML(event.payload?.ref_type || 'resource')} in <strong>${repo}</strong>`;
      case 'PullRequestEvent':
        return `${escapeHTML(event.payload?.action || 'updated')} PR in <strong>${repo}</strong>`;
      case 'IssuesEvent':
        return `${escapeHTML(event.payload?.action || 'updated')} issue in <strong>${repo}</strong>`;
      case 'WatchEvent':
        return `Starred <strong>${repo}</strong>`;
      case 'ForkEvent':
        return `Forked <strong>${repo}</strong>`;
      default:
        return `Activity in <strong>${repo}</strong>`;
    }
  }

  fetchGitHubActivity();
  let activityTimer = setInterval(fetchGitHubActivity, CONFIG.activityRefreshInterval);

  // ===== Modal Utilities (shared) =====
  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }

  // ===== Command Palette =====
  const cmdPalette = $('#command-palette');
  const cmdInput = $('#command-input');
  const cmdList = $('#command-list');
  const cmdBtn = $('#cmd-btn');

  const commands = [
    { label: 'Go to Operations', href: '#operations' },
    { label: 'Go to Evidence', href: '#evidence' },
    { label: 'Go to About', href: '#transparency' },
    { label: 'Go to Activity', href: '#activity' },
    { label: 'Go to Contact', href: '#contact' },
    { label: 'Download Resume', run: () => window.open('Divyanshu_Kumar_Resume.pdf', '_blank') },
    { label: 'Email Divyanshu', run: () => { location.href = 'mailto:' + CONFIG.email; } },
    { label: 'Open LinkedIn', run: () => window.open(CONFIG.social.linkedin, '_blank') },
    { label: 'Open GitHub', run: () => window.open(CONFIG.social.github, '_blank') },
    { label: 'View Cosmos', run: () => window.open(CONFIG.social.cosmos, '_blank') },
  ];

  let selectedIdx = 0;
  let removePaletteTrap = null;

  function openPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add('open');
    cmdInput.value = '';
    selectedIdx = 0;
    renderCommands('');
    setTimeout(() => {
      cmdInput.focus();
      removePaletteTrap = trapFocus(cmdPalette);
    }, 50);
  }

  function closePalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('open');
    if (removePaletteTrap) {
      removePaletteTrap();
      removePaletteTrap = null;
    }
    if (cmdBtn) cmdBtn.focus();
  }

  function fuzzyMatch(query, str) {
    const q = query.toLowerCase();
    const s = str.toLowerCase();
    let queryIdx = 0;
    for (let strIdx = 0; strIdx < s.length && queryIdx < q.length; strIdx++) {
      if (q[queryIdx] === s[strIdx]) queryIdx++;
    }
    return queryIdx === q.length;
  }

  function renderCommands(query) {
    const filtered = commands.filter(cmd => !query || fuzzyMatch(query, cmd.label));

    cmdList.innerHTML = filtered.map((cmd, i) => `
      <div class="command-item${i === selectedIdx ? ' selected' : ''}" data-idx="${commands.indexOf(cmd)}" role="option" aria-selected="${i === selectedIdx}">
        <span>${escapeHTML(cmd.label)}</span>
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

  if (cmdPalette && cmdInput && cmdList) {
    if (cmdBtn) cmdBtn.addEventListener('click', openPalette);

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      }
    });

    cmdPalette.addEventListener('click', (e) => {
      if (e.target === cmdPalette) closePalette();
    });

    cmdInput.addEventListener('input', () => {
      selectedIdx = 0;
      renderCommands(cmdInput.value);
    });

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

    cmdList.addEventListener('click', (e) => {
      const item = e.target.closest('.command-item');
      if (item) executeCommand(+item.getAttribute('data-idx'));
    });
  }

  // ===== Project Detail Modal =====
  const projectModal = $('#projectModal');
  const modalBackdrop = $('#modalBackdrop');
  const modalClose = $('#modalClose');
  const modalContent = $('#modalContent');
  const modalTitle = $('#modalTitle');
  const modalIcon = $('#modalIcon');
  const modalStatus = $('#modalStatus');

  const projectMeta = {
    cosmos: { icon: '\uD83C\uDF0C', title: 'COSMOS', status: 'Live', statusClass: 'badge-green badge-status' },
    finsight: { icon: '\uD83D\uDCCA', title: 'FINSIGHT', status: 'Building', statusClass: 'badge-purple badge-status' },
    bubble: { icon: '\uD83D\uDCC8', title: 'AI Bubble Detection', status: 'Complete', statusClass: 'badge-green' },
    research: { icon: '\uD83D\uDD2C', title: 'SCF Research', status: 'In Progress', statusClass: 'badge-orange badge-status' },
    internship: { icon: '\uD83D\uDCBC', title: 'S.K. Chadha Internship', status: 'Completed', statusClass: 'badge-green' },
    msme: { icon: '\uD83C\uDFE6', title: 'MSME Lending', status: 'Active', statusClass: 'badge-green badge-status' },
    leadership: { icon: '\uD83D\uDC65', title: 'Leadership Roles', status: 'Active', statusClass: 'badge-outline' },
    iitk: { icon: '\uD83C\uDF93', title: 'IIT Kanpur Internship', status: 'Completed', statusClass: 'badge-green' },
    achievements: { icon: '\uD83C\uDFC6', title: 'Achievements', status: '', statusClass: '' },
    srcc: { icon: '\uD83C\uDFC6', title: 'SRCC Quiz', status: 'Achievement', statusClass: 'badge-purple' }
  };

  let removeModalTrap = null;
  let modalTriggerEl = null;

  function openProjectModal(projectId, scrollToSection = null) {
    if (!projectModal) return;

    const template = $(`#template-${projectId}`);
    if (!template) return;

    const meta = projectMeta[projectId] || { icon: '\uD83D\uDCC1', title: projectId, status: '', statusClass: '' };

    if (modalTitle) modalTitle.textContent = meta.title;
    if (modalIcon) modalIcon.textContent = meta.icon;
    if (modalStatus) {
      modalStatus.textContent = meta.status;
      modalStatus.className = 'modal-status badge ' + meta.statusClass;
      modalStatus.style.display = meta.status ? 'inline-flex' : 'none';
    }

    const content = template.content.cloneNode(true);
    modalContent.innerHTML = '';
    modalContent.appendChild(content);

    modalTriggerEl = document.activeElement;
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (scrollToSection) {
      setTimeout(() => {
        const section = $(`#${scrollToSection}`, modalContent);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    setTimeout(() => {
      if (modalClose) modalClose.focus();
      removeModalTrap = trapFocus(projectModal);
    }, 50);
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (removeModalTrap) {
      removeModalTrap();
      removeModalTrap = null;
    }
    if (modalTriggerEl) {
      modalTriggerEl.focus();
      modalTriggerEl = null;
    }
  }

  if (projectModal) {
    if (modalClose) {
      modalClose.addEventListener('click', closeProjectModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeProjectModal);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal.getAttribute('aria-hidden') === 'false') {
        closeProjectModal();
      }
    });
  }

  $$('.project-trigger').forEach(btn => {
    const projectId = btn.getAttribute('data-project');
    if (projectId && $(`#template-${projectId}`)) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openProjectModal(projectId);
      });
    }
  });

  $$('.evidence-card').forEach(card => {
    const cardId = card.id;
    const projectId = cardId.replace('evidence-', '');

    const templateMap = {
      'cosmos': 'cosmos',
      'research': 'research',
      'srcc': 'achievements',
      'finsight': 'finsight',
      'bubble': 'bubble'
    };

    const templateId = templateMap[projectId];

    if (templateId) {
      $$('.evidence-level button', card).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const level = e.target.closest('.evidence-level').getAttribute('data-level');

          const sectionMap = {
            '1': `${projectId}-metrics`,
            '2': `${projectId}-evidence`,
            '3': `${projectId}-evidence`
          };

          openProjectModal(templateId, sectionMap[level]);
        });
      });
    }
  });

  commands.push(
    { label: 'View COSMOS Details', run: () => openProjectModal('cosmos') },
    { label: 'View FinSight Details', run: () => openProjectModal('finsight') },
    { label: 'View AI Bubble Detection', run: () => openProjectModal('bubble') },
    { label: 'View SCF Research', run: () => openProjectModal('research') },
    { label: 'View MSME Operations', run: () => openProjectModal('msme') },
    { label: 'View S.K. Chadha Internship', run: () => openProjectModal('internship') },
    { label: 'View Leadership Roles', run: () => openProjectModal('leadership') },
    { label: 'View IIT Kanpur Internship', run: () => openProjectModal('iitk') }
  );

  // ===== Live Data Updates =====
  function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  async function loadLiveStatus() {
    try {
      const response = await fetchWithTimeout('data/live-status.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      updateElement('msmeDealFlow', data.operations.msme.lifetime);
      updateElement('msmeThisMonth', data.operations.msme.thisMonth);
      updateElement('msmeMoM', data.operations.msme.momGrowth);

      updateElement('finsightVersion', data.operations.finsight.version);
      updateElement('anomaliesDetected', data.operations.finsight.anomaliesDetected);

      updateElement('cosmosUsers', data.operations.cosmos.users);
      updateElement('cosmosProofs', data.operations.cosmos.proofsThisWeek);

      updateElement('researchProgress', data.operations.research.completion + '%');

      updateElement('currentFocus', data.currentFocus);

      const lastUpdated = new Date(data.lastUpdated);
      updateElement('syncTime', getTimeAgo(lastUpdated));
      updateElement('lastUpdated', getTimeAgo(lastUpdated));

      updateElement('focusDate', lastUpdated.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));

    } catch (_) {
      updateLastUpdated();
    }
  }

  function updateLastUpdated() {
    const lastUpdatedEl = $('#lastUpdated');
    const syncTimeEl = $('#syncTime');

    if (lastUpdatedEl) lastUpdatedEl.textContent = getTimeAgo(new Date(Date.now() - 2 * 60 * 60 * 1000));
    if (syncTimeEl) syncTimeEl.textContent = getTimeAgo(new Date(Date.now() - 2 * 60 * 1000));
  }

  loadLiveStatus();

  // ===== Text Reveal Animation =====
  $$('.text-reveal').forEach(el => {
    const text = el.textContent;
    const words = text.split(' ');
    el.innerHTML = words.map((word, i) =>
      `<span style="animation-delay: ${i * 0.1}s">${escapeHTML(word)}</span>`
    ).join(' ');
  });

  // ===== Active Nav Link Highlighting =====
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' });

    sections.forEach(section => navObserver.observe(section));
  }

})();
