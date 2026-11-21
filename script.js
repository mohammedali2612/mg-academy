/**
 * MG Academy - Interactive JavaScript
 * Premium animations, navigation, category filter tabs, modals, and confetti celebration
 */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalSmoothScroll();
  initNavbar();
  initCourseTabs();
  initDanceScrollStack();
  initScrollReveal();
  initHeroAnimation();
  initModals();
  initFormsAndConfetti();
  initSkiper30Parallax();
  initInvertedDomeMobile();
  initStatsCounter();
  initPeekAdmissionButton();
  initHeroSlideshow();
  initStaggerTestimonials();
  initMobileDockNav();
  initCourseCardStack();
  initMobileFooterAutoFlip();
  initFeesSkiper47Carousel();
  initMascotVideoPlayers();
  initMascotPeekScroll();
  initDesktopCardSmoothScroll();

  // Handle ?scrollTo= param if present
  if (window.location.search.includes('scrollTo=')) {
    const targetId = new URLSearchParams(window.location.search).get('scrollTo');
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        if (window.__lenis) {
          window.__lenis.scrollTo(target, { immediate: true });
        } else {
          target.scrollIntoView({ behavior: 'instant' });
        }
      }
    }, 150);
  }
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
  const sections = document.querySelectorAll('main section[id], #home, #about, #courses, #dance, #gallery, #achievements, #reviews, #fees, #contact');

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
    if (window.innerWidth <= 860 && window.filterCourseStackByCategory) {
      window.filterCourseStackByCategory(category);
      return;
    }
    courseCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || !category || cardCat === category || cardCat.includes(category)) {
        card.style.display = 'flex';
        card.classList.remove('hidden-card');
        setTimeout(() => {
          card.style.opacity = '1';
        }, 30);
      } else {
        card.style.opacity = '0';
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

  const measure = () => {
    if (!stage || !list) return;
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
    if (overlay) overlay.style.display = pipeline ? 'block' : 'none';
    if (fallback) fallback.style.display = pipeline ? 'none' : 'block';
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
    if (!pipeline || !gl) {
      const box = shape(target, 1);
      if (fallback && box) {
        fallback.style.transform = `translate(${box.x.toFixed(2)}px, ${box.y.toFixed(2)}px)`;
        fallback.style.width = `${box.w}px`;
        fallback.style.height = `${box.h}px`;
        fallback.style.opacity = '1';
        fallback.style.display = 'block';
      }
      return;
    }

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
    target = index;
    if (!pipeline || reduced || !rects[index] || !animate) {
      settle(index);
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

      // Re-measure for precise offset alignment
      measure();

      // Liquid gooey transition
      go(index, true);

      // Filter course cards
      filterCards(selectedCategory);
      if (window.filterCourseStackByCategory) {
        window.filterCourseStackByCategory(selectedCategory);
      }

      // Ensure mobile smooth scrolling to center the clicked tab in view
      item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  // Initial measurement & settling on active index (0: All Programs)
  measure();
  settle(0);
  setTimeout(() => {
    measure();
    settle(0);
  }, 50);
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

// Official Google Admission & Enrollment Form URL
const GOOGLE_ADMISSION_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeO3i9Zs6bc7cFcwR72ii8JfPZumFF3y4ttTjq1Y5IOtiKj4g/viewform?usp=dialog';

// Global admission triggers for inline onclicks - Opens Google Form in new tab
window.openAdmissionModal = function (courseName = '') {
  window.open(GOOGLE_ADMISSION_FORM_URL, '_blank', 'noopener,noreferrer');
};

window.closeAdmissionModal = function () {
  const modal = document.getElementById('admission-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Official Academy WhatsApp Contact (+91 86819 94164)
const MG_ACADEMY_WHATSAPP = '918681994164';

window.handleAdmissionSubmit = function (event) {
  if (event) {
    event.preventDefault();
    if (event._waHandled) return;
    event._waHandled = true;
  }
  const form = document.getElementById('admission-form');
  const childName = document.getElementById('adm-child-name')?.value.trim() || 'Little Artist';
  const childAge = document.getElementById('adm-child-age')?.value.trim() || '';
  const parentName = document.getElementById('adm-parent-name')?.value.trim() || 'Parent';
  const phone = document.getElementById('adm-phone')?.value.trim() || '';
  const course = document.getElementById('adm-course')?.value || 'Creative Course';
  const batch = document.getElementById('adm-batch')?.value || 'Flexible';

  const waLines = [
    '🌟 *Admission & Demo Class Booking - MG Academy* 🌟',
    '',
    `👤 *Parent Name:* ${parentName}`,
    `👶 *Child's Name:* ${childName}${childAge ? ` (${childAge} Years)` : ''}`,
    `📞 *Phone / WhatsApp:* ${phone || 'Not provided'}`,
    `🎨 *Selected Course:* ${course}`,
    `⏰ *Preferred Timing:* ${batch}`,
    '',
    'Hello MG Academy! Please confirm our slot for the free demo class! ✨'
  ];

  const waText = waLines.join('\n');
  const waUrl = `https://wa.me/${MG_ACADEMY_WHATSAPP}?text=${encodeURIComponent(waText)}`;

  launchConfetti();
  window.open(waUrl, '_blank', 'noopener,noreferrer');

  if (form) form.reset();
  closeAdmissionModal();
};

window.handleContactSubmit = function (event) {
  if (event) {
    event.preventDefault();
    if (event._waHandled) return;
    event._waHandled = true;
  }
  const form = document.getElementById('contact-form');
  const parentName = document.getElementById('contact-name')?.value.trim() || 'Parent';
  const childName = document.getElementById('contact-child-name')?.value.trim() || 'Child';
  const childAge = document.getElementById('contact-child-age')?.value.trim() || '';
  const phone = document.getElementById('contact-phone')?.value.trim() || '';
  const course = document.getElementById('contact-course')?.value || 'General Inquiry';
  const message = document.getElementById('contact-message')?.value.trim() || '';

  const waLines = [
    '🎨 *New Inquiry for MG Academy* 🎨',
    '',
    `👤 *Parent Name:* ${parentName}`,
    `👶 *Child's Name:* ${childName}${childAge ? ` (Age: ${childAge} yrs)` : ''}`,
    `📞 *Phone / WhatsApp:* ${phone || 'Not provided'}`,
    `📚 *Interested Course:* ${course}`,
  ];
  if (message) {
    waLines.push(`💬 *Message / Questions:* ${message}`);
  } else {
    waLines.push('💬 *Message:* Hello MG Academy! I would like to inquire about upcoming batch timings and arrange a free trial class.');
  }
  waLines.push('');
  waLines.push('Thank you! ✨');

  const waText = waLines.join('\n');
  const waUrl = `https://wa.me/${MG_ACADEMY_WHATSAPP}?text=${encodeURIComponent(waText)}`;

  launchConfetti();

  const submitBtn = form?.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    const origHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-brands fa-whatsapp fa-bounce"></i> Opening WhatsApp...';
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHTML;
    }, 1800);
  }

  // Open WhatsApp directly to +91 86819 94164
  window.open(waUrl, '_blank', 'noopener,noreferrer');

  if (form) form.reset();
};

window.openLightbox = function (imageSrc, caption = '') {
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

window.closeLightbox = function () {
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
      window.handleAdmissionSubmit(e);
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      window.handleContactSubmit(e);
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
  const cards = gallery.querySelectorAll('.skiper30-card');

  // Mobile Gallery Scroll Reveal (<= 860px)
  if ('IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('card-in-view');
          cardObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    cards.forEach((card) => {
      cardObserver.observe(card);
      // If already in viewport on load, reveal immediately
      const r = card.getBoundingClientRect();
      if (r.top < window.innerHeight - 30 && r.bottom > 30) {
        card.classList.add('card-in-view');
      }
    });
  } else {
    // Fallback: reveal immediately
    cards.forEach((card) => card.classList.add('card-in-view'));
  }

  // Initialize Lenis smooth scroll if loaded
  const lenis = window.__lenis;

  let ticking = false;

  function updateParallax() {
    // Mobile view (<= 860px): Desktop parallax gallery is hidden, Skiper 47 Coverflow Carousel active
    if (window.innerWidth <= 860) {
      ticking = false;
      return;
    }

    // Desktop view (> 860px): reset mobile transforms on cards & run desktop Skiper 30 parallax
    cards.forEach((card) => {
      const img = card.querySelector('img');
      if (img && img.style.transform) img.style.transform = '';
    });

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
   12. 3D CIRCULAR CAROUSEL (Mobile Gallery View Only: <= 860px)
   ========================================================================== */
/* ==========================================================================
   MOBILE 3D CONTAINER-SCROLL GALLERY (Framer Motion emulation in pure JS)
   - Perspective container with rotateX: 75deg -> 0deg as scroll progress goes 0 -> 0.5
   - Scale: 1.2 -> 1.0 as progress goes 0.5 -> 0.9
   - Column Parallax:
     * Col 1: 0% -> -14%
     * Col 2: -6% -> +10%
     * Col 3: 0% -> -16%
   - Optimized for smooth 60fps across all mobile viewports (360px - 430px)
   ========================================================================== */
/* ==========================================================================
   STAGGER TESTIMONIALS (Staggered polygon card stack carousel)
   - Chamfered cards with 45deg diagonal fold line
   - Active card centered, elevated with brand gradient, white text & shadow
   - Side cards offset by (cardSize / 1.5) * position, rotated +-2.5deg
   - Click card to center, next/prev arrow buttons, touch swipe
   ========================================================================== */
function initStaggerTestimonials() {
  const stage = document.getElementById('stagger-stage');
  const prevBtn = document.getElementById('stagger-prev-btn');
  const nextBtn = document.getElementById('stagger-next-btn');
  const dotsContainer = document.getElementById('stagger-dots');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.stagger-testimonial-card'));
  const totalCards = cards.length;
  if (totalCards === 0) return;

  let activeIndex = 0;

  function update() {
    // Adapt card size: desktop 365px, tablet 330px, mobile 285px (capped by viewport)
    let cardSize = 365;
    if (window.innerWidth <= 400) {
      cardSize = Math.max(260, window.innerWidth - 50);
    } else if (window.innerWidth <= 640) {
      cardSize = 290;
    } else if (window.innerWidth <= 992) {
      cardSize = 330;
    }

    cards.forEach((card, index) => {
      // Calculate relative position offset: -2, -1, 0, 1, 2, 3 ...
      let diff = (index - activeIndex) % totalCards;
      if (diff > totalCards / 2) diff -= totalCards;
      if (diff < -totalCards / 2) diff += totalCards;
      const position = diff;
      const isCenter = position === 0;

      card.classList.toggle('is-center', isCenter);
      card.style.width = `${cardSize}px`;
      card.style.height = `${cardSize}px`;

      // z-index: center is highest (10), side cards decrease with distance
      card.style.zIndex = isCenter ? '10' : String(Math.max(1, 6 - Math.abs(position)));

      const xOffset = (cardSize / 1.5) * position;
      const yOffset = isCenter ? -55 : (position % 2 !== 0 ? 15 : -15);
      const rotation = isCenter ? 0 : (position % 2 !== 0 ? 2.5 : -2.5);

      card.style.transform = `translate(-50%, -50%) translateX(${xOffset.toFixed(1)}px) translateY(${yOffset}px) rotate(${rotation}deg)`;
    });

    // Update dot indicators
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.stagger-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    }
  }

  function handleMove(steps) {
    activeIndex = (activeIndex + steps) % totalCards;
    if (activeIndex < 0) activeIndex += totalCards;
    update();
  }

  // Click card to bring to center
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      let diff = (index - activeIndex) % totalCards;
      if (diff > totalCards / 2) diff -= totalCards;
      if (diff < -totalCards / 2) diff += totalCards;
      if (diff !== 0) {
        handleMove(diff);
      }
    });

    // Accessible keyboard enter/space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleMove(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleMove(1);
    });
  }

  // Dots click
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.stagger-dot');
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        activeIndex = i;
        update();
      });
    });
  }

  // Touch swipe support on mobile
  let touchStartX = 0;
  let touchEndX = 0;

  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleMove(1); // swipe left -> next
      } else {
        handleMove(-1); // swipe right -> prev
      }
    }
  }, { passive: true });

  window.addEventListener('resize', update, { passive: true });
  update();
}

/* ==========================================================================
   FLOATING MOBILE PILL NAVBAR LOGIC
   - Smooth active capsule transitions
   - Tap to scroll smoothly to target section
   - IntersectionObserver / scroll spy to auto-expand active section
   - Hides when modals/lightboxes open
   ========================================================================== */
function initMobileDockNav() {
  const dock = document.getElementById('mobile-dock-nav');
  if (!dock) return;

  const items = Array.from(dock.querySelectorAll('.mobile-dock-item'));
  const targets = items.map(item => ({
    item,
    id: item.getAttribute('data-target'),
    section: document.getElementById(item.getAttribute('data-target'))
  })).filter(t => t.section);

  function setActive(targetId) {
    items.forEach(item => {
      const match = item.getAttribute('data-target') === targetId;
      item.classList.toggle('active', match);
      if (match) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  // Click handler
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);

      setActive(targetId);

      if (targetEl) {
        if (window.__lenis) {
          window.__lenis.scrollTo(targetEl, { offset: -65 });
        } else {
          const y = targetEl.getBoundingClientRect().top + window.pageYOffset - 65;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

  // Scroll spy observer
  let scrollTimeout = null;
  function updateActiveOnScroll() {
    if (window.innerWidth > 860) return;

    const scrollPos = window.scrollY + 180;
    let currentId = 'home';

    targets.forEach(t => {
      const top = t.section.offsetTop;
      const height = t.section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = t.id;
      }
    });

    // If near bottom of page, highlight contact
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 120) {
      currentId = 'contact';
    }

    setActive(currentId);
  }

  window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(() => {
        updateActiveOnScroll();
        scrollTimeout = null;
      }, 50);
    }
  }, { passive: true });

  if (window.__lenis) {
    window.__lenis.on('scroll', updateActiveOnScroll);
  }

  // Initial check
  updateActiveOnScroll();
}


/* ==========================================================================
   16. 3D ANIMATED CARD STACK (Spring Physics Deck for Courses)
   Emulates Framer Motion AnimatedCardStack (scale 1, 0.95, 0.9; y 12, -16, -44; exit 340)
   ========================================================================== */
function initCourseCardStack() {
  const wrapper = document.getElementById('course-stack-deck-wrapper');
  const cardsContainer = document.getElementById('course-stack-cards');
  if (!wrapper || !cardsContainer) return;

  const allCards = Array.from(cardsContainer.querySelectorAll('.course-stack-card'));
  if (!allCards.length) return;

  let activeQueue = [...allCards];
  let isAnimating = false;

  const activeIndexEl = document.getElementById('course-stack-active-index');
  const totalEl = document.getElementById('course-stack-total');
  const activeNameEl = document.getElementById('course-stack-active-name');
  const dotsContainer = document.getElementById('course-stack-dots');
  const nextBtn = document.getElementById('course-stack-next-btn');
  const prevBtn = document.getElementById('course-stack-prev-btn');

  // Render dots
  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    allCards.forEach((card, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `course-stack-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to course ${idx + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToCard(idx);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlots() {
    allCards.forEach(c => {
      c.removeAttribute('data-slot');
      c.classList.remove('card-exiting');
    });

    activeQueue.forEach((card, idx) => {
      if (idx === 0) {
        card.setAttribute('data-slot', '0');
      } else if (idx === 1) {
        card.setAttribute('data-slot', '1');
      } else if (idx === 2) {
        card.setAttribute('data-slot', '2');
      } else {
        card.setAttribute('data-slot', 'hidden');
      }
    });

    // Update meta
    if (activeQueue.length > 0) {
      const frontCard = activeQueue[0];
      const titleEl = frontCard.querySelector('.course-title');
      const title = titleEl ? titleEl.textContent.trim() : '';
      const originalIndex = allCards.indexOf(frontCard) + 1;

      if (activeIndexEl) activeIndexEl.textContent = originalIndex;
      if (totalEl) totalEl.textContent = allCards.length;
      if (activeNameEl) activeNameEl.textContent = `— ${title}`;

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.course-stack-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', (allCards.indexOf(frontCard)) === idx);
        });
      }
    }
  }

  function nextCard() {
    if (isAnimating || activeQueue.length <= 1) return;
    isAnimating = true;

    const topCard = activeQueue[0];
    topCard.classList.add('card-exiting');

    setTimeout(() => {
      topCard.classList.remove('card-exiting');
      const first = activeQueue.shift();
      activeQueue.push(first);
      updateSlots();
      isAnimating = false;
    }, 400);
  }

  function prevCard() {
    if (isAnimating || activeQueue.length <= 1) return;
    isAnimating = true;

    const last = activeQueue.pop();
    activeQueue.unshift(last);
    updateSlots();
    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }

  function goToCard(targetIndex) {
    if (isAnimating) return;
    const targetCard = allCards[targetIndex];
    if (!targetCard) return;

    let iterations = 0;
    while (activeQueue[0] !== targetCard && iterations < activeQueue.length) {
      const first = activeQueue.shift();
      activeQueue.push(first);
      iterations++;
    }
    updateSlots();
  }

  // Next / Prev Button events
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextCard();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevCard();
    });
  }

  // Click on front card to advance (mobile view only: <= 860px)
  cardsContainer.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return; // Desktop uses standard grid!
    if (e.target.closest('button') || e.target.closest('a')) return;
    const clickedCard = e.target.closest('.course-stack-card');
    if (!clickedCard) return;

    const slot = clickedCard.getAttribute('data-slot');
    if (slot === '0' || slot === '1') {
      nextCard();
    }
  });

  // Touch Swipe for Mobile (swipe down or horizontal to advance)
  let touchStartX = 0;
  let touchStartY = 0;
  cardsContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  cardsContainer.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Swipe down to dismiss (matches exitAnimation y: 340)
    if (diffY > 40 && Math.abs(diffY) > Math.abs(diffX)) {
      nextCard();
    } else if (diffX < -40 && Math.abs(diffX) > Math.abs(diffY)) {
      nextCard();
    } else if (diffX > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      prevCard();
    }
  }, { passive: true });

  // Expose category filter hook
  window.filterCourseStackByCategory = function (category) {
    if (category === 'all' || !category) {
      activeQueue = [...allCards];
    } else {
      const matches = allCards.filter(c => {
        const cat = c.getAttribute('data-category') || '';
        return cat === category || cat.includes(category);
      });
      const nonMatches = allCards.filter(c => !matches.includes(c));
      activeQueue = [...matches, ...nonMatches];
    }
    updateSlots();
  };

  renderDots();
  updateSlots();
}

/* ==========================================================================
   17. MOBILE FOOTER CONTACT ANIMATION (Interactive 3D C-O-N-T-A-C-T Dock)
   ========================================================================== */
function initMobileFooterAutoFlip() {
  const card = document.getElementById('social-flip-card');
  if (!card) return;
  const nodes = Array.from(card.querySelectorAll('.social-flip-node'));
  if (!nodes.length) return;

  let hasWaved = false;
  let isHovered = false;

  card.addEventListener('mouseenter', () => { isHovered = true; });
  card.addEventListener('mouseleave', () => { isHovered = false; });

  function triggerIntroWave() {
    if (isHovered || hasWaved) return;
    hasWaved = true;

    // Smooth intro wave: C-O-N-T-A-C-T reveal icons
    nodes.forEach((node, idx) => {
      setTimeout(() => {
        node.classList.add('is-flipped');
      }, idx * 70);
    });

    // Hold icons for 1.8 seconds, then wave cleanly back to letters
    setTimeout(() => {
      if (isHovered) return;
      nodes.forEach((node, idx) => {
        setTimeout(() => {
          node.classList.remove('is-flipped');
        }, idx * 70);
      });
    }, 2000);
  }

  // Interactive mobile tap: tap flips node, second tap or follow-through opens link
  nodes.forEach(node => {
    node.addEventListener('touchstart', (e) => {
      if (!node.classList.contains('is-flipped')) {
        // First tap reveals icon
        nodes.forEach(n => n.classList.remove('is-flipped'));
        node.classList.add('is-flipped');
      }
    }, { passive: true });
  });

  // Tap outside resets flipped cards to clean C-O-N-T-A-C-T letters
  document.addEventListener('touchstart', (e) => {
    if (!card.contains(e.target)) {
      nodes.forEach(n => n.classList.remove('is-flipped'));
    }
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasWaved) {
        if (window.innerWidth <= 860) {
          triggerIntroWave();
        }
      }
    });
  }, { threshold: 0.35 });

  observer.observe(card);
}

/* ==========================================================================
   DANCE CLASSES SCROLL STACK ENGINE
   - Mobile View (<= 860px): Framer Motion StackedCards Engine
     * Progressive sticky top: calc(68px + index * 16px)
     * Step: 1 / total (0.25)
     * Range: [Math.max(0, index * step), 1]
     * TargetScale: 1 - (total - index - 1) * 0.075
     * Scale: useTransform(progress, range, [1, targetScale])
     * transformOrigin: 'top center'
   - Desktop View (> 860px): Kexsio ScrollStack Horizontal Engine
     * Pinned deck with stepped scale, vertical offset, and depth dimming
   ========================================================================== */
function initDanceScrollStack() {
  const container = document.getElementById('dance-styles-grid');
  if (!container) return;

  const slots = Array.from(container.querySelectorAll('.dance-stack-slot'));
  if (!slots.length) return;

  let rafId = 0;

  function update() {
    rafId = 0;
    const isMobile = window.innerWidth <= 860;

    if (isMobile) {
      // ----------------------------------------------------------------------
      // Mobile View: Framer Motion StackedCards Physics
      // ----------------------------------------------------------------------
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + window.scrollY;
      const containerHeight = container.offsetHeight;
      const stickyHeaderHeight = 68;
      const startY = containerTop - stickyHeaderHeight;
      const endY = containerTop + containerHeight - window.innerHeight;
      const scrollY = window.scrollY;

      let progress = 0;
      if (endY > startY) {
        progress = Math.min(1, Math.max(0, (scrollY - startY) / (endY - startY)));
      }

      const total = slots.length;
      const step = 1 / total; // 0.25

      slots.forEach((slot, index) => {
        const card = slot.querySelector('.dance-style-card');
        if (!card) return;

        // Card scaling range: begins scaling down when the next card scrolls in
        const rangeStart = Math.max(0, index * step);
        const targetScale = total > 1 ? 1 - (total - index - 1) * 0.075 : 1;

        let scale = 1;
        if (progress >= 1) {
          scale = targetScale;
        } else if (progress > rangeStart) {
          const p = (progress - rangeStart) / (1 - rangeStart);
          scale = 1 - p * (1 - targetScale);
        }

        // Framer Motion: scale with transformOrigin: top center
        card.style.transformOrigin = 'top center';
        card.style.transform = `scale(${scale.toFixed(4)})`;
        card.style.filter = '';

        // Depth dimming on mobile cards for physical depth
        const depth = targetScale < 1 ? (1 - scale) / (1 - targetScale) : 0;
        const dim = Math.min(0.22, depth * 0.18);
        card.style.setProperty('--scroll-stack-dim', dim.toFixed(3));
      });
      return;
    }

    // ----------------------------------------------------------------------
    // Desktop View (> 860px): Smooth Scroll-Linked 3D Wave Parallax
    // ----------------------------------------------------------------------
    const containerRect = container.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = (vh - containerRect.top) / (vh + containerRect.height);

    if (progress >= -0.2 && progress <= 1.2) {
      slots.forEach((slot, index) => {
        const card = slot.querySelector('.dance-style-card');
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.top + cardRect.height / 2;
        const normalizedY = (cardCenter - vh / 2) / (vh / 2);

        const staggerMultipliers = [-24, 18, -16, 22];
        const mult = staggerMultipliers[index % 4];
        const floatY = normalizedY * mult;
        const rotX = Math.max(-5, Math.min(5, normalizedY * -4));
        const rotY = (index % 2 === 0 ? 1 : -1) * Math.max(-3, Math.min(3, normalizedY * 2.5));

        card.style.setProperty('--card-scroll-y', `${floatY.toFixed(2)}px`);
        card.style.setProperty('--card-scroll-tilt', `${rotX.toFixed(2)}deg`);
        card.style.setProperty('--card-scroll-rot-y', `${rotY.toFixed(2)}deg`);
        card.style.removeProperty('--scroll-stack-dim');
      });
    } else {
      slots.forEach(slot => {
        const card = slot.querySelector('.dance-style-card');
        if (card) {
          card.style.setProperty('--card-scroll-y', '0px');
          card.style.setProperty('--card-scroll-tilt', '0deg');
          card.style.setProperty('--card-scroll-rot-y', '0deg');
          card.style.removeProperty('--scroll-stack-dim');
        }
      });
    }
  }

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  if (window.__lenis) {
    window.__lenis.on('scroll', schedule);
  } else {
    window.addEventListener('load', () => {
      if (window.__lenis) window.__lenis.on('scroll', schedule);
    });
  }
  schedule();
}

/* ==========================================================================
   INVERTED DOME 3D WEBGL CURVED GALLERY (ReactBits Pro) - Mobile Gallery (<= 860px Only)
   Component parity: @reactbits-starter/inverted-dome-tw (<M />)
   Features:
   - Interactive Draggable Image Grid curved like the inside of a dome
   - Shader lens equation mapping tiles into concave dome curvature
   - Touch drag with inertia physics & velocity momentum decay (friction: 0.9)
   - Click/tap hit-test opens high-resolution student artwork in modal lightbox
   - Desktop View (> 860px): Skiper 30 Parallax Gallery untouched
   ========================================================================== */
let invertedDomeActiveInstance = null;

function initInvertedDomeMobile() {
  const container = document.getElementById('inverted-dome-canvas-wrapper');
  if (!container) return;

  const DOME_IMAGES = [
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.44 AM.jpeg', title: 'Little Picasso Art Studio' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.37 AM.jpeg', title: 'Classical Poise & Rhythms' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.34 AM.jpeg', title: 'Young Masters Exhibition' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.35 AM.jpeg', title: 'Hands-on Art Workshop' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.38 AM.jpeg', title: 'Creative Learning & Sketching' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.41 AM.jpeg', title: 'Competition Laurels & Awards' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.40 AM.jpeg', title: 'Student Achievements & Growth' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.43 AM.jpeg', title: 'Cultural Celebrations & Events' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.39 AM (1).jpeg', title: 'Classroom Learning Workshop' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.36 AM.jpeg', title: 'Creative Studio Exploration' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.42 AM.jpeg', title: 'Stage Dance Salangai' },
    { src: './photos/WhatsApp Image 2026-11-14 at 10.27.33 AM.jpeg', title: 'Joyful Creative Moments' }
  ];

  const vertexShader = `
    attribute vec2 aCell;
    uniform vec2 uResolution;
    uniform vec2 uOffset;
    uniform vec2 uTile;
    uniform vec2 uPitch;
    uniform vec2 uHalfCount;
    uniform vec2 uAtlasGrid;
    uniform vec2 uInset;
    uniform float uRotation;
    uniform float uCurve;
    uniform float uCurveRadius;
    uniform float uZoom;
    uniform float uSeed;
    uniform float uImageCount;

    varying vec2 vUv;
    varying vec2 vLocal;
    varying float vEdge;

    float hashCell(vec2 cell) {
      vec2 c = mod(cell, 1024.0);
      float h = mod(c.x * 7919.0 + c.y * 7307.0 + uSeed * 613.0, 1021.0);
      return mod(h * h + c.x * 3.0 + c.y * 17.0, 1009.0);
    }

    vec2 lens(vec2 screen) {
      vec2 n = screen / uResolution - 0.5;
      float aspect = uResolution.x / uResolution.y;
      n.x *= aspect;
      float t = length(n) / uCurveRadius;
      float z = sqrt(max(0.5 - t * t, 0.0004));
      n *= uZoom + uCurve / z;
      n.x /= aspect;
      return (n + 0.5) * uResolution;
    }

    void main() {
      vec2 cell = aCell - uHalfCount + floor(uOffset / uPitch);
      vec2 origin = cell * uPitch - uOffset + uResolution * 0.5;

      vec2 local = uv * uTile;
      vec2 centre = origin + uTile * 0.5;
      vec2 rel = local - uTile * 0.5;
      float c = cos(uRotation);
      float s = sin(uRotation);
      rel = vec2(rel.x * c - rel.y * s, rel.x * s + rel.y * c);
      vec2 screen = lens(centre + rel);

      vec2 n = screen / uResolution - 0.5;
      n.x *= uResolution.x / uResolution.y;
      vEdge = length(n);

      float index = mod(hashCell(cell), uImageCount);
      vec2 slot = vec2(mod(index, uAtlasGrid.x), floor(index / uAtlasGrid.x));

      vec2 padded = mix(uInset, 1.0 - uInset, vec2(uv.x, 1.0 - uv.y));
      vUv = (slot + padded) / uAtlasGrid;
      vLocal = local;

      vec2 clip = screen / uResolution * 2.0 - 1.0;
      gl_Position = vec4(clip, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    uniform sampler2D uAtlas;
    uniform vec2 uTile;
    uniform float uRadius;
    uniform float uGrayscale;
    uniform float uVignette;
    uniform float uVignetteReach;

    varying vec2 vUv;
    varying vec2 vLocal;
    varying float vEdge;

    float roundedBox(vec2 p, vec2 extent, float r) {
      vec2 q = abs(p) - extent + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    void main() {
      vec4 tex = texture2D(uAtlas, vUv);
      vec2 extent = uTile * 0.5;
      float r = min(uRadius, min(extent.x, extent.y));
      float d = roundedBox(vLocal - extent, extent, r);
      float aa = fwidth(d);
      float shape = 1.0 - smoothstep(-aa, aa, d);
      if (shape < 0.003) discard;

      float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
      vec3 color = mix(tex.rgb, vec3(luma), uGrayscale);
      float fade = smoothstep(0.0, uVignetteReach, vEdge);
      color *= 1.0 - uVignette * fade;
      gl_FragColor = vec4(color, tex.a * shape);
    }
  `;

  // Exact configuration matching <M /> from @reactbits-starter/inverted-dome-tw
  const config = {
    tileWidth: 200,
    tileHeight: 200,
    gap: 16,
    borderRadius: 16,
    curve: 0.3,
    curveRadius: 1.5,
    zoom: 0.1,
    tileRotation: 0,
    grayscale: 0,
    vignette: 0,
    friction: 0.9,
    segments: 20,
    seed: 0,
    openOnClick: true
  };

  function cleanup() {
    if (invertedDomeActiveInstance) {
      invertedDomeActiveInstance.dispose();
      invertedDomeActiveInstance = null;
    }
  }

  function start() {
    const isMobile = window.innerWidth <= 860;
    if (!isMobile) {
      cleanup();
      return;
    }

    if (typeof THREE === 'undefined') return;
    if (invertedDomeActiveInstance) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 460;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const pitchX = config.tileWidth + config.gap;
    const pitchY = config.tileHeight + config.gap;
    const cols = Math.min(Math.ceil((1.35 * width) / pitchX) + 3, 60);
    const rows = Math.min(Math.ceil((1.35 * height) / pitchY) + 3, 60);
    const cellCount = Math.min(cols * rows, 900);

    const plane = new THREE.PlaneGeometry(1, 1, config.segments, config.segments);
    const instancedGeom = new THREE.InstancedBufferGeometry();
    instancedGeom.index = plane.index;
    instancedGeom.setAttribute('position', plane.getAttribute('position'));
    instancedGeom.setAttribute('uv', plane.getAttribute('uv'));

    const aCell = new Float32Array(2 * cellCount);
    for (let i = 0; i < cellCount; i++) {
      aCell[2 * i] = i % cols;
      aCell[2 * i + 1] = Math.floor(i / cols);
    }
    instancedGeom.setAttribute('aCell', new THREE.InstancedBufferAttribute(aCell, 2));
    instancedGeom.instanceCount = cellCount;

    const hVal = Math.max(Math.min(width, height), 1);
    const mVal = Math.hypot(width / hVal, height / hVal);

    const uniforms = {
      uAtlas: { value: null },
      uResolution: { value: new THREE.Vector2(width, height) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uTile: { value: new THREE.Vector2(config.tileWidth, config.tileHeight) },
      uPitch: { value: new THREE.Vector2(pitchX, pitchY) },
      uHalfCount: { value: new THREE.Vector2(Math.floor(cols / 2), Math.floor(rows / 2)) },
      uAtlasGrid: { value: new THREE.Vector2(1, 1) },
      uInset: { value: new THREE.Vector2(0, 0) },
      uRotation: { value: (config.tileRotation * Math.PI) / 180 },
      uCurve: { value: Math.max(config.curve, 0) },
      uCurveRadius: { value: 0.72 * mVal * Math.max(config.curveRadius, 1) },
      uZoom: { value: Math.max(config.zoom, 0.05) },
      uSeed: { value: config.seed },
      uImageCount: { value: DOME_IMAGES.length },
      uRadius: { value: Math.max(config.borderRadius, 0) },
      uGrayscale: { value: config.grayscale },
      uVignette: { value: config.vignette },
      uVignetteReach: { value: 0.5 * mVal }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(instancedGeom, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    // Build Texture Atlas
    let disposed = false;
    const loadedImages = [];
    let loadedCount = 0;

    DOME_IMAGES.forEach((item) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (disposed) return;
        loadedCount++;
        if (loadedCount === DOME_IMAGES.length) {
          buildAtlasTexture();
        }
      };
      img.src = item.src;
      loadedImages.push(img);
    });

    function buildAtlasTexture() {
      const count = loadedImages.length;
      if (!count) return;
      const aCols = Math.ceil(Math.sqrt(count));
      const aRows = Math.ceil(count / aCols);
      const tileW = 512;
      const tileH = 512;

      const canvas = document.createElement('canvas');
      canvas.width = tileW * aCols;
      canvas.height = tileH * aRows;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      loadedImages.forEach((img, idx) => {
        const x = (idx % aCols) * tileW;
        const y = Math.floor(idx / aCols) * tileH;
        const scale = Math.max(tileW / img.naturalWidth, tileH / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, tileW, tileH);
        ctx.clip();
        ctx.drawImage(img, x + (tileW - dw) / 2, y + (tileH - dh) / 2, dw, dh);
        ctx.restore();
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = false;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;

      uniforms.uAtlas.value = texture;
      uniforms.uAtlasGrid.value.set(aCols, aRows);
      uniforms.uInset.value.set(1.5 / tileW, 1.5 / tileH);
      uniforms.uImageCount.value = count;
    }

    // Touch & Pointer State
    const state = {
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      dragging: false,
      lastPos: { x: 0, y: 0 },
      downPos: { x: 0, y: 0 },
      downTime: 0
    };

    function hitTest(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (!w || !h) return null;

      const screenX = clientX - rect.left;
      const screenY = h - (clientY - rect.top);
      const aspect = w / h;
      const nx = (screenX / w - 0.5) * aspect;
      const ny = screenY / h - 0.5;
      const dist = Math.hypot(nx, ny);

      let unprojX = screenX;
      let unprojY = screenY;

      const rReach = uniforms.uCurveRadius.value;
      const zoom = uniforms.uZoom.value;
      const curve = uniforms.uCurve.value;

      if (dist >= 1e-6) {
        const lensFn = (t) => {
          const normT = t / rReach;
          const z = Math.sqrt(Math.max(0.5 - normT * normT, 0.0004));
          return t * (zoom + curve / z);
        };

        let low = 0;
        let high = rReach * Math.SQRT1_2;
        if (lensFn(high) >= dist) {
          for (let i = 0; i < 35; i++) {
            const mid = (low + high) / 2;
            if (lensFn(mid) < dist) {
              low = mid;
            } else {
              high = mid;
            }
          }
          const scale = ((low + high) / 2) / dist;
          unprojX = (nx * scale / aspect + 0.5) * w;
          unprojY = (ny * scale + 0.5) * h;
        }
      }

      const pX = config.tileWidth + config.gap;
      const pY = config.tileHeight + config.gap;
      const gx = unprojX - 0.5 * w + state.offset.x;
      const gy = unprojY - 0.5 * h + state.offset.y;

      const rad = (-config.tileRotation * Math.PI) / 180;
      const cosR = Math.cos(rad);
      const sinR = Math.sin(rad);

      const baseCol = Math.floor(gx / pX);
      const baseRow = Math.floor(gy / pY);

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const col = baseCol + dx;
          const row = baseRow + dy;
          const relX = gx - (col * pX + 0.5 * config.tileWidth);
          const relY = gy - (row * pY + 0.5 * config.tileHeight);
          const rotX = relX * cosR - relY * sinR;
          const rotY = relX * sinR + relY * cosR;

          if (Math.abs(rotX) <= 0.5 * config.tileWidth && Math.abs(rotY) <= 0.5 * config.tileHeight) {
            const cX = ((col % 1024) + 1024) % 1024;
            const cY = ((row % 1024) + 1024) % 1024;
            const h1 = (((7919 * cX + 7307 * cY + 613 * config.seed) % 1021) + 1021) % 1021;
            const h2 = (((h1 * h1 + 3 * cX + 17 * cY) % 1009) + 1009) % 1009;
            return h2 % DOME_IMAGES.length;
          }
        }
      }
      return null;
    }

    const onPointerDown = (e) => {
      state.dragging = true;
      state.velocity.x = 0;
      state.velocity.y = 0;
      state.lastPos.x = e.clientX;
      state.lastPos.y = e.clientY;
      state.downPos.x = e.clientX;
      state.downPos.y = e.clientY;
      state.downTime = performance.now();
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!state.dragging) return;
      const dx = e.clientX - state.lastPos.x;
      const dy = e.clientY - state.lastPos.y;
      state.lastPos.x = e.clientX;
      state.lastPos.y = e.clientY;

      state.offset.x -= dx;
      state.offset.y += dy;

      state.velocity.x = -(0.3 * dx) + 0.7 * state.velocity.x;
      state.velocity.y = 0.3 * dy + 0.7 * state.velocity.y;
    };

    const onPointerUp = (e) => {
      if (container.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
      const wasDragging = state.dragging;
      state.dragging = false;

      const dist = Math.hypot(e.clientX - state.downPos.x, e.clientY - state.downPos.y);
      if (wasDragging && dist < 7 && performance.now() - state.downTime < 500) {
        const hitIdx = hitTest(e.clientX, e.clientY);
        if (hitIdx !== null && DOME_IMAGES[hitIdx]) {
          const item = DOME_IMAGES[hitIdx];
          if (typeof window.openLightbox === 'function') {
            window.openLightbox(item.src, item.title);
          }
        }
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    let animId;
    let lastTime = performance.now();

    function renderLoop() {
      animId = requestAnimationFrame(renderLoop);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!state.dragging) {
        const decay = Math.pow(config.friction, 60 * dt);
        state.velocity.x *= decay;
        state.velocity.y *= decay;
        if (Math.abs(state.velocity.x) < 0.01) state.velocity.x = 0;
        if (Math.abs(state.velocity.y) < 0.01) state.velocity.y = 0;

        state.offset.x += state.velocity.x * dt * 60;
        state.offset.y += state.velocity.y * dt * 60;
      }

      uniforms.uOffset.value.set(state.offset.x, state.offset.y);
      renderer.render(scene, camera);
    }
    renderLoop();

    invertedDomeActiveInstance = {
      dispose() {
        disposed = true;
        cancelAnimationFrame(animId);
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointercancel', onPointerUp);
        renderer.dispose();
        instancedGeom.dispose();
        plane.dispose();
        material.dispose();
        if (uniforms.uAtlas.value) uniforms.uAtlas.value.dispose();
        container.innerHTML = '';
      }
    };
  }

  if (typeof THREE !== 'undefined') {
    start();
  } else {
    window.addEventListener('load', start);
  }

  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 860;
    if (!isMobile) {
      cleanup();
    } else {
      if (!invertedDomeActiveInstance) start();
    }
  }, { passive: true });
}

/* ==========================================================================
   SKIPER 47 3D COVERFLOW CAROUSEL (Carousel_001) - Fee Structure Cards (Mobile Only <= 860px)
   Features:
   - Mobile View (<= 860px): Swiper Coverflow with depth, centered active slide & chevrons
   - Desktop View (> 860px): Static 3-column responsive grid (no swiper, no 3D animation)
   ========================================================================== */
let feesSwiperInstance = null;

function initFeesSkiper47Carousel() {
  const container = document.getElementById('fees-swiper');
  if (!container) return;

  function update() {
    const isMobile = window.innerWidth <= 860;

    if (!isMobile) {
      // Desktop View (> 860px): Destroy Swiper, restore static 3-column grid
      if (feesSwiperInstance) {
        feesSwiperInstance.destroy(true, true);
        feesSwiperInstance = null;
      }
      const wrapper = container.querySelector('.swiper-wrapper');
      if (wrapper) {
        wrapper.querySelectorAll('.cloned-tier-slide').forEach(c => c.remove());
        wrapper.style.transform = '';
        wrapper.style.transitionDuration = '';
      }
      const slides = container.querySelectorAll('.swiper-slide');
      slides.forEach(slide => {
        slide.style.transform = '';
        slide.style.transitionDuration = '';
        slide.style.width = '';
        slide.style.marginRight = '';
      });
      return;
    }

    // Mobile View (<= 860px): Initialize Coverflow Carousel with Loop & Autoplay
    if (typeof Swiper === 'undefined') return;

    const wrapper = container.querySelector('.swiper-wrapper');
    if (wrapper) {
      // Remove any previously cloned slides so Swiper manages loop duplicates cleanly
      wrapper.querySelectorAll('.cloned-tier-slide').forEach(c => c.remove());
      wrapper.querySelectorAll('.fee-card').forEach(card => {
        card.classList.remove('reveal-fade-up');
        card.classList.add('is-visible');
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.transform = 'none';
      });
    }

    if (feesSwiperInstance) {
      feesSwiperInstance.update();
      return;
    }

    feesSwiperInstance = new Swiper('#fees-swiper', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      slideToClickedSlide: true,
      slidesPerView: 'auto',
      coverflowEffect: {
        rotate: 0,
        slideShadows: false,
        stretch: 0,
        depth: 35,
        modifier: 1.4,
      },
      pagination: {
        el: '.fees-pagination',
        clickable: true,
      }
    });
  }

  // Ensure Swiper library is loaded
  if (typeof Swiper !== 'undefined') {
    update();
  } else {
    window.addEventListener('load', update);
  }

  window.addEventListener('resize', update, { passive: true });
}

/* ==========================================================================
   MASCOT LIVE VIDEO CHROMA-KEY PLAYER (GPU WebGL Real-Time Playback)
   ========================================================================== */
function initMascotVideoPlayers() {
  const vGirl = document.getElementById('mgGirlVideo');
  const cGirl = document.getElementById('mgGirlCanvas');
  const vBoy = document.getElementById('mgBoyVideo');
  const cBoy = document.getElementById('mgBoyCanvas');
  const girlWrap = document.getElementById('mgGirlMascot');
  const boyWrap = document.getElementById('mgBoyMascot');

  function setupWebGLPlayer(video, canvas, wrapper, fallbackSrc) {
    if (!video || !canvas) return;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
        || canvas.getContext('experimental-webgl', { premultipliedAlpha: false, alpha: true });
    } catch (e) { }

    // Fallback if WebGL unavailable: draw static fallback image
    if (!gl) {
      if (fallbackSrc) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          const ctx2d = canvas.getContext('2d');
          if (ctx2d) {
            canvas.width = fallbackImg.width;
            canvas.height = fallbackImg.height;
            ctx2d.drawImage(fallbackImg, 0, 0);
          }
        };
        fallbackImg.src = fallbackSrc;
      }
      return;
    }

    const vsSource = `
      attribute vec2 a_pos;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        // Key out vibrant green background
        if (color.g > 0.30 && color.g > color.r * 1.32 && color.g > color.b * 1.32) {
          discard;
        }
        // Smooth edge despill & anti-aliasing
        if (color.g > 0.35 && color.g > color.r * 1.15 && color.g > color.b * 1.15 && color.r < 0.35 && color.b < 0.35) {
          color.a = clamp(1.0 - (color.g - max(color.r, color.b)) * 4.0, 0.0, 1.0);
        }
        gl_FragColor = color;
      }
    `;

    function createShader(gl, type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // FULL SIZE VIDEO (NO CROP: 0.0 to 1.0 across full frame)
    const texBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0
    ]), gl.STATIC_DRAW);
    const aTex = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(aTex);
    gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.clearColor(0, 0, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    function startPlayback() {
      video.play().catch(() => { });
    }

    startPlayback();
    ['click', 'touchstart', 'scroll'].forEach(evt => {
      document.addEventListener(evt, startPlayback, { once: true, passive: true });
    });

    let isConfigured = false;
    function renderLoop() {
      // Conserve GPU cycles when mascot is not visible
      if (!wrapper || wrapper.classList.contains('show')) {
        if (video.readyState >= 2) {
          if (!isConfigured && video.videoWidth > 0) {
            isConfigured = true;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            gl.viewport(0, 0, video.videoWidth, video.videoHeight);
          }

          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }
      requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
  }

  // Setup Girl video player (Full uncropped 848x480 frame)
  setupWebGLPlayer(vGirl, cGirl, girlWrap, 'assets/girl-mascot.png');

  // Setup Boy video player (Full uncropped 848x480 frame)
  setupWebGLPlayer(vBoy, cBoy, boyWrap, 'assets/boy-mascot.png');
}

/* ==========================================================================
   MASCOT PEEK-IN SCROLL OBSERVER (Girl Artist & Boy Scholar)
   ========================================================================== */
function initMascotPeekScroll() {
  const girlWrap = document.getElementById('mgGirlMascot');
  const boyWrap = document.getElementById('mgBoyMascot');
  const girlText = document.getElementById('mgGirlText');
  const boyText = document.getElementById('mgBoyText');
  const vGirl = document.getElementById('mgGirlVideo');
  const vBoy = document.getElementById('mgBoyVideo');
  if (!girlWrap || !boyWrap || !girlText || !boyText) return;

  // Section configuration matching 8 navigation links (+ dance studio)
  const sectionConfig = {
    home: { side: 'none' },
    about: { side: 'left', text: '🎨 About Us!' },
    courses: { side: 'right', text: '📚 Our Courses!' },
    dance: { side: 'right', text: '💃 Dance Classes!' },
    gallery: { side: 'left', text: '🎨 Art Gallery!' },
    achievements: { side: 'right', text: '🏆 Achievements!' },
    reviews: { side: 'left', text: '⭐ Parent Reviews!' },
    fees: { side: 'right', text: '💡 Course Fees!' },
    contact: { side: 'both', leftText: '💌 Contact Us!', rightText: '📞 Contact Us!' }
  };

  // Track sections shown: each section triggers entrance once per section visit
  const shownSections = new Set();
  let currentActiveSection = null;
  let hideTimer = null;

  function hideAllMascots() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    girlWrap.classList.remove('show');
    boyWrap.classList.remove('show');
  }

  function updateMascots(sectionId) {
    if (!sectionId || sectionId === currentActiveSection) return;
    const config = sectionConfig[sectionId];
    if (!config) return;
    currentActiveSection = sectionId;

    if (config.side === 'none') {
      hideAllMascots();
      return;
    }

    const isMobile = window.innerWidth <= 860;

    // If section has already been shown, do not re-trigger repeatedly
    if (shownSections.has(sectionId)) {
      hideAllMascots();
      return;
    }

    // Mark section as shown
    shownSections.add(sectionId);

    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    if (config.side === 'left') {
      girlText.textContent = config.text;
      if (vGirl && vGirl.paused) vGirl.play().catch(() => { });
      girlWrap.classList.add('show');
      boyWrap.classList.remove('show');
    } else if (config.side === 'right') {
      boyText.textContent = config.text;
      if (vBoy && vBoy.paused) vBoy.play().catch(() => { });
      boyWrap.classList.add('show');
      girlWrap.classList.remove('show');
    } else if (config.side === 'both') {
      girlText.textContent = config.leftText;
      boyText.textContent = config.rightText;
      if (vGirl && vGirl.paused) vGirl.play().catch(() => { });
      if (vBoy && vBoy.paused) vBoy.play().catch(() => { });
      girlWrap.classList.add('show');
      boyWrap.classList.add('show');
    }

    // Auto-dismiss smoothly after timeout so it doesn't linger indefinitely
    const autoDismissTime = isMobile ? 5000 : 6500;
    hideTimer = setTimeout(() => {
      girlWrap.classList.remove('show');
      boyWrap.classList.remove('show');
      hideTimer = null;
    }, autoDismissTime);
  }

  // Dual trigger: IntersectionObserver + Viewport position tracking for 100% reliable detection
  const sectionIds = Object.keys(sectionConfig);
  const sectionElements = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function checkActiveSection() {
    const vh = window.innerHeight;
    const midPoint = vh * 0.45;
    // Top of page: home
    if (window.scrollY < 180) {
      updateMascots('home');
      return;
    }
    // Bottom of page: contact
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 120) {
      updateMascots('contact');
      return;
    }
    // Find section covering the midPoint
    for (let i = 0; i < sectionElements.length; i++) {
      const el = sectionElements[i];
      const r = el.getBoundingClientRect();
      if (r.top <= midPoint && r.bottom > midPoint) {
        updateMascots(el.id);
        return;
      }
    }
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateMascots(entry.target.id);
        }
      });
    }, {
      rootMargin: '-15% 0px -25% 0px',
      threshold: [0.15, 0.4]
    });

    sectionElements.forEach(el => sectionObserver.observe(el));
  }

  // Scroll event backup to catch quick flicks, Lenis smooth scroll updates, or hashtag clicks
  let scrollThrottle = false;
  function onScrollHandler() {
    if (scrollThrottle) return;
    scrollThrottle = true;
    requestAnimationFrame(() => {
      scrollThrottle = false;
      checkActiveSection();
    });
  }

  window.addEventListener('scroll', onScrollHandler, { passive: true });
  if (window.__lenis) {
    window.__lenis.on('scroll', onScrollHandler);
  } else {
    window.addEventListener('load', () => {
      if (window.__lenis) window.__lenis.on('scroll', onScrollHandler);
    });
  }

  // Initial check on load
  setTimeout(checkActiveSection, 150);
}



/* ==========================================================================
   GLOBAL SMOOTH SCROLL ENGINE (Lenis Smooth Scroll - Desktop View Only > 860px)
   - Desktop: Physics-based inertial smooth wheel scroll (duration: 1.25s)
   - Desktop: Smooth scroll progress bar at top of viewport
   - Desktop: Smooth floating Scroll-to-Top button with animated glide
   - Mobile View (<= 860px): Strictly disabled so mobile enjoys 100% native momentum scrolling
   ========================================================================== */
let lenisInstance = null;

function initGlobalSmoothScroll() {
  const progressBar = document.getElementById('desktop-scroll-progress');
  const scrollTopBtn = document.getElementById('desktop-scroll-top');

  function updateDesktopScrollUI(scroll, limit) {
    if (window.innerWidth <= 860) return;

    // 1. Desktop Top Scroll Progress Bar
    if (progressBar && limit > 0) {
      const progress = Math.min(Math.max(scroll / limit, 0), 1);
      progressBar.style.transform = `scaleX(${progress})`;
    }

    // 2. Desktop Floating Scroll-to-Top Button
    if (scrollTopBtn) {
      if (scroll > 350) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }
  }

  function setup() {
    const isDesktop = window.innerWidth > 860;

    // If mobile: destroy Lenis if active, reset progress bar, and return
    if (!isDesktop) {
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
        window.__lenis = null;
      }
      if (progressBar) progressBar.style.transform = 'scaleX(0)';
      if (scrollTopBtn) scrollTopBtn.classList.remove('is-visible');
      return;
    }

    // If already running on desktop, update and return
    if (lenisInstance) return;

    if (typeof Lenis === 'undefined') return;

    try {
      lenisInstance = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.08,
        syncTouch: false,
        infinite: false,
      });

      window.__lenis = lenisInstance;

      function raf(time) {
        if (lenisInstance) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }
      }
      requestAnimationFrame(raf);

      lenisInstance.on('scroll', (e) => {
        updateDesktopScrollUI(e.scroll, e.limit);
        if (typeof window.__updateDesktopCards === 'function') {
          window.__updateDesktopCards();
        }
      });

      // Desktop anchor links smooth glide
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          if (window.innerWidth <= 860) return;
          const href = this.getAttribute('href');
          if (!href || href === '#' || href.length < 2) return;
          const target = document.querySelector(href);
          if (target && lenisInstance) {
            e.preventDefault();
            lenisInstance.scrollTo(target, { offset: -72, duration: 1.2 });
          }
        });
      });

      // Scroll-to-top button click
      if (scrollTopBtn) {
        scrollTopBtn.onclick = function(e) {
          e.preventDefault();
          if (lenisInstance) {
            lenisInstance.scrollTo(0, { duration: 1.3 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        };
      }
    } catch (err) {
      console.warn('Desktop smooth scroll error:', err);
    }
  }

  setup();
  window.addEventListener('resize', setup, { passive: true });
}

/* ==========================================================================
   DESKTOP CARD SMOOTH SCROLL FLOATING PARALLAX & 3D TILT ENGINE
   Features:
   - Synchronized with Lenis smooth wheel scrolling on desktop (> 860px)
   - Staggered vertical depth parallax for Course, Fee, Achievement, Pillar & Review cards
   - Subtle 3D perspective tilt reacting to viewport position & scroll velocity
   - Completely disabled on mobile (<= 860px) to preserve native touch performance
   ========================================================================== */
function initDesktopCardSmoothScroll() {
  const cardSelectors = [
    '.course-stack-card',
    '.fee-card',
    '.achievement-card',
    '.five-pillar-card',
    '.review-card',
    '.mission-card',
    '.vision-card'
  ];

  const cards = Array.from(document.querySelectorAll(cardSelectors.join(', ')));
  if (!cards.length) return;

  let ticking = false;
  const staggerPatterns = [-18, 14, -12, 16, -10, 12, -15, 13];

  function updateCards() {
    ticking = false;
    if (window.innerWidth <= 860) {
      cards.forEach(card => {
        card.style.removeProperty('--card-scroll-y');
        card.style.removeProperty('--card-scroll-tilt');
        card.style.removeProperty('--card-scroll-rot-y');
      });
      return;
    }

    const vh = window.innerHeight;

    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      // Only calculate for cards in or near the viewport (-120px to vh + 120px)
      if (rect.bottom >= -120 && rect.top <= vh + 120) {
        const cardCenter = rect.top + rect.height / 2;
        const normY = (cardCenter - vh / 2) / (vh / 2); // -1.2 to +1.2

        const mult = staggerPatterns[idx % staggerPatterns.length];
        const scrollY = normY * mult;
        const tiltX = Math.max(-4.5, Math.min(4.5, normY * -3.5));
        const rotY = (idx % 2 === 0 ? 1 : -1) * Math.max(-2.5, Math.min(2.5, normY * 1.8));

        card.style.setProperty('--card-scroll-y', `${scrollY.toFixed(2)}px`);
        card.style.setProperty('--card-scroll-tilt', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--card-scroll-rot-y', `${rotY.toFixed(2)}deg`);
      }
    });
  }

  function schedule() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateCards);
    }
  }

  window.__updateDesktopCards = schedule;

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  if (window.__lenis) {
    window.__lenis.on('scroll', schedule);
  } else {
    window.addEventListener('load', () => {
      if (window.__lenis) window.__lenis.on('scroll', schedule);
    });
  }

  schedule();
}
