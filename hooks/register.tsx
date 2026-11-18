import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { TextStyle } from '../types'
import { terminalText } from './terminal'
import { THEMES, findTheme, monoColors } from './themes'
import type { LookTheme } from './themes'

const PANE = 'looks'
const STORE_KEY = 'active'
const TEXT_KEY = 'text'

/** The id of the theme in use, so the picker and the chat redraw when it changes. */
const active = atom({ plugin: 'looks', key: 'active' } as const, 'default')
/** Normal or Monospace messages: chosen apart from the theme, works with every theme. */
const textStyle = atom({ plugin: 'looks', key: 'text' } as const, 'normal')

const TEXT_STYLES: { id: TextStyle; name: string; sample: string; words: string[] }[] = [
  { id: 'normal', name: 'Normal font', sample: 'Messages in the app’s regular font.', words: ['normal', 'normal-text', 'sans', 'regular'] },
  { id: 'mono', name: 'Monospace', sample: '❯ messages drawn like a terminal', words: ['mono', 'monospace', 'terminal-text'] },
]

function asTextStyle(value: unknown): TextStyle {
  return value === 'mono' ? 'mono' : 'normal'
}

/**
 * Older choices: before 0.5 the mod stored `{ palette, scene, text }`, and 0.5
 * had a separate "Hypr Night · Monospace" theme. Map both to theme + text style.
 */
function fromOldSettings(old: unknown): { theme: LookTheme | undefined; text: TextStyle } | undefined {
  if (typeof old !== 'object' || old === null) {
    return undefined
  }
  const o = old as Record<string, unknown>
  const text: TextStyle = o.text === 'terminal' ? 'mono' : 'normal'
  if (o.palette === 'terminal') {
    return { theme: findTheme('terminal'), text: 'mono' }
  }
  if (o.palette === 'hypr') {
    return { theme: findTheme('hypr-night'), text }
  }
  return { theme: findTheme(o.scene === 'great-tree' ? 'great-tree' : 'ashfall'), text }
}

async function setText($: EngineInterface, style: TextStyle, announce: boolean): Promise<string> {
  await update($, textStyle, () => style)
  await $.store.set(TEXT_KEY, style)
  const message = style === 'mono' ? 'Text style: Monospace' : 'Text style: Normal font'
  if (announce) {
    $.ui.toast(message)
  }
  return message
}

async function apply($: EngineInterface, theme: LookTheme, announce: boolean): Promise<string> {
  let message: string
  if (theme.look === null) {
    await $.theme.clear()
    await $.store.delete(STORE_KEY)
    message = 'Back to the app default look.'
  } else {
    const unpainted = theme.problems?.find(l => l.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(`${theme.name}: ${unpainted}`)
    }
    const set = await $.theme.set(theme.look)
    await $.store.set(STORE_KEY, theme.id)
    message = set.isDrawn
      ? `Look set: ${theme.name}`
      : `${theme.name} saved, but nothing draws it here: ${set.reason}`
  }
  await update($, active, () => theme.id)
  if (announce) {
    $.ui.toast(message)
  }
  return message
}

/** The monospace colors to draw with, or undefined while the text style is Normal. */
async function monoOf($: EngineInterface): Promise<LookTheme['mono']> {
  if (asTextStyle(await read($, textStyle)) !== 'mono') {
    return undefined
  }
  return monoColors(findTheme(await read($, active)))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'looks',
      description: 'Choose a theme (or /looks <name> to switch directly)',
      argumentHint: '[ashen | tree | hypr | terminal | midnight-kingdom | frostpine-hollow | sakura-night | default | normal | mono]',
    })
    const saved = await $.store.get(STORE_KEY)
    let theme = typeof saved === 'string' ? findTheme(saved) : undefined
    let text = asTextStyle(await $.store.get(TEXT_KEY))
    if (saved === 'hypr-mono') {
      // 0.5's "Hypr Night · Monospace" is now Hypr Night + the Monospace text style.
      theme = findTheme('hypr-night')
      text = 'mono'
    } else if (saved === undefined) {
      const old = fromOldSettings(await $.store.get('settings'))
      if (old !== undefined) {
        theme = old.theme
        text = old.text
        await $.store.delete('settings')
      }
    }
    if (theme !== undefined && theme.look !== null) {
      await apply($, theme, false)
    }
    await setText($, text, false)
    return next(e)
  })

  on('command.run', { command: 'looks' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg !== '') {
      const style = TEXT_STYLES.find(s => s.words.includes(arg))
      if (style !== undefined) {
        return { text: await setText($, style.id, false) }
      }
      const theme = findTheme(arg)
      if (theme === undefined) {
        return {
          text: `No theme "${arg}". Themes: ${THEMES.map(t => t.id).join(', ')}. Text: normal, mono.`,
        }
      }
      return { text: await apply($, theme, false) }
    }
    await $.ui.open({ id: PANE, title: 'Looks', focus: true })
    return { text: 'Looks picker opened.' }
  })

  // Draws the animated scene of whichever theme is active.
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const theme = THEMES.find(t => t.id === e.props.scene)
    if (theme?.scene === undefined) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={theme.scene} alt={`${theme.name} animated backdrop`} isInteractive />
  })

  // The picker.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const table = $.ui.resolve(e)
    const { Box, Text, Button } = table
    const Svg = 'Svg' in table ? table.Svg : undefined
    const current = await read($, active)
    const text = asTextStyle(await read($, textStyle))
    const accent = monoColors(findTheme(current)).accent

    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Text bold>Text style</Text>
        <Text dimColor>Works with every theme.</Text>
        <Box flexDirection="row" gap={1}>
          {TEXT_STYLES.map(style => {
            const isOn = style.id === text
            return (
              <Box
                key={`text-card-${style.id}`}
                flexDirection="column"
                gap={1}
                padding={1}
                flexGrow={1}
                borderStyle="round"
                borderColor={isOn ? 'cyan' : 'gray'}
              >
                <Box flexDirection="row" gap={1}>
                  <Text bold>{style.name}</Text>
                  {isOn && <Text color="cyan">● active</Text>}
                </Box>
                {style.id === 'mono' ? (
                  <Text mono>
                    <Text mono color={accent}>{'❯ '}</Text>
                    <Text mono dimColor>{'make it darker'}</Text>
                  </Text>
                ) : (
                  <Text dimColor>{'make it darker'}</Text>
                )}
                <Button
                  key={`text-${style.id}`}
                  label={isOn ? 'In use' : 'Use this style'}
                  variant={isOn ? 'secondary' : 'primary'}
                  onPress={() => {
                    void setText($, style.id, true)
                  }}
                />
              </Box>
            )
          })}
        </Box>

        <Text bold>Choose a look</Text>
        <Text dimColor>
          {THEMES.length} themes. Tip: /looks {'<name>'} switches without opening this.
        </Text>
        {THEMES.map(theme => {
          const isActive = theme.id === current
          return (
            <Box
              key={`card-${theme.id}`}
              flexDirection="column"
              gap={1}
              padding={1}
              borderStyle="round"
              borderColor={isActive ? 'cyan' : 'gray'}
            >
              {Svg !== undefined ? (
                <Svg
                  source={theme.preview}
                  alt={`Preview of ${theme.name}`}
                  width={260}
                  height={140}
                />
              ) : (
                <Box flexDirection="row">
                  {theme.swatch.map((c, i) => (
                    <Text key={`${theme.id}-sw-${i}`} backgroundColor={c}>
                      {'    '}
                    </Text>
                  ))}
                </Box>
              )}
              <Box flexDirection="row" gap={1}>
                <Text bold>{theme.name}</Text>
                {isActive && <Text color="cyan">● active</Text>}
              </Box>
              <Text dimColor>{theme.tagline}</Text>
              <Button
                key={`use-${theme.id}`}
                label={isActive ? 'In use' : 'Use this look'}
                variant={isActive ? 'secondary' : 'primary'}
                onPress={() => {
                  void apply($, theme, true)
                }}
              />
            </Box>
          )
        })}
      </Box>
    )
  })

  // ---------- the terminal text style (Terminal, Hypr Night · Monospace)

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || !e.props.isExpanded) {
      return next(e)
    }
    const mono = await monoOf($)
    if (mono === undefined) {
      return next(e)
    }
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row">
        <Text mono color={mono.accent}>{'❯ '}</Text>
        <Text mono dimColor>{e.props.text}</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const mono = await monoOf($)
    if (mono === undefined) {
      return next(e)
    }
    const { Box, Text } = $.ui.resolve(e)
    return terminalText(e.props.text, { Box, Text }, e.props.isFirstOfReply, mono.accent)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.hasSurvey) {
      return next(e)
    }
    const mono = await monoOf($)
    if (mono === undefined) {
      return next(e)
    }
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row">
        <Text mono color={mono.accent}>{'▚▞ '}</Text>
        <Text mono color={mono.label}>{mono.name}</Text>
        <Text mono dimColor>{'  ·  /looks to change'}</Text>
      </Box>
    )
  })
}
