(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  // Year
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Spotlight background
  const spotlight = $(".spotlight");
  window.addEventListener("mousemove", (e) => {
    if (!spotlight) return;
    spotlight.style.setProperty("--mx", e.clientX + "px");
    spotlight.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });

  // JWST cursor (global)
  const jc = $("#jwst-cursor");
  const ring = $(".ring", jc);
  const hexes = $$(".hex", jc);
  let raf; const target = {x: innerWidth/2, y: innerHeight/2}; const pos = {x: target.x, y: target.y};
  function loop(){
    pos.x += (target.x - pos.x) * 0.2;
    pos.y += (target.y - pos.y) * 0.2;
    ring.style.left = pos.x + "px"; ring.style.top = pos.y + "px";
    // parallax hex drift
    hexes.forEach((h, i) => {
      const dx = (i%2?1:-1) * (i+1)*0.3;
      const dy = (i%3?1:-1) * (i+1)*0.2;
      h.style.left = (pos.x + dx) + "px"; h.style.top = (pos.y + dy) + "px";
      h.style.transform = "translate(-50%,-50%) rotate(" + ((pos.x+pos.y)/200) + "deg)";
    });
    raf = requestAnimationFrame(loop);
  }
  window.addEventListener("mousemove", e => { target.x = e.clientX; target.y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, {passive:true});
  window.addEventListener("pointerdown", () => { ring.style.transform = "translate(-50%,-50%) scale(.9)"; setTimeout(()=>{ ring.style.transform = "translate(-50%,-50%)"; }, 140); });

  // Magnetic hover for brand/links/buttons
  window.addEventListener("mousemove", (e) => {
    $$(".brand,[data-magnet]").forEach(el => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.hypot(dx,dy), max = 140;
      if (dist < max) {
        const s = (1 - dist/max) * 10;
        el.style.transform = `translate(${(dx/dist)*s}px, ${(dy/dist)*s}px)`;
      } else el.style.transform = "";
    });
  }, {passive:true});

  // Tilt on hero image
  const tiltEl = document.querySelector("[data-tilt]");
  if (tiltEl) {
    tiltEl.addEventListener("mousemove", (e) => {
      const r = tiltEl.getBoundingClientRect();
      const rx = ((e.clientY - r.top)/r.height - .5) * -6;
      const ry = ((e.clientX - r.left)/r.width - .5) *  6;
      tiltEl.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    tiltEl.addEventListener("mouseleave", () => { tiltEl.style.transform = ""; });
  }

  // Reveal on scroll (cards/timeline)
  const io = new IntersectionObserver((entries)=>{
    for(const ent of entries){ if(ent.isIntersecting){ ent.target.classList.add("revealed"); io.unobserve(ent.target);} }
  }, { threshold: 0.2 });
  document.querySelectorAll(".reveal, .t-item").forEach(el => io.observe(el));

  // Tabs (Projects)
  const tabs = $$(".tab");
  const panels = $$(".panel-card");
  function activate(i){
    tabs.forEach((t, idx) => {
      const sel = idx===i; t.setAttribute("aria-selected", sel); t.tabIndex = sel? 0 : -1;
      panels[idx].classList.toggle("show", sel);
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => activate(i));
    t.addEventListener("keydown", (e) => {
      if(e.key === "ArrowRight") activate((i+1)%tabs.length);
      if(e.key === "ArrowLeft") activate((i-1+tabs.length)%tabs.length);
    });
  });

  // Accordion (Certifications)
  $$(".acc").forEach((btn) => {
    const panel = btn.nextElementSibling;
    btn.addEventListener("click", () => {
      const state = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!state));
      panel.style.display = state ? "none" : "block";
    });
  });

  // Contact copy-to-clipboard
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy");
      try { await navigator.clipboard.writeText(text); btn.textContent = "Copied!"; setTimeout(()=>btn.textContent="Copy " + ("@" in text? "Email":"Phone"), 1200);} catch {}
    });
  });

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cancelAnimationFrame(raf);
    if (jc) jc.style.display = "none";
  }
})();
// All UI behavior, perf guards, command palette, minimap, cursor, tabs, etc.
(function(){
  const $ = (s,sc=document)=> sc.querySelector(s);
  const $$ = (s,sc=document)=> Array.from(sc.querySelectorAll(s));
  const fine = matchMedia('(pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // View Transitions for hash nav (silent fallback)
  function smoothHash(href){
    if (document.startViewTransition){
      document.startViewTransition(()=> location.hash = href);
    } else {
      location.hash = href;
    }
  }
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    e.preventDefault();
    smoothHash(id);
    document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // JWST cursor + section spotlight (site-wide)
  const cursor = document.getElementById('jwst-cursor');
  let mx=0, my=0, tx=0, ty=0;
  function raf(){
    tx += (mx - tx) * 0.18;
    ty += (my - ty) * 0.18;
    if (cursor){
      cursor.style.transform = `translate(${tx}px, ${ty}px)`;
      const ring = cursor.querySelector('.ring');
      if (ring) ring.style.transform = `translate(-50%,-50%) scale(${1 + Math.hypot(mx-tx, my-ty)/300})`;
    }
    requestAnimationFrame(raf);
  }
  if (cursor && fine && !reduced){ requestAnimationFrame(raf); }
  window.addEventListener('pointermove', (e)=>{
    mx = e.clientX; my = e.clientY;
    const sec = document.elementFromPoint(mx,my)?.closest('.section');
    if (sec){
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--mx', `${(mx - r.left)}px`);
      sec.style.setProperty('--my', `${(my - r.top)}px`);
      if (!sec.querySelector(':scope > .spotlight')){ const s = document.createElement('div'); s.className='spotlight'; sec.appendChild(s); }
    }
  }, {passive:true});

  // Cosmic particle trail (lightweight; disabled on coarse pointers/reduced motion)
  (function(){
    if (!fine || reduced) return;
    const canvas = document.createElement('canvas');
    canvas.width = innerWidth; canvas.height = innerHeight;
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let pr = Math.min(devicePixelRatio||1, 1.5);
    function resize(){ pr = Math.min(devicePixelRatio||1, 1.5); canvas.width = innerWidth*pr; canvas.height = innerHeight*pr; }
    addEventListener('resize', resize);

    const N = matchMedia('(max-width: 900px)').matches ? 40 : 90;
    const parts = new Array(N).fill(0).map(()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:0,vy:0,life:Math.random()*100}));
    let hx=innerWidth/2, hy=innerHeight*0.22; // hero gravity center
    function step(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (const p of parts){
        const dx = mx*pr - p.x, dy = my*pr - p.y;
        const dd = Math.hypot(dx,dy)+1;
        p.vx += dx/dd * 0.02; p.vy += dy/dd * 0.02;
        // subtle pull to hero
        const dxh = hx*pr - p.x, dyh = hy*pr - p.y;
        const ddh = Math.hypot(dxh,dyh)+1;
        p.vx += dxh/ddh * 0.004; p.vy += dyh/ddh * 0.004;
        p.vx *= 0.96; p.vy *= 0.96;
        p.x += p.vx; p.y += p.vy;
        p.life += 1;
        const a = 0.6 + 0.4*Math.sin(p.life*0.1);
        ctx.globalAlpha = a*0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2*pr, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,216,168,0.9)';
        ctx.fill();
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  // Magnet hover (Neuralink-y micro interaction)
  $$('#home a, nav a, .btn, .tab').forEach(el=>{
    if (!fine || reduced) return;
    const str = 18;
    el.setAttribute('data-magnet','');
    el.addEventListener('pointermove', (e)=>{
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width/2);
      const y = e.clientY - (r.top + r.height/2);
      el.style.transform = `translate(${(x/r.width)*str}px, ${(y/r.height)*str}px)`;
    });
    el.addEventListener('pointerleave', ()=> el.style.transform = 'translate(0,0)');
  });

  // Tabs
  const tabs = $$('.tabs .tab');
  function setTab(i){
    const panels = $$('.panels .panel-card');
    tabs.forEach(t=> t.setAttribute('aria-selected','false'));
    panels.forEach(p=> p.classList.remove('show'));
    tabs[i].setAttribute('aria-selected','true');
    $('#'+tabs[i].getAttribute('aria-controls'))?.classList.add('show');
  }
  tabs.forEach((t,i)=> t.addEventListener('click', ()=> setTab(i)));
  document.addEventListener('keydown',(e)=>{
    if (document.activeElement && document.activeElement.tagName==='INPUT') return;
    const cur = Math.max(0, tabs.findIndex(t=> t.getAttribute('aria-selected')==='true'));
    if (e.key==='ArrowRight'){ setTab((cur+1)%tabs.length); }
    if (e.key==='ArrowLeft'){ setTab((cur-1+tabs.length)%tabs.length); }
  });

  // Accordion
  $$('.acc').forEach(btn=>{
    const panel = btn.nextElementSibling;
    btn.addEventListener('click', ()=>{
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.display = open ? 'none' : 'block';
    });
  });

  // Minimap
  const anchors = $$('.minimap a');
  const sections = anchors.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const mio = new IntersectionObserver((ents)=>{
    ents.forEach(ent=>{
      const idx = sections.indexOf(ent.target);
      if (idx>=0){ anchors[idx].classList.toggle('active', ent.isIntersecting); }
    });
  }, { rootMargin:'-40% 0px -50% 0px', threshold:0.01 });
  sections.forEach(s=> mio.observe(s));

  // Command palette (⌘/Ctrl+K)
  const kbar = $('#kbar'), kin = $('#kinput'), klist = $('#klist'), kOpen = $('#kbar-open');
  const actions = [
    {label:'Go to Projects', href:'#projects'},
    {label:'Go to About', href:'#about'},
    {label:'Go to Experience', href:'#experience'},
    {label:'Go to Leadership', href:'#leadership'},
    {label:'Go to Research', href:'#research'},
    {label:'Go to Certifications', href:'#certifications'},
    {label:'Go to Writing', href:'#writing'},
    {label:'Go to Contact', href:'#contact'},
    {label:'Open Résumé (PDF)', run:()=> window.open('PF.pdf','_blank')},
    {label:'Email Divyanshu', run:()=> location.href='mailto:divyanshukumar0163@gmail.com'},
    {label:'Open LinkedIn', run:()=> window.open('https://linkedin.com/in/divyanshukumar27','_blank')},
  ];
  function showK(){ kbar.style.display='flex'; setTimeout(()=> kin.focus(), 0); renderK(''); }
  function hideK(){ kbar.style.display='none'; kin.value=''; }
  function score(q, s){
    q = q.toLowerCase(); s = s.toLowerCase();
    let i=0, j=0, sc=0;
    while (i<q.length && j<s.length){ if (q[i]===s[j]){ sc+=2; i++; } j++; }
    return i===q.length ? sc - (s.length - q.length) : -1;
  }
  function renderK(q){
    const items = actions.map(a=>({a,sc: q? score(q, a.label):0})).filter(x=> q? x.sc>=0 : true)
      .sort((A,B)=> B.sc - A.sc).slice(0, 12);
    klist.innerHTML = items.map(x=> `<div class="kitem" data-idx="${actions.indexOf(x.a)}"><span>${x.a.label}</span><span>↩︎</span></div>`).join('');
  }
  document.addEventListener('keydown', (e)=>{
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); showK(); }
    if (kbar.style.display!=='flex') return;
    if (e.key==='Escape'){ hideK(); }
    if (e.key==='Enter'){
      const first = klist.querySelector('.kitem'); if (!first) return;
      const idx = +first.getAttribute('data-idx'); const a = actions[idx];
      hideK();
      if (a.run) a.run(); else smoothHash(a.href);
    }
  });
  kOpen?.addEventListener('click', showK);
  kbar.addEventListener('click', (e)=> { if (e.target===kbar) hideK(); });
  klist.addEventListener('click', (e)=>{
    const item = e.target.closest('.kitem'); if (!item) return;
    const idx = +item.getAttribute('data-idx'); const a = actions[idx];
    hideK();
    if (a.run) a.run(); else smoothHash(a.href);
  });
  kin.addEventListener('input', ()=> renderK(kin.value));

  // Theme toggle (Dark → Noir → Blue-Haze)
  const tbtn = $('#theme-toggle');
  const themes = ['dark','noir','blue-haze'];
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved !== 'dark') document.documentElement.setAttribute('data-theme', saved);
  function setBtn(){ const cur = document.documentElement.getAttribute('data-theme') || 'dark'; tbtn.textContent = cur.replace('-',' ').replace(/\b\w/g,s=>s.toUpperCase()); }
  setBtn();
  tbtn.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = themes[(themes.indexOf(cur)+1)%themes.length];
    if (next==='dark') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next); setBtn();
  });

  // Progress bar
  let bar = $('.progress'), ticking=false;
  addEventListener('scroll', ()=>{
    if (ticking) return; ticking = true;
    requestAnimationFrame(()=>{
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max>0 ? (h.scrollTop / max) * 100 : 0) + '%';
      ticking = false;
    });
  }, { passive:true });

  // Perf guardrails: if frame drops pile up, reduce heavy effects
  let drops=0, last=performance.now();
  function perf(){
    const now = performance.now(), dt = now - last; last = now;
    if (dt > 55) drops++; else drops = Math.max(0, drops-1);
    if (drops > 120){ document.body.classList.add('reduced'); } // disables particles via CSS/logic above
    requestAnimationFrame(perf);
  }
  requestAnimationFrame(perf);
  if (reduced) document.body.classList.add('reduced');

  // Copy buttons in Contact
  $$('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(btn.getAttribute('data-copy') || '');
        const old = btn.textContent; btn.textContent='Copied!'; setTimeout(()=> btn.textContent=old, 1100);
      }catch{}
    });
  });

  // Current year
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
