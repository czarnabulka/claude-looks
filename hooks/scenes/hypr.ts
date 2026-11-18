// Hypr Night: a riced tiling-desktop look. Cool slate blues, a soft cyan
// accent and a lavender highlight, like a Hyprland setup at night.
// The scene: misty moonlit ridges, a floating bar along the top with
// workspace pills and a slow visualizer, and a thin gradient border around
// everything, the "active window". Flat shapes, slow motion, nothing flashes.

import { makeColors } from '../make-colors.js'

export const HYPR_ACCENT = '#7fc8d8' // soft cyan
export const HYPR_LAVENDER = '#b4a4e4'

export const hypr = makeColors({
  label: 'Hypr Night',
  only: 'dark',
  roles: {
    accent: HYPR_ACCENT,
    danger: '#d47a8a', // muted rose
    success: '#8cc49a', // sage
    warning: '#d8b67a', // sand
    pro: HYPR_LAVENDER,
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#11151e',
        'surface-1': '#151a25',
        'surface-2': '#1a202d',
        'surface-3': '#212837',
        'text-primary': '#d6deea',
        'text-secondary': '#aeb8c8',
        'text-muted': '#8590a4',
      },
    },
  },
})

const W = 1600
const H = 1000

// Visualizer bars in the bar: [height, seconds, delay]
const BARS: readonly [number, number, number][] = [
  [10, 3.1, 0], [16, 2.6, 0.7], [12, 3.4, 1.3], [20, 2.9, 0.4],
  [14, 3.7, 1.9], [18, 2.7, 1.1], [11, 3.3, 0.2], [15, 3.0, 1.6],
  [9, 3.6, 0.9], [13, 2.8, 2.2],
]

// Slow motes drifting up: [x, y, r, seconds, delay]
const MOTES: readonly [number, number, number, number, number][] = [
  [140, 900, 1.6, 48, 0], [380, 940, 1.2, 56, 18], [620, 920, 1.4, 52, 34],
  [910, 960, 1.1, 60, 9], [1160, 930, 1.5, 50, 26], [1420, 950, 1.2, 58, 41],
  [1520, 910, 1.0, 54, 13], [260, 980, 1.0, 62, 47],
]

function bars(): string {
  const x0 = W / 2 - (BARS.length * 9) / 2
  return BARS.map(([h, dur, delay], i) =>
    `<rect class="bar" x="${x0 + i * 9}" y="${40 - h}" width="5" height="${h}" rx="1.5" ` +
    `style="animation-duration:${dur}s;animation-delay:-${delay}s"/>`,
  ).join('')
}

function motes(): string {
  return MOTES.map(([x, y, r, dur, delay]) =>
    `<circle class="mote" cx="${x}" cy="${y}" r="${r}" style="animation-duration:${dur}s;animation-delay:-${delay}s"/>`,
  ).join('')
}

export const HYPR_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.moon{animation:breathe 14s ease-in-out infinite alternate}
.cloud{animation:drift 170s ease-in-out infinite alternate}
.cloud.two{animation-duration:210s;animation-direction:alternate-reverse}
.bar{fill:${HYPR_ACCENT};opacity:.55;transform-box:fill-box;transform-origin:bottom;animation:bounce 3s ease-in-out infinite alternate}
.mote{fill:#9fc4e0;animation:rise 52s linear infinite}
.frame{animation:glow 16s ease-in-out infinite alternate}
@keyframes breathe{from{opacity:.75}to{opacity:1}}
@keyframes drift{from{transform:translateX(-110px)}to{transform:translateX(110px)}}
@keyframes bounce{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
@keyframes rise{0%{transform:translate(0,0);opacity:0}12%{opacity:.5}70%{opacity:.3}100%{transform:translate(40px,-620px);opacity:0}}
@keyframes glow{from{opacity:.28}to{opacity:.5}}
@media (prefers-reduced-motion: reduce){.moon,.cloud,.bar,.mote,.frame{animation:none}}
</style>
<defs>
<linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0d111a"/>
<stop offset=".45" stop-color="#151b28"/>
<stop offset=".68" stop-color="#1f2738"/>
<stop offset="1" stop-color="#0e121a"/>
</linearGradient>
<radialGradient id="h-moon" cx=".5" cy=".5" r=".5">
<stop offset="0" stop-color="#cfdcec" stop-opacity=".55"/>
<stop offset=".18" stop-color="#9fb4cf" stop-opacity=".22"/>
<stop offset="1" stop-color="#3a4a66" stop-opacity="0"/>
</radialGradient>
<linearGradient id="h-border" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${HYPR_ACCENT}"/>
<stop offset="1" stop-color="${HYPR_LAVENDER}"/>
</linearGradient>
<filter id="h-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
</defs>

<rect width="${W}" height="${H}" fill="url(#h-sky)"/>

<g class="moon">
<circle cx="1190" cy="260" r="260" fill="url(#h-moon)"/>
<circle cx="1190" cy="260" r="46" fill="#c3cfdf" opacity=".55"/>
</g>

<g filter="url(#h-soft)">
<ellipse class="cloud" cx="1100" cy="300" rx="520" ry="30" fill="#2a3448" opacity=".7"/>
<ellipse class="cloud two" cx="420" cy="420" rx="640" ry="34" fill="#232c3e" opacity=".6"/>
<ellipse class="cloud" cx="800" cy="610" rx="900" ry="40" fill="#2a3448" opacity=".45"/>
</g>

<path d="M0 640L160 590L300 618L470 560L640 606L780 584L960 622L1120 576L1290 612L1450 580L1600 604L1600 ${H}L0 ${H}Z" fill="#1b2232"/>
<path d="M0 700L200 660L380 690L560 650L760 694L940 668L1140 702L1330 662L1500 688L1600 676L1600 ${H}L0 ${H}Z" fill="#151b28"/>
<path d="M0 760C200 738 380 744 560 758C760 774 960 760 1160 746C1340 734 1480 746 1600 752L1600 ${H}L0 ${H}Z" fill="#0f131c"/>

<g>${motes()}</g>

<rect class="frame" x="22" y="66" width="${W - 44}" height="${H - 88}" rx="16" fill="none" stroke="url(#h-border)" stroke-width="2.5"/>

<rect x="22" y="14" width="${W - 44}" height="40" rx="20" fill="#121723" opacity=".82"/>
<rect x="22" y="14" width="${W - 44}" height="40" rx="20" fill="none" stroke="#2a3346" stroke-width="1"/>
<rect x="44" y="24" width="44" height="20" rx="10" fill="${HYPR_LAVENDER}" opacity=".85"/>
<circle cx="108" cy="34" r="4" fill="#8590a4"/>
<circle cx="126" cy="34" r="4" fill="#8590a4"/>
<circle cx="144" cy="34" r="4" fill="#4a5468"/>
<g>${bars()}</g>
<g fill="#8590a4">
<circle cx="${W - 150}" cy="34" r="4"/>
<circle cx="${W - 128}" cy="34" r="4"/>
<circle cx="${W - 106}" cy="34" r="4"/>
<rect x="${W - 88}" y="28" width="12" height="12" rx="3"/>
</g>
<circle cx="${W - 54}" cy="34" r="7" fill="none" stroke="${HYPR_ACCENT}" stroke-width="2" opacity=".8"/>
</svg>`
