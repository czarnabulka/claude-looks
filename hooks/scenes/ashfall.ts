// Ashfall, kept simple: one idea, few colours, flat shapes.
// A dull fire-glow smoulders low on the horizon behind a bare ridge,
// grey ash drifts down and a few embers rise. Nothing flashes.

const W = 1600
const H = 1000

// [x, start y, size, seconds, delay, direction]
const ASH: readonly [number, number, number, number, number, 1 | -1][] = [
  [120, -30, 1.0, 38, 0, 1],
  [330, -50, 0.8, 46, 14, -1],
  [560, -20, 1.1, 41, 27, 1],
  [780, -60, 0.7, 52, 8, -1],
  [990, -40, 0.9, 44, 33, 1],
  [1180, -30, 1.0, 39, 20, -1],
  [1370, -50, 0.8, 49, 4, 1],
  [1540, -40, 0.9, 43, 38, -1],
  [240, -70, 0.7, 55, 45, 1],
  [870, -80, 0.8, 50, 24, -1],
  [1460, -70, 0.7, 57, 50, 1],
]

// [x, start y, size, seconds, delay]
const EMBERS: readonly [number, number, number, number, number][] = [
  [380, 760, 1.0, 26, 0],
  [520, 780, 0.8, 31, 11],
  [640, 770, 1.1, 28, 19],
  [300, 790, 0.7, 34, 7],
  [720, 790, 0.9, 30, 24],
  [460, 800, 0.8, 36, 15],
]

function ash(): string {
  return ASH.map(([x, y, s, dur, delay, dir]) =>
    `<g class="ash ${dir === 1 ? 'r' : 'l'}" style="animation-duration:${dur}s;animation-delay:-${delay}s">` +
    `<g transform="translate(${x} ${y}) scale(${s})"><path class="flake" d="M-4 -1L1 -3L4 1L-1 3Z"/></g></g>`,
  ).join('')
}

function embers(): string {
  return EMBERS.map(([x, y, s, dur, delay]) =>
    `<g class="ember" style="animation-duration:${dur}s;animation-delay:-${delay}s">` +
    `<circle cx="${x}" cy="${y}" r="${(3.6 * s).toFixed(1)}" fill="url(#ember)"/></g>`,
  ).join('')
}

export const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.fire{transform-origin:520px 700px;animation:smoulder 11s ease-in-out infinite alternate}
.smoke{animation:drift 150s ease-in-out infinite alternate}
.smoke.two{animation-duration:190s;animation-direction:alternate-reverse}
.ash{animation-timing-function:linear;animation-iteration-count:infinite}
.ash.r{animation-name:ash-r}
.ash.l{animation-name:ash-l}
.flake{fill:#8a837a;transform-box:fill-box;transform-origin:center;animation:tumble 9s linear infinite}
.ember{animation:rise 30s linear infinite}
@keyframes smoulder{from{opacity:.65;transform:scale(.98)}to{opacity:.95;transform:scale(1.02)}}
@keyframes drift{from{transform:translateX(-90px)}to{transform:translateX(90px)}}
@keyframes ash-r{0%{transform:translate(0,0);opacity:0}8%{opacity:.6}90%{opacity:.45}100%{transform:translate(200px,1100px);opacity:0}}
@keyframes ash-l{0%{transform:translate(0,0);opacity:0}8%{opacity:.55}90%{opacity:.4}100%{transform:translate(-170px,1100px);opacity:0}}
@keyframes tumble{from{transform:rotate(0) scaleY(1)}50%{transform:rotate(180deg) scaleY(.4)}to{transform:rotate(360deg) scaleY(1)}}
@keyframes rise{0%{transform:translate(0,0);opacity:0}10%{opacity:.8}60%{transform:translate(50px,-420px);opacity:.5}100%{transform:translate(-20px,-760px);opacity:0}}
@media (prefers-reduced-motion: reduce){.fire,.smoke,.ash,.flake,.ember{animation:none}}
</style>
<defs>
<linearGradient id="a-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0e0d0d"/>
<stop offset=".5" stop-color="#171312"/>
<stop offset=".7" stop-color="#2c1a14"/>
<stop offset=".76" stop-color="#160f0c"/>
<stop offset="1" stop-color="#0b0908"/>
</linearGradient>
<radialGradient id="a-fire" cx=".5" cy=".5" r=".5">
<stop offset="0" stop-color="#c4582a" stop-opacity=".8"/>
<stop offset=".35" stop-color="#8a361c" stop-opacity=".4"/>
<stop offset="1" stop-color="#3a1810" stop-opacity="0"/>
</radialGradient>
<radialGradient id="ember" cx=".5" cy=".5" r=".5">
<stop offset="0" stop-color="#f0a060"/>
<stop offset=".5" stop-color="#c0602c" stop-opacity=".6"/>
<stop offset="1" stop-color="#c0602c" stop-opacity="0"/>
</radialGradient>
<filter id="a-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
</defs>

<rect width="${W}" height="${H}" fill="url(#a-sky)"/>

<ellipse class="fire" cx="520" cy="680" rx="760" ry="320" fill="url(#a-fire)"/>
<ellipse class="fire" cx="520" cy="620" rx="380" ry="70" fill="#d06a34" opacity=".35" filter="url(#a-soft)"/>

<g filter="url(#a-soft)">
<ellipse class="smoke" cx="460" cy="470" rx="760" ry="34" fill="#4a2a1c" opacity=".5"/>
<ellipse class="smoke two" cx="1100" cy="330" rx="620" ry="26" fill="#36231a" opacity=".4"/>
</g>

<path d="M0 640L180 610L340 628L520 596L700 624L900 612L1100 636L1300 616L1460 630L1600 612L1600 ${H}L0 ${H}Z" fill="#1d1513"/>

<path d="M0 712C160 690 300 676 420 690C560 706 640 730 820 724C1020 716 1180 690 1360 694C1470 696 1540 708 1600 704L1600 ${H}L0 ${H}Z" fill="#0d0b0a"/>

<g fill="none" stroke="#0d0b0a" stroke-linecap="round">
<path d="M262 694C258 640 266 600 256 552" stroke-width="7"/>
<path d="M258 610C236 590 222 566 200 556" stroke-width="4"/>
<path d="M260 584C282 566 296 548 318 540" stroke-width="4"/>
<path d="M256 566C250 548 244 536 236 520" stroke-width="3"/>
<path d="M214 562C206 552 204 544 196 536" stroke-width="2"/>
<path d="M300 548C306 536 316 530 324 522" stroke-width="2"/>
<path d="M1424 698C1428 664 1422 640 1430 612" stroke-width="5"/>
<path d="M1427 646C1444 634 1456 622 1470 618" stroke-width="3"/>
<path d="M1428 630C1414 618 1404 606 1392 600" stroke-width="3"/>
</g>

<g>${embers()}</g>
<g>${ash()}</g>
</svg>`
