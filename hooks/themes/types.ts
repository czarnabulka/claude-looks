import type { ThemeSetArgs } from 'claude-code'

/**
 * One entry in the /looks picker. To add a theme: make a file in this folder
 * that exports a LookTheme, then add it to the list in ./index.ts.
 */
export type LookTheme = {
  /** Stable id, also the scene name: letters, digits, `-` and `_` only. */
  id: string
  /** Shown in the picker. */
  name: string
  /** One short line under the name. */
  tagline: string
  /** What `$.theme.set` receives. `null` means "clear back to the app's own look". */
  look: ThemeSetArgs | null
  /** Full `<svg>` drawn behind the conversation when `look.backdrop.scene === id`. */
  scene?: string
  /** Small `<svg>` card shown in the picker (about 260x140). */
  preview: string
  /** A few hex colors, drawn as blocks where SVG can't be shown (terminal). */
  swatch: string[]
  /** Other words `/looks <word>` accepts for this theme. */
  aliases?: string[]
  /**
   * Colors for the Monospace text style (the `❯`/`●` markers and the band
   * above the prompt). Optional: without it they come from `swatch`.
   */
  mono?: { accent: string; label: string; name: string }
  /** Contrast notes from makeColors, surfaced while developing. */
  problems?: string[]
}
