"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle interactive honeycomb: hexagons gently brighten near the pointer and
 * a few "pollen" dots drift. Pauses when off-screen and respects reduced motion.
 */
export function HoneycombBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };
    const R = 26;
    const HX = Math.sqrt(3) * R;
    const VY = 1.5 * R;
    const pollen = Array.from({ length: 18 }, () => ({ x: Math.random(), y: Math.random(), s: 0.00015 + Math.random() * 0.0003, r: 1.5 + Math.random() * 2.5, p: Math.random() * Math.PI * 2 }));

    function colors() {
      const dark = document.documentElement.classList.contains("dark");
      return dark
        ? { line: "rgba(157,176,132,0.16)", glow: "226,184,74", dot: "226,184,74" }
        : { line: "rgba(23,77,54,0.10)", glow: "213,168,46", dot: "213,168,46" };
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function hex(cx: number, cy: number) {
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        const x = cx + R * Math.cos(a);
        const y = cy + R * Math.sin(a);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
    }

    function draw(t: number) {
      const c = colors();
      ctx!.clearRect(0, 0, w, h);
      ctx!.lineWidth = 1;
      for (let row = -1, y = 0; y < h + R * 2; row++, y = row * VY) {
        const offset = row % 2 ? HX / 2 : 0;
        for (let x = -HX + offset; x < w + HX; x += HX) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          const near = Math.max(0, 1 - d / 180);
          hex(x, y);
          if (near > 0) {
            ctx!.fillStyle = `rgba(${c.glow},${0.22 * near})`;
            ctx!.fill();
          }
          ctx!.strokeStyle = c.line;
          ctx!.stroke();
        }
      }
      for (const p of pollen) {
        const px = ((p.x + t * p.s) % 1) * w;
        const py = (p.y + Math.sin(t / 1600 + p.p) * 0.03) * h;
        ctx!.beginPath();
        ctx!.arc(px, py, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${c.dot},0.55)`;
        ctx!.fill();
      }
    }

    function loop(t: number) {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      if (reduced) draw(0);
    }
    function onLeave() {
      pointer.x = pointer.y = -9999;
      if (reduced) draw(0);
    }

    resize();
    const parent = canvas.parentElement!;
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
