/**
 * Portfolio JavaScript - Operations Dashboard
 * Cosmos Design System Implementation
 */
(function() {
  'use strict';

  // ===== Utilities =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ===== Footer Year =====
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Cursor Spotlight =====
  const spotlight = $('#spotlight');
  if (spotlight && !('ontouchstart' in window)) {
    document.addEventListener('mousemove', (e) => {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top = e.clientY + 'px';
    });
  } else if (spotlight) {
    spotlight.style.display = 'none';
  }

  // ===== Scroll Progress Bar =====
  const progressBar = $('#scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // ===== Navigation Scroll Effect =====
  const navbar = $('#navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
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

    // Close menu when clicking a link
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
      }
    });

    // Close on escape
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
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `
        perspective(1000px)
        rotateY(${x * 8}deg)
        rotateX(${-y * 8}deg)
        scale(1.02)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    });
  });

  // ===== Magnetic Buttons =====
  $$('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ===== Time-Aware Greeting =====
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
  setInterval(setTimeGreeting, 60000);

  // ===== Returning Visitor Detection =====
  function handleReturningVisitor() {
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    localStorage.setItem('visitCount', (visitCount + 1).toString());
    localStorage.setItem('lastVisit', new Date().toISOString());

    if (visitCount > 2) {
      const greetingEl = $('#timeGreeting');
      if (greetingEl) greetingEl.textContent = "Welcome back";
    }
  }

  handleReturningVisitor();

  // ===== GitHub Activity Feed =====
  async function fetchGitHubActivity() {
    const username = 'NovaXTritan';
    const feedContainer = $('#githubFeed');

    if (!feedContainer) return;

    try {
      const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=10`);
      const events = await response.json();

      if (!Array.isArray(events) || events.length === 0) {
        feedContainer.innerHTML = `
          <div class="activity-error">
            No recent activity. <a href="https://github.com/${username}" target="_blank">View on GitHub</a>
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
              <span class="activity-time">${timeAgo}</span>
            </div>
          </div>
        `;
      }).join('');

      feedContainer.innerHTML = activityHTML;

    } catch (error) {
      feedContainer.innerHTML = `
        <div class="activity-error">
          Unable to fetch activity. <a href="https://github.com/${username}" target="_blank">View on GitHub</a>
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
      PushEvent: '⬆',
      CreateEvent: '✨',
      PullRequestEvent: '🔀',
      IssuesEvent: '🎯',
      WatchEvent: '⭐',
      ForkEvent: '🍴',
      default: '📌'
    };
    return icons[type] || icons.default;
  }

  function getEventDescription(event) {
    const repo = event.repo.name.split('/')[1];
    switch (event.type) {
      case 'PushEvent':
        const commits = event.payload.commits?.length || 0;
        return `Pushed ${commits} commit${commits > 1 ? 's' : ''} to <strong>${repo}</strong>`;
      case 'CreateEvent':
        return `Created ${event.payload.ref_type} in <strong>${repo}</strong>`;
      case 'PullRequestEvent':
        return `${event.payload.action} PR in <strong>${repo}</strong>`;
      case 'IssuesEvent':
        return `${event.payload.action} issue in <strong>${repo}</strong>`;
      case 'WatchEvent':
        return `Starred <strong>${repo}</strong>`;
      case 'ForkEvent':
        return `Forked <strong>${repo}</strong>`;
      default:
        return `Activity in <strong>${repo}</strong>`;
    }
  }

  fetchGitHubActivity();
  setInterval(fetchGitHubActivity, 300000); // Refresh every 5 minutes

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
    { label: 'Email Divyanshu', run: () => location.href = 'mailto:divyanshukumar27@gmail.com' },
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

  // ===== Project Detail Modal =====
  const projectModal = $('#projectModal');
  const modalBackdrop = $('#modalBackdrop');
  const modalClose = $('#modalClose');
  const modalContent = $('#modalContent');
  const modalTitle = $('#modalTitle');
  const modalIcon = $('#modalIcon');
  const modalStatus = $('#modalStatus');

  // Project metadata mapping
  const projectMeta = {
    cosmos: { icon: '🌌', title: 'COSMOS', status: 'Live', statusClass: 'badge-green badge-status' },
    finsight: { icon: '📊', title: 'FINSIGHT', status: 'Building', statusClass: 'badge-purple badge-status' },
    bubble: { icon: '📈', title: 'AI Bubble Detection', status: 'Complete', statusClass: 'badge-green' },
    research: { icon: '🔬', title: 'SCF Research', status: 'In Progress', statusClass: 'badge-orange badge-status' },
    internship: { icon: '💼', title: 'S.K. Chadha Internship', status: 'Completed', statusClass: 'badge-green' },
    msme: { icon: '🏦', title: 'MSME Lending', status: 'Active', statusClass: 'badge-green badge-status' },
    leadership: { icon: '👥', title: 'Leadership Roles', status: 'Active', statusClass: 'badge-outline' },
    iitk: { icon: '🎓', title: 'IIT Kanpur Internship', status: 'Completed', statusClass: 'badge-green' },
    achievements: { icon: '🏆', title: 'Achievements', status: '', statusClass: '' },
    srcc: { icon: '🏆', title: 'SRCC Quiz', status: 'Achievement', statusClass: 'badge-purple' }
  };

  function openProjectModal(projectId, scrollToSection = null) {
    if (!projectModal) return;

    const template = $(`#template-${projectId}`);
    if (!template) {
      console.warn(`Project template not found: template-${projectId}`);
      return;
    }

    // Get metadata
    const meta = projectMeta[projectId] || { icon: '📁', title: projectId, status: '', statusClass: '' };

    // Set modal header
    if (modalTitle) modalTitle.textContent = meta.title;
    if (modalIcon) modalIcon.textContent = meta.icon;
    if (modalStatus) {
      modalStatus.textContent = meta.status;
      modalStatus.className = 'modal-status badge ' + meta.statusClass;
      modalStatus.style.display = meta.status ? 'inline-flex' : 'none';
    }

    // Clone template content into modal
    const content = template.content.cloneNode(true);
    modalContent.innerHTML = '';
    modalContent.appendChild(content);

    // Open modal
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Scroll to specific section if requested
    if (scrollToSection) {
      setTimeout(() => {
        const section = $(`#${scrollToSection}`, modalContent);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    // Focus management
    setTimeout(() => modalClose && modalClose.focus(), 50);
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Modal Event Listeners
  if (projectModal) {
    // Close button
    if (modalClose) {
      modalClose.addEventListener('click', closeProjectModal);
    }

    // Backdrop click
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeProjectModal);
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal.getAttribute('aria-hidden') === 'false') {
        closeProjectModal();
      }
    });
  }

  // Wire up project-trigger buttons
  $$('.project-trigger').forEach(btn => {
    const projectId = btn.getAttribute('data-project');
    if (projectId && $(`#template-${projectId}`)) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openProjectModal(projectId);
      });
    }
  });

  // Wire up evidence section buttons
  $$('.evidence-card').forEach(card => {
    const cardId = card.id;
    const projectId = cardId.replace('evidence-', '');

    // Map evidence IDs to template IDs
    const templateMap = {
      'cosmos': 'cosmos',
      'research': 'research',
      'srcc': 'achievements',
      'finsight': 'finsight',
      'bubble': 'bubble'
    };

    const templateId = templateMap[projectId];

    if (templateId) {
      // Wire up evidence level buttons
      $$('.evidence-level button', card).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const level = e.target.closest('.evidence-level').getAttribute('data-level');

          // Map levels to sections
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

  // Add project commands to command palette
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

  // Load live status data from JSON
  async function loadLiveStatus() {
    try {
      const response = await fetch('data/live-status.json');
      const data = await response.json();

      // Update operations dashboard
      updateElement('msmeDealFlow', data.operations.msme.lifetime);
      updateElement('msmeThisMonth', data.operations.msme.thisMonth);
      updateElement('msmeMoM', data.operations.msme.momGrowth);

      updateElement('finsightVersion', data.operations.finsight.version);
      updateElement('anomaliesDetected', data.operations.finsight.anomaliesDetected);

      updateElement('cosmosUsers', data.operations.cosmos.users);
      updateElement('cosmosProofs', data.operations.cosmos.proofsThisWeek);

      updateElement('researchProgress', data.operations.research.completion + '%');

      updateElement('currentFocus', data.currentFocus);

      // Update last sync time
      const lastUpdated = new Date(data.lastUpdated);
      updateElement('syncTime', getTimeAgo(lastUpdated));
      updateElement('lastUpdated', getTimeAgo(lastUpdated));

      // Update focus date
      updateElement('focusDate', lastUpdated.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));

    } catch (error) {
      console.log('Live status data not available, using defaults');
      updateLastUpdated();
    }
  }

  // Fallback update last updated time
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
      `<span style="animation-delay: ${i * 0.1}s">${word}</span>`
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
