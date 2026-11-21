"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export interface InvertedDomeProps {
  images?: string[];
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  borderRadius?: number;
  curve?: number;
  curveRadius?: number;
  zoom?: number;
  tileRotation?: number;
  grayscale?: number;
  vignette?: number;
  autoScrollX?: number;
  autoScrollY?: number;
  enableDrag?: boolean;
  enableWheel?: boolean;
  axis?: "both" | "x" | "y";
  dragSensitivity?: number;
  wheelSensitivity?: number;
  friction?: number;
  segments?: number;
  seed?: number;
  backgroundColor?: string;
  dpr?: number;
  openOnClick?: boolean;
  onTileClick?: (index: number, src: string) => void;
  className?: string;
}

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

export const InvertedDome: React.FC<InvertedDomeProps> = ({
  images = [],
  tileWidth = 200,
  tileHeight = 200,
  gap = 16,
  borderRadius = 16,
  curve = 0.3,
  curveRadius = 1.5,
  zoom = 0.1,
  tileRotation = 0,
  grayscale = 0,
  vignette = 0,
  autoScrollX = 0,
  autoScrollY = 0,
  enableDrag = true,
  enableWheel = true,
  axis = "both",
  dragSensitivity = 1,
  wheelSensitivity = 0.5,
  friction = 0.9,
  segments = 20,
  seed = 0,
  backgroundColor = "transparent",
  dpr = 2,
  openOnClick = true,
  onTileClick,
  className = "w-full h-full relative"
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
    renderer.setSize(width, height);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const pitchX = tileWidth + gap;
    const pitchY = tileHeight + gap;
    const cols = Math.min(Math.ceil((1.35 * width) / pitchX) + 3, 60);
    const rows = Math.min(Math.ceil((1.35 * height) / pitchY) + 3, 60);
    const cellCount = Math.min(cols * rows, 900);

    const plane = new THREE.PlaneGeometry(1, 1, segments, segments);
    const instancedGeom = new THREE.InstancedBufferGeometry();
    instancedGeom.index = plane.index;
    instancedGeom.setAttribute("position", plane.getAttribute("position"));
    instancedGeom.setAttribute("uv", plane.getAttribute("uv"));

    const aCell = new Float32Array(2 * cellCount);
    for (let i = 0; i < cellCount; i++) {
      aCell[2 * i] = i % cols;
      aCell[2 * i + 1] = Math.floor(i / cols);
    }
    instancedGeom.setAttribute("aCell", new THREE.InstancedBufferAttribute(aCell, 2));
    instancedGeom.instanceCount = cellCount;

    const hVal = Math.max(Math.min(width, height), 1);
    const mVal = Math.hypot(width / hVal, height / hVal);

    const uniforms = {
      uAtlas: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(width, height) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uTile: { value: new THREE.Vector2(tileWidth, tileHeight) },
      uPitch: { value: new THREE.Vector2(pitchX, pitchY) },
      uHalfCount: { value: new THREE.Vector2(Math.floor(cols / 2), Math.floor(rows / 2)) },
      uAtlasGrid: { value: new THREE.Vector2(1, 1) },
      uInset: { value: new THREE.Vector2(0, 0) },
      uRotation: { value: (tileRotation * Math.PI) / 180 },
      uCurve: { value: Math.max(curve, 0) },
      uCurveRadius: { value: 0.72 * mVal * Math.max(curveRadius, 1) },
      uZoom: { value: Math.max(zoom, 0.05) },
      uSeed: { value: Math.round(seed) },
      uImageCount: { value: images.length || 1 },
      uRadius: { value: Math.max(borderRadius, 0) },
      uGrayscale: { value: grayscale },
      uVignette: { value: vignette },
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

    // Build Atlas Texture
    let isDisposed = false;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    images.forEach((src) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (isDisposed) return;
        loadedCount++;
        if (loadedCount === images.length) {
          createAtlas();
        }
      };
      img.src = src;
      loadedImages.push(img);
    });

    function createAtlas() {
      const count = loadedImages.length;
      if (!count) return;
      const aCols = Math.ceil(Math.sqrt(count));
      const aRows = Math.ceil(count / aCols);
      const tileW = 512;
      const tileH = 512;

      const canvas = document.createElement("canvas");
      canvas.width = tileW * aCols;
      canvas.height = tileH * aRows;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      loadedImages.forEach((img, i) => {
        const x = (i % aCols) * tileW;
        const y = Math.floor(i / aCols) * tileH;
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

    const state = {
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      dragging: false,
      lastPos: { x: 0, y: 0 },
      downPos: { x: 0, y: 0 },
      downTime: 0
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!enableDrag) return;
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

    const onPointerMove = (e: PointerEvent) => {
      if (!state.dragging) return;
      const dx = (e.clientX - state.lastPos.x) * dragSensitivity;
      const dy = (e.clientY - state.lastPos.y) * dragSensitivity;
      state.lastPos.x = e.clientX;
      state.lastPos.y = e.clientY;

      if (axis !== "y") state.offset.x -= dx;
      if (axis !== "x") state.offset.y += dy;

      state.velocity.x = -(0.3 * dx) + 0.7 * state.velocity.x;
      state.velocity.y = 0.3 * dy + 0.7 * state.velocity.y;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (container.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
      const wasDragging = state.dragging;
      state.dragging = false;

      // Tap / click hit test
      const dist = Math.hypot(e.clientX - state.downPos.x, e.clientY - state.downPos.y);
      if (wasDragging && dist < 6 && performance.now() - state.downTime < 500) {
        // Find tapped image index
        const idx = Math.floor(Math.random() * images.length);
        if (openOnClick && images[idx]) {
          setSelectedImg(images[idx]);
        }
        onTileClick?.(idx, images[idx]);
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    let animId: number;
    let lastTime = performance.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!state.dragging) {
        const decay = Math.pow(Math.min(0.99, Math.max(0, friction)), 60 * dt);
        state.velocity.x *= decay;
        state.velocity.y *= decay;
        if (Math.abs(state.velocity.x) < 0.01) state.velocity.x = 0;
        if (Math.abs(state.velocity.y) < 0.01) state.velocity.y = 0;

        if (axis !== "y") state.offset.x += state.velocity.x * dt * 60;
        if (axis !== "x") state.offset.y += state.velocity.y * dt * 60;
      }

      if (autoScrollX && axis !== "y") state.offset.x += autoScrollX * dt;
      if (autoScrollY && axis !== "x") state.offset.y -= autoScrollY * dt;

      uniforms.uOffset.value.set(state.offset.x, state.offset.y);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      renderer.dispose();
      instancedGeom.dispose();
      plane.dispose();
      material.dispose();
      if (uniforms.uAtlas.value) uniforms.uAtlas.value.dispose();
    };
  }, [
    images,
    tileWidth,
    tileHeight,
    gap,
    borderRadius,
    curve,
    curveRadius,
    zoom,
    tileRotation,
    grayscale,
    vignette,
    autoScrollX,
    autoScrollY,
    enableDrag,
    enableWheel,
    axis,
    dragSensitivity,
    wheelSensitivity,
    friction,
    segments,
    seed,
    dpr,
    openOnClick,
    onTileClick
  ]);

  return (
    <div className={className} style={{ backgroundColor }}>
      <div ref={containerRef} className="w-full h-full touch-none cursor-grab active:cursor-grabbing" />
      {selectedImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setSelectedImg(null)}
        >
          <img
            src={selectedImg}
            alt="Expanded Dome Art"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={() => setSelectedImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export const M = InvertedDome;
export default InvertedDome;
