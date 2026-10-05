// Generates the hand-drawn wing mark variations in public/brand/wing/.
// Usage: node scripts/wing-variants.mjs
// Every variant is seeded, so output is reproducible; change a seed in layout() to re-roll one.
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'brand', 'wing')

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(r, n = 32) { const v = Array.from({ length: n + 2 }, () => r() * 2 - 1); return x => { x = Math.max(0, x) * 1; const i = Math.floor(x), f = x - i, a = v[i % (n + 1)], b = v[(i + 1) % (n + 1)]; const s = (1 - Math.cos(f * Math.PI)) / 2; return a + (b - a) * s; }; }
const f2 = n => +n.toFixed(1);
const lerp = (a, b, t) => a + (b - a) * t;

// Catmull-Rom closed/open polyline -> smooth cubic path
function smooth(pts, closed = true, k = 1) {
  const n = pts.length; const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f2(pts[0][0])},${f2(pts[0][1])}`;
  const end = closed ? n : n - 1;
  for (let i = 0; i < end; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k];
    d += `C${f2(c1[0])},${f2(c1[1])} ${f2(c2[0])},${f2(c2[1])} ${f2(p2[0])},${f2(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

// cubic bezier point + tangent
function bez(a, b, c, d, t) { const u = 1 - t; return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0], u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]; }

// A feather "spine": root -> tip, bowed. Returns sampler s(t) -> {p, n(normal pointing 'up/leading')}
function spine(root, tip, bow, wob, r) {
  const dx = tip[0] - root[0], dy = tip[1] - root[1], L = Math.hypot(dx, dy);
  const nx = dy / L, ny = -dx / L; // left normal (towards upper-left / leading edge)
  const c1 = [root[0] + dx * .33 + nx * bow * L * .9, root[1] + dy * .33 + ny * bow * L * .9];
  const c2 = [root[0] + dx * .7 + nx * bow * L * 1.1, root[1] + dy * .7 + ny * bow * L * 1.1];
  const nz = noise1(r);
  const s = t => {
    const p = bez(root, c1, c2, tip, t), q = bez(root, c1, c2, tip, t + .002), p0 = bez(root, c1, c2, tip, t - .002);
    const tx = q[0] - p0[0], ty = q[1] - p0[1], l = Math.hypot(tx, ty);
    const n = [ty / l, -tx / l];
    const w = nz(t * 5) * wob * Math.sin(Math.PI * t);
    return { p: [p[0] + n[0] * w, p[1] + n[1] * w], n, tan: [tx / l, ty / l] };
  };
  s.L = L; return s;
}

// filled tapered feather polygon
function feather(s, o, r) {
  const { W, cut = .9, cutSide = 1, rootTaper = .12, edgeAmp = .8, N = 48, bulge = .55, notch = null } = o;
  const nA = noise1(r), nB = noise1(r), fA = 4 + r() * 4, fB = 4 + r() * 4;
  const { grow = 0 } = o;
  const prof = t => {
    const rise = Math.min(1, t / rootTaper); const sR = Math.sin(rise * Math.PI / 2);
    const fall = t > bulge ? Math.pow(Math.cos((t - bulge) / (1 - bulge) * Math.PI / 2), .7) : 1;
    const g = grow ? Math.max(.03, Math.pow(Math.min(1, t / bulge), grow)) : 1;
    return W * (.25 + .75 * sR) * fall * g;
  };
  const up = [], dn = [];
  const tEndUp = cutSide > 0 ? 1 : cut, tEndDn = cutSide > 0 ? cut : 1;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const tu = t * tEndUp, td = t * tEndDn;
    const a = s(tu), b = s(td);
    let wu = prof(tu) * .5 * (1 + edgeAmp * .12 * nA(tu * fA)), wd = prof(td) * .5 * (1 + edgeAmp * .12 * nB(td * fB));
    if (cutSide > 0) wd = Math.max(wd, prof(td) * .5 * .9 * (td / tEndDn) ** 6 * 1.4); else wu = Math.max(wu, prof(tu) * .5 * .9 * (tu / tEndUp) ** 6 * 1.4);
    if (notch && Math.abs(tu - notch.t) < notch.w) wu *= 1 - notch.d * Math.cos((tu - notch.t) / notch.w * Math.PI / 2);
    up.push([a.p[0] + a.n[0] * wu + (r() - .5) * edgeAmp * .25, a.p[1] + a.n[1] * wu + (r() - .5) * edgeAmp * .25]);
    dn.push([b.p[0] - b.n[0] * wd + (r() - .5) * edgeAmp * .25, b.p[1] - b.n[1] * wd + (r() - .5) * edgeAmp * .25]);
  }
  return smooth(up.concat(dn.reverse()));
}

// thin tapered ribbon along a sampler (for ink lines / bristles)
function ribbon(s, t0, t1, w, r, o = {}) {
  const { N = 40, taper0 = .15, taper1 = .35, off = 0, amp = .3, press = 0 } = o;
  const nz = noise1(r), nw = noise1(r), up = [], dn = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, t = lerp(t0, t1, u), a = s(t);
    let ww = w * Math.min(1, Math.sin(Math.min(1, u / taper0) * Math.PI / 2)) * Math.min(1, Math.pow(Math.sin(Math.min(1, (1 - u) / taper1) * Math.PI / 2), 1.2));
    ww *= 1 + press * nw(u * 6);
    const c = off(t) + nz(u * 7) * amp;
    up.push([a.p[0] + a.n[0] * (c + ww / 2), a.p[1] + a.n[1] * (c + ww / 2)]);
    dn.push([a.p[0] + a.n[0] * (c - ww / 2), a.p[1] + a.n[1] * (c - ww / 2)]);
  }
  return smooth(up.concat(dn.reverse()));
}

// wing layout: count feathers, fan from a wrist curve; asymmetry via jitter
function layout(seed, o = {}) {
  const r = rng(seed);
  const { n = 12, a0 = -45, a1 = -4, L0 = 590, L1 = 330, pivot = [24, 420], wristLen = 70, jitterA = .7, jitterL = .06, curve = 1.25 } = o;
  const fs = [];
  for (let i = 0; i < n; i++) {
    let t = i / (n - 1);
    t = Math.pow(t, curve === 1 ? 1 : .92) ;
    const ang = (lerp(a0, a1, t) + (r() - .5) * 2 * jitterA * (i ? 1 : .3)) * Math.PI / 180;
    let L = lerp(L0, L1, Math.pow(t, 1.15)) * (1 + (r() - .5) * 2 * jitterL * (i ? 1 : .2));
    // roots move along the 'arm' (from pivot up-right a bit), lower feathers root further right
    const rootT = lerp(.95, .15, t) + (r() - .5) * .08;
    const root = [pivot[0] + Math.cos(-50 * Math.PI / 180) * wristLen * rootT + 10 * t, pivot[1] + Math.sin(-50 * Math.PI / 180) * wristLen * rootT + 6 * t];
    const tip = [pivot[0] + Math.cos(ang) * L, pivot[1] + Math.sin(ang) * L];
    fs.push({ i, t, root, tip, ang, L, dA: Math.abs(a1 - a0) / (n - 1) * Math.PI / 180, r: rng(seed * 31 + i * 7 + 1) });
  }
  return fs;
}

function svg(paths, vb, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="#111">${extra}\n${paths.map(d => `  <path d="${d}"/>`).join('\n')}\n</svg>\n`;
}
const V = {};
const fanW = (f, k, b) => k * f.L * b * f.dA; // width that leaves a sliver gap to the neighbour
const halfwFn = (W, b = .6) => t => (t = Math.min(1, t), W / 2 * Math.max(.03, Math.pow(Math.min(1, t / b), .85)) * (t > b ? Math.pow(Math.max(0, Math.cos((t - b) / (1 - b) * Math.PI / 2)), .6) : 1));

// A — Ink: solid brush feathers, uneven, the closest relative of the original
V['a-ink'] = () => {
  const L = layout(7, { n: 12, wristLen: 40 });
  return svg(L.map(f => {
    const b = .66 + f.r() * .14;
    const s = spine(f.root, f.tip, .035 + f.r() * .008, 2.5, f.r);
    return feather(s, { W: fanW(f, .8 + f.r() * .2, b), grow: .6, cut: .82 + f.r() * .1, bulge: b, edgeAmp: 1.4, rootTaper: .05 }, f.r);
  }), '0 0 500 450');
};

// B — Dry brush: each feather a bundle of bristle strokes that breaks up toward the tip
V['b-drybrush'] = () => {
  const L = layout(21, { n: 11, jitterL: .08, wristLen: 40 });
  const P = [];
  for (const f of L) {
    const s = spine(f.root, f.tip, .04 + f.r() * .008, 3, f.r);
    const W = fanW(f, .95, .7), nb = 5 + Math.floor(f.r() * 4), hw = halfwFn(W, .7);
    for (let k = 0; k < nb; k++) {
      const u = k / (nb - 1) - .5, end = .8 + f.r() * .2 - Math.abs(u) * .3 * f.r();
      P.push(ribbon(s, f.r() * .05, end, W / nb * (1.3 + f.r() * .8), f.r, { off: t => u * 1.7 * hw(t), amp: .45, taper0: .08, taper1: .25 + f.r() * .3, press: .4 }));
    }
  }
  return svg(P, '0 0 500 450');
};

// C — Gesture: six loose, splayed calligraphic feathers + one drifting free
V['c-gesture'] = () => {
  const L = layout(5, { n: 6, a0: -52, a1: -6, L0: 560, L1: 340, jitterA: 2.5, jitterL: .1, wristLen: 50 });
  const P = L.map(f => {
    const b = .55 + f.r() * .15;
    const s = spine(f.root, f.tip, .06 + f.r() * .02, 4, f.r);
    return feather(s, { W: fanW(f, .6 + f.r() * .2, b), grow: .85, cut: .82 + f.r() * .1, bulge: b, edgeAmp: 1.6, rootTaper: .05 }, f.r);
  });
  const r = rng(99);
  P.push(feather(spine([330, 452], [470, 402], .1, 2, r), { W: 13, cut: .84, bulge: .55, edgeAmp: 1.2, rootTaper: .2 }, r));
  return svg(P, '0 0 500 450');
};

// D — Pen: nib outlines with overshoot, open roots, hairline quills
V['d-pen'] = () => {
  const L = layout(13, { n: 8, jitterL: .07, wristLen: 40 });
  const P = [];
  for (const f of L) {
    const s = spine(f.root, f.tip, .045 + f.r() * .008, 3, f.r);
    const hw = halfwFn(fanW(f, .72, .65), .65);
    P.push(ribbon(s, .02, 1.0 + f.r() * .03, 3.4, f.r, { off: t => hw(t), amp: .5, press: .5, taper1: .2 }));
    P.push(ribbon(s, .1 + f.r() * .1, .93 + f.r() * .05, 2.4, f.r, { off: t => -hw(t) * .95, amp: .5, press: .5, taper0: .3 }));
    P.push(ribbon(s, 0, .7 + f.r() * .15, 1, f.r, { off: () => 0, amp: .3, taper1: .6 }));
  }
  return svg(P, '0 0 500 450');
};

// E — Heavy leading edge: bold primaries up top, lighter feathers fall away below
V['e-split'] = () => {
  const L = layout(42, { n: 12, a0: -47, a1: -5, wristLen: 45 });
  return svg(L.map((f, i) => {
    const heavy = i < 3, b = heavy ? .72 : .6 + f.r() * .15;
    const s = spine(f.root, f.tip, .03 + f.r() * .008 + (i > 7 ? .02 : 0), 2.5, f.r);
    return feather(s, { W: fanW(f, heavy ? 1.15 : .6 + f.r() * .2, b), grow: .85, cut: .85 + f.r() * .1, bulge: b, edgeAmp: 1.3, rootTaper: .05, cutSide: i === 1 ? -1 : 1 }, f.r);
  }), '0 0 500 450');
};

// F — Sketch: doubled, slightly misregistered outlines over a pale wash
V['f-sketch'] = () => {
  const L = layout(77, { n: 8, jitterL: .09, wristLen: 40 });
  const P = [], wash = [];
  for (const f of L) {
    const s = spine(f.root, f.tip, .05 + f.r() * .008, 3.5, f.r);
    const W = fanW(f, .75, .65), hw = halfwFn(W, .65);
    wash.push(feather(s, { W: W * .95, grow: .85, cut: .9, bulge: .65, edgeAmp: 2, rootTaper: .05 }, f.r));
    for (let pass = 0; pass < 2; pass++) {
      const d = (f.r() - .5) * 2.2;
      P.push(ribbon(s, f.r() * .05, 1.02, 1.7 + f.r() * .9, f.r, { off: t => hw(t) + d, amp: .8, press: .6 }));
      P.push(ribbon(s, .08 + f.r() * .1, .95, 1.4 + f.r() * .9, f.r, { off: t => -hw(t) + d, amp: .8, press: .6 }));
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" fill="#111">\n  <g opacity=".08">\n${wash.map(d => `    <path d="${d}"/>`).join('\n')}\n  </g>\n${P.map(d => `  <path d="${d}"/>`).join('\n')}\n</svg>\n`;
};


// tight viewBox from the path coordinates, with a little breathing room
function fit(src) {
  const nums = [...src.matchAll(/ d="([^"]+)"/g)].flatMap(m => m[1].match(/-?\d*\.?\d+/g).map(Number))
  const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1)
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const pad = Math.max(x1 - x0, y1 - y0) * 0.04
  const vb = [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].map(n => +n.toFixed(1)).join(' ')
  return src.replace(/viewBox="[^"]*"/, `viewBox="${vb}"`)
}

fs.mkdirSync(OUT, { recursive: true })
for (const [name, make] of Object.entries(V)) {
  const src = fit(make())
  fs.writeFileSync(path.join(OUT, `wing-${name}.svg`), src)
  fs.writeFileSync(path.join(OUT, `wing-${name}-white.svg`), src.replace('fill="#111"', 'fill="#fff"'))
}
console.log(`wrote ${Object.keys(V).length * 2} files to ${path.relative(process.cwd(), OUT)}`)
