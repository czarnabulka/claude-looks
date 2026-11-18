import type { BoxProps, ElementConstructor, RenderElement, RenderNode, TextProps, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// The Terminal look: plain near-black, soft grey text, one coral accent.
// Flat, no scene, everything monospace.
const { theme, problems } = makeColors({
  label: 'Graphite',
  only: 'dark',
  roles: {
    accent: '#d08770', // coral
    danger: '#d36a6a',
    success: '#8fbf7f',
    warning: '#d0b060',
    pro: '#a08fd0',
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#111111',
        'surface-1': '#161616',
        'surface-2': '#1b1b1b',
        'surface-3': '#222222',
        'text-primary': '#dadada',
        'text-secondary': '#b4b4b4',
        'text-muted': '#8f8f8f',
      },
    },
  },
})

export const TERMINAL_PROBLEMS = problems

export const TERMINAL_LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { color: 'surface-0' },
}

export const ACCENT = '#d08770'
export const AMBER = '#c9a85e'
const CODE = '#9fb7c9'

type Els = {
  Box: ElementConstructor<BoxProps>
  Text: ElementConstructor<TextProps>
}

// **bold** and `code` inside a line.
function inline(line: string, { Text }: Els, key: string): RenderNode[] {
  return line
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    .filter(part => part !== '')
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={`${key}-${i}`} mono weight="bold">{part.slice(2, -2)}</Text>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <Text key={`${key}-${i}`} mono color={CODE}>{part.slice(1, -1)}</Text>
      }
      // Links [text](url) as "text (url)".
      return <Text key={`${key}-${i}`} mono>{part.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')}</Text>
    })
}

// A reply's markdown drawn as a terminal would: monospace lines, headings
// bold, code blocks indented in a cool tint, lists with plain bullets.
export function terminalText(text: string, els: Els, bullet: boolean, accent: string = ACCENT): RenderElement {
  const { Box, Text } = els
  const rows: RenderNode[] = []
  let inFence = false

  text.split('\n').forEach((raw, i) => {
    const key = `l${i}`
    if (raw.trimStart().startsWith('```')) {
      inFence = !inFence
      return
    }
    if (inFence) {
      rows.push(<Text key={key} mono color={CODE}>{`  ${raw}`}</Text>)
      return
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(raw)
    if (heading !== null) {
      rows.push(<Text key={key} mono weight="bold">{heading[2] ?? ''}</Text>)
      return
    }
    const item = /^(\s*)[-*+]\s+(.*)$/.exec(raw)
    if (item !== null) {
      rows.push(<Text key={key} mono>{`${item[1] ?? ''}  • `}{inline(item[2] ?? '', els, key)}</Text>)
      return
    }
    rows.push(<Text key={key} mono>{raw === '' ? ' ' : inline(raw, els, key)}</Text>)
  })

  return (
    <Box flexDirection="row">
      <Text mono color={bullet ? accent : undefined}>{bullet ? '● ' : '  '}</Text>
      <Box flexDirection="column" flexShrink={1}>{rows}</Box>
    </Box>
  )
}
