"use client";

import { useEffect, useRef } from "react";

/**
 * OrbCanvas — a self-contained Three.js 3D particle-sphere orb that fills
 * the entire hero background. No external URLs or CDN dependencies.
 *
 * Architecture:
 *   - ~2 000 dots arranged on the surface of a sphere (Fibonacci lattice)
 *   - Two nested particle shells for depth (outer + inner haze ring)
 *   - Mouse parallax: the orb subtly tracks the cursor
 *   - Continuous slow Y-axis rotation
 *   - Teal / cyan color gradient that matches the hero accent palette
 *   - Fully GPU-accelerated; <canvas> sits at z-index 0 behind all text
 */
export function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let three: typeof import("three") | null = null;
    let renderer: import("three").WebGLRenderer | null = null;

    async function init() {
      three = await import("three");
      const {
        WebGLRenderer,
        Scene,
        PerspectiveCamera,
        BufferGeometry,
        BufferAttribute,
        Points,
        PointsMaterial,
        AdditiveBlending,
        Color,
        Vector3,
        Group,
      } = three;

      // ── Renderer ──────────────────────────────────────────────────────
      renderer = new WebGLRenderer({ canvas: canvas!, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas!.clientWidth, canvas!.clientHeight);
      renderer.setClearColor(0x000000, 0); // transparent background

      // ── Scene / Camera ─────────────────────────────────────────────────
      const scene = new Scene();
      const camera = new PerspectiveCamera(
        60,
        canvas!.clientWidth / canvas!.clientHeight,
        0.1,
        100,
      );
      camera.position.z = 3.2;

      // ── Helper: Fibonacci sphere positions ─────────────────────────────
      function fibonacciSphere(n: number, radius: number): Float32Array {
        const positions = new Float32Array(n * 3);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < n; i++) {
          const y = 1 - (i / (n - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const theta = golden * i;
          positions[i * 3] = Math.cos(theta) * r * radius;
          positions[i * 3 + 1] = y * radius;
          positions[i * 3 + 2] = Math.sin(theta) * r * radius;
        }
        return positions;
      }

      // ── Helper: color array (teal → cyan → white gradient by Y) ────────
      function buildColors(positions: Float32Array, n: number): Float32Array {
        const colors = new Float32Array(n * 3);
        const lo = new Color("#0A6B68"); // lagoon-deep
        const mid = new Color("#5CC6C0"); // hero-accent
        const hi = new Color("#DCF8F6");  // near-white
        for (let i = 0; i < n; i++) {
          const y = positions[i * 3 + 1]; // -radius … +radius
          const t = (y + 1.0) / 2.0;      // 0 … 1
          const c = new Color();
          if (t < 0.5) c.lerpColors(lo, mid, t * 2);
          else c.lerpColors(mid, hi, (t - 0.5) * 2);
          colors[i * 3] = c.r;
          colors[i * 3 + 1] = c.g;
          colors[i * 3 + 2] = c.b;
        }
        return colors;
      }

      // ── Outer shell — 2 000 dots, R = 1.0 ─────────────────────────────
      const N_OUTER = 2000;
      const outerPos = fibonacciSphere(N_OUTER, 1.0);
      const outerGeo = new BufferGeometry();
      outerGeo.setAttribute("position", new BufferAttribute(outerPos, 3));
      outerGeo.setAttribute("color", new BufferAttribute(buildColors(outerPos, N_OUTER), 3));

      const outerMat = new PointsMaterial({
        size: 0.018,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      const outerPoints = new Points(outerGeo, outerMat);

      // ── Inner shell — 600 dots, R = 0.62, dimmer ──────────────────────
      const N_INNER = 600;
      const innerPos = fibonacciSphere(N_INNER, 0.62);
      const innerColors = buildColors(innerPos, N_INNER);
      const innerGeo = new BufferGeometry();
      innerGeo.setAttribute("position", new BufferAttribute(innerPos, 3));
      innerGeo.setAttribute("color", new BufferAttribute(innerColors, 3));

      const innerMat = new PointsMaterial({
        size: 0.012,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      const innerPoints = new Points(innerGeo, innerMat);

      // ── Halo ring — 400 dots scattered at R = 1.18, very faint ────────
      const N_HALO = 400;
      const haloPos = fibonacciSphere(N_HALO, 1.18);
      const haloGeo = new BufferGeometry();
      haloGeo.setAttribute("position", new BufferAttribute(haloPos, 3));

      const halosColors = new Float32Array(N_HALO * 3);
      const haloColor = new Color("#7EC8C6");
      for (let i = 0; i < N_HALO; i++) {
        halosColors[i * 3] = haloColor.r;
        halosColors[i * 3 + 1] = haloColor.g;
        halosColors[i * 3 + 2] = haloColor.b;
      }
      haloGeo.setAttribute("color", new BufferAttribute(halosColors, 3));

      const haloMat = new PointsMaterial({
        size: 0.008,
        vertexColors: true,
        transparent: true,
        opacity: 0.18,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      const haloPoints = new Points(haloGeo, haloMat);

      // ── Group everything ───────────────────────────────────────────────
      const orbGroup = new Group();
      orbGroup.add(outerPoints, innerPoints, haloPoints);
      scene.add(orbGroup);

      // ── Mouse parallax tracking ────────────────────────────────────────
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      function onMouseMove(e: MouseEvent) {
        const rect = canvas!.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }
      function onTouchMove(e: TouchEvent) {
        if (!e.touches[0]) return;
        const rect = canvas!.getBoundingClientRect();
        mouseX = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.touches[0].clientY - rect.top) / rect.height - 0.5) * 2;
      }

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });

      // ── Resize handler ─────────────────────────────────────────────────
      const ro = new ResizeObserver(() => {
        if (!canvas || !renderer) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      if (canvas) ro.observe(canvas);

      // ── Animation loop ─────────────────────────────────────────────────
      const clock = { start: performance.now() };

      function animate() {
        animId = requestAnimationFrame(animate);
        const elapsed = (performance.now() - clock.start) / 1000;

        // Slow continuous Y rotation
        orbGroup.rotation.y = elapsed * 0.12;
        // Subtle X tilt for life
        orbGroup.rotation.x = Math.sin(elapsed * 0.07) * 0.12;

        // Smooth mouse parallax (lazy follow)
        targetX += (mouseX * 0.18 - targetX) * 0.04;
        targetY += (mouseY * 0.18 - targetY) * 0.04;
        orbGroup.rotation.y += targetX;
        orbGroup.rotation.x += targetY;

        // Breathing scale pulse
        const breathe = 1 + Math.sin(elapsed * 0.55) * 0.025;
        orbGroup.scale.setScalar(breathe);

        renderer!.render(scene, camera);
      }

      animate();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchmove", onTouchMove);
        ro.disconnect();
        outerGeo.dispose();
        outerMat.dispose();
        innerGeo.dispose();
        innerMat.dispose();
        haloGeo.dispose();
        haloMat.dispose();
        renderer?.dispose();
      };
    }

    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
