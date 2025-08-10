
/*! Hyperreal Black Hole Hero — Pure WebGL (no dependencies)
 *  Author: GPT-5 Thinking (for Divyanshu / NovaXTritan)
 *  API:   window.BlackHoleHero.mount({ selector:"#bh-hero", accent:"#64ffda", heightVh:78, pixelRatioCap:1.5, forceMotion:false })
 *  Notes: Decorative only. Degrades for reduced-motion. Works offline.
 */
(function (global){
  function makeShader(gl, type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      console.error("[BH] Shader compile error:", gl.getShaderInfoLog(sh));
      throw new Error("shader compile");
    }
    return sh;
  }
  function makeProgram(gl, vsSrc, fsSrc){
    const vs = makeShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = makeShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      console.error("[BH] Program link error:", gl.getProgramInfoLog(prog));
      throw new Error("program link");
    }
    return prog;
  }

  const VERT = `#version 300 es
  precision highp float;
  out vec2 vUv;
  void main(){
    // Fullscreen triangle
    vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    vUv = pos;
    gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
  }`;

  const FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 frag;

  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_mouse;   // normalized [-1,1]
  uniform vec3 u_accent;

  // hash & noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.,0.));
    float c = hash(i + vec2(0.,1.));
    float d = hash(i + vec2(1.,1.));
    vec2 u = f * f * (3. - 2. * f);
    return mix(a,b,u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
  }
  mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

  void main(){
    // Normalized coords centered
    vec2 uv = vUv;
    vec2 p = (uv * 2.0 - 1.0);
    p.x *= u_res.x / u_res.y; // correct aspect

    // Mouse-driven orientation and parallax
    vec2 m = u_mouse; // [-1,1]
    float tiltX = -m.y * 0.25;
    float tiltY =  m.x * 0.35;
    p *= rot(tiltY * 0.25);

    // Background starfield (cheap, layered)
    float stars = 0.0;
    vec2 sp = p * 2.0 + vec2(u_time * 0.01, 0.0);
    for (int i=0;i<3;i++){
      float layer = smoothstep(0.85, 1.0, noise(sp * (3.0 + float(i)*1.7)));
      stars += layer * (0.2 + float(i)*0.15);
      sp *= 1.7;
    }
    stars *= 0.25;

    // Black hole parameters
    float r = length(p);
    float horizon = 0.22;        // event horizon radius
    float photonR = 0.27;        // photon ring radius (Einstein ring)
    float diskInner = 0.45;      // accretion disk inner
    float diskOuter = 0.88;      // accretion disk outer

    // Accretion disk with swirl + noise
    vec2 q = p;
    q *= rot(tiltX * 0.6);
    float ang = atan(q.y, q.x);
    float swirl = ang * 4.0 + u_time * 1.2;
    float band = 0.55 + 0.45 * sin(swirl + noise(vec2(swirl * 0.35, 0.0)) * 2.0);
    float ringMask = smoothstep(diskInner, diskInner+0.08, r) * smoothstep(diskOuter, diskOuter-0.1, r);
    float disk = band * ringMask;

    // Einstein ring (anisotropic; leans toward mouse)
    float orient = atan(m.y, m.x + 1e-5);
    vec2 pr = p * rot(-orient);
    pr.x *= 1.0 + length(m) * 0.45; // stretch toward cursor
    pr.y *= 1.0 - length(m) * 0.15;
    float rr = length(pr);
    float ring = smoothstep(photonR-0.01, photonR, rr) * smoothstep(photonR+0.08, photonR+0.02, rr);

    // Gravitational lensing glow (soft halo)
    float lens = smoothstep(horizon+0.05, photonR+0.2, r) * (1.0 - smoothstep(photonR+0.2, photonR+0.55, r));

    // Compose color
    vec3 space = vec3(0.02, 0.05, 0.12) + stars * vec3(0.7,0.8,1.0);
    vec3 accCol = mix(vec3(0.06,0.12,0.30), u_accent, 0.65 + 0.35*band);
    vec3 ringCol = u_accent;
    vec3 col = space;
    col += accCol * disk * 0.95;
    col += ringCol * ring * 0.6;
    col += ringCol * lens * 0.08;

    // Event horizon punch-out (near pure black)
    float hole = smoothstep(horizon, horizon-0.01, r);
    col = mix(vec3(0.0), col, hole);

    // Subtle vignette
    float vig = smoothstep(1.2, 0.1, r);
    col *= mix(0.85, 1.0, vig);

    frag = vec4(col, 1.0);
  }`;

  function mount(opts){
    const {
      selector = "#bh-hero",
      accent = "#64ffda",
      pixelRatioCap = 1.5,
      heightVh = 78,
      forceMotion = false,
    } = (opts || {});

    const el = document.querySelector(selector);
    if(!el){ console.warn("[BH] container not found:", selector); return; }

    // Reduced motion?
    const urlParams = new URLSearchParams(location.search);
    const motionOverride = urlParams.get("motion") === "on";
    const reduce = !forceMotion && !motionOverride &&
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduce){
      // Keep CSS fallback visible
      console.info("[BH] Reduced motion: using CSS fallback");
      return;
    }

    // Canvas
    if (!el.style.height){
      el.style.height = `min(${heightVh}vh, 900px)`;
      el.style.minHeight = "420px";
    }
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    el.appendChild(canvas);

    // GL
    const gl = canvas.getContext("webgl2", { antialias:true, alpha:true, premultipliedAlpha:false }) ||
               canvas.getContext("webgl",  { antialias:true, alpha:true, premultipliedAlpha:false });
    if (!gl){
      console.warn("[BH] No WebGL: fallback CSS stays");
      return;
    }

    // Program
    const prog = makeProgram(gl, VERT, FRAG);
    gl.useProgram(prog);

    // Buffer (fullscreen triangle: no VBO needed in GL3; keep basic for compatibility)
    const vao = gl.createVertexArray && gl.createVertexArray();
    if (vao) gl.bindVertexArray(vao);

    // Uniforms
    const u_res = gl.getUniformLocation(prog, "u_res");
    const u_time = gl.getUniformLocation(prog, "u_time");
    const u_mouse = gl.getUniformLocation(prog, "u_mouse");
    const u_accent = gl.getUniformLocation(prog, "u_accent");

    // Parse accent color hex to rgb
    function hexToRgb(hex){
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] : [0.39, 1.0, 0.85];
    }
    const [ar, ag, ab] = hexToRgb(accent);
    gl.uniform3f(u_accent, ar, ag, ab);

    // Mouse
    let mouse = {x:0, y:0};
    function onMove(e){
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouse.x += (x - mouse.x) * 0.15;
      mouse.y += (y - mouse.y) * 0.15;
    }
    window.addEventListener("pointermove", onMove, { passive:true });

    // Resize
    function resize(){
      const ratio = Math.min(pixelRatioCap, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(el.clientWidth  * ratio));
      const h = Math.max(1, Math.floor(el.clientHeight * ratio));
      if (canvas.width !== w || canvas.height !== h){
        canvas.width = w; canvas.height = h;
      }
      gl.viewport(0,0, w,h);
      gl.uniform2f(u_res, float(w), float(h));
    }
    function float(v){ return v; }
    resize();
    window.addEventListener("resize", resize);

    // Render loop with FPS self-throttle
    let last = performance.now(), drop = 0, paused = false, t = 0;
    function tick(now){
      const dt = (now - last)/1000; last = now; t += dt;
      if (dt > 0.045) drop++; else drop = Math.max(0, drop-1);
      if (drop > 90){
        // reduce backing resolution a bit
        const newCap = Math.max(1, pixelRatioCap - 0.25);
        if (newCap !== pixelRatioCap){ opts.pixelRatioCap = newCap; }
        drop = 0; resize();
      }

      gl.uniform1f(u_time, t);
      gl.uniform2f(u_mouse, mouse.x, mouse.y);

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!paused) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
      if (!paused){ last = performance.now(); requestAnimationFrame(tick); }
    });
  }

  global.BlackHoleHero = { mount };
})(window);
