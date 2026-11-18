/**
 * Shared helpers for themes: a mock "chat window" preview card, and pixel-art
 * drawing utilities. Every theme can reuse these so previews look consistent.
 */

export type PreviewPalette = {
  page: string
  panel: string
  border: string
  text: string
  muted: string
  accent: string
  code: [string, string, string]
}

const W = 260
const H = 140

/** A 260x140 card: optional scene art behind a little pixel chat window. */
export function previewCard(p: PreviewPalette, art?: string): string {
  const bg = art ?? `<rect width="320" height="180" fill="${p.page}"/>`
  const line = (x: number, y: number, w: number, c: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="4" fill="${c}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges">
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">${stripOuter(bg)}</svg>
<g>
  <rect x="12" y="12" width="150" height="116" fill="${p.panel}" fill-opacity="0.88"/>
  <rect x="12" y="12" width="150" height="2" fill="${p.border}"/>
  <rect x="12" y="126" width="150" height="2" fill="${p.border}"/>
  <rect x="12" y="12" width="2" height="116" fill="${p.border}"/>
  <rect x="160" y="12" width="2" height="116" fill="${p.border}"/>
  ${line(22, 24, 70, p.text)}
  ${line(22, 32, 100, p.muted)}
  ${line(22, 40, 84, p.muted)}
  <rect x="22" y="52" width="130" height="34" fill="${p.page}" fill-opacity="0.9"/>
  ${line(28, 58, 18, p.code[0])}${line(50, 58, 40, p.code[1])}
  ${line(34, 66, 30, p.code[2])}${line(68, 66, 50, p.text)}
  ${line(28, 74, 22, p.code[0])}${line(54, 74, 26, p.code[1])}
  <rect x="22" y="100" width="130" height="18" fill="${p.page}" fill-opacity="0.9"/>
  <rect x="22" y="100" width="130" height="2" fill="${p.accent}"/>
  <rect x="28" y="107" width="4" height="4" fill="${p.accent}">${op('1;0', 1, 0, DISCRETE)}</rect>
</g>
</svg>`
}

/** Removes an outer `<svg ...>` wrapper so the body can be nested. */
function stripOuter(svg: string): string {
  const m = svg.match(/^\s*<svg[^>]*>([\s\S]*)<\/svg>\s*$/)
  return m?.[1] ?? svg
}

/** Small deterministic random generator, so scenes are the same every load. */
export function rng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** A pixel rect. */
export const px = (x: number, y: number, w: number, h: number, fill: string, cls = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${cls ? ` class="${cls}"` : ''}/>`

/** A stepped (pixel) pointed roof that sits on top of `baseY`. */
export function roof(cx: number, baseY: number, halfW: number, fill: string, step = 2): string {
  let out = ''
  for (let i = 0; halfW - i > 0; i++) {
    const w = 2 * (halfW - i)
    out += px(cx - halfW + i, baseY - (i + 1) * step, w, step, fill)
  }
  return out
}

/*
 * SMIL animation. The app does not run a scene's <style> animations, so
 * scenes animate with SVG's own <animate>/<animateTransform> tags instead.
 * A scene tags elements with classes, and `smilify` gives each tagged
 * element the animation tags its theme's `anim` function returns.
 */

const REPEAT = 'repeatCount="indefinite"'
const at = (begin: number) => `begin="${begin === 0 ? 0 : -Math.abs(begin)}s"`

/** Animate opacity through `values` (`;`-separated) over `dur` seconds. */
export const op = (values: string, dur: number, begin = 0, extra = '') =>
  `<animate attributeName="opacity" values="${values}" dur="${dur}s" ${at(begin)} ${REPEAT}${extra}/>`

/** Animate a transform (`translate`, `rotate`, `scale`) through `values`. */
export const tf = (type: string, values: string, dur: number, begin = 0, extra = '') =>
  `<animateTransform attributeName="transform" type="${type}" values="${values}" dur="${dur}s" ${at(begin)} ${REPEAT}${extra}/>`

/** Holds an attribute at one value. */
export const hold = (attr: string, to: string) => `<set attributeName="${attr}" to="${to}"/>`

export const DISCRETE = ' calcMode="discrete"'
/** Ease in and out between each pair of values (`n` values). */
export const ease = (n: number) =>
  ` calcMode="spline" keyTimes="${Array.from({ length: n }, (_, i) => +(i / (n - 1)).toFixed(4)).join(';')}" keySplines="${Array.from({ length: n - 1 }, () => '.42 0 .58 1').join(';')}"`

/** The number after `prefix` in one of `classes` (`d3` → 3), else 0. */
export const num = (classes: string[], prefix: string): number => {
  const hit = classes.find(c => c.startsWith(prefix) && /^\d+$/.test(c.slice(prefix.length)))
  return hit === undefined ? 0 : Number(hit.slice(prefix.length))
}

/** Drops any stylesheet and inline styles, and puts each classed element's animation tags inside it. */
export function smilify(svg: string, anim: (classes: string[]) => string): string {
  return svg
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/ style="[^"]*"/g, '')
    .replace(/<(\w+)([^<>]*?) class="([^"]+)"([^<>]*?)(\/?)>/g, (_m, tag: string, a: string, cls: string, b: string, closed: string) => {
      const open = `<${tag}${a}${b}>`
      const kids = anim(cls.split(/\s+/))
      if (closed === '/') {
        return kids === '' ? `<${tag}${a}${b}/>` : `${open}${kids}</${tag}>`
      }
      return `${open}${kids}`
    })
}
