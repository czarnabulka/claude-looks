// A second scene, kept simple: one idea, few colours, flat shapes.
// A vast tree of golden light glows beyond flat mountain silhouettes at dusk,
// and a few golden leaves drift down across the screen.

const W = 1600
const H = 1000

// Fixed leaf drift: [x, y, size, fall seconds, delay, spin seconds, direction]
const LEAVES: readonly [number, number, number, number, number, number, 1 | -1][] = [
  [180, -40, 1.0, 34, 0, 9, 1],
  [420, -60, 0.8, 41, 12, 11, -1],
  [690, -30, 1.2, 37, 25, 8, 1],
  [940, -50, 0.9, 44, 6, 12, -1],
  [1120, -40, 1.1, 36, 19, 10, 1],
  [1290, -70, 0.8, 47, 31, 13, -1],
  [1460, -30, 1.0, 39, 3, 9, 1],
  [1560, -60, 0.7, 50, 22, 14, -1],
  [300, -80, 0.7, 52, 38, 12, 1],
  [820, -70, 0.8, 48, 44, 10, -1],
  [1020, -90, 1.0, 43, 16, 11, 1],
  [1380, -50, 0.9, 40, 9, 8, -1],
]

// ---------- the tree
// A flat silhouette: a flared trunk that splits into tapered limbs a few
// times, with a bumpy canopy of light at the tips. Drawn once from a fixed
// seed, so it's the same tree every time.

const BASE_X = 1160
const BASE_Y = 640

function rng(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n: number) => n.toFixed(1)

type Tree = { limbs: string[]; tips: [number, number, number][] }

// One tapered, slightly bent limb as a filled shape.
function limb(x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bend: number): string {
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy)
  const nx = -dy / len
  const ny = dx / len
  const mx = (x0 + x1) / 2 + nx * bend
  const my = (y0 + y1) / 2 + ny * bend
  const wm = (w0 + w1) / 4
  return `M${f(x0 + nx * w0 / 2)} ${f(y0 + ny * w0 / 2)}` +
    `Q${f(mx + nx * wm)} ${f(my + ny * wm)} ${f(x1 + nx * w1 / 2)} ${f(y1 + ny * w1 / 2)}` +
    `L${f(x1 - nx * w1 / 2)} ${f(y1 - ny * w1 / 2)}` +
    `Q${f(mx - nx * wm)} ${f(my - ny * wm)} ${f(x0 - nx * w0 / 2)} ${f(y0 - ny * w0 / 2)}Z`
}

function grow(): Tree {
  const r = rng(7)
  const tree: Tree = { limbs: [], tips: [] }
  const UP = -Math.PI / 2

  const branch = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
    const x1 = x + Math.cos(a) * len
    const y1 = y + Math.sin(a) * len
    const w1 = w * 0.6
    tree.limbs.push(limb(x, y, x1, y1, w, w1, (r() - 0.5) * len * 0.12))
    if (depth === 0) {
      tree.tips.push([x1, y1, 30 + r() * 16])
      return
    }
    if (depth <= 1) {
      tree.tips.push([x1, y1, 36 + r() * 14])
    }
    // Upper limbs spread wide and level out, like a broad old tree.
    const spread = depth >= 3 ? [-0.78, 0.04, 0.74] : [-0.42, 0.4]
    for (const s of spread) {
      let na = a + s + (r() - 0.5) * 0.22
      // Pull limbs toward horizontal the further out they get, never downward.
      na = Math.max(-Math.PI + 0.18, Math.min(-0.18, na))
      branch(x1, y1, na, len * (0.7 + r() * 0.1), w1, depth - 1)
    }
  }

  branch(BASE_X, BASE_Y, UP, 150, 30, 4)
  return tree
}

const TREE = grow()

function tree(): string {
  const { limbs, tips } = TREE
  const top = Math.min(...tips.map(t => t[1]))
  const blobs = (dx: number, dy: number, scale: number) =>
    tips.map(([x, y, rad]) => `<circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="${f(rad * scale)}"/>`).join('')
  // Roots: a flare at the foot of the trunk.
  const roots = `M${BASE_X - 44} ${BASE_Y + 4}C${BASE_X - 26} ${BASE_Y - 2} ${BASE_X - 16} ${BASE_Y - 20} ${BASE_X - 14} ${BASE_Y - 46}` +
    `L${BASE_X + 14} ${BASE_Y - 46}C${BASE_X + 16} ${BASE_Y - 20} ${BASE_X + 26} ${BASE_Y - 2} ${BASE_X + 46} ${BASE_Y + 4}Z`

  return `<g class="crown">` +
    // Back canopy: deep amber, one merged shape.
    `<g fill="#6e5028" opacity=".75">${blobs(0, 6, 1.18)}</g>` +
    // Trunk and limbs, lit from above.
    `<g fill="url(#trunk)"><path d="${roots}"/><path d="${limbs.join('')}"/></g>` +
    // Front canopy, solid: its own colour shows as shade under each clump...
    `<clipPath id="gt-canopy">${blobs(0, 0, 1.0)}</clipPath>` +
    `<g fill="#86622f">${blobs(0, 0, 1.0)}</g>` +
    // ...lit gold over the rest of each clump, light coming from above...
    `<g fill="#b48a48" clip-path="url(#gt-canopy)">${blobs(-5, -11, 1.0)}</g>` +
    // ...and the clumps along the crown catch the most light.
    `<g fill="#d4ad6a" opacity=".6" clip-path="url(#gt-canopy)">${tips.filter(t => t[1] < top + 60).map(([x, y, rad]) => `<circle cx="${f(x - 8)}" cy="${f(y - 18)}" r="${f(rad * 0.9)}"/>`).join('')}</g>` +
    `</g>`
}

function leaves(): string {
  return LEAVES.map(([x, y, s, fall, delay, spin, dir]) =>
    `<g class="fall ${dir === 1 ? 'r' : 'l'}" style="animation-duration:${fall}s;animation-delay:-${delay}s">` +
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<path class="leaf" d="M0 -7C5 -4 5 4 0 8C-5 4 -5 -4 0 -7Z" style="animation-duration:${spin}s"/>` +
    `</g></g>`,
  ).join('')
}

export const GREAT_TREE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.glow{transform-origin:1160px 400px;animation:breathe 14s ease-in-out infinite alternate}
.crown{transform-origin:1160px 640px;animation:sway 22s ease-in-out infinite alternate}
.band{animation:drift 140s ease-in-out infinite alternate}
.band.two{animation-duration:180s;animation-direction:alternate-reverse}
.fall{animation-timing-function:linear;animation-iteration-count:infinite}
.fall.r{animation-name:fall-r}
.fall.l{animation-name:fall-l}
.leaf{fill:#d9b46a;transform-box:fill-box;transform-origin:center;animation:spin 10s linear infinite}
@keyframes breathe{from{opacity:.7;transform:scale(.98)}to{opacity:1;transform:scale(1.02)}}
@keyframes sway{from{transform:rotate(-.4deg)}to{transform:rotate(.4deg)}}
@keyframes drift{from{transform:translateX(-80px)}to{transform:translateX(80px)}}
@keyframes fall-r{0%{transform:translate(0,0);opacity:0}8%{opacity:.75}90%{opacity:.6}100%{transform:translate(220px,1100px);opacity:0}}
@keyframes fall-l{0%{transform:translate(0,0);opacity:0}8%{opacity:.7}90%{opacity:.55}100%{transform:translate(-180px,1100px);opacity:0}}
@keyframes spin{from{transform:rotate(0) scaleX(1)}50%{transform:rotate(180deg) scaleX(.35)}to{transform:rotate(360deg) scaleX(1)}}
@media (prefers-reduced-motion: reduce){.glow,.crown,.band,.fall,.leaf{animation:none}}
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0d0b0e"/>
<stop offset=".45" stop-color="#18130f"/>
<stop offset=".66" stop-color="#3a2a18"/>
<stop offset=".72" stop-color="#1a1410"/>
<stop offset="1" stop-color="#0c0a08"/>
</linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5">
<stop offset="0" stop-color="#d4a556" stop-opacity=".55"/>
<stop offset=".35" stop-color="#a87b3a" stop-opacity=".22"/>
<stop offset="1" stop-color="#5a4020" stop-opacity="0"/>
</radialGradient>
<radialGradient id="light" cx=".5" cy=".55" r=".5">
<stop offset="0" stop-color="#f6dc9c"/>
<stop offset=".55" stop-color="#d6a85a" stop-opacity=".75"/>
<stop offset="1" stop-color="#a87b3a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="trunk" gradientUnits="userSpaceOnUse" x1="0" y1="${BASE_Y}" x2="0" y2="200">
<stop offset="0" stop-color="#4a3820"/>
<stop offset=".6" stop-color="#8f6f3e"/>
<stop offset="1" stop-color="#c9a462"/>
</linearGradient>
<linearGradient id="farHills" gradientUnits="userSpaceOnUse" x1="0" y1="418" x2="0" y2="660">
<stop offset="0" stop-color="#857a70"/>
<stop offset=".14" stop-color="#4c433b"/>
<stop offset=".5" stop-color="#2e2620"/>
<stop offset="1" stop-color="#241e19"/>
</linearGradient>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="softer" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>

<rect width="${W}" height="${H}" fill="url(#sky)"/>

<ellipse class="glow" cx="1160" cy="400" rx="520" ry="380" fill="url(#glow)"/>

<g filter="url(#soft)">
<ellipse class="band" cx="520" cy="250" rx="620" ry="22" fill="#4a3820" opacity=".45"/>
<ellipse class="band two" cx="1100" cy="345" rx="700" ry="16" fill="#5a4426" opacity=".4"/>
</g>

${tree()}

<path d="M0 600L120 540L220 470L300 418L380 468L470 452L560 520L660 560L780 590L900 610L1040 622L1240 628L1400 596L1520 560L1600 576L1600 ${H}L0 ${H}Z" fill="url(#farHills)"/>
<path d="M0 662L160 612L280 640L420 600L560 650L760 668L1000 658L1300 668L1450 640L1600 652L1600 ${H}L0 ${H}Z" fill="#1c1713"/>
<path d="M0 730C180 704 330 712 520 722C760 736 940 712 1180 704C1360 698 1480 712 1600 706L1600 ${H}L0 ${H}Z" fill="#110e0b"/>

<g>${leaves()}</g>
</svg>`
