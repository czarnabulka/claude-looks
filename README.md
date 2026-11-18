# looks

A theme manager for Claude Code (desktop and mobile apps), with animated themes.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install looks --marketplace czarnabulka/claude-looks
```

Or from a shell:

```bash
claude plugin install looks --marketplace czarnabulka/claude-looks
```

Answer `y` to add the marketplace, then choose the user scope. In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `czarnabulka/claude-looks`, then Add plugin.

## Use

- `/looks` opens a picker pane: every theme with an animated preview, its name, and a **Use this look** button.
- `/looks <id or name>` switches directly, e.g. `/looks midnight-kingdom` or `/looks default`.
- The chosen theme is remembered and re-applied in every new session.

## Included themes

- **App default**: clears the theme.
- **Ashen Gold**: ash-black stone and worn bronze. A dull fire-glow behind a bare ridge, ash drifting down, embers rising.
- **Ashen Gold · Great tree**: the same colors with a vast tree of golden light beyond dark mountains.
- **Hypr Night**: a tiling-desktop rice at night. Slate blues, soft cyan and lavender, misty ridges under a floating top bar.
- **Hypr Night · Monospace**: Hypr Night with the chat drawn as a terminal.
- **Terminal**: plain near-black, soft grey, one coral accent, everything monospace. No background scene.
- **Midnight Kingdom**: a pixel-art dark-world RPG night. Twinkling stars, a castle with flickering windows and a waving flag, a pulsing pillar of light with rising motes, and a scrolling checkerboard field.
- **Frostpine Hollow**: the snowy part of the journey. Three layers of falling snow, a drifting aurora, snow-capped mountains, a pine forest, a cabin with a warm window and chimney smoke, and a glowing lamp post.
- **Sakura Night**: smooth vector art rather than pixel art. A dark plum night, cherry branches in bloom swaying from the corners, petals tumbling down from the sky, and a moon reflected in still water.

Keep each scene under about 120k characters (the app's limit is 131k, and the preview embeds the scene). Reuse repeated shapes with `<defs>`/`<use>` and draw dithering with `<pattern>` instead of many small rects.

Scenes can animate two ways, and both work in the app: CSS `@keyframes` in the scene's own `<style>` (Ashen Gold, Great tree, Hypr Night), or SVG's animation tags `<animate>`/`<animateTransform>` (Midnight Kingdom, Frostpine Hollow, Sakura Night: tag elements with classes and return their tags from the theme's `animate()` function; `smilify()` in `hooks/themes/preview.ts` puts them in place). CSS animation respects the system's reduced-motion setting: if a computer has animations turned off (Windows: Settings › Accessibility › Visual effects › Animation effects), a CSS scene stands still while SVG-tag animation keeps moving.

## Adding a theme

1. Copy `hooks/themes/midnight-kingdom.ts` to a new file in `hooks/themes/`.
2. Change its `id`, `name`, `tagline`, the colors passed to `makeColors`, and the `scene()` art (or drop `scene` and `backdrop` for a colors-only theme).
3. Import it in `hooks/themes/index.ts` and add it to the `THEMES` list.

Optional fields: `aliases` (extra words `/looks <word>` accepts) and `mono` (draws the chat as a terminal, like the Terminal theme). A theme can reuse another theme's scene by naming that theme's `id` as its `backdrop.scene` (see Hypr Night · Monospace). Bigger hand-drawn scenes live in `hooks/scenes/`.

`previewCard()` in `hooks/themes/preview.ts` builds the picker card from a few colors plus your scene, and `px`, `roof` and `rng` help draw pixel art.

Run `claude plugin test <this folder>` to check every theme paints and fits the size limit.

The terminal CLI does not draw themes; there the picker shows color swatches instead of previews.
