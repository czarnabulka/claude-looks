import { makeColors } from '../make-colors.js'
import type { LookTheme } from './types'
import { previewCard, px, rng } from './preview'

/**
 * Frostpine Hollow: the snowy stretch of a dark-world journey. Falling snow
 * in three layers, a drifting aurora, snow-capped mountains, pine forest, a
 * little cabin with a warm window and chimney smoke, and a glowing lamp post.
 * Original art, drawn in code.
 */

const ID = 'frostpine-hollow'

const C = {
  sky: ['#040816', '#070e24', '#0b1532', '#101d42', '#162754'],
  aurora: ['#3dffc0', '#3fd8ff', '#8f7bff'],
  mountain: '#1a2a5a',
  mountainShade: '#142249',
  cap: '#dfe9ff',
  pineBack: '#132449',
  pineFront: '#0a1530',
  pineSnow: '#d5e3ff',
  snow: '#e6efff',
  snowShade: '#9fb4e0',
  snowDeep: '#7d93c4',
  wall: '#3b2219',
  wallEdge: '#5a3424',
  window: '#ffb84d',
  smoke: '#8796b8',
  lamp: '#ffd27a',
  post: '#0c1428',
  flake: '#f4f8ff',
}

/** A pixel pine: stacked stepped tiers with snow on each tier's top. */
function pine(cx: number, baseY: number, size: number, body: string, snow: string): string {
  let out = px(cx - 1, baseY - 4, 2, 4, '#1b0f0a')
  const tiers = 3
  let top = baseY - 3
  for (let t = 0; t < tiers; t++) {
    const half = size - t * Math.ceil(size / 4)
    const rows = Math.max(3, Math.floor(half * 0.9))
    for (let i = 0; i < rows; i++) {
      const w = Math.max(1, Math.round(half * (1 - i / rows)))
      out += px(cx - w, top - i * 2 - 2, w * 2, 2, body)
      if (i === rows - 1 || i % 3 === 2) {
        out += px(cx - w, top - i * 2 - 2, Math.max(1, w), 1, snow)
      }
    }
    top -= rows * 2 - Math.ceil(rows * 0.8)
  }
  return out
}

function scene(): string {
  const r = rng(2025)
  const parts: string[] = []

  // Sky bands with dithered seams
  const bands: Array<[number, string]> = [0, 28, 56, 84, 110].map((y, i) => [y, C.sky[i] ?? '#000000'])
  bands.forEach(([y, fill]) => parts.push(px(-40, y, 400, 200, fill)))
  // Dithered seams, as 4x4 checker patterns rather than hundreds of rects
  const dither = (id: string, fill: string) =>
    `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse">${px(0, 2, 2, 2, fill)}${px(2, 0, 2, 2, fill)}</pattern>`
  parts.push(
    `<defs>${bands.map(([, fill], i) => dither(`dz${i}`, fill)).join('')}${dither('dsn', C.snow)}${dither('dsh', C.snowShade)}</defs>`,
  )
  bands.slice(1).forEach(([y], i) => {
    parts.push(`<rect x="-40" y="${y - 4}" width="400" height="4" fill="url(#dz${i + 1})"/>`)
  })

  // A few stars behind the aurora
  for (let i = 0; i < 40; i++) {
    parts.push(px(Math.floor(r() * 360) - 20, Math.floor(r() * 80), 1, 1, '#cfe0ff', `tw d${i % 4}`))
  }

  // Aurora: wavy pixel ribbons drifting sideways
  C.aurora.forEach((col, k) => {
    let ribbon = ''
    for (let x = -60; x < 420; x += 4) {
      const y = 22 + k * 7 + Math.round(Math.sin(x / 28 + k) * 6 + Math.sin(x / 11) * 2)
      ribbon += px(x, y, 4, 3 + (x % 12 === 0 ? 2 : 0), col)
    }
    parts.push(`<g class="aur a${k}" fill-opacity="1">${ribbon}</g>`)
  })

  // Mountains with snow caps
  const mountain = (cx: number, peakY: number, half: number) => {
    let out = ''
    const rows = Math.floor((128 - peakY) / 2)
    for (let i = 0; i < rows; i++) {
      const w = Math.round((half * (i + 1)) / rows)
      const y = peakY + i * 2
      out += px(cx - w, y, w, 2, C.mountain)
      out += px(cx, y, w, 2, C.mountainShade)
      if (i < rows * 0.28) {
        const capW = Math.max(1, w - (i % 2) * 2)
        out += px(cx - capW, y, capW * 2, 2, C.cap)
      }
    }
    return out
  }
  parts.push(mountain(40, 60, 70), mountain(150, 74, 60), mountain(250, 52, 80), mountain(330, 70, 50))

  // Back row of pines: three shapes drawn once, then reused
  const defs = [6, 7, 8]
    .map((s, i) => `<g id="pb${i}">${pine(0, 0, s, C.pineBack, C.pineSnow)}</g>`)
    .join('')
  parts.push(`<defs>${defs}</defs>`)
  for (let x = -30; x < 360; x += 9 + Math.floor(r() * 6)) {
    parts.push(`<use href="#pb${Math.floor(r() * 3)}" x="${x}" y="136"/>`)
  }

  // Snow ground
  parts.push(px(-40, 134, 400, 50, C.snow))
  parts.push(`<rect x="-40" y="130" width="400" height="4" fill="url(#dsn)"/>`)
  parts.push(px(-40, 160, 400, 30, C.snowShade))
  parts.push(`<rect x="-40" y="156" width="400" height="4" fill="url(#dsh)"/>`)
  parts.push(px(-40, 172, 400, 20, C.snowDeep))
  // Footprints along a path
  for (let i = 0; i < 16; i++) {
    const fx = 70 + i * 11
    parts.push(px(fx, 150 + (i % 2) * 3, 2, 1, C.snowShade))
  }

  // Cabin (left)
  const cabin: string[] = []
  cabin.push(px(14, 118, 40, 24, C.wall))
  for (let y = 120; y < 142; y += 4) cabin.push(px(14, y, 40, 1, C.wallEdge))
  // roof (stepped) with snow
  for (let i = 0; i < 9; i++) {
    cabin.push(px(10 + i * 2, 118 - (i + 1) * 2, 48 - i * 4, 2, '#24140f'))
  }
  for (let i = 0; i < 9; i++) {
    cabin.push(px(10 + i * 2, 118 - (i + 1) * 2, 4, 2, C.snow))
    cabin.push(px(54 - i * 2, 118 - (i + 1) * 2, 4, 2, C.snow))
  }
  cabin.push(px(26, 100, 16, 2, C.snow))
  // chimney
  cabin.push(px(44, 96, 6, 12, '#2b1810'), px(43, 94, 8, 3, C.snow))
  // window + door
  cabin.push(px(20, 124, 10, 8, C.window, 'win'), px(24, 124, 2, 8, C.wall), px(20, 127, 10, 1, C.wall))
  cabin.push(px(36, 126, 10, 16, '#1c0e09'), px(43, 134, 1, 2, C.lamp))
  // warm light on snow under the window
  cabin.push(`<rect x="16" y="142" width="18" height="3" fill="${C.window}" fill-opacity="0.35" class="win"/>`)
  parts.push(`<g>${cabin.join('')}</g>`)
  // chimney smoke
  for (let i = 0; i < 6; i++) {
    parts.push(px(46 + (i % 2), 92, 3, 3, C.smoke, `smoke s${i}`))
  }

  // Front pines (sides only, the middle stays clear)
  ;[[-6, 16], [62, 13], [78, 10], [214, 11], [232, 15], [300, 17], [326, 12]].forEach(([x, s]) =>
    parts.push(pine(x ?? 0, 150, s ?? 10, C.pineFront, C.pineSnow)),
  )

  // Lamp post (right) with pulsing glow
  parts.push(`<circle cx="268" cy="112" r="22" fill="${C.lamp}" fill-opacity="0.10" class="glow"/>`)
  parts.push(`<circle cx="268" cy="112" r="12" fill="${C.lamp}" fill-opacity="0.16" class="glow"/>`)
  parts.push(px(267, 114, 3, 38, C.post), px(263, 151, 11, 2, C.post))
  parts.push(px(264, 106, 9, 2, C.post), px(265, 108, 7, 6, C.lamp, 'glow'), px(264, 114, 9, 2, C.post))
  parts.push(px(264, 104, 9, 2, C.snow))
  parts.push(`<rect x="256" y="150" width="26" height="3" fill="${C.lamp}" fill-opacity="0.3"/>`)

  // Snowfall: three layers, each a tile drawn twice and slid down one tile height
  const layer = (n: number, size: number, cls: string) => {
    let tile = ''
    for (let i = 0; i < n; i++) {
      const fx = Math.floor(r() * 360) - 20
      const fy = Math.floor(r() * 180)
      tile += px(fx, fy, size, size, C.flake)
    }
    const id = `t-${cls.replace(' ', '-')}`
    return `<g class="${cls}"><g class="sway"><g id="${id}">${tile}</g><use href="#${id}" y="-180"/></g></g>`
  }
  parts.push(layer(70, 1, 'fall far'), layer(40, 1, 'fall mid'), layer(18, 2, 'fall near'))

  const css = `
.tw{animation:tw 3s steps(3,end) infinite}
@keyframes tw{0%,100%{opacity:.9}50%{opacity:.2}}
.d1{animation-delay:-.8s}.d2{animation-delay:-1.6s}.d3{animation-delay:-2.4s}
.aur{animation:aur 9s steps(18,end) infinite alternate;opacity:.35}
.a1{animation-duration:12s;animation-delay:-3s}.a2{animation-duration:15s;animation-delay:-6s}
@keyframes aur{0%{transform:translateX(0);opacity:.2}50%{opacity:.5}100%{transform:translateX(-36px);opacity:.25}}
.win{animation:win 5s steps(1,end) infinite}
@keyframes win{0%,100%{opacity:1}30%{opacity:.75}33%{opacity:1}64%{opacity:.85}}
.glow{animation:glow 2.6s steps(4,end) infinite alternate}
@keyframes glow{from{opacity:.6}to{opacity:1}}
.smoke{animation:smoke 5s steps(25,end) infinite;opacity:0}
@keyframes smoke{0%{transform:translate(0,0);opacity:0}10%{opacity:.7}100%{transform:translate(14px,-46px);opacity:0}}
.s1{animation-delay:-.83s}.s2{animation-delay:-1.66s}.s3{animation-delay:-2.5s}.s4{animation-delay:-3.33s}.s5{animation-delay:-4.16s}
.fall{animation:fall linear infinite}
.far{animation-duration:22s;opacity:.55}.mid{animation-duration:14s;opacity:.8}.near{animation-duration:8s}
@keyframes fall{from{transform:translateY(0)}to{transform:translateY(180px)}}
.sway{animation:sway 4s steps(4,end) infinite alternate}
.mid .sway{animation-duration:3s}.near .sway{animation-duration:2.2s}
@keyframes sway{from{transform:translateX(-3px)}to{transform:translateX(3px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.smoke{opacity:.4}}
`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges"><style>${css}</style>${parts.join('')}</svg>`
}

const { theme, problems } = makeColors({
  label: 'Frostpine Hollow',
  id: ID,
  only: 'dark',
  roles: {
    accent: '#6fd3ff',
    danger: '#ff5a6e',
    success: '#7dffb0',
    warning: '#ffc857',
    pro: '#b49cff',
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a1122',
        'surface-1': '#101a30',
        'surface-2': '#15213b',
        'surface-3': '#16213c',
        'text-primary': '#eef5ff',
        'text-secondary': '#c6d4ec',
        'text-muted': '#93a6c8',
      },
    },
    git: { added: '#7dffb0', removed: '#ff5a6e', modified: '#ffc857', merged: '#b49cff' },
  },
})

const SCENE = scene()

export const frostpineHollow: LookTheme = {
  id: ID,
  name: 'Frostpine Hollow',
  tagline: 'Pixel-art snowy forest: falling snow, aurora, cozy cabin, lamp glow.',
  look: {
    colors: theme,
    overrideColorScheme: 'dark',
    backdrop: { scene: ID, glass: { blur: 4, tint: '#0a1122', opacity: 0.74 } },
  },
  scene: SCENE,
  preview: previewCard(
    {
      page: '#0a1122',
      panel: '#101a30',
      border: '#eef5ff',
      text: '#eef5ff',
      muted: '#93a6c8',
      accent: '#ffc857',
      code: ['#6fd3ff', '#7dffb0', '#b49cff'],
    },
    SCENE,
  ),
  swatch: ['#0a1122', '#15213b', '#6fd3ff', '#e6efff', '#ffc857', '#b49cff'],
  problems,
}
