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
- **Midnight Kingdom**: a pixel-art dark-world RPG night. Twinkling stars, a castle with flickering windows and a waving flag, a pulsing pillar of light with rising motes, and a scrolling checkerboard field.
- **Frostpine Hollow**: the snowy part of the journey. Three layers of falling snow, a drifting aurora, snow-capped mountains, a pine forest, a cabin with a warm window and chimney smoke, and a glowing lamp post.
- **Sakura Night**: smooth vector art rather than pixel art. A dark plum night, cherry branches in bloom swaying from the corners, petals tumbling down from the sky, and a moon reflected in still water.

Keep each scene under about 120k characters (the app's limit is 131k, and the preview embeds the scene). Reuse repeated shapes with `<defs>`/`<use>` and draw dithering with `<pattern>` instead of many small rects.

Animate scenes with SVG's own animation tags (`<animate>`, `<animateTransform>`), not CSS: the app does not run a scene's `<style>` animations. Tag elements with classes and return their animation tags from the theme's `animate()` function; `smilify()` in `hooks/themes/preview.ts` puts them in place.

## Adding a theme

1. Copy `hooks/themes/midnight-kingdom.ts` to a new file in `hooks/themes/`.
2. Change its `id`, `name`, `tagline`, the colors passed to `makeColors`, and the `scene()` art (or drop `scene` and `backdrop` for a colors-only theme).
3. Import it in `hooks/themes/index.ts` and add it to the `THEMES` list.

`previewCard()` in `hooks/themes/preview.ts` builds the picker card from a few colors plus your scene, and `px`, `roof` and `rng` help draw pixel art.

Run `claude plugin test <this folder>` to check every theme paints and fits the size limit.

The terminal CLI does not draw themes; there the picker shows color swatches instead of previews.
