// Shorter / fatter variations of the traced wing mark, with fewer blades.
// Usage: node scripts/wing-stout.mjs  ->  public/brand/wing/stout/
// Built in the traced mark's own frame (448 x 423): a solid heel at the lower left, blades fanning
// from a short "arm", chiselled tips, faceted edges and slivers that close up toward the base.
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'brand', 'wing', 'stout')

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
function noise(r, n = 16) { const v = Array.from({ length: n + 2 }, () => r() * 2 - 1); return x => { const i = Math.min(n, Math.floor(Math.max(0, x))), f = x - i, s = (1 - Math.cos(Math.min(1, f) * Math.PI)) / 2; return v[i] + (v[i + 1] - v[i]) * s } }
const lerp = (a, b, t) => a + (b - a) * t
const quad = (a, c, b, t) => [0, 1].map(k => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * c[k] + t * t * b[k])
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x))
// all subpaths share one winding so they union cleanly in a single nonzero path (no seams)
const area = pts => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1] }, 0)
const pathOf = pts => { if (area(pts) < 0) pts = pts.slice().reverse(); return 'M' + pts.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L') + 'Z' }

function wing({ seed, n, len = 1, spread = 1, gap = 1 }) {
  const r = rng(seed)
  const H = [0, 423], armTop = [96, 214], armBot = [132, 386]
  const arm = u => quad(armTop, [106, 300], armBot, u)
  const ang = u => (-24 + (u - 0.5) * 24 * spread) * Math.PI / 180
  const L = u => (lerp(370, 245, u ** 1.6) + 28 * Math.sin(Math.PI * u)) * len

  // n+1 boundary curves; blade i sits between boundary i and i+1
  const B = []
  for (let j = 0; j <= n; j++) {
    const u = j === 0 || j === n ? j / n : j / n + (r() - 0.5) * 0.3 / n
    const S = arm(u), a = ang(u), l = L(u) * (j === n ? 0.95 : 1 + (r() - 0.5) * 0.08)
    const T = [S[0] + Math.cos(a) * l, S[1] + Math.sin(a) * l]
    const nx = Math.sin(a), ny = -Math.cos(a) // normal toward the leading (upper-left) side
    const bow = (j === n ? 0.02 : 0.05 + r() * 0.015) * l
    const C = [(S[0] + T[0]) / 2 + nx * bow, (S[1] + T[1]) / 2 + ny * bow]
    const wob = noise(r), g0 = 0.03 + r() * 0.14, gmax = (4 + r() * 3.5) * gap
    const at = t => { const p = quad(S, C, T, t), w = wob(t * 3) * 1.6 * Math.sin(Math.PI * t); return [p[0] + nx * w, p[1] + ny * w] }
    // negative near the root so neighbouring blades overlap into one solid mass
    const g = t => j === 0 || j === n ? 0 : gmax * clamp((t - g0) / (1 - g0)) ** 1.1 - 0.6
    B.push({ at, g, nx, ny, S, T })
  }

  const jit = p => [p[0] + (r() - 0.5) * 0.7, p[1] + (r() - 0.5) * 0.7]
  const paths = []
  for (let i = 0; i < n; i++) {
    const up = B[i], dn = B[i + 1], N = 18
    const cut = 0.76 + r() * 0.1
    const jogT = r() < 0.45 ? 0.62 + r() * 0.2 : 2, jog = 1.2 + r() * 1.6 // small step on the leading edge
    const top = [], bot = []
    for (let k = 0; k <= N; k++) {
      const t = k / N, p = up.at(t), s = -up.g(t) / 2 + (t > jogT ? jog : 0)
      top.push(jit([p[0] + up.nx * s, p[1] + up.ny * s]))
    }
    for (let k = 0; k <= N; k++) {
      const t = (k / N) * cut, p = dn.at(t), s = dn.g(t) / 2
      bot.push(jit([p[0] + dn.nx * s, p[1] + dn.ny * s]))
    }
    paths.push(pathOf([...top, ...bot.reverse()]))
  }

  // heel: convex leading edge from the heel up into the top blade, down the arm, straight back along the bottom
  const a0 = ang(0), C0 = [armTop[0] - Math.cos(a0) * 70, armTop[1] - Math.sin(a0) * 70 + 25]
  const body = []
  for (let k = 0; k <= 14; k++) body.push(jit(quad(H, C0, armTop, k / 14)))
  for (let k = 1; k <= 10; k++) { const p = arm(k / 10), a = ang(k / 10); body.push([p[0] + Math.cos(a) * 14, p[1] + Math.sin(a) * 14]) } // reach into the blade roots
  // bottom edge runs straight from the heel to a point well along the bottom blade, so the outline is unbroken
  const below = t => { const p = B[n].at(t); return [p[0] + B[n].nx * 1.5, p[1] + B[n].ny * 1.5] } // overlap up into the bottom blade
  for (let k = 1; k <= 6; k++) body.push(below(0.05 + k * 0.05))
  const F = below(0.35)
  for (let k = 0; k < 10; k++) body.push(jit([lerp(F[0], H[0], k / 10), lerp(F[1], H[1], k / 10)]))
  paths.unshift(pathOf(body))
  return paths
}

function svg(paths, fill) {
  const xs = [], ys = []
  for (const d of paths) for (const [x, y] of d.slice(1, -1).split('L').map(p => p.split(',').map(Number))) { xs.push(x); ys.push(y) }
  const pad = 6, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad
  const vb = [x0, y0, Math.max(...xs) - x0 + pad, Math.max(...ys) - y0 + pad].map(v => +v.toFixed(2)).join(' ')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="${fill}">\n  <path d="${paths.join('')}"/>\n</svg>\n`
}

// name: [blades, length, spread]
const VARIANTS = {
  '9-blades':          { seed: 11, n: 9, len: 1, spread: 1 },
  '9-blades-short':    { seed: 12, n: 9, len: 0.82, spread: 1.08 },
  '8-blades-short':    { seed: 23, n: 8, len: 0.76, spread: 1.12, gap: 1.1 },
  '7-blades-stout':    { seed: 34, n: 7, len: 0.7, spread: 1.15, gap: 1.2 },
  '6-blades-stout':    { seed: 45, n: 6, len: 0.64, spread: 1.2, gap: 1.3 },
}

fs.mkdirSync(OUT, { recursive: true })
for (const [name, o] of Object.entries(VARIANTS)) {
  const p = wing(o)
  fs.writeFileSync(path.join(OUT, `wing-${name}.svg`), svg(p, '#030909'))
  fs.writeFileSync(path.join(OUT, `wing-${name}-white.svg`), svg(p, '#fff'))
}
console.log(`wrote ${Object.keys(VARIANTS).length * 2} files to ${path.relative(process.cwd(), OUT)}`)
