import { HYPR_ACCENT, HYPR_LAVENDER, HYPR_SCENE, hypr } from '../scenes/hypr'
import { ACCENT, AMBER, TERMINAL_LOOK, TERMINAL_PROBLEMS } from '../terminal'
import { previewCard } from './preview'
import type { LookTheme } from './types'

// Terminal and Hypr Night. Either can be drawn with normal or monospace text:
// that is the picker's separate "Text style" choice.

export const terminal: LookTheme = {
  id: 'terminal',
  name: 'Terminal',
  tagline: 'Plain near-black, soft grey, one coral accent. Best with Monospace text.',
  aliases: ['graphite'],
  look: TERMINAL_LOOK,
  mono: { accent: ACCENT, label: AMBER, name: 'terminal' },
  preview: previewCard({
    page: '#111111',
    panel: '#161616',
    border: '#d08770',
    text: '#dadada',
    muted: '#8f8f8f',
    accent: '#d08770',
    code: ['#d08770', '#9fb7c9', '#c9a85e'],
  }),
  swatch: ['#111111', '#222222', '#d08770', '#9fb7c9', '#dadada'],
  problems: TERMINAL_PROBLEMS,
}

const HYPR_CARD = {
  page: '#11151e',
  panel: '#151a25',
  border: HYPR_ACCENT,
  text: '#d6deea',
  muted: '#8590a4',
  accent: HYPR_ACCENT,
  code: [HYPR_ACCENT, '#8cc49a', HYPR_LAVENDER] as [string, string, string],
}
const HYPR_SWATCH = ['#11151e', '#212837', HYPR_ACCENT, HYPR_LAVENDER, '#d6deea']

export const hyprNight: LookTheme = {
  id: 'hypr-night',
  name: 'Hypr Night',
  tagline: 'Misty moonlit ridges, a floating top bar, a cyan-to-lavender window border.',
  aliases: ['hypr', 'night', 'cyan'],
  look: { colors: hypr.theme, backdrop: { scene: 'hypr-night' } },
  mono: { accent: HYPR_ACCENT, label: HYPR_LAVENDER, name: 'hypr' },
  scene: HYPR_SCENE,
  preview: previewCard(HYPR_CARD, HYPR_SCENE),
  swatch: HYPR_SWATCH,
  problems: hypr.problems,
}
