import { makeColors } from '../make-colors.js'
import type { LookTheme } from './types'
import { ease, num, op, previewCard, rng, smilify, tf } from './preview'

/**
 * Sakura Night: a smooth (not pixel) scene. A dark plum night, a soft moon
 * mirrored in still water, a cherry branch in bloom swaying from the corner,
 * and petals tumbling down across the screen. Original art, drawn in code.
 */

const ID = 'sakura-night'

const PINKS = ['#ffc4d8', '#ffb0cb', '#f78fb3', '#ffd9e6', '#f4a3c4']

/** Blossom cluster: a handful of soft five-petal flowers around a point. */
function cluster(cx: number, cy: number, n: number, r: () => number): string {
  let out = ''
  for (let i = 0; i < n; i++) {
    const x = (cx + (r() - 0.5) * 18).toFixed(1)
    const y = (cy + (r() - 0.5) * 12).toFixed(1)
    const s = (0.7 + r() * 0.6).toFixed(2)
    const fill = PINKS[Math.floor(r() * PINKS.length)] ?? '#ffc4d8'
    out += `<use href="#fl" transform="translate(${x} ${y}) scale(${s}) rotate(${Math.floor(r() * 72)})" fill="${fill}"/>`
  }
  return out
}

const PATHS = [
  { values: '0 0;-14 50;-6 100;-30 150;-40 200', keyTimes: '0;.25;.5;.75;1' },
  { values: '0 0;-26 60;-18 120;-60 200', keyTimes: '0;.3;.6;1' },
  { values: '0 0;-8 70;-34 130;-30 200', keyTimes: '0;.35;.65;1' },
]

/** The animation tags for an element with these classes. */
function animate(c: string[]): string {
  switch (c[0]) {
    case 'tw':
      return op('.85;.2;.85', 4, num(c, 'd'), ease(3))
    case 'halo':
      return op('.75;1;.75', 14, 0, ease(3))
    case 'ripple':
      return tf('translate', '-2 0;2 0;-2 0', 10, num(c, 'd'), ease(3))
    case 'sway':
      return tf('rotate', '-1.2 -20 -6;1.2 -20 -6;-1.2 -20 -6', 16, 0, ease(3))
    case 'sway2':
      return tf('rotate', '1.5 345 70;-1.5 345 70;1.5 345 70', 14, 0, ease(3))
    case 'bob':
      return tf('translate', '0 -.6;0 .6;0 -.6', 12, num(c, 'd'), ease(3))
    case 'fall': {
      const path = PATHS[num(c, 'f')] ?? { values: '0 0;-40 200', keyTimes: '0;1' }
      const dur = [9, 10.75, 12.5, 14.25, 16][num(c, 'fd')] ?? 12
      const b = num(c, 'dl')
      return (
        tf('translate', path.values, dur, b, ` keyTimes="${path.keyTimes}"`) +
        op('0;.9;.9;0', dur, b, ' keyTimes="0;.06;.92;1"')
      )
    }
    case 'tumble': {
      const dur = [2, 2.75, 3.5, 4.25, 5][num(c, 'sp')] ?? 3
      const b = num(c, 'dl')
      return (
        tf('rotate', '0;360', dur, b) +
        tf('scale', '1 1;1 .35;1 1;1 .35;1 1', dur, b, ' additive="sum"')
      )
    }
    default:
      return ''
  }
}

function scene(): string {
  const r = rng(404)
  const parts: string[] = []

  parts.push(`<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#07040b"/><stop offset=".55" stop-color="#160c1d"/><stop offset="1" stop-color="#2a1430"/>
</linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#1b0f22"/><stop offset="1" stop-color="#09050c"/>
</linearGradient>
<radialGradient id="moonglow"><stop offset="0" stop-color="#ffe3ee" stop-opacity=".35"/><stop offset="1" stop-color="#ffe3ee" stop-opacity="0"/></radialGradient>
<radialGradient id="bloomglow"><stop offset="0" stop-color="#ff9cc2" stop-opacity=".22"/><stop offset="1" stop-color="#ff9cc2" stop-opacity="0"/></radialGradient>
<g id="fl"><circle r="1.7" cy="-1.9"/><circle r="1.7" cx="1.8" cy="-.6"/><circle r="1.7" cx="1.1" cy="1.6"/><circle r="1.7" cx="-1.1" cy="1.6"/><circle r="1.7" cx="-1.8" cy="-.6"/><circle r=".7" fill="#fff4f8"/></g>
<path id="pe" d="M0 0C1.6-2.4 4.6-2.6 6 0C4.6 2.6 1.6 2.4 0 0Z"/>
</defs>`)

  parts.push(`<rect x="-40" y="-20" width="400" height="220" fill="url(#sky)"/>`)

  // Stars
  for (let i = 0; i < 50; i++) {
    const x = (r() * 360 - 20).toFixed(1)
    const y = (r() * 95).toFixed(1)
    parts.push(`<circle cx="${x}" cy="${y}" r="${(0.25 + r() * 0.45).toFixed(2)}" fill="#f6e6ff" class="tw d${i % 4}"/>`)
  }

  // Moon
  parts.push(`<circle cx="236" cy="44" r="46" fill="url(#moonglow)" class="halo"/>`)
  parts.push(`<circle cx="236" cy="44" r="15" fill="#fbe9f0"/>`)
  parts.push(`<circle cx="231" cy="40" r="3" fill="#efd6e1"/><circle cx="241" cy="49" r="2" fill="#efd6e1"/><circle cx="240" cy="38" r="1.3" fill="#efd6e1"/>`)

  // Distant hills
  parts.push(`<path d="M-40 128 C10 112 40 118 80 110 S150 100 190 114 S260 104 300 112 S350 116 360 118 V140 H-40Z" fill="#1d1024"/>`)
  parts.push(`<path d="M-40 134 C20 124 70 130 120 124 S220 120 260 128 S330 126 360 130 V140 H-40Z" fill="#150b1a"/>`)

  // Still water with the moon's reflection
  parts.push(`<rect x="-40" y="134" width="400" height="60" fill="url(#water)"/>`)
  for (let i = 0; i < 7; i++) {
    const w = 22 - i * 2.4
    parts.push(
      `<rect x="${(236 - w / 2).toFixed(1)}" y="${138 + i * 4}" width="${w.toFixed(1)}" height="1.2" rx=".6" fill="#fbe9f0" class="ripple d${i % 4}" opacity="${(0.55 - i * 0.06).toFixed(2)}"/>`,
    )
  }
  for (let i = 0; i < 10; i++) {
    const x = (r() * 320).toFixed(1)
    parts.push(
      `<rect x="${x}" y="${(140 + r() * 36).toFixed(1)}" width="${(6 + r() * 16).toFixed(1)}" height=".6" fill="#ffd2e4" opacity=".14" class="ripple d${i % 4}"/>`,
    )
  }

  // Cherry branch from the top-left corner, swaying gently
  const branch = `
<path d="M-20 -6 C20 6 44 18 70 30 S118 52 150 56" stroke="#1c0c15" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M70 30 C78 14 92 8 108 6" stroke="#1c0c15" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<path d="M104 46 C110 62 122 72 136 78" stroke="#1c0c15" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<path d="M30 10 C34 28 30 42 22 54" stroke="#1c0c15" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M150 56 C160 58 168 62 176 68" stroke="#1c0c15" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
  const glows = [
    [64, 28, 30], [108, 8, 22], [150, 56, 26], [136, 78, 20], [22, 52, 22], [30, 12, 20],
  ]
    .map(([x, y, rad]) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="url(#bloomglow)"/>`)
    .join('')
  const blooms = [
    [10, 2, 7], [30, 12, 9], [26, 34, 6], [22, 52, 8], [48, 20, 8], [66, 28, 10],
    [86, 10, 7], [106, 6, 9], [90, 40, 7], [116, 50, 9], [136, 56, 8], [152, 56, 10],
    [124, 70, 7], [138, 78, 9], [172, 66, 7],
  ]
    .map(([x, y, n]) => cluster(x ?? 0, y ?? 0, n ?? 6, r))
    .join('')
  parts.push(`<g class="sway">${glows}${branch}${blooms}</g>`)

  // Small branch at the right edge, lower down
  const right = `
<path d="M345 70 C326 76 312 86 300 100" stroke="#1c0c15" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M318 82 C312 70 304 64 294 62" stroke="#1c0c15" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<circle cx="300" cy="96" r="18" fill="url(#bloomglow)"/>`
  const rightBlooms = [
    [330, 74, 7], [312, 86, 8], [300, 100, 9], [296, 62, 6],
  ]
    .map(([x, y, n]) => cluster(x ?? 0, y ?? 0, n ?? 6, r))
    .join('')
  parts.push(`<g class="sway2">${right}${rightBlooms}</g>`)

  // Petals resting on the water
  for (let i = 0; i < 9; i++) {
    const x = (r() * 320).toFixed(1)
    const y = (142 + r() * 34).toFixed(1)
    parts.push(
      `<use href="#pe" x="${x}" y="${y}" fill="${PINKS[i % PINKS.length]}" opacity=".55" class="bob d${i % 4}"/>`,
    )
  }

  // Falling petals: each drifts down and left while tumbling. Its classes pick
  // the path (f), fall speed (fd), spin speed (sp) and start offset (dl).
  for (let i = 0; i < 42; i++) {
    const x = (r() * 400 - 20).toFixed(1)
    const dl = Math.floor(r() * 14)
    const fd = Math.floor(r() * 5)
    const sp = Math.floor(r() * 5)
    const s = (0.6 + r() * 0.8).toFixed(2)
    const fill = PINKS[Math.floor(r() * PINKS.length)] ?? '#ffc4d8'
    const lane = i % 3
    parts.push(
      `<g transform="translate(${x} -12)"><g class="fall f${lane} fd${fd} dl${dl}"><g class="tumble sp${sp} dl${dl}"><use href="#pe" fill="${fill}" transform="scale(${s}) translate(-3 0)"/></g></g></g>`,
    )
  }



  return smilify(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">${parts.join('')}</svg>`,
    animate,
  )
}

const { theme, problems } = makeColors({
  label: 'Sakura Night',
  id: ID,
  only: 'dark',
  roles: {
    accent: '#ff8fb8',
    danger: '#ff4d5e',
    success: '#8fe3a8',
    warning: '#ffcf7a',
    pro: '#b99cff',
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#120c16',
        'surface-1': '#19111e',
        'surface-2': '#1f1626',
        'surface-3': '#241a2c',
        'text-primary': '#fbeff5',
        'text-secondary': '#e0cbd8',
        'text-muted': '#b49aab',
      },
    },
    git: { added: '#8fe3a8', removed: '#ff4d5e', modified: '#ffcf7a', merged: '#b99cff' },
  },
})

const SCENE = scene()

export const sakuraNight: LookTheme = {
  id: ID,
  name: 'Sakura Night',
  tagline: 'Smooth, calm night: cherry blossoms swaying, petals falling, moon on still water.',
  look: {
    colors: theme,
    overrideColorScheme: 'dark',
    backdrop: { scene: ID, glass: { blur: 8, tint: '#120c16', opacity: 0.7 } },
  },
  scene: SCENE,
  preview: previewCard(
    {
      page: '#120c16',
      panel: '#19111e',
      border: '#ffb0cb',
      text: '#fbeff5',
      muted: '#b49aab',
      accent: '#ff8fb8',
      code: ['#ff8fb8', '#8fe3a8', '#b99cff'],
    },
    SCENE,
  ),
  swatch: ['#120c16', '#1f1626', '#ff8fb8', '#ffc4d8', '#8fe3a8', '#b99cff'],
  problems,
}
