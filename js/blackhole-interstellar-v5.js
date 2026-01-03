/*! Interstellar Black Hole — v5 (pure WebGL, no deps)
 *  Features:
 *   - Relativistic beaming (tunable)
 *   - Gravitational lensing approximation (tunable)
 *   - Disk thickness & swirl speed (tunable)
 *   - Mouse/touch parallax with inertia (tunable sensitivity)
 *   - Auto quality + pause when off-screen
 *   - Tiny on-page controls (optional)
 *  API: window.InterstellarBH.mount(opts)
 */
(function (global){
  function makeShader(gl, type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      console.error("[InterstellarBH] Shader compile:", gl.getShaderInfoLog(sh));
      throw new Error("shader compile");
    }
    return sh;
  }
  function makeProgram(gl, vsSrc, fsSrc){
    const vs = makeShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = makeShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
      console.error("[InterstellarBH] Program link:", gl.getProgramInfoLog(p));
      throw new Error("program link");
    }
    return p;
  }

  const VERT = `#version 300 es
  precision highp float;
  out vec2 vUv;
  void main(){
    // Fullscreen triangle via gl_VertexID (WebGL2)
    vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    vUv = pos;
    gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
  }`;

  const FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 frag;

  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;   // [-1,1] inertia-smoothed
  uniform vec3  u_accent;
  uniform float u_beam;    // beaming strength (~v/c)
  uniform float u_lens;    // lens strength
  uniform float u_speed;   // swirl speed multiplier
  uniform float u_diskIn;  // disk inner radius
  uniform float u_diskOut; // disk outer radius

  // Event horizon, photon ring, camera focal length
  const float rH   = 0.55;
  const float rPh  = 0.85;
  const float focal= 1.9;

  // --- helpers ---
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
  }
  mat3 rotX(float a){ float s=sin(a), c=cos(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
  mat3 rotY(float a){ float s=sin(a), c=cos(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }

  float lineToPointDistance(vec3 ro, vec3 rd, vec3 p){
    return length(cross(p - ro, rd)) / max(length(rd), 1e-5);
  }
  bool rayPlane(vec3 ro, vec3 rd, vec3 n, float d, out float t){
    float dn = dot(rd, n);
    if (abs(dn) < 1e-4) return false;
    t = -(dot(ro, n) + d) / dn;
    return t > 0.0;
  }

  vec3 diskShade(vec3 pos, vec3 n, vec3 viewDir, vec3 accent, float diskIn, float diskOut, float speed){
    vec3 u = normalize(pos - dot(pos, n) * n); // radial in plane
    vec3 t = normalize(cross(n, u));           // tangent (orbital)
    float doppler = max(0.0, 1.0 + u_beam * dot(t, viewDir));
    float boost = pow(doppler, 3.0);

    float R = length(u * dot(pos, u));
    float ring = smoothstep(diskIn, diskIn+0.25, R) * smoothstep(diskOut, diskOut-0.35, R);

    float temp = smoothstep(diskIn, diskOut, R);
    vec3 cold = vec3(0.25, 0.5, 1.0);
    vec3 warm = accent;
    vec3 col = mix(cold, warm, temp);
    col *= (0.55 + 0.45 * sin(atan(u.y, u.x) * 6.0 + u_time * (1.2 * speed) + noise(u.xz * 2.0) * 2.0));
    return col * ring * boost;
  }

  void main(){
    // Screen coords -> camera ray
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= u_res.x / u_res.y;

    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(p, -focal));

    // Mouse tilt (edge-on like Interstellar)
    float yaw = u_mouse.x * 0.35;
    float pitch = -u_mouse.y * 0.22;
    rd = rotY(yaw) * rotX(pitch) * rd;
    ro = rotY(yaw) * rotX(pitch) * ro;

    // Disk plane (slightly tilted)
    vec3 nDisk = normalize(rotX(0.35) * vec3(0.0, 1.0, 0.0));

    // Space background (subtle structured starfield)
    vec2 sp = p * 1.8 + vec2(u_time * 0.02, 0.0);
    float stars = 0.0;
    for (int i=0;i<3;i++){
      stars += smoothstep(0.85, 1.0, noise(sp*(3.0+float(i)*1.7))) * (0.20 + float(i)*0.13);
      sp *= 1.6;
    }
    vec3 col = vec3(0.02, 0.05, 0.11) + stars * vec3(0.7,0.8,1.0) * 0.25;

    // Impact parameter: if captured by horizon, paint black
    float b = lineToPointDistance(ro, rd, vec3(0.0));
    if (b < rH){ frag = vec4(0.0,0.0,0.0,1.0); return; }

    // Direct disk image
    float tHit;
    if (rayPlane(ro, rd, nDisk, 0.0, tHit)){
      vec3 hit = ro + rd * tHit;
      float h = dot(hit, nDisk);
      vec3 inPlane = hit - nDisk * h;
      float R = length(inPlane);
      if (R > u_diskIn && R < u_diskOut){
        vec3 vdir = normalize(-rd);
        col += diskShade(inPlane, nDisk, vdir, u_accent, u_diskIn, u_diskOut, u_speed) * 0.85;
      }
    }

    // Lensed (bent) disk image
    float alpha = clamp(u_lens / (b + 0.25), 0.0, 1.2);
    vec3 toward = normalize(-ro);
    vec3 rdBent = normalize(mix(rd, toward, alpha));
    if (rayPlane(ro, rdBent, nDisk, 0.0, tHit)){
      vec3 hit = ro + rdBent * tHit;
      float h = dot(hit, nDisk);
      vec3 inPlane = hit - nDisk * h;
      float R = length(inPlane);
      if (R > u_diskIn && R < u_diskOut){
        vec3 vdir = normalize(-rdBent);
        col += diskShade(inPlane, nDisk, vdir, u_accent, u_diskIn, u_diskOut, u_speed) * 0.45;
      }
    }

    // Photon ring hint
    float ring = smoothstep(rPh-0.02, rPh, b) * smoothstep(rPh+0.08, rPh+0.02, b);
    col += u_accent * ring * 0.25;

    // Vignette
    float r = length(p);
    col *= mix(0.85, 1.0, smoothstep(1.2, 0.1, r));

    frag = vec4(col, 1.0);
  }`;

  function hexToRgb(hex){
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] : [1, .85, .66];
  }

  function mount(opts){
    const {
      selector = "#bh-hero",
      accent = "#ffd8a8",
      pixelRatioCap = 1.5,
      heightVh = 78,
      forceMotion = false,
      quality = "auto",          // "low" | "auto" | "high"
      beamStrength = 0.65,       // 0.5–0.9
      lensStrength = 0.9,        // 0.6–1.2
      speed = 1.0,               // 0.6–1.6
      diskInner = 1.25,          // 1.0–1.6
      diskOuter = 3.20,          // 2.6–3.8
      sensitivity = 0.12,        // 0.08–0.2
      controls = true,           // show tiny UI panel
    } = (opts || {});

    const el = document.querySelector(selector);
    if(!el){ console.warn("[InterstellarBH] container not found:", selector); return; }

    const urlParams = new URLSearchParams(location.search);
    const motionOverride = urlParams.get("motion") === "on";
    const reduce = !forceMotion && !motionOverride &&
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduce){ console.info("[InterstellarBH] Reduced motion: using fallback"); return; }

    if (!el.style.height){
      el.style.height = `min(${heightVh}vh, 900px)`;
      el.style.minHeight = "420px";
    }

    // Require WebGL2 (GLSL 300 es). If missing, degrade gracefully.
    const gl = el.appendChild(document.createElement("canvas"))
      .getContext("webgl2", { antialias:true, alpha:true, premultipliedAlpha:false });
    if (!gl){ console.warn("[InterstellarBH] WebGL2 not available — fallback stays"); return; }
    const canvas = gl.canvas;
    canvas.style.position = "absolute"; canvas.style.inset = "0"; canvas.style.width = "100%"; canvas.style.height = "100%";
    canvas.setAttribute("aria-hidden","true");

    const prog = makeProgram(gl, VERT, FRAG); gl.useProgram(prog);
    const vao = gl.createVertexArray && gl.createVertexArray(); if (vao) gl.bindVertexArray(vao);

    const u_res   = gl.getUniformLocation(prog, "u_res");
    const u_time  = gl.getUniformLocation(prog, "u_time");
    const u_mouse = gl.getUniformLocation(prog, "u_mouse");
    const u_acc   = gl.getUniformLocation(prog, "u_accent");
    const u_beam  = gl.getUniformLocation(prog, "u_beam");
    const u_lens  = gl.getUniformLocation(prog, "u_lens");
    const u_speed = gl.getUniformLocation(prog, "u_speed");
    const u_dIn   = gl.getUniformLocation(prog, "u_diskIn");
    const u_dOut  = gl.getUniformLocation(prog, "u_diskOut");

    const [ar, ag, ab] = hexToRgb(accent); gl.uniform3f(u_acc, ar, ag, ab);
    gl.uniform1f(u_beam,  beamStrength);
    gl.uniform1f(u_lens,  lensStrength);
    gl.uniform1f(u_speed, speed);
    gl.uniform1f(u_dIn,   diskInner);
    gl.uniform1f(u_dOut,  diskOuter);

    // Quality → pixel ratio cap
    let cap = pixelRatioCap;
    if (quality === "high") cap = Math.max(cap, 2.0);
    if (quality === "low")  cap = Math.min(cap, 1.25);
    if (quality === "auto"){
      const mem = navigator.deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 4;
      if (mem >= 8 && cores >= 8) cap = Math.max(cap, 2.0);
      if (mem <= 4 || cores <= 4) cap = Math.min(cap, 1.25);
    }

    function resize(){
      const ratio = Math.min(cap, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(el.clientWidth  * ratio));
      const h = Math.max(1, Math.floor(el.clientHeight * ratio));
      if (canvas.width !== w || canvas.height !== h){ canvas.width = w; canvas.height = h; }
      gl.viewport(0,0,w,h);
      gl.uniform2f(u_res, float(w), float(h));
    }
    function float(v){ return v; }
    resize(); window.addEventListener("resize", resize);

    // Input
    let mouse = {x:0, y:0}, target = {x:0, y:0};
    function setTarget(x,y){
      target.x = (x / window.innerWidth) * 2 - 1;
      target.y = (y / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", (e)=> setTarget(e.clientX, e.clientY), { passive:true });
    window.addEventListener("touchmove", (e)=>{ const t = e.touches && e.touches[0]; if (t) setTarget(t.clientX, t.clientY); }, { passive:true });

    // Render
    let last = performance.now(), drop=0, paused=false, t=0;
    function tick(now){
      const dt = (now - last)/1000; last = now; t += dt;
      mouse.x += (target.x - mouse.x) * sensitivity;
      mouse.y += (target.y - mouse.y) * sensitivity;

      if (dt > 0.045) drop++; else drop = Math.max(0, drop-1);
      if (drop > 90){ cap = Math.max(1, cap - 0.25); drop = 0; resize(); }

      gl.uniform1f(u_time, t);
      gl.uniform2f(u_mouse, mouse.x, mouse.y);

      gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!paused) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
      if (!paused){ last = performance.now(); requestAnimationFrame(tick); }
    });

    // Pause when hero off-screen
    const io = new IntersectionObserver((entries)=>{
      for (const ent of entries){
        paused = !ent.isIntersecting;
        if (!paused){ last = performance.now(); requestAnimationFrame(tick); }
      }
    }, { threshold: 0.05 });
    io.observe(el);

    // Tiny controls (optional)
    if (controls){
      const panel = document.createElement("div");
      panel.style.cssText = "position:absolute;right:12px;bottom:12px;z-index:5;font:12px system-ui,Segoe UI,Roboto,Arial;color:#cbd5e1;background:#0b1220cc;border:1px solid #ffffff22;border-radius:10px;padding:8px 10px;backdrop-filter:blur(8px)";
      panel.setAttribute("role","region"); panel.setAttribute("aria-label","Black hole controls");
      panel.innerHTML = `
        <style>
          .bhc-row{display:flex;align-items:center;gap:6px;margin:6px 0}
          .bhc-row label{min-width:88px;color:#9fb0c6}
          .bhc-row input[type=range]{width:130px}
          .bhc-row select,.bhc-row input{background:#0f1629;border:1px solid #ffffff22;color:#e7eaf0;border-radius:6px;padding:3px 6px}
        </style>
        <div class="bhc-row"><label>Quality</label>
          <select id="bhc-q"><option>low</option><option selected>auto</option><option>high</option></select>
        </div>
        <div class="bhc-row"><label>Beaming</label><input id="bhc-beam" type="range" min="0.5" max="0.9" step="0.01" value="${beamStrength}"></div>
        <div class="bhc-row"><label>Lensing</label><input id="bhc-lens" type="range" min="0.6" max="1.2" step="0.01" value="${lensStrength}"></div>
        <div class="bhc-row"><label>Speed</label><input id="bhc-speed" type="range" min="0.6" max="1.6" step="0.01" value="${speed}"></div>
        <div class="bhc-row"><label>Disk In</label><input id="bhc-in" type="range" min="1.0" max="1.6" step="0.01" value="${diskInner}"></div>
        <div class="bhc-row"><label>Disk Out</label><input id="bhc-out" type="range" min="2.6" max="3.8" step="0.01" value="${diskOuter}"></div>
      `;
      el.appendChild(panel);

      const qSel = panel.querySelector("#bhc-q"); qSel.value = quality;
      qSel.addEventListener("change", ()=>{
        const v = qSel.value;
        if (v==="high") cap = Math.max(pixelRatioCap, 2.0);
        if (v==="low")  cap = Math.min(pixelRatioCap, 1.25);
        if (v==="auto"){
          const mem = navigator.deviceMemory || 4;
          const cores = navigator.hardwareConcurrency || 4;
          cap = pixelRatioCap;
          if (mem >= 8 && cores >= 8) cap = Math.max(cap, 2.0);
          if (mem <= 4 || cores <= 4) cap = Math.min(cap, 1.25);
        }
        resize();
      });
      panel.querySelector("#bhc-beam").addEventListener("input", (e)=> gl.uniform1f(u_beam, parseFloat(e.target.value)));
      panel.querySelector("#bhc-lens").addEventListener("input", (e)=> gl.uniform1f(u_lens, parseFloat(e.target.value)));
      panel.querySelector("#bhc-speed").addEventListener("input", (e)=> gl.uniform1f(u_speed, parseFloat(e.target.value)));
      panel.querySelector("#bhc-in").addEventListener("input", (e)=> gl.uniform1f(u_dIn, parseFloat(e.target.value)));
      panel.querySelector("#bhc-out").addEventListener("input", (e)=> gl.uniform1f(u_dOut, parseFloat(e.target.value)));
    }
  }

  global.InterstellarBH = { mount };
})(window);
