"use client";

import { useEffect, useRef } from "react";

type Vec = [number, number, number];

type CrystalPoly = { type: "crystal"; p: Vec[]; z: number; lower: number; i: number };
type OrbitPoly = { type: "orbit"; p: Vec[]; z: number; k: number };
type Poly = CrystalPoly | OrbitPoly;

const TAU = Math.PI * 2;

const CODE_LINES = [
  "const intelligence = {",
  '  strategy: "balance",',
  "  horizon: Infinity,",
  "};",
  "function next(market) {",
  "  return portfolio.map(",
  "    asset => asset.value",
  "  );",
  "}",
  "if (risk < threshold) {",
  "  invest.future();",
  "  yield growth;",
  "}",
  "const alpha = 0.024;",
  "model.predict(data);",
  "return new Strategy();",
];

const rotY = (p: Vec, a: number): Vec => [
  p[0] * Math.cos(a) + p[2] * Math.sin(a),
  p[1],
  -p[0] * Math.sin(a) + p[2] * Math.cos(a),
];
const rotX = (p: Vec, a: number): Vec => [
  p[0],
  p[1] * Math.cos(a) - p[2] * Math.sin(a),
  p[1] * Math.sin(a) + p[2] * Math.cos(a),
];
const rotZ = (p: Vec, a: number): Vec => [
  p[0] * Math.cos(a) - p[1] * Math.sin(a),
  p[0] * Math.sin(a) + p[1] * Math.cos(a),
  p[2],
];

const area = (p: Vec[]) =>
  (p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[1][1] - p[0][1]) * (p[2][0] - p[0][0]);

function createTexture() {
  const texture = document.createElement("canvas");
  texture.width = 768;
  texture.height = 1024;
  const tc = texture.getContext("2d");
  if (!tc) return texture;

  let grad = tc.createLinearGradient(0, 0, 768, 1024);
  grad.addColorStop(0, "rgba(6,73,215,.80)");
  grad.addColorStop(0.36, "rgba(28,153,236,.64)");
  grad.addColorStop(0.65, "rgba(57,196,237,.52)");
  grad.addColorStop(1, "rgba(6,86,213,.76)");
  tc.fillStyle = grad;
  tc.fillRect(0, 0, 768, 1024);

  tc.textBaseline = "middle";
  tc.font = "bold 52px monospace";
  for (let i = 0; i < 18; i++) {
    const line = CODE_LINES[i % CODE_LINES.length];
    const x = -10 + (i % 3) * 12;
    const y = 35 + i * 59;
    tc.shadowColor = "#98f7ff";
    tc.shadowBlur = 32;
    tc.fillStyle = "rgba(207,252,255,.93)";
    tc.fillText(line, x, y);
    tc.shadowBlur = 13;
    tc.fillText(line, x, y);
  }
  tc.shadowBlur = 0;

  grad = tc.createLinearGradient(0, 0, 768, 0);
  grad.addColorStop(0, "#063cce38");
  grad.addColorStop(0.36, "#b4ffff18");
  grad.addColorStop(0.7, "#18dfff1a");
  grad.addColorStop(1, "#0038d944");
  tc.fillStyle = grad;
  tc.fillRect(0, 0, 768, 1024);

  return texture;
}

export default function HeroCrystal({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const texture = createTexture();
    let W = 0;
    let H = 0;
    let S = 0;
    let t = 0;
    let last = 0;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      S = Math.min(W / 5.6, H / 5);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (p: Vec): Vec => {
      const q = rotX(p, 0.11);
      const k = 7 / (7 - q[2]);
      return [W / 2 + q[0] * S * k, H / 2 - q[1] * S * k + Math.sin(t * 0.55) * S * 0.028, q[2]];
    };

    const path = (p: Vec[]) => {
      ctx.beginPath();
      p.forEach((v, i) => (i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])));
      ctx.closePath();
    };

    const textured = (p: Vec[], uv: number[][]) => {
      const [a, b, c] = p;
      const [u, v, w] = uv;
      const den = u[0] * (v[1] - w[1]) + v[0] * (w[1] - u[1]) + w[0] * (u[1] - v[1]);
      if (Math.abs(den) < 0.0001) return;
      const A = (a[0] * (v[1] - w[1]) + b[0] * (w[1] - u[1]) + c[0] * (u[1] - v[1])) / den;
      const B = (a[1] * (v[1] - w[1]) + b[1] * (w[1] - u[1]) + c[1] * (u[1] - v[1])) / den;
      const C = (a[0] * (w[0] - v[0]) + b[0] * (u[0] - w[0]) + c[0] * (v[0] - u[0])) / den;
      const D = (a[1] * (w[0] - v[0]) + b[1] * (u[0] - w[0]) + c[1] * (v[0] - u[0])) / den;
      const E = a[0] - A * u[0] - C * u[1];
      const F = a[1] - B * u[0] - D * u[1];
      ctx.save();
      path(p);
      ctx.clip();
      ctx.transform(A, B, C, D, E, F);
      ctx.drawImage(texture, 0, 0);
      ctx.restore();
    };

    const linear = (x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      return g;
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);

      const halo = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, S * 1.5);
      halo.addColorStop(0, "rgba(104,224,255,.13)");
      halo.addColorStop(0.5, "rgba(71,181,254,.055)");
      halo.addColorStop(1, "rgba(70,166,255,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      const polys: Poly[] = [];
      const angle = (t * TAU) / 48 + 0.34;
      const ring: Vec[] = [];
      for (let i = 0; i < 6; i++) {
        ring.push(rotY([1.04 * Math.cos((TAU * i) / 6), -0.12, 1.04 * Math.sin((TAU * i) / 6)], angle));
      }

      for (let i = 0; i < 6; i++) {
        for (let lower = 0; lower < 2; lower++) {
          const a = project([0, lower ? -1.62 : 1.78, 0]);
          const b = project(ring[i]);
          const c = project(ring[(i + 1) % 6]);
          const p = lower ? [a, c, b] : [a, b, c];
          if (area(p) < 0) continue;
          polys.push({ type: "crystal", p, z: (a[2] + b[2] + c[2]) / 3, lower, i });
        }
      }

      const orbit = (radius: number, tilt: number, spin: number, roll: number) => {
        const count = 384;
        const width = 0.225;
        const thick = 0.04;
        const point = (a: number, r: number, h: number) =>
          project(rotY(rotZ(rotX([r * Math.cos(a), h, r * Math.sin(a)], tilt), roll), spin));

        for (let k = 0; k < 3; k++) {
          let run: Vec[][] = [];
          const flush = () => {
            if (!run.length) return;
            const lo = run.map((q) => q[0]);
            lo.push(run[run.length - 1][1]);
            const hi = run.map((q) => q[3]);
            hi.push(run[run.length - 1][2]);
            const p = [...lo, ...hi.reverse()];
            polys.push({ type: "orbit", p, z: p.reduce((n, v) => n + v[2], 0) / p.length, k });
            run = [];
          };

          for (let j = 0; j < count; j++) {
            const a = (j / count) * TAU;
            const b = ((j + 1) / count) * TAU + 0.0025;
            const r = k === 2 ? radius - thick : radius;
            const p =
              k === 1
                ? [
                    point(a, radius - thick, width / 2),
                    point(b, radius - thick, width / 2),
                    point(b, radius, width / 2),
                    point(a, radius, width / 2),
                  ]
                : [point(a, r, -width / 2), point(b, r, -width / 2), point(b, r, width / 2), point(a, r, width / 2)];
            const s = area(p);
            const hidden = (k === 0 && s < 0) || (k === 2 && s > 0);
            if (hidden) {
              flush();
              continue;
            }
            run.push(p);
          }
          flush();
        }
      };

      orbit(2.22, 0.26, (t * TAU) / 32, 0.035);
      orbit(1.92, 0.64, (-t * TAU) / 65 + 0.3, 0.65);

      const ribbon = linear(W / 2 - S * 2.15, H / 2 + S * 0.15, W / 2 + S * 2.15, H / 2 - S * 0.15, [
        [0, "rgba(75,145,215,.58)"],
        [0.1, "rgba(153,207,239,.72)"],
        [0.26, "rgba(181,220,243,.66)"],
        [0.42, "rgba(109,174,227,.58)"],
        [0.55, "rgba(25,105,222,.72)"],
        [0.64, "rgba(39,137,231,.70)"],
        [0.76, "rgba(150,207,240,.68)"],
        [0.84, "rgba(207,234,248,.78)"],
        [0.9, "rgba(96,172,229,.62)"],
        [1, "rgba(163,207,237,.68)"],
      ]);
      const inside = linear(W / 2 - S * 2, H / 2 + S, W / 2 + S * 2, H / 2 - S, [
        [0, "rgba(100,166,221,.48)"],
        [0.2, "rgba(183,218,239,.58)"],
        [0.36, "rgba(224,241,250,.68)"],
        [0.5, "rgba(164,205,232,.52)"],
        [0.76, "rgba(172,211,235,.56)"],
        [1, "rgba(113,174,221,.50)"],
      ]);
      const bevel = linear(W / 2 - S * 2, H / 2, W / 2 + S * 2, H / 2, [
        [0, "rgba(150,204,239,.72)"],
        [0.25, "rgba(98,161,219,.65)"],
        [0.55, "rgba(48,120,209,.72)"],
        [0.82, "rgba(121,181,228,.68)"],
        [1, "rgba(181,218,242,.75)"],
      ]);

      polys.sort((a, b) => a.z - b.z);

      for (const f of polys) {
        if (f.type === "crystal") {
          textured(
            f.p,
            f.lower
              ? [
                  [384, 1024],
                  [0, 0],
                  [768, 0],
                ]
              : [
                  [384, 0],
                  [768, 1024],
                  [0, 1024],
                ],
          );
          path(f.p);
          ctx.fillStyle = `rgba(0,40,160,${0.025 + (f.i % 3) * 0.075})`;
          ctx.fill();
          ctx.save();
          ctx.clip();
          ctx.fillStyle = linear(f.p[1][0], f.p[1][1], f.p[2][0], f.p[2][1], [
            [0, "rgba(115,225,255,.20)"],
            [0.09, "rgba(99,222,253,.035)"],
            [0.38, "rgba(163,246,255,.025)"],
            [0.52, "rgba(185,250,255,.16)"],
            [0.62, "rgba(55,189,242,.025)"],
            [1, "rgba(0,40,155,.19)"],
          ]);
          ctx.fill();
          const inner = ctx.createRadialGradient(W / 2, H / 2 - S * 0.14, 0, W / 2, H / 2 - S * 0.14, S * 0.95);
          inner.addColorStop(0, "rgba(128,238,255,.17)");
          inner.addColorStop(0.45, "rgba(75,214,255,.06)");
          inner.addColorStop(1, "rgba(70,200,255,0)");
          ctx.fillStyle = inner;
          ctx.fill();
          ctx.restore();
        } else {
          path(f.p);
          ctx.fillStyle = f.k === 1 ? bevel : f.k === 2 ? inside : ribbon;
          ctx.fill();
          if (f.k === 0) {
            ctx.save();
            ctx.clip();
            ctx.fillStyle = linear(W / 2 - S * 1.9, H / 2 - S * 0.8, W / 2 + S * 1.9, H / 2 + S * 0.6, [
              [0, "rgba(255,255,255,0)"],
              [0.38, "rgba(215,245,255,.05)"],
              [0.52, "rgba(236,251,255,.18)"],
              [0.63, "rgba(180,226,249,.05)"],
              [1, "rgba(255,255,255,0)"],
            ]);
            ctx.fill();
            ctx.restore();
          }
        }
      }
    };

    const tick = (ms: number) => {
      const dt = last ? Math.min((ms - last) / 1000, 0.05) : 0;
      last = ms;
      if (visible && !document.hidden) {
        t += dt;
        frame();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    frame();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      frame();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(canvas);

    if (!reduceMotion) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
