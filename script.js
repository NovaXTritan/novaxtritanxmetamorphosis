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

  // ===== Multi-Scene Cinematic Welcome: Nova's Journey =====
  const CinematicWelcome = {
    // Total duration ~6 seconds for quick but impactful experience
    totalDuration: 6000,
    skipDelay: 0, // Show skip button immediately for recruiters

    // Scene timing (ms) - compressed for faster experience
    scenes: {
      1: { start: 0, duration: 1200 },      // Cosmos text
      2: { start: 1200, duration: 1200 },   // Nova birth
      3: { start: 2400, duration: 1200 },   // Stats reveal
      4: { start: 3600, duration: 1400 },   // Identity
      5: { start: 5000, duration: 1000 }    // Invitation
    },

    currentScene: 0,
    isPlaying: false,
    canSkip: false,
    hasExited: false,
    animationFrame: null,
    timerInterval: null,
    startTime: 0,

    init() {
      const overlay = $('#cinema-welcome');
      if (!overlay) return;

      // Check returning visitor (within 4 hours)
      if (this.hasVisitedRecently()) {
        this.skipImmediately();
        return;
      }

      // Check reduced motion preference
      if (reduced) {
        this.skipImmediately();
        return;
      }

      this.start();
    },

    hasVisitedRecently() {
      const lastVisit = localStorage.getItem('nova-cinema-visit');
      if (!lastVisit) return false;
      const hoursSince = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60);
      return hoursSince < 4;
    },

    skipImmediately() {
      const overlay = $('#cinema-welcome');
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.remove();
      }
      document.body.classList.add('cinema-complete');
      window.cinematicComplete = true;
      this.showReplayButton();
    },

    start() {
      this.isPlaying = true;
      this.startTime = performance.now();
      localStorage.setItem('nova-cinema-visit', Date.now().toString());

      // Initialize canvas animation
      this.initCanvas();
      this.startAnimation();

      // Setup controls
      this.setupSkipControls();
      this.setupSoundToggle();
      this.setupProgressDots();

      // Start ambient audio if not muted
      if (!AudioManager.muted) {
        AudioManager.startAmbient();
      }

      // Enable skip after delay
      setTimeout(() => {
        this.canSkip = true;
        const skipBtn = $('#cinema-skip');
        if (skipBtn) skipBtn.classList.add('visible');
      }, this.skipDelay);

      // Start timer display
      this.updateTimer();

      // Start scene controller
      this.runTimeline();
    },

    initCanvas() {
      const canvas = $('#cinema-canvas');
      if (!canvas) return;

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      const resize = () => {
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * this.dpr;
        canvas.height = window.innerHeight * this.dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
      };

      resize();
      this.resizeHandler = resize;
      window.addEventListener('resize', resize);
    },

    startAnimation() {
      let accretionAngle = 0;
      let bhSize = 0;
      let bhTargetSize = 100;

      const animate = (now) => {
        if (!this.isPlaying) return;

        const elapsed = now - this.startTime;
        const ctx = this.ctx;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2;
        const cy = h / 2;

        // Black hole grows over time
        const growProgress = Math.min(1, elapsed / 6000);
        bhSize = bhTargetSize * this.easeOutCubic(growProgress);

        // Clear with deep space gradient
        const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
        bgGrad.addColorStop(0, '#0a1628');
        bgGrad.addColorStop(0.5, '#050d18');
        bgGrad.addColorStop(1, '#020508');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw twinkling stars
        this.drawStars(ctx, w, h, elapsed);

        // Draw black hole
        accretionAngle += 0.003;
        this.drawBlackHole(ctx, cx, cy, bhSize, accretionAngle, growProgress);

        // Draw nebula clouds
        this.drawNebula(ctx, w, h, elapsed);

        this.animationFrame = requestAnimationFrame(animate);
      };

      this.animationFrame = requestAnimationFrame(animate);
    },

    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    },

    drawStars(ctx, w, h, time) {
      const seed = 54321;
      const rand = (i) => {
        const x = Math.sin(seed + i * 9999) * 10000;
        return x - Math.floor(x);
      };

      // More stars for cinematic feel
      for (let i = 0; i < 200; i++) {
        const x = rand(i) * w;
        const y = rand(i + 1000) * h;
        const size = rand(i + 2000) * 2 + 0.5;
        const twinkle = 0.4 + 0.6 * Math.sin(time / 400 + i * 0.5);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + twinkle * 0.5})`;
        ctx.fill();
      }
    },

    drawBlackHole(ctx, cx, cy, size, angle, intensity) {
      if (size < 5) return;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, size, cx, cy, size * 4);
      outerGlow.addColorStop(0, `rgba(100, 255, 218, ${0.15 * intensity})`);
      outerGlow.addColorStop(0.3, `rgba(100, 200, 255, ${0.08 * intensity})`);
      outerGlow.addColorStop(0.6, `rgba(150, 100, 255, ${0.04 * intensity})`);
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, ctx.canvas.width / this.dpr, ctx.canvas.height / this.dpr);

      // Accretion disk
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      for (let i = 0; i < 5; i++) {
        const r = size * (1.4 + i * 0.3);
        ctx.save();
        ctx.scale(1, 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const alpha = (0.25 - i * 0.04) * intensity;
        ctx.strokeStyle = `rgba(255, ${180 - i * 20}, ${120 - i * 15}, ${alpha})`;
        ctx.lineWidth = 8 - i * 1.2;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // Event horizon (pure black center)
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();

      // Photon ring (bright inner edge)
      ctx.beginPath();
      ctx.arc(cx, cy, size * 1.05, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 255, 218, ${0.5 * intensity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      const innerGlow = ctx.createRadialGradient(cx, cy, size * 0.7, cx, cy, size * 1.3);
      innerGlow.addColorStop(0, 'transparent');
      innerGlow.addColorStop(0.6, `rgba(100, 255, 218, ${0.2 * intensity})`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 1.3, 0, Math.PI * 2);
      ctx.fill();
    },

    drawNebula(ctx, w, h, time) {
      // Subtle colored nebula clouds
      const clouds = [
        { x: w * 0.2, y: h * 0.3, r: 200, color: '100, 150, 255' },
        { x: w * 0.8, y: h * 0.7, r: 180, color: '255, 100, 150' },
        { x: w * 0.5, y: h * 0.8, r: 150, color: '100, 255, 200' }
      ];

      clouds.forEach((cloud, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(time / 3000 + i);
        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
        grad.addColorStop(0, `rgba(${cloud.color}, ${0.03 * pulse})`);
        grad.addColorStop(0.5, `rgba(${cloud.color}, ${0.015 * pulse})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
    },

    runTimeline() {
      // Scene 1: Cosmos
      this.showScene(1);
      AudioManager.play('whoosh');

      // Scene 2: Nova Birth
      setTimeout(() => {
        if (!this.hasExited) {
          this.showScene(2);
          this.birthNova();
        }
      }, this.scenes[2].start);

      // Scene 3: Stats with staggered impact sounds
      setTimeout(() => {
        if (!this.hasExited) {
          this.showScene(3);
          AudioManager.play('chapterReveal');
          // Impact sounds for each stat
          setTimeout(() => AudioManager.play('statReveal'), 200);
          setTimeout(() => AudioManager.play('statReveal'), 600);
          setTimeout(() => AudioManager.play('statReveal'), 1000);
        }
      }, this.scenes[3].start);

      // Scene 4: Identity
      setTimeout(() => {
        if (!this.hasExited) {
          this.showScene(4);
          AudioManager.play('chapterReveal');
        }
      }, this.scenes[4].start);

      // Scene 5: Invitation
      setTimeout(() => {
        if (!this.hasExited) {
          this.showScene(5);
          AudioManager.play('whoosh');
        }
      }, this.scenes[5].start);

      // Auto exit
      setTimeout(() => {
        if (!this.hasExited) {
          this.exit();
        }
      }, this.totalDuration);
    },

    showScene(num) {
      if (this.hasExited) return;
      this.currentScene = num;

      // Update scene visibility
      $$('.cinema-scene').forEach(scene => {
        const sceneNum = parseInt(scene.dataset.scene);
        scene.classList.toggle('active', sceneNum === num);
      });

      // Update progress dots
      $$('.progress-dot').forEach(dot => {
        const dotScene = parseInt(dot.dataset.scene);
        dot.classList.toggle('active', dotScene === num);
        dot.classList.toggle('completed', dotScene < num);
      });

      // Update progress bar
      const progressBar = $('.cinema-progress-bar');
      if (progressBar) {
        const progress = (num / 5) * 100;
        progressBar.style.setProperty('--progress', progress + '%');
      }
    },

    birthNova() {
      const nova = $('#nova');
      if (nova) {
        nova.classList.add('born');
        AudioManager.play('novaBounce');
        setTimeout(() => {
          if (!this.hasExited && nova) {
            nova.classList.add('pulsing');
          }
        }, 800);
      }
    },

    updateTimer() {
      const timerEl = $('.skip-timer');
      if (!timerEl) return;

      this.timerInterval = setInterval(() => {
        if (this.hasExited) {
          clearInterval(this.timerInterval);
          return;
        }

        const elapsed = performance.now() - this.startTime;
        const remaining = Math.max(0, Math.ceil((this.totalDuration - elapsed) / 1000));
        timerEl.textContent = remaining > 0 ? remaining + 's' : '';

        if (remaining <= 0) {
          clearInterval(this.timerInterval);
        }
      }, 100);
    },

    exit() {
      if (this.hasExited) return;
      this.hasExited = true;
      this.isPlaying = false;

      // Stop ambient audio
      AudioManager.stopAmbient();

      // Cleanup
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);

      const overlay = $('#cinema-welcome');
      if (!overlay) return;

      overlay.classList.add('exiting');

      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.remove();
        document.body.classList.add('cinema-complete');
        window.cinematicComplete = true;
        this.showReplayButton();
      }, 2000);
    },

    skip() {
      if (!this.canSkip || this.hasExited) return;
      this.exit();
    },

    showReplayButton() {
      const replayBtn = $('#replay-intro');
      if (replayBtn) {
        replayBtn.classList.add('visible');
        replayBtn.addEventListener('click', () => this.replay());
      }
    },

    replay() {
      // Remove existing overlay if any
      const existing = $('#cinema-welcome');
      if (existing) existing.remove();

      // Reset state
      this.currentScene = 0;
      this.isPlaying = false;
      this.canSkip = false;
      this.hasExited = false;
      this.animationFrame = null;
      this.timerInterval = null;

      // Hide replay button
      const replayBtn = $('#replay-intro');
      if (replayBtn) replayBtn.classList.remove('visible');

      // Clear localStorage to allow replay
      localStorage.removeItem('nova-cinema-visit');

      // Re-create the cinema welcome overlay
      this.createOverlay();
      this.start();
    },

    createOverlay() {
      const overlay = document.createElement('div');
      overlay.id = 'cinema-welcome';
      overlay.className = 'cinema-welcome';
      overlay.setAttribute('aria-hidden', 'true');

      overlay.innerHTML = `
        <canvas id="cinema-canvas"></canvas>
        <div class="vignette"></div>
        <div class="cinema-scene scene-cosmos" data-scene="1">
          <div class="cosmos-text">
            <span class="cosmos-line line-1">In a universe of infinite possibilities...</span>
          </div>
        </div>
        <div class="cinema-scene scene-nova" data-scene="2">
          <div id="nova-container" class="nova-container">
            <div id="nova" class="nova">
              <div class="nova-core"></div>
              <div class="nova-glow"></div>
              <div class="nova-rings"><span></span><span></span><span></span></div>
              <div class="nova-particles">
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div class="nova-birth-text"><span>A spark of curiosity emerges</span></div>
        </div>
        <div class="cinema-scene scene-stats" data-scene="3">
          <div class="stats-cinematic">
            <div class="stat-reveal" data-delay="0">
              <span class="stat-big">₹100Cr+</span>
              <span class="stat-desc">MSME Deal Flow Processed</span>
            </div>
            <div class="stat-reveal" data-delay="1">
              <span class="stat-big">$6.5B</span>
              <span class="stat-desc">Research Validation</span>
            </div>
            <div class="stat-reveal" data-delay="2">
              <span class="stat-big">30+</span>
              <span class="stat-desc">Beta Users on Cosmos</span>
            </div>
          </div>
        </div>
        <div class="cinema-scene scene-identity" data-scene="4">
          <div class="identity-content">
            <div class="identity-roles">
              <span class="role-tag" data-delay="0">MSME Lending</span>
              <span class="role-separator">×</span>
              <span class="role-tag" data-delay="1">AI Research</span>
              <span class="role-separator">×</span>
              <span class="role-tag" data-delay="2">Product Builder</span>
            </div>
            <h1 class="identity-name">DIVYANSHU KUMAR</h1>
            <p class="identity-tagline">Building AI to detect cognitive biases in SEC filings — validated against $6.5B in write-offs</p>
            <div class="identity-education">
              <span>BBA Finance & Marketing Analytics</span>
              <span class="edu-separator">•</span>
              <span>Christ University, Delhi NCR '27</span>
            </div>
          </div>
        </div>
        <div class="cinema-scene scene-invitation" data-scene="5">
          <div class="invitation-content">
            <p class="invitation-text">Welcome to my story</p>
            <div class="invitation-cta">
              <span class="scroll-indicator"><span class="scroll-arrow"></span></span>
              <span class="scroll-text">Scroll to explore</span>
            </div>
          </div>
        </div>
        <div class="cinema-progress">
          <div class="cinema-progress-bar"></div>
          <div class="cinema-progress-dots">
            <span class="progress-dot active" data-scene="1"></span>
            <span class="progress-dot" data-scene="2"></span>
            <span class="progress-dot" data-scene="3"></span>
            <span class="progress-dot" data-scene="4"></span>
            <span class="progress-dot" data-scene="5"></span>
          </div>
        </div>
        <button id="cinema-skip" class="cinema-skip" aria-label="Skip intro">
          <span class="skip-text">Skip Intro</span>
          <span class="skip-timer"></span>
          <span class="skip-key">ESC</span>
        </button>
        <button id="cinema-sound" class="cinema-sound" aria-label="Toggle sound" data-muted="true">
          <svg class="sound-on" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <svg class="sound-off" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        </button>
      `;

      document.body.insertBefore(overlay, document.body.firstChild);
    },

    setupSkipControls() {
      const escHandler = (e) => {
        if (e.key === 'Escape' && !this.hasExited) {
          this.skip();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      const skipBtn = $('#cinema-skip');
      if (skipBtn) {
        skipBtn.addEventListener('click', () => this.skip());
      }
    },

    setupSoundToggle() {
      const soundBtn = $('#cinema-sound');
      if (!soundBtn) return;

      // Sync with global audio state
      const isMuted = localStorage.getItem('audio-muted') !== 'false';
      soundBtn.dataset.muted = isMuted;

      soundBtn.addEventListener('click', () => {
        AudioManager.toggle();
        soundBtn.dataset.muted = AudioManager.muted;
      });
    },

    setupProgressDots() {
      $$('.progress-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          if (this.hasExited) return;
          const sceneNum = parseInt(dot.dataset.scene);
          this.showScene(sceneNum);
        });
      });
    }
  };

  // ===== Chapter Controller =====
  const ChapterController = {
    chapters: {
      1: 'The Origin Story',
      2: 'The Creations',
      3: 'The Journey',
      4: 'The Impact',
      5: 'The Frontier',
      6: 'The Milestones',
      7: 'The Arsenal',
      8: 'The Voice',
      9: 'The Next Chapter'
    },

    init() {
      this.observeChapters();
    },

    observeChapters() {
      const chapterReveals = $$('.chapter-reveal');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            AudioManager.play('chapterReveal');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });

      chapterReveals.forEach(el => observer.observe(el));
    }
  };

  // ===== Story Progress =====
  const StoryProgress = {
    currentChapter: 1,
    chapterNames: {
      1: 'The Origin Story',
      2: 'The Creations',
      3: 'The Journey',
      4: 'The Impact',
      5: 'The Frontier',
      6: 'The Milestones',
      7: 'The Arsenal',
      9: 'The Next Chapter'
    },

    init() {
      this.progressFill = $('.story-progress-fill');
      this.chapterDots = $$('.story-chapter');
      this.currentNumEl = $('.current-chapter-num');
      this.currentNameEl = $('.current-chapter-name');
      this.sections = $$('[data-chapter]');

      if (!this.progressFill || !this.sections.length) return;

      this.observeSections();
      this.updateScrollProgress();
      window.addEventListener('scroll', throttle(() => this.updateScrollProgress(), 50), { passive: true });
    },

    observeSections() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const chapter = parseInt(entry.target.dataset.chapter);
            this.setCurrentChapter(chapter);
          }
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });

      this.sections.forEach(s => observer.observe(s));
    },

    setCurrentChapter(num) {
      if (this.currentChapter === num) return;
      this.currentChapter = num;

      // Update dots
      this.chapterDots.forEach(dot => {
        const dotChapter = parseInt(dot.dataset.chapter);
        dot.classList.toggle('active', dotChapter === num);
        dot.classList.toggle('completed', dotChapter < num);
      });

      // Update display
      if (this.currentNumEl) {
        this.currentNumEl.textContent = num < 10 ? `0${num}` : num;
      }
      if (this.currentNameEl && this.chapterNames[num]) {
        this.currentNameEl.textContent = this.chapterNames[num];
      }
    },

    updateScrollProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, (scrollTop / docHeight) * 100);

      if (this.progressFill) {
        this.progressFill.style.height = progress + '%';
      }
    }
  };

  // ===== Premium Cinematic Audio Manager =====
  const AudioManager = {
    ctx: null,
    muted: true,
    masterGain: null,
    ambientNodes: [],
    isAmbientPlaying: false,

    init() {
      const audioBtn = $('#audio-control');
      if (!audioBtn) return;

      // Load muted state from localStorage
      this.muted = localStorage.getItem('audio-muted') !== 'false';
      audioBtn.dataset.muted = this.muted;

      audioBtn.addEventListener('click', () => this.toggle());
    },

    ensureContext() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    toggle() {
      this.muted = !this.muted;
      localStorage.setItem('audio-muted', this.muted);

      const audioBtn = $('#audio-control');
      if (audioBtn) audioBtn.dataset.muted = this.muted;

      // Sync cinema sound button
      const cinemaSound = $('#cinema-sound');
      if (cinemaSound) cinemaSound.dataset.muted = this.muted;

      if (!this.muted) {
        this.ensureContext();
        // Start ambient if cinema is playing
        if (!window.cinematicComplete && !this.isAmbientPlaying) {
          this.startAmbient();
        }
      } else {
        this.stopAmbient();
      }
    },

    // Deep space ambient drone
    startAmbient() {
      if (this.muted || this.isAmbientPlaying) return;
      this.ensureContext();
      this.isAmbientPlaying = true;

      const now = this.ctx.currentTime;

      // Create ambient gain for fade in/out
      const ambientGain = this.ctx.createGain();
      ambientGain.gain.setValueAtTime(0, now);
      ambientGain.gain.linearRampToValueAtTime(0.15, now + 3);
      ambientGain.connect(this.masterGain);

      // Deep bass drone (40Hz)
      const bass = this.ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.value = 40;
      const bassGain = this.ctx.createGain();
      bassGain.gain.value = 0.4;
      bass.connect(bassGain);
      bassGain.connect(ambientGain);
      bass.start();

      // Sub-harmonic (20Hz - felt more than heard)
      const sub = this.ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.value = 20;
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.3;
      sub.connect(subGain);
      subGain.connect(ambientGain);
      sub.start();

      // Ethereal pad (filtered noise)
      const noise = this.ctx.createBufferSource();
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 200;
      noiseFilter.Q.value = 2;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.08;

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ambientGain);
      noise.start();

      // Slow LFO modulation on noise filter
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 100;
      lfo.connect(lfoGain);
      lfoGain.connect(noiseFilter.frequency);
      lfo.start();

      this.ambientNodes = { bass, sub, noise, lfo, ambientGain };
    },

    stopAmbient() {
      if (!this.isAmbientPlaying || !this.ambientNodes.ambientGain) return;

      const now = this.ctx.currentTime;
      this.ambientNodes.ambientGain.gain.linearRampToValueAtTime(0, now + 1.5);

      setTimeout(() => {
        try {
          this.ambientNodes.bass?.stop();
          this.ambientNodes.sub?.stop();
          this.ambientNodes.noise?.stop();
          this.ambientNodes.lfo?.stop();
        } catch (e) {}
        this.ambientNodes = [];
        this.isAmbientPlaying = false;
      }, 1600);
    },

    // Play specific cinematic sounds
    play(soundName) {
      if (this.muted) return;
      this.ensureContext();

      const now = this.ctx.currentTime;

      switch (soundName) {
        case 'novaBounce':
          this.playNovaBirth(now);
          break;
        case 'chapterReveal':
          this.playSceneTransition(now);
          break;
        case 'statReveal':
          this.playImpact(now);
          break;
        case 'whoosh':
          this.playWhoosh(now);
          break;
        case 'success':
          this.playSuccess(now);
          break;
        case 'hover':
          this.playHover(now);
          break;
        case 'click':
          this.playClick(now);
          break;
      }
    },

    // Nova birth - magical shimmer
    playNovaBirth(now) {
      // Shimmer sweep
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + i * 200, now);
        osc.frequency.exponentialRampToValueAtTime(800 + i * 300, now + 0.8);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1 + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.05);
        osc.stop(now + 1 + i * 0.1);
      }

      // Soft chime
      const chime = this.ctx.createOscillator();
      chime.type = 'sine';
      chime.frequency.value = 1200;
      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.12, now + 0.2);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      chime.connect(chimeGain);
      chimeGain.connect(this.masterGain);
      chime.start(now + 0.2);
      chime.stop(now + 1.5);
    },

    // Scene transition - cinematic whoosh
    playSceneTransition(now) {
      // Filtered noise whoosh
      const noise = this.ctx.createBufferSource();
      const bufferSize = this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.6);
      filter.Q.value = 1;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.7);

      // Subtle tonal element
      const tone = this.ctx.createOscillator();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(200, now);
      tone.frequency.exponentialRampToValueAtTime(400, now + 0.4);
      const toneGain = this.ctx.createGain();
      toneGain.gain.setValueAtTime(0.06, now);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      tone.connect(toneGain);
      toneGain.connect(this.masterGain);
      tone.start(now);
      tone.stop(now + 0.5);
    },

    // Impact for stats
    playImpact(now) {
      // Low thump
      const thump = this.ctx.createOscillator();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(80, now);
      thump.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      const thumpGain = this.ctx.createGain();
      thumpGain.gain.setValueAtTime(0.25, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      thump.connect(thumpGain);
      thumpGain.connect(this.masterGain);
      thump.start(now);
      thump.stop(now + 0.3);
    },

    // Quick whoosh
    playWhoosh(now) {
      const noise = this.ctx.createBufferSource();
      const bufferSize = this.ctx.sampleRate * 0.3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(3000, now + 0.15);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.25);
    },

    playSuccess(now) {
      const freqs = [523, 659, 784];
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.1);
        osc.stop(now + 0.6 + i * 0.1);
      });
    },

    playHover(now) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    },

    playClick(now) {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 600;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  };

  // ===== Easter Eggs =====
  const EasterEggs = {
    konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    konamiIndex: 0,
    nameClickCount: 0,
    nameClickTimeout: null,

    init() {
      this.setupKonami();
      this.setupTripleClick();
      this.setupBlackHoleClick();
      this.setupButtonEffects();
      this.setupCardSpotlight();
    },

    setupKonami() {
      document.addEventListener('keydown', (e) => {
        if (e.key === this.konamiCode[this.konamiIndex]) {
          this.konamiIndex++;
          if (this.konamiIndex === this.konamiCode.length) {
            this.triggerKonamiCelebration();
            this.konamiIndex = 0;
          }
        } else {
          this.konamiIndex = 0;
        }
      });
    },

    triggerKonamiCelebration() {
      AudioManager.play('success');

      // Create 20 Nova particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'konami-particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particle.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 2500);
      }
    },

    setupTripleClick() {
      const brand = $('.brand');
      if (!brand) return;

      brand.addEventListener('click', () => {
        this.nameClickCount++;
        clearTimeout(this.nameClickTimeout);

        this.nameClickTimeout = setTimeout(() => {
          this.nameClickCount = 0;
        }, 500);

        if (this.nameClickCount === 3) {
          this.showSecretMessage();
          this.nameClickCount = 0;
        }
      });
    },

    showSecretMessage() {
      AudioManager.play('success');

      const existing = $('.secret-message');
      if (existing) existing.remove();

      const msg = document.createElement('div');
      msg.className = 'secret-message';
      msg.innerHTML = `
        <p style="margin:0 0 0.5rem; color: var(--accent);">You found a secret!</p>
        <p style="margin:0; font-size: 0.9rem;">This portfolio was crafted with curiosity, code, and countless cups of chai.</p>
      `;
      document.body.appendChild(msg);

      requestAnimationFrame(() => msg.classList.add('visible'));

      setTimeout(() => {
        msg.classList.remove('visible');
        setTimeout(() => msg.remove(), 500);
      }, 4000);
    },

    setupBlackHoleClick() {
      const bhHero = $('#bh-hero');
      if (!bhHero) return;

      bhHero.addEventListener('click', (e) => {
        const rect = bhHero.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

        // If clicked near center
        if (dist < 100) {
          document.body.classList.add('warp-effect');
          setTimeout(() => document.body.classList.remove('warp-effect'), 800);
        }
      });
    },

    setupButtonEffects() {
      $$('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => AudioManager.play('hover'));

        btn.addEventListener('click', (e) => {
          AudioManager.play('click');

          // Ripple effect
          const rect = btn.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          btn.style.setProperty('--ripple-x', x + '%');
          btn.style.setProperty('--ripple-y', y + '%');
          btn.classList.add('ripple');
          setTimeout(() => btn.classList.remove('ripple'), 500);
        });
      });
    },

    setupCardSpotlight() {
      $$('.holo').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--spotlight-x', x + '%');
          card.style.setProperty('--spotlight-y', y + '%');
        });
      });
    }
  };

  // Initialize all modules
  CinematicWelcome.init();
  AudioManager.init();

  // Initialize other modules after cinema complete or if skipped
  function initStoryModules() {
    ChapterController.init();
    StoryProgress.init();
    EasterEggs.init();
  }

  if (window.cinematicComplete) {
    initStoryModules();
  } else {
    const checkCinema = setInterval(() => {
      if (window.cinematicComplete) {
        clearInterval(checkCinema);
        initStoryModules();
      }
    }, 100);
  }

  // ===== Loading Animation =====
  const loader = $('#loader');

  function hideLoader() {
    if (loader) {
      loader.classList.add('loaded');
      document.body.classList.add('loaded');
    }
  }

  // Hide loader when page is fully loaded and cinema is done
  function checkAndHideLoader() {
    // If cinema intro is playing, wait for it
    const cinemaOverlay = $('#cinema-welcome');
    if (cinemaOverlay && !cinemaOverlay.classList.contains('hidden')) {
      // Wait for cinema to complete
      const checkInterval = setInterval(() => {
        if (window.cinematicComplete || !$('#cinema-welcome')) {
          clearInterval(checkInterval);
          setTimeout(hideLoader, 300);
        }
      }, 100);
    } else {
      hideLoader();
    }
  }

  // Hide loader when page is fully loaded
  if (document.readyState === 'complete') {
    checkAndHideLoader();
  } else {
    window.addEventListener('load', () => {
      // Minimum display time for loader
      setTimeout(checkAndHideLoader, 1800);
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

  // ===== Unified Animated Counter =====
  // Handles both stat-value (data-count) and project journey counters (data-target)
  function animateCounter(el) {
    // Support both data-count and data-target attributes
    const target = parseFloat(el.getAttribute('data-count') || el.getAttribute('data-target')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo for smoother animation
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
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
      } catch {
        // Fallback: show error feedback to user instead of console
        btn.textContent = 'Failed';
        setTimeout(() => btn.textContent = originalText, 1200);
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

  // ===== Animated Project Journey =====

  // Observer for project journey counters (uses unified animateCounter above)
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('.counter').forEach(counter => counterObserver.observe(counter));

  // Journey Timeline Navigation
  $$('.journey-timeline').forEach(timeline => {
    const markers = $$('.timeline-marker', timeline);
    const progress = $('.timeline-progress', timeline);
    const journeyContent = timeline.nextElementSibling;

    if (!journeyContent || !journeyContent.classList.contains('journey-content')) return;

    const steps = $$('.journey-step', journeyContent);

    markers.forEach((marker, index) => {
      marker.addEventListener('click', () => {
        // Update markers
        markers.forEach(m => m.classList.remove('active'));
        marker.classList.add('active');

        // Update progress bar
        const progressPercent = ((index + 1) / markers.length) * 100;
        if (progress) progress.style.width = progressPercent + '%';

        // Show corresponding step
        steps.forEach(s => s.classList.remove('active'));
        const targetSection = marker.dataset.target;
        const targetStep = steps.find(s => s.dataset.section === targetSection);
        if (targetStep) {
          targetStep.classList.add('active');
          // Re-trigger stagger animations
          const staggerContainer = targetStep.querySelector('.stagger-children');
          if (staggerContainer) {
            staggerContainer.classList.remove('stagger-children');
            void staggerContainer.offsetWidth; // Force reflow
            staggerContainer.classList.add('stagger-children');
          }
        }
      });
    });
  });

  // Typewriter Effect for Titles
  function typewriterEffect(element) {
    const text = element.dataset.text || element.textContent;
    element.textContent = '';
    let index = 0;

    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, 50);
      } else {
        element.classList.add('typed');
      }
    }

    type();
  }

  // Observer for typewriter titles
  const typewriterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        entry.target.dataset.typed = 'true';
        if (!reduced) {
          typewriterEffect(entry.target);
        }
      }
    });
  }, { threshold: 0.5 });

  $$('.typewriter-title').forEach(title => {
    if (!reduced) {
      typewriterObserver.observe(title);
    }
  });

  // Re-animate journey content when tab is switched
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(() => {
        // Find the active panel
        const panelId = tab.getAttribute('aria-controls');
        const panel = $('#' + panelId);

        if (panel && panel.classList.contains('project-journey')) {
          // Re-trigger counter animations
          $$('.counter', panel).forEach(counter => {
            if (counter.dataset.animated !== 'true') {
              counter.dataset.animated = 'true';
              animateCounter(counter);
            }
          });

          // Reset journey to first step
          const timeline = $('.journey-timeline', panel);
          if (timeline) {
            const firstMarker = $('.timeline-marker', timeline);
            if (firstMarker) firstMarker.click();
          }
        }
      }, 100);
    });
  });

  // Auto-advance journey on scroll (for Cosmos main project)
  let lastScrollY = window.scrollY;
  const cosmosPanel = $('#p1');

  if (cosmosPanel && cosmosPanel.classList.contains('project-journey')) {
    const scrollAdvanceHandler = throttle(() => {
      if (!cosmosPanel.classList.contains('show')) return;

      const panelRect = cosmosPanel.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1,
        (window.innerHeight - panelRect.top) / (panelRect.height + window.innerHeight)
      ));

      const timeline = $('.journey-timeline', cosmosPanel);
      if (!timeline) return;

      const markers = $$('.timeline-marker', timeline);
      const stepIndex = Math.min(Math.floor(scrollProgress * markers.length), markers.length - 1);

      const currentActive = $('.timeline-marker.active', timeline);
      const currentIndex = markers.indexOf(currentActive);

      // Only advance, don't go backwards automatically
      if (stepIndex > currentIndex && markers[stepIndex]) {
        markers[stepIndex].click();
      }
    }, 200);

    window.addEventListener('scroll', scrollAdvanceHandler, { passive: true });
  }

})();
