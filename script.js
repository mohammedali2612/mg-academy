/**
 * MG Academy - Interactive JavaScript
 * Premium animations, navigation, category filter tabs, modals, and confetti celebration
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCourseTabs();
  initScrollReveal();
  initHeroAnimation();
  initModals();
  initFormsAndConfetti();
  initSkiper30Parallax();
  initStatsCounter();
  initPeekAdmissionButton();
  initHeroSlideshow();
  initGenerateButtons();
});

/* ==========================================================================
   1. NAVBAR & NAVIGATION
   ========================================================================== */
function initNavbar() {
  const header = document.getElementById('header');
  const navList = document.getElementById('nav-list');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  const spotlightGlow = document.getElementById('nav-spotlight-glow');
  const spotlightPill = document.getElementById('nav-spotlight-pill');
  const sections = document.querySelectorAll('main section[id], #home, #about, #courses, #dance, #gallery, #achievements, #fees, #contact');

  let isNavHovered = false;

  // ---------------- Spotlight Navbar Effect (Desktop Only) ----------------
  function moveSpotlightPill(targetLink) {
    if (window.innerWidth <= 992) {
      if (spotlightPill) spotlightPill.classList.remove('visible');
      return;
    }
    if (!spotlightPill || !navList || !targetLink) return;
    const listRect = navList.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();
    const left = linkRect.left - listRect.left;
    const width = linkRect.width;

    spotlightPill.style.transform = `translateX(${left}px)`;
    spotlightPill.style.width = `${width}px`;
    spotlightPill.classList.add('visible');
  }

  function getActiveLink() {
    return document.querySelector('.nav-link.active') || navLinks[0];
  }

  if (navList) {
    // Dynamic cursor spotlight tracking
    navList.addEventListener('mousemove', (e) => {
      const rect = navList.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      navList.style.setProperty('--spotlight-x', `${x}px`);
      navList.style.setProperty('--spotlight-y', `${y}px`);
    });

    // Hover moves spotlight pill smoothly to hovered link
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        isNavHovered = true;
        moveSpotlightPill(link);
      });
    });

    // Leaving nav smoothly returns spotlight pill to active link
    navList.addEventListener('mouseleave', () => {
      isNavHovered = false;
      moveSpotlightPill(getActiveLink());
    });

    // Initial positioning after layout renders
    setTimeout(() => {
      moveSpotlightPill(getActiveLink());
    }, 120);

    window.addEventListener('resize', () => {
      moveSpotlightPill(getActiveLink());
    });
  }

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ScrollSpy active link update
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      let activeChanged = false;
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentId}`) {
          if (!link.classList.contains('active')) {
            link.classList.add('active');
            activeChanged = true;
            if (!isNavHovered) {
              moveSpotlightPill(link);
            }
          }
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('open')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }
}

/* ==========================================================================
   2. CATEGORY FILTER TABS (GooeyNav WebGL2 Liquid Metaballs & Course Filter)
   ========================================================================== */
function initCourseTabs() {
  const container = document.getElementById('category-gooey-nav');
  const stage = document.getElementById('category-gooey-stage');
  const canvas = document.getElementById('category-gooey-canvas');
  const list = document.getElementById('category-gooey-list');
  const overlay = document.getElementById('category-gooey-overlay');
  const fallback = document.getElementById('category-gooey-fallback');
  const courseCards = document.querySelectorAll('.course-card');

  if (!container || !stage || !list || !courseCards.length) return;

  function filterCards(category) {
    courseCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || !category || cardCat === category || cardCat.includes(category)) {
        card.style.display = 'flex';
        card.classList.remove('hidden-card');
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
        }, 30);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px) scale(0.97)';
        setTimeout(() => {
          card.style.display = 'none';
          card.classList.add('hidden-card');
        }, 220);
      }
    });
  }

  // WebGL2 Gooey Engine
  const MAX_DROPS = 32;
  const MAX_PILLS = 4;
  const MARGIN = 72;

  const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

  const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uSize;
uniform float uRatio;
uniform vec4 uPills[${MAX_PILLS}];
uniform vec4 uHover;
uniform vec4 uDrops[${MAX_DROPS}];
uniform vec2 uTails[${MAX_DROPS}];
uniform vec3 uTints[${MAX_DROPS}];
uniform int uCount;
uniform float uSmooth;
uniform vec3 uPill;
uniform vec4 uHoverColor;
uniform float uShadow;

out vec4 outColor;

float sdPill(vec2 p, vec4 box) {
  vec2 extent = max(box.zw, vec2(0.0));
  float r = min(extent.x, extent.y);
  vec2 q = abs(p - box.xy) - extent + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

vec4 blend(vec4 a, vec4 b, float k) {
  float h = clamp(0.5 + 0.5 * (b.w - a.w) / k, 0.0, 1.0);
  return vec4(mix(b.rgb, a.rgb, h), mix(b.w, a.w, h) - k * h * (1.0 - h));
}

vec4 field(vec2 p) {
  vec4 shape = vec4(uPill, 1e5);
  for (int i = 0; i < ${MAX_PILLS}; i++) {
    vec4 pill = uPills[i];
    if (pill.z <= 0.0) continue;
    shape = blend(shape, vec4(uPill, sdPill(p, pill)), uSmooth);
  }
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    if (i >= uCount) break;
    vec4 drop = uDrops[i];
    if (drop.z <= 0.0) continue;
    float d = sdCapsule(p, drop.xy, drop.xy - uTails[i], drop.z);
    if (d > shape.w + uSmooth) continue;
    shape = blend(shape, vec4(uTints[i], d), uSmooth);
  }
  return shape;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uRatio - gl_FragCoord.y) / uRatio;
  vec4 shape = field(p);
  float d = shape.w;
  float aa = max(fwidth(d), 0.35);
  float body = clamp(0.5 - d / aa, 0.0, 1.0);

  vec2 grad = vec2(dFdx(d), -dFdy(d));
  vec2 n = length(grad) > 0.0001 ? normalize(grad) : vec2(0.0, 1.0);
  float rim = (1.0 - smoothstep(0.0, 1.6, -d)) * max(0.0, -n.y) * 0.3;
  vec3 fill = mix(shape.rgb, vec3(1.0), rim) * (1.0 - 0.06 * max(0.0, n.y) * (1.0 - smoothstep(0.0, 6.0, -d)));

  float lifted = field(p - vec2(0.0, 3.0)).w;
  float shadow = (1.0 - smoothstep(-3.0, 9.0, lifted)) * uShadow * (1.0 - body);

  float hover = clamp(0.5 - sdPill(p, uHover) / aa, 0.0, 1.0) * uHoverColor.a;

  vec4 color = vec4(0.0, 0.0, 0.0, shadow);
  color = vec4(uHoverColor.rgb * hover, hover) + color * (1.0 - hover);
  color = vec4(fill * body, body) + color * (1.0 - body);
  outColor = color;
}
`;

  function parseColor(value) {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(value).trim());
    if (match) {
      const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];
      return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).concat(1);
    }
    const rgba = /rgba?\(([^)]+)\)/i.exec(String(value));
    if (rgba) {
      const parts = rgba[1].split(',').map(part => parseFloat(part));
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255, parts[3] ?? 1];
    }
    return [1, 1, 1, 1];
  }

  const clamp01 = value => Math.min(1, Math.max(0, value));

  const travelEase = t => {
    const x = clamp01(t);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  const bezier = (a, b, c, d, t) => {
    const u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  };

  const pillPath = (x, y, w, h) => {
    if (w <= 0.5 || h <= 0.5) return '';
    const r = Math.min(w, h) / 2;
    return `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
  };

  const compile = (glCtx, type, source) => {
    const shader = glCtx.createShader(type);
    glCtx.shaderSource(shader, source);
    glCtx.compileShader(shader);
    if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
      glCtx.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const UNIFORMS = [
    'uSize',
    'uRatio',
    'uPills',
    'uHover',
    'uDrops',
    'uTails',
    'uTints',
    'uCount',
    'uSmooth',
    'uPill',
    'uHoverColor',
    'uShadow'
  ];

  const build = glCtx => {
    const vs = compile(glCtx, glCtx.VERTEX_SHADER, VERTEX);
    const fs = compile(glCtx, glCtx.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return null;
    const program = glCtx.createProgram();
    glCtx.attachShader(program, vs);
    glCtx.attachShader(program, fs);
    glCtx.linkProgram(program);
    if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
      glCtx.deleteProgram(program);
      return null;
    }
    const uniforms = Object.fromEntries(UNIFORMS.map(name => [name, glCtx.getUniformLocation(program, name)]));
    const buffer = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffer);
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), glCtx.STATIC_DRAW);
    return { program, uniforms, buffer, position: glCtx.getAttribLocation(program, 'aPosition') };
  };

  const settings = {
    animationTime: 620,
    particleCount: 16,
    timeVariance: 260,
    spread: 54,
    gooeyness: 0.5,
    wobble: 0.5,
    hoverEffect: true,
    pillRgb: parseColor('#005A9C'),
    tints: [parseColor('#60C1E5'), parseColor('#A0E0EF'), parseColor('#005A9C')],
    hoverRgb: [0, 90 / 255, 156 / 255, 0.08],
    shadow: 0.18
  };

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gl = null;
  try {
    gl = canvas ? canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false }) : null;
  } catch (err) {
    gl = null;
  }
  const pipeline = gl ? build(gl) : null;

  if (fallback) fallback.style.display = pipeline ? 'none' : 'block';
  if (canvas) canvas.style.display = pipeline ? 'block' : 'none';

  const view = { width: 0, height: 0 };
  let rects = [];
  let target = 0;
  const pills = new Map();
  const drops = [];
  const hover = { x: 0, y: 0, w: 0, h: 0, alpha: 0, index: -1 };
  const pillData = new Float32Array(MAX_PILLS * 4);
  const dropData = new Float32Array(MAX_DROPS * 4);
  const tailData = new Float32Array(MAX_DROPS * 2);
  const tintData = new Float32Array(MAX_DROPS * 3);
  let raf = 0;
  let last = 0;

  const isMobile = () => window.innerWidth <= 768;

  const measure = () => {
    if (!stage || !list) return;
    if (isMobile()) {
      if (canvas) canvas.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
      if (fallback) fallback.style.display = 'none';
      return;
    }
    const box = stage.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    view.width = box.width;
    view.height = box.height;
    const outerWidth = box.width + MARGIN * 2;
    const outerHeight = box.height + MARGIN * 2;
    if (canvas) {
      canvas.style.display = pipeline ? 'block' : 'none';
      Object.assign(canvas.style, {
        left: `${-MARGIN}px`,
        top: `${-MARGIN}px`,
        width: `${outerWidth}px`,
        height: `${outerHeight}px`
      });
      const width = Math.max(1, Math.round(outerWidth * ratio));
      const height = Math.max(1, Math.round(outerHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    if (overlay) overlay.style.display = 'block';
    rects = Array.from(list.children).map(item => {
      const rect = item.getBoundingClientRect();
      return { x: rect.left - box.left, y: rect.top - box.top, w: rect.width, h: rect.height };
    });
  };

  const trace = (boxes, blobs, smooth) => {
    const field = (x, y) => {
      let d = 1e5;
      const merge = value => {
        const h = clamp01(0.5 + (0.5 * (value - d)) / smooth);
        d = value + (d - value) * h - smooth * h * (1 - h);
      };
      for (const box of boxes) {
        const r = Math.min(box.hw, box.hh);
        const qx = Math.abs(x - box.cx) - box.hw + r;
        const qy = Math.abs(y - box.cy) - box.hh + r;
        merge(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r);
      }
      for (const blob of blobs) {
        const px = x - blob.x;
        const py = y - blob.y;
        const bx = -blob.tx;
        const by = -blob.ty;
        const span = bx * bx + by * by;
        const h = span > 0.0001 ? clamp01((px * bx + py * by) / span) : 0;
        const value = Math.hypot(px - bx * h, py - by * h) - blob.r;
        if (value > d + smooth) continue;
        merge(value);
      }
      return d;
    };
    const step = 2;
    const parts = [];
    for (let y = 0; y < view.height; y += 1) {
      const cy = y + 0.5;
      let previous = field(0, cy);
      let start = previous < 0 ? 0 : null;
      for (let x = step; x <= view.width + step; x += step) {
        const value = field(Math.min(x, view.width), cy);
        if (previous < 0 !== value < 0) {
          const cross = x - step + (step * previous) / (previous - value);
          if (value < 0) start = cross;
          else if (start !== null) {
            parts.push(`M${start.toFixed(1)},${y}H${cross.toFixed(1)}V${y + 1}H${start.toFixed(1)}Z`);
            start = null;
          }
        }
        previous = value;
      }
      if (start !== null) parts.push(`M${start.toFixed(1)},${y}H${view.width}V${y + 1}H${start.toFixed(1)}Z`);
    }
    return parts.join('');
  };

  const pill = index => {
    if (!pills.has(index)) pills.set(index, { mass: 0, scale: 0, velocity: 0, outgoing: 0 });
    return pills.get(index);
  };

  const shape = (index, amount) => {
    const rect = rects[index];
    if (!rect || amount <= 0.002) return null;
    const h = rect.h * Math.min(1.08, 0.42 + 0.58 * Math.sqrt(Math.max(0, amount)));
    const w = Math.max(h, rect.w * Math.pow(Math.max(0, amount), 0.75));
    return { x: rect.x + rect.w / 2 - w / 2, y: rect.y + rect.h / 2 - h / 2, w, h };
  };

  const plan = (drop, index, now, fresh) => {
    const s = settings;
    const rect = rects[index];
    if (!rect) return;
    const reach = Math.max(0, s.spread);
    const ex = rect.x + rect.w / 2 + (Math.random() - 0.5) * rect.w * 0.45;
    const ey = rect.y + rect.h / 2 + (Math.random() - 0.5) * rect.h * 0.2;
    const base = Math.max(0.15, s.animationTime / 1000);
    const variance = (Math.random() - 0.5) * (Math.max(0, s.timeVariance) / 1000);
    const duration = Math.max(0.15, base * (0.62 + Math.random() * 0.32) + variance * 0.6);
    const out = Math.random() * Math.PI * 2;
    const into = Math.random() * Math.PI * 2;
    const burst = reach * (0.7 + Math.random() * 0.6);
    const swing = reach * (0.55 + Math.random() * 0.55);
    const carry = Math.min(duration / 3, 0.12);
    drop.index = index;
    drop.start = now;
    drop.duration = duration;
    drop.path = [
      drop.x,
      drop.y,
      fresh ? drop.x + Math.cos(out) * burst * 1.6 : drop.x + drop.vx * carry,
      fresh ? drop.y + Math.sin(out) * burst * 1.6 : drop.y + drop.vy * carry,
      ex + Math.cos(into) * swing * 1.5,
      ey + Math.sin(into) * swing * 1.5,
      ex,
      ey
    ];
  };

  const emit = (from, to, now) => {
    const s = settings;
    const source = pills.get(from);
    const rect = rects[from];
    if (!source || !rect || !rects[to]) return;
    const available = source.mass - source.outgoing;
    if (available <= 0.002) return;
    const room = MAX_DROPS - drops.length;
    const count = Math.min(room, Math.max(1, Math.round(Math.max(1, s.particleCount) * available)));
    if (count <= 0) return;
    const windowTime = Math.max(0.15, s.animationTime / 1000) * 0.16;
    for (let i = 0; i < count; i++) {
      const mass = available / count;
      source.outgoing += mass;
      drops.push({
        x: rect.x + rect.w / 2 + (Math.random() - 0.5) * rect.w * 0.6,
        y: rect.y + rect.h / 2 + (Math.random() - 0.5) * rect.h * 0.3,
        vx: 0,
        vy: 0,
        mass,
        size: 0.8 + Math.random() * 0.4,
        given: 0,
        source: from,
        index: to,
        leave: now + Math.random() * windowTime * 1000,
        emerged: 0,
        absorbed: 0,
        state: 'waiting',
        tint: s.tints.length ? s.tints[Math.floor(Math.random() * s.tints.length)] : null
      });
    }
  };

  const render = () => {
    if (isMobile()) return;
    const s = settings;
    const height = rects[target]?.h ?? rects[0]?.h ?? 36;
    const smooth = height * (0.18 + 0.5 * clamp01(s.gooeyness));
    const boxes = [];
    const blobs = [];
    for (const [index, state] of pills) {
      const box = shape(index, state.scale);
      if (box) boxes.push({ cx: box.x + box.w / 2, cy: box.y + box.h / 2, hw: box.w / 2, hh: box.h / 2 });
    }
    for (const drop of drops) {
      if (drop.state === 'waiting') continue;
      const radius = 0.26 * height * drop.size * Math.min(drop.emerged, 1 - drop.absorbed);
      if (radius <= 0.05) continue;
      const speed = Math.hypot(drop.vx, drop.vy);
      const length = Math.min(radius * 1.1, speed * 0.018);
      blobs.push({
        x: drop.x,
        y: drop.y,
        r: radius,
        tx: speed > 0.01 ? (drop.vx / speed) * length : 0,
        ty: speed > 0.01 ? (drop.vy / speed) * length : 0,
        tint: drop.tint
      });
    }

    const settledPill = boxes.length === 1 && !blobs.length;
    if (overlay) {
      if (settledPill) {
        const box = boxes[0];
        overlay.style.clipPath = `path('${pillPath(box.cx - box.hw, box.cy - box.hh, box.hw * 2, box.hh * 2)}')`;
      } else {
        overlay.style.clipPath = `path('${trace(boxes, blobs, smooth) || 'M0,0Z'}')`;
      }
      overlay.style.visibility = 'visible';
    }

    if (!pipeline || !gl) {
      const box = shape(target, 1);
      if (fallback && box) {
        fallback.style.transform = `translate(${box.x.toFixed(2)}px, ${box.y.toFixed(2)}px)`;
        fallback.style.width = `${box.w}px`;
        fallback.style.height = `${box.h}px`;
        fallback.style.opacity = '1';
      }
      return;
    }

    let slot = 0;
    for (const box of boxes) {
      if (slot >= MAX_PILLS) break;
      pillData[slot * 4] = box.cx + MARGIN;
      pillData[slot * 4 + 1] = box.cy + MARGIN;
      pillData[slot * 4 + 2] = box.hw;
      pillData[slot * 4 + 3] = box.hh;
      slot += 1;
    }
    pillData.fill(0, slot * 4);
    let count = 0;
    for (const blob of blobs) {
      if (count >= MAX_DROPS) break;
      dropData[count * 4] = blob.x + MARGIN;
      dropData[count * 4 + 1] = blob.y + MARGIN;
      dropData[count * 4 + 2] = blob.r;
      dropData[count * 4 + 3] = 0;
      tailData[count * 2] = blob.tx;
      tailData[count * 2 + 1] = blob.ty;
      const tint = blob.tint || s.pillRgb;
      tintData[count * 3] = tint[0];
      tintData[count * 3 + 1] = tint[1];
      tintData[count * 3 + 2] = tint[2];
      count += 1;
    }

    const { program, uniforms, buffer, position } = pipeline;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uniforms.uSize, view.width + MARGIN * 2, view.height + MARGIN * 2);
    gl.uniform1f(uniforms.uRatio, canvas.width / Math.max(1, view.width + MARGIN * 2));
    gl.uniform4fv(uniforms.uPills, pillData);
    gl.uniform4f(uniforms.uHover, hover.x + MARGIN, hover.y + MARGIN, hover.w / 2, hover.h / 2);
    gl.uniform4fv(uniforms.uDrops, dropData);
    gl.uniform2fv(uniforms.uTails, tailData);
    gl.uniform3fv(uniforms.uTints, tintData);
    gl.uniform1i(uniforms.uCount, count);
    gl.uniform1f(uniforms.uSmooth, smooth);
    gl.uniform3f(uniforms.uPill, s.pillRgb[0], s.pillRgb[1], s.pillRgb[2]);
    gl.uniform4f(uniforms.uHoverColor, s.hoverRgb[0], s.hoverRgb[1], s.hoverRgb[2], s.hoverRgb[3] * hover.alpha);
    gl.uniform1f(uniforms.uShadow, s.shadow);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const frame = now => {
    raf = 0;
    const s = settings;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    const emergeTime = 0.09;
    const absorbTime = 0.12;

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      if (drop.state === 'waiting') {
        if (now < drop.leave) continue;
        drop.state = 'flying';
        plan(drop, drop.index, now, true);
      }
      if (drop.state === 'flying') {
        drop.emerged = Math.min(1, drop.emerged + dt / emergeTime);
        const source = pills.get(drop.source);
        if (source && drop.given < drop.mass) {
          const step = Math.min(drop.mass * (dt / emergeTime), drop.mass - drop.given);
          source.mass = Math.max(0, source.mass - step);
          source.outgoing = Math.max(0, source.outgoing - step);
          drop.given += step;
        }
        const t = clamp01((now - drop.start) / 1000 / drop.duration);
        const eased = travelEase(t);
        const [x0, y0, x1, y1, x2, y2, x3, y3] = drop.path;
        const x = bezier(x0, x1, x2, x3, eased);
        const y = bezier(y0, y1, y2, y3, eased);
        if (dt > 0) {
          drop.vx = (x - drop.x) / dt;
          drop.vy = (y - drop.y) / dt;
        }
        drop.x = x;
        drop.y = y;
        if (t >= 1) drop.state = 'absorbing';
      }
      if (drop.state === 'absorbing') {
        const step = Math.min(1 - drop.absorbed, dt / absorbTime);
        drop.absorbed += step;
        drop.vx *= 0.8;
        drop.vy *= 0.8;
        const host = pill(drop.index);
        host.mass = Math.min(1, host.mass + drop.mass * step);
        if (drop.absorbed >= 1) drops.splice(i, 1);
      }
    }

    const zeta = reduced ? 1 : 1 - 0.72 * clamp01(s.wobble);
    const omega = 26;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (const [index, state] of pills) {
      for (let n = 0; n < steps; n++) {
        state.velocity += (omega * omega * (state.mass - state.scale) - 2 * zeta * omega * state.velocity) * h;
        state.scale += state.velocity * h;
      }
      if (index !== target && state.mass <= 0.002 && state.outgoing <= 0.002 && Math.abs(state.scale) < 0.004) {
        pills.delete(index);
      }
    }

    if (hover.index >= 0 && rects[hover.index]) {
      const rect = rects[hover.index];
      const k = 1 - Math.exp(-dt / 0.06);
      hover.x += (rect.x + rect.w / 2 - hover.x) * k;
      hover.y += (rect.y + rect.h / 2 - hover.y) * k;
      hover.w += (rect.w - hover.w) * k;
      hover.h += (rect.h - hover.h) * k;
    }
    const hoverGoal = s.hoverEffect && hover.index >= 0 && hover.index !== target ? 1 : 0;
    hover.alpha += (hoverGoal - hover.alpha) * (1 - Math.exp(-dt / 0.08));

    render();

    const host = pills.get(target);
    const resting =
      drops.length === 0 &&
      pills.size === 1 &&
      host &&
      Math.abs(host.mass - host.scale) < 0.0008 &&
      Math.abs(host.velocity) < 0.004;
    const hoverRect = rects[hover.index];
    const hovering =
      Math.abs(hoverGoal - hover.alpha) > 0.003 ||
      (hoverRect && Math.abs(hoverRect.x + hoverRect.w / 2 - hover.x) + Math.abs(hoverRect.w - hover.w) > 0.1);
    if (!resting || hovering) raf = requestAnimationFrame(frame);
    else {
      host.mass = 1;
      host.scale = 1;
      host.velocity = 0;
      hover.alpha = hoverGoal;
      render();
    }
  };

  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const settle = index => {
    pills.clear();
    drops.length = 0;
    target = index;
    const state = pill(index);
    state.mass = 1;
    state.scale = 1;
    state.velocity = 0;
    render();
  };

  const go = (index, animate) => {
    if (index === target) return;
    if (isMobile() || !rects[index] || !animate || reduced || target < 0) {
      target = index;
      if (!isMobile()) settle(index);
      return;
    }
    const now = performance.now();
    target = index;
    pill(index);
    for (const drop of drops) {
      drop.index = index;
      if (drop.state === 'flying') plan(drop, index, now, false);
      if (drop.state === 'absorbing') {
        drop.state = 'flying';
        drop.mass *= 1 - drop.absorbed;
        drop.absorbed = 0;
        plan(drop, index, now, false);
      }
    }
    for (const from of [...pills.keys()]) {
      if (from !== index) emit(from, index, now);
    }
    wake();
  };

  const onOver = event => {
    if (isMobile()) return;
    const item = event.target.closest('[data-gooey-index]');
    if (!item || !list.contains(item)) return;
    const index = Number(item.dataset.gooeyIndex);
    const rect = rects[index];
    if (!rect) return;
    if (hover.alpha < 0.01) {
      hover.x = rect.x + rect.w / 2;
      hover.y = rect.y + rect.h / 2;
      hover.w = rect.w;
      hover.h = rect.h;
    }
    hover.index = index;
    wake();
  };

  const onLeave = () => {
    hover.index = -1;
    wake();
  };

  list.addEventListener('pointerover', onOver);
  list.addEventListener('pointerleave', onLeave);

  // Resize handling
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      measure();
      if (!drops.length) settle(target < 0 ? 0 : target);
      else render();
    });
    resizeObserver.observe(stage);
    resizeObserver.observe(list);
  } else {
    window.addEventListener('resize', () => {
      measure();
      settle(target < 0 ? 0 : target);
    });
  }

  // Click handling & category tabs synchronization
  const listItems = Array.from(list.children);
  listItems.forEach((item, index) => {
    const btn = item.querySelector('.category-tab-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedCategory = btn.getAttribute('data-category');

      // Update data-active attribute
      listItems.forEach(el => el.removeAttribute('data-active'));
      item.setAttribute('data-active', '');

      // Update active class on buttons
      document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Liquid gooey transition
      go(index, true);

      // Filter course cards
      filterCards(selectedCategory);

      // Ensure mobile smooth scrolling to center the clicked tab in view
      item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  // Initial measurement & settling on active index (0: All Programs)
  measure();
  settle(0);
}

/* ==========================================================================
   3. SCROLL REVEAL (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-scale-up');

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. HERO TEXT ANIMATION
   ========================================================================== */
function initHeroAnimation() {
  const heroLines = document.querySelectorAll('.hero-word-line');
  heroLines.forEach((line, index) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(25px)';
    line.style.transition = `all 0.8s cubic-bezier(0.2, 0.9, 0.3, 1.2) ${index * 0.25 + 0.1}s`;
    
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    }, 150);
  });
}

/* ==========================================================================
   5. MODALS (Admission Modal & Lightbox)
   ========================================================================== */
function initModals() {
  // Global modal escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAdmissionModal();
      closeLightbox();
    }
  });

  // Admission backdrop click
  const admissionModal = document.getElementById('admission-modal');
  if (admissionModal) {
    admissionModal.addEventListener('click', (e) => {
      if (e.target === admissionModal) {
        closeAdmissionModal();
      }
    });
  }

  // Lightbox backdrop click
  const lightboxModal = document.getElementById('lightbox-modal');
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }
}

// Global modal triggers for inline onclicks
window.openAdmissionModal = function(courseName = '') {
  const modal = document.getElementById('admission-modal');
  const courseSelect = document.getElementById('adm-course') || document.getElementById('modal-course-select');
  const successState = document.getElementById('modal-success-state');
  const formEl = document.getElementById('admission-form');

  if (courseSelect && courseName) {
    for (let i = 0; i < courseSelect.options.length; i++) {
      if (courseSelect.options[i].text.toLowerCase().includes(courseName.toLowerCase())) {
        courseSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (successState) successState.style.display = 'none';
  if (formEl) formEl.style.display = 'block';

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeAdmissionModal = function() {
  const modal = document.getElementById('admission-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.handleAdmissionSubmit = function(event) {
  if (event) event.preventDefault();
  const form = document.getElementById('admission-form');
  const childName = document.getElementById('adm-child-name')?.value || 'Little Artist';
  
  launchConfetti();
  alert(`🎉 Congratulations! Admission request for ${childName} has been received. Our team will contact you shortly to schedule your child's free trial class!`);
  
  if (form) form.reset();
  closeAdmissionModal();
};

window.openLightbox = function(imageSrc, caption = '') {
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCap = document.getElementById('lightbox-caption');

  if (lightbox && lightboxImg) {
    lightboxImg.src = imageSrc;
    if (lightboxCap) lightboxCap.textContent = caption || 'MG Academy Moment';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('lightbox-modal');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
};

/* ==========================================================================
   6. FORMS & CONFETTI SYSTEM
   ========================================================================== */
function initFormsAndConfetti() {
  const admissionForm = document.getElementById('admission-form');
  const contactForm = document.getElementById('contact-form');

  if (admissionForm) {
    admissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const childName = document.getElementById('modal-child-name')?.value || 'Little Artist';
      const submitBtn = admissionForm.querySelector('button[type="submit"]');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
      }

      setTimeout(() => {
        // Trigger celebratory confetti
        launchConfetti();

        admissionForm.style.display = 'none';
        const successBox = document.getElementById('modal-success-state');
        const successName = document.getElementById('success-child-name');
        
        if (successName) successName.textContent = childName;
        if (successBox) successBox.style.display = 'block';

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Submit Admission Inquiry</span> <i class="fa-solid fa-paper-plane"></i>';
        }
        admissionForm.reset();
      }, 700);
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      }

      setTimeout(() => {
        launchConfetti();
        alert('🎉 Thank you for reaching out to MG Academy! Our academic coordinator will contact you shortly.');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Inquiry</span> <i class="fa-solid fa-paper-plane"></i>';
        }
      }, 700);
    });
  }
}

/**
 * Pure Vanilla Canvas Confetti Blast
 */
function launchConfetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#9D4EDD', '#4CC9F0', '#FFA07A'];
  const confettiCount = 120;
  const particles = [];

  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 15,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      alpha: 1
    });
  }

  let animationFrame;
  let startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.vRotation;

      if (elapsed > 1800) {
        p.alpha -= 0.02;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (elapsed < 3500) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

/* ==========================================================================
   7. SKIPER 30 PARALLAX GALLERY (Parallax_002 with Lenis Smooth Scroll)
   ========================================================================== */
function initSkiper30Parallax() {
  const gallery = document.getElementById('skiper30-gallery');
  if (!gallery) return;

  const col1 = document.getElementById('skiper-col-1');
  const col2 = document.getElementById('skiper-col-2');
  const col3 = document.getElementById('skiper-col-3');
  const col4 = document.getElementById('skiper-col-4');

  // Initialize Lenis smooth scroll if loaded
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis initialization skipped:', e);
    }
  }

  let ticking = false;

  function updateParallax() {
    // Normal gallery layout for mobile & tablet screens (<= 860px)
    if (window.innerWidth <= 860) {
      if (col1 && col1.style.transform) col1.style.transform = '';
      if (col2 && col2.style.transform) col2.style.transform = '';
      if (col3 && col3.style.transform) col3.style.transform = '';
      if (col4 && col4.style.transform) col4.style.transform = '';
      ticking = false;
      return;
    }

    const rect = gallery.getBoundingClientRect();
    const H = window.innerHeight;

    // Check if gallery is anywhere near the viewport
    if (rect.bottom >= -200 && rect.top <= H + 200) {
      // scrollYProgress matching offset: ["start end", "end start"]
      // 0 when gallery top enters bottom of viewport, 1 when gallery bottom leaves top of viewport
      const totalSpan = H + rect.height;
      const progress = (H - rect.top) / totalSpan;
      const clamped = Math.min(Math.max(progress, 0), 1);

      // Exact Skiper 30 transforms:
      // y  = scrollYProgress * (height * 2)
      // y2 = scrollYProgress * (height * 3.3)
      // y3 = scrollYProgress * (height * 1.25)
      // y4 = scrollYProgress * (height * 3)
      const y1 = clamped * (H * 2);
      const y2 = clamped * (H * 3.3);
      const y3 = clamped * (H * 1.25);
      const y4 = clamped * (H * 3);

      if (col1) col1.style.transform = `translate3d(0, ${y1.toFixed(2)}px, 0)`;
      if (col2) col2.style.transform = `translate3d(0, ${y2.toFixed(2)}px, 0)`;
      if (col3) col3.style.transform = `translate3d(0, ${y3.toFixed(2)}px, 0)`;
      if (col4) col4.style.transform = `translate3d(0, ${y4.toFixed(2)}px, 0)`;
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  if (lenis) {
    lenis.on('scroll', onScroll);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateParallax);
  
  // Initial run
  updateParallax();
}

/* ==========================================================================
   8. STATS COUNTER ANIMATION (Port of React Framer-Motion StatsCounter)
   ========================================================================== */
function initStatsCounter() {
  const counterElements = document.querySelectorAll('.stats-counter, [data-stats-counter]');
  if (!counterElements.length) return;

  // Critically damped spring / smooth ease-out matching:
  // useSpring(motionValue, { duration: duration * 1000, bounce: 0 })
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  function animateCounter(el) {
    const rawValue = el.getAttribute('data-value');
    if (rawValue === null) return;

    const targetValue = parseFloat(rawValue) || 0;
    const duration = (parseFloat(el.getAttribute('data-duration')) || 1.5) * 1000;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

    let startTime = null;

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = easedProgress * targetValue;

      el.textContent = `${prefix}${currentValue.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${targetValue.toFixed(decimals)}${suffix}`;
        el.classList.add('stats-counted');
      }
    }

    requestAnimationFrame(step);
  }

  // IntersectionObserver matching: useInView(ref, { once: true, margin: "-100px" })
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target); // once: true
      }
    });
  }, observerOptions);

  counterElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   9. INTERACTIVE PEEK-A-BOO EYE ADMISSION BUTTON (Port of CreepyButton)
   ========================================================================== */
function initPeekAdmissionButton() {
  const peekButtons = document.querySelectorAll('.peek-admission-btn, #header-admission-btn, .btn-creepy');
  if (!peekButtons.length) return;

  peekButtons.forEach(btn => {
    const eyesContainer = btn.querySelector('.peek-eyes');
    const pupils = btn.querySelectorAll('.peek-pupil');
    if (!eyesContainer || !pupils.length) return;

    // Vision limits matching React component
    const visionRangeX = 180;
    const visionRangeY = 75;

    function updateEyes(e) {
      const userEvent = e.touches && e.touches.length ? e.touches[0] : e;
      const eyesRect = eyesContainer.getBoundingClientRect();
      const eyesCenter = {
        x: eyesRect.left + eyesRect.width / 2,
        y: eyesRect.top + eyesRect.height / 2
      };

      const dx = userEvent.clientX - eyesCenter.x;
      const dy = userEvent.clientY - eyesCenter.y;
      const angle = Math.atan2(-dy, dx) + Math.PI / 2;
      const distance = Math.hypot(dx, dy);

      // Normalized eye deflection matching Framer Motion transform
      const x = (Math.sin(angle) * Math.min(distance, visionRangeX)) / visionRangeX;
      const y = (Math.cos(angle) * Math.min(distance, visionRangeY)) / visionRangeY;

      pupils.forEach(pupil => {
        pupil.style.transform = `translate(calc(-50% + ${(x * 50).toFixed(2)}%), calc(-50% + ${(y * 50).toFixed(2)}%))`;
      });
    }

    function resetEyes() {
      pupils.forEach(pupil => {
        pupil.style.transform = 'translate(-50%, -50%)';
      });
      btn.classList.remove('is-hovered');
    }

    btn.addEventListener('mousemove', (e) => {
      btn.classList.add('is-hovered');
      updateEyes(e);
    });

    btn.addEventListener('touchmove', (e) => {
      btn.classList.add('is-hovered');
      updateEyes(e);
    }, { passive: true });

    btn.addEventListener('mouseleave', resetEyes);
    btn.addEventListener('touchend', resetEyes);
    btn.addEventListener('focus', () => btn.classList.add('is-hovered'));
    btn.addEventListener('blur', resetEyes);

    // Global cursor tracking when near button
    window.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dist = Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2));
      if (dist < 450) {
        updateEyes(e);
      }
    }, { passive: true });
  });
}

/* ==========================================================================
   10. HERO PHOTO SLIDESHOW (Rotates every 3 seconds from ./photos)
   ========================================================================== */
function initHeroSlideshow() {
  const container = document.getElementById('hero-slideshow-container');
  const slide1 = document.getElementById('hero-slide-1');
  const slide2 = document.getElementById('hero-slide-2');
  const counterEl = document.getElementById('hero-slideshow-counter');
  if (!container || !slide1 || !slide2) return;

  const photos = [
    "./photos/WhatsApp Image 2026-11-14 at 10.27.44 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.33 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.34 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.35 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.36 AM (1).jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.36 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.37 AM (1).jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.37 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.38 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.39 AM (1).jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.39 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.40 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.41 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.42 AM.jpeg",
    "./photos/WhatsApp Image 2026-11-14 at 10.27.43 AM.jpeg"
  ];

  // Preload next images into memory for instant transitions
  photos.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  let currentIndex = 0;
  let activeSlide = slide1;
  let nextSlide = slide2;
  let intervalId = null;
  let isHovered = false;

  function showNextPhoto() {
    if (isHovered) return;

    currentIndex = (currentIndex + 1) % photos.length;
    const nextSrc = photos[currentIndex];

    // Load next photo onto background layer
    nextSlide.src = nextSrc;

    // Cross-fade smoothly between active and next
    nextSlide.classList.add('slide-active');
    activeSlide.classList.remove('slide-active');

    // Update counter
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${photos.length}`;
    }

    // Flip references
    const temp = activeSlide;
    activeSlide = nextSlide;
    nextSlide = temp;
  }

  function startSlideshow() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(showNextPhoto, 3000); // Exactly every 3 seconds
  }

  // Pause when hovered, resume on leave
  const frameEl = document.getElementById('hero-frame') || container;
  frameEl.addEventListener('mouseenter', () => {
    isHovered = true;
  });
  frameEl.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  // Start rotation
  startSlideshow();
}

/* ==========================================================================
   11. GENERATE BUTTON (Book Free Demo Class - Pulsing Letter Glow & State)
   ========================================================================== */
function initGenerateButtons() {
  const genButtons = document.querySelectorAll('.gen-btn');
  if (!genButtons.length) return;

  genButtons.forEach(btn => {
    btn.addEventListener('focus', () => {
      btn.setAttribute('data-generating', 'true');
    });

    btn.addEventListener('blur', () => {
      btn.removeAttribute('data-generating');
    });

    btn.addEventListener('click', () => {
      btn.setAttribute('data-generating', 'true');
      setTimeout(() => {
        btn.removeAttribute('data-generating');
      }, 2500);
    });
  });
}




