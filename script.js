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