import type { LookTheme } from './types'
import { previewCard } from './preview'
import { midnightKingdom } from './midnight-kingdom'
import { frostpineHollow } from './frostpine-hollow'
import { sakuraNight } from './sakura-night'

export type { LookTheme } from './types'

/** "Back to normal": clears any theme this mod set. */
const appDefault: LookTheme = {
  id: 'default',
  name: 'App default',
  tagline: "Claude's own look, no theme applied.",
  look: null,
  preview: previewCard({
    page: '#262624',
    panel: '#30302e',
    border: '#5a5955',
    text: '#f5f4ef',
    muted: '#a6a39b',
    accent: '#d97757',
    code: ['#d97757', '#8fb573', '#b48ead'],
  }),
  swatch: ['#262624', '#30302e', '#d97757', '#f5f4ef'],
}

/**
 * THE THEME REGISTRY. To add a theme:
 *   1. copy midnight-kingdom.ts to a new file and change it,
 *   2. import it here and add it to this list.
 * The /looks picker shows them in this order.
 */
export const THEMES: readonly LookTheme[] = [appDefault, midnightKingdom, frostpineHollow, sakuraNight]

export function findTheme(query: string): LookTheme | undefined {
  const q = query.trim().toLowerCase()
  return THEMES.find(t => t.id === q || t.name.toLowerCase() === q)
}
