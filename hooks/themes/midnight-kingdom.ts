import { makeColors } from '../make-colors.js'
import type { LookTheme } from './types'
import { DISCRETE, num, op, previewCard, px, rng, roof, smilify, tf } from './preview'

/**
 * Midnight Kingdom: a dark-world, 16-bit RPG night. Pixel stars, a distant
 * castle with flickering windows, a pulsing pillar of light with rising motes,
 * and a scrolling checkerboard field. Original art, drawn in code.
 */

const ID = 'midnight-kingdom'

const C = {
  sky: ['#06030d', '#0a0516', '#0f0720', '#150a2c', '#1c0d3a'],
  hill: '#1a0c34',
  hill2: '#120827',
  castle: '#0a0414',
  castleEdge: '#2b1659',
  window: '#ffd84a',
  star: '#f4efff',
  starCyan: '#7ff3ff',
  pillarOuter: '#3a1f7a',
  pillarMid: '#7b55ff',
  pillarCore: '#efe8ff',
  floorA: '#2a1050',
  floorB: '#170833',
  floorEdge: '#6b3cff',
  mote: '#c9b8ff',
  flag: '#ff3b8d',
}

/** The animation tags for an element with these classes. */
function animate(c: string[]): string {
  const floorSteps = Array.from({ length: 20 }, (_, i) => `${-i} 0`).join(';')
  switch (c[0]) {
    case 'tw':
      return op('1;.55;.15;.55', 3.2, num(c, 'd') * 0.7, DISCRETE)
    case 'spk':
      return op('0;.35;1;1;.35;0', 5, num(c, 'd') * 0.7, DISCRETE)
    case 'win':
      return op('1;1;.55;1;1;.8;1', 4, [0, 1, 2.3, 3.1][num(c, 'w')] ?? 0, DISCRETE)
    case 'flagA':
      return op('1;0', 0.8, 0, DISCRETE)
    case 'flagB':
      return op('0;1', 0.8, 0, DISCRETE)
    case 'pillar':
      return op('.55;.68;.82;.95;.82;.68', 4.8, 0, DISCRETE)
    case 'rise': {
      const b = num(c, 'r') * 0.9
      return op('0;1;.8;0', 6, b, ' keyTimes="0;.1;.8;1"') + tf('translate', '0 0;0 -130', 6, b)
    }
    case 'floor':
      return tf('translate', floorSteps, 2, 0, DISCRETE)
    default:
      return ''
  }
}

function scene(): string {
  const r = rng(1997)
  const parts: string[] = []

  // Banded sky (pixel gradient)
  const bands: Array<[number, string]> = [0, 30, 60, 90, 115].map((y, i) => [y, C.sky[i] ?? '#000000'])
  bands.forEach(([y, fill]) => parts.push(px(-40, y, 400, 200, fill)))
  // Dithered seams between bands
  bands.slice(1).forEach(([y, fill]) => {
    for (let x = -40; x < 360; x += 4) {
      parts.push(px(x, y - 2, 2, 2, fill))
      parts.push(px(x + 2, y - 4, 2, 2, fill))
    }
  })

  // Stars
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(r() * 360) - 20
    const y = Math.floor(r() * 110)
    const big = r() < 0.15
    const col = r() < 0.25 ? C.starCyan : C.star
    const cls = `tw d${i % 6}`
    if (big) {
      // 4-point pixel sparkle
      parts.push(`<g class="${cls}">${px(x, y - 1, 1, 3, col)}${px(x - 1, y, 3, 1, col)}</g>`)
    } else {
      parts.push(px(x, y, 1, 1, col, cls))
    }
  }

  // Big slow sparkles
  const sparkle = (x: number, y: number, d: number) =>
    `<g class="spk d${d}" style="transform-origin:${x + 0.5}px ${y + 0.5}px">${px(x, y - 3, 1, 7, C.star)}${px(x - 3, y, 7, 1, C.star)}${px(x - 1, y - 1, 3, 3, C.starCyan)}</g>`
  parts.push(sparkle(118, 26, 1), sparkle(196, 54, 3), sparkle(26, 72, 5), sparkle(300, 18, 2))

  // Far hills (stepped silhouette)
  let x = -40
  while (x < 360) {
    const w = 8 + Math.floor(r() * 3) * 4
    const h = 18 + Math.floor(r() * 5) * 4
    parts.push(px(x, 150 - h, w, h + 10, C.hill))
    x += w
  }
  x = -40
  while (x < 360) {
    const w = 12 + Math.floor(r() * 3) * 4
    const h = 6 + Math.floor(r() * 4) * 3
    parts.push(px(x, 150 - h, w, h + 10, C.hill2))
    x += w
  }

  // Castle (right side)
  const castle: string[] = []
  const tower = (x0: number, top: number, w: number, roofH = 2) => {
    castle.push(px(x0, top, w, 150 - top, C.castle))
    castle.push(px(x0, top, 1, 150 - top, C.castleEdge))
    castle.push(roof(x0 + w / 2, top, w / 2 + 1, C.castle, roofH))
  }
  // keep with crenellations
  castle.push(px(246, 116, 52, 34, C.castle))
  for (let cx = 246; cx < 298; cx += 4) castle.push(px(cx, 113, 2, 3, C.castle))
  castle.push(px(246, 116, 52, 1, C.castleEdge))
  tower(234, 100, 12, 2)
  tower(298, 96, 12, 2)
  tower(264, 78, 16, 3)
  // flag on the central tower
  castle.push(px(271, 46, 1, 10, C.castleEdge))
  castle.push(`<g class="flagA">${px(272, 46, 6, 2, C.flag)}${px(272, 48, 4, 2, C.flag)}</g>`)
  castle.push(`<g class="flagB">${px(272, 46, 4, 2, C.flag)}${px(272, 48, 6, 2, C.flag)}</g>`)
  // gate
  castle.push(px(267, 136, 10, 14, '#000000'))
  castle.push(px(268, 134, 8, 2, '#000000'))
  // windows
  const wins: Array<[number, number]> = [
    [238, 108], [238, 122], [302, 104], [302, 118], [268, 88], [274, 88],
    [252, 124], [288, 124], [256, 136], [284, 136], [271, 100],
  ]
  wins.forEach(([wx, wy], i) => castle.push(px(wx, wy, 2, 3, C.window, `win w${i % 4}`)))
  parts.push(`<g>${castle.join('')}</g>`)

  // Pillar of light (left side)
  parts.push(
    `<g class="pillar">${px(36, 0, 22, 150, C.pillarOuter)}${px(40, 0, 14, 150, C.pillarMid)}${px(44, 0, 6, 150, C.pillarCore)}</g>`,
  )
  parts.push(px(30, 146, 34, 4, C.pillarMid, 'pillar'))
  // Rising motes
  for (let i = 0; i < 14; i++) {
    const mx = 30 + Math.floor(r() * 34)
    const my = 130 + Math.floor(r() * 18)
    parts.push(px(mx, my, r() < 0.3 ? 2 : 1, r() < 0.3 ? 2 : 1, C.mote, `rise r${i % 7}`))
  }

  // Checkerboard field, scrolling
  let floor = ''
  for (let row = 0; row < 4; row++) {
    for (let col = -2; col < 36; col++) {
      const fill = (row + col) % 2 === 0 ? C.floorA : C.floorB
      floor += px(col * 10, 152 + row * 8, 10, 8, fill)
    }
  }
  parts.push(px(-40, 150, 400, 2, C.floorEdge))
  parts.push(`<g class="floor">${floor}</g>`)
  // floor shading (closer = darker)
  parts.push(`<rect x="-40" y="168" width="400" height="20" fill="#05020b" fill-opacity="0.45"/>`)


  return smilify(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">${parts.join('')}</svg>`,
    animate,
  )
}

const { theme, problems } = makeColors({
  label: 'Midnight Kingdom',
  id: ID,
  only: 'dark',
  roles: {
    accent: '#2fd8ff',
    danger: '#ff3b5c',
    success: '#3dff8f',
    warning: '#ffd23d',
    pro: '#c46bff',
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0d0818',
        'surface-1': '#150d26',
        'surface-2': '#1b1131',
        'surface-3': '#22163c',
        'text-primary': '#f4efff',
        'text-secondary': '#d2c7ec',
        'text-muted': '#a99bcc',
      },
    },
    git: { added: '#3dff8f', removed: '#ff3b5c', modified: '#ffd23d', merged: '#c46bff' },
  },
})

const SCENE = scene()

export const midnightKingdom: LookTheme = {
  id: ID,
  name: 'Midnight Kingdom',
  tagline: 'Pixel-art dark world: starfield, castle, light pillar, scrolling field.',
  look: {
    colors: theme,
    overrideColorScheme: 'dark',
    backdrop: { scene: ID, glass: { blur: 4, tint: '#0d0818', opacity: 0.74 } },
  },
  scene: SCENE,
  preview: previewCard(
    {
      page: '#0d0818',
      panel: '#150d26',
      border: '#f4efff',
      text: '#f4efff',
      muted: '#a99bcc',
      accent: '#ffd84a',
      code: ['#2fd8ff', '#3dff8f', '#c46bff'],
    },
    SCENE,
  ),
  swatch: ['#0d0818', '#1b1131', '#2fd8ff', '#ffd84a', '#ff3b5c', '#c46bff'],
  problems,
}
