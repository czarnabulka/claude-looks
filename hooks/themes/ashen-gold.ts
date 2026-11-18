import { makeColors } from '../make-colors.js'
import { SCENE as ASHFALL } from '../scenes/ashfall'
import { GREAT_TREE } from '../scenes/great-tree'
import { previewCard } from './preview'
import type { LookTheme } from './types'

// Ash-black stone, dim embers, only a trace of gold. Dark only, kept low-glare:
// no pure black or white, text a soft parchment instead of bright white.
const { theme, problems } = makeColors({
  label: 'Ashen Gold',
  only: 'dark',
  roles: {
    accent: '#a8956a', // pale, worn bronze
    danger: '#b04a3c', // ember red
    success: '#7f9a5a', // moss green
    warning: '#b98242', // dim torch amber
    pro: '#8a6fb0', // faded violet
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#14120f',
        'surface-1': '#1a1815',
        'surface-2': '#211e1a',
        'surface-3': '#28241f',
        'text-primary': '#e2dbcb',
        'text-secondary': '#c0b7a4',
        'text-muted': '#9e9584',
      },
    },
  },
})

const CARD = {
  page: '#14120f',
  panel: '#1a1815',
  border: '#a8956a',
  text: '#e2dbcb',
  muted: '#9e9584',
  accent: '#a8956a',
  code: ['#b98242', '#7f9a5a', '#8a6fb0'],
} as const

const SWATCH = ['#14120f', '#28241f', '#a8956a', '#b98242', '#b04a3c', '#e2dbcb']

export const ashenGold: LookTheme = {
  id: 'ashfall',
  name: 'Ashen Gold',
  tagline: 'A dull fire-glow behind a bare ridge, ash drifting down, embers rising.',
  aliases: ['ashen', 'gold', 'ashen-gold'],
  look: { colors: theme, backdrop: { scene: 'ashfall' } },
  scene: ASHFALL,
  preview: previewCard({ ...CARD, code: [...CARD.code] }, ASHFALL),
  swatch: SWATCH,
  problems,
}

export const ashenTree: LookTheme = {
  id: 'great-tree',
  name: 'Ashen Gold · Great tree',
  tagline: 'A vast tree of golden light beyond dark mountains, leaves drifting down.',
  aliases: ['tree', 'ashen-tree'],
  look: { colors: theme, backdrop: { scene: 'great-tree' } },
  scene: GREAT_TREE,
  preview: previewCard({ ...CARD, code: [...CARD.code] }, GREAT_TREE),
  swatch: SWATCH,
  problems,
}
