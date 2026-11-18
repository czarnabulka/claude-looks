import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { terminalText } from './terminal'
import { THEMES, findTheme } from './themes'
import type { LookTheme } from './themes'

const PANE = 'looks'
const STORE_KEY = 'active'

/** The id of the theme in use, so the picker and the chat redraw when it changes. */
const active = atom({ plugin: 'looks', key: 'active' } as const, 'default')

/** Before 0.5 the mod stored `{ palette, scene, text }`; map it to a theme. */
function fromOldSettings(old: unknown): LookTheme | undefined {
  if (typeof old !== 'object' || old === null) {
    return undefined
  }
  const o = old as Record<string, unknown>
  if (o.palette === 'terminal') {
    return findTheme('terminal')
  }
  if (o.palette === 'hypr') {
    return findTheme(o.text === 'terminal' ? 'hypr-mono' : 'hypr-night')
  }
  return findTheme(o.scene === 'great-tree' ? 'great-tree' : 'ashfall')
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

/** The active theme's terminal colors, if it draws the chat as a terminal. */
async function monoOf($: EngineInterface): Promise<LookTheme['mono']> {
  return findTheme(await read($, active))?.mono
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'looks',
      description: 'Choose a theme (or /looks <name> to switch directly)',
      argumentHint: '[ashen | tree | hypr | hypr-mono | terminal | midnight-kingdom | frostpine-hollow | sakura-night | default]',
    })
    const saved = await $.store.get(STORE_KEY)
    let theme = typeof saved === 'string' ? findTheme(saved) : undefined
    if (saved === undefined) {
      theme = fromOldSettings(await $.store.get('settings'))
      if (theme !== undefined) {
        await $.store.delete('settings')
      }
    }
    if (theme !== undefined && theme.look !== null) {
      await apply($, theme, false)
    }
    return next(e)
  })

  on('command.run', { command: 'looks' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg !== '') {
      const theme = findTheme(arg)
      if (theme === undefined) {
        return { text: `No theme "${arg}". Available: ${THEMES.map(t => t.id).join(', ')}` }
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

    return (
      <Box flexDirection="column" gap={1} padding={1}>
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
                  isInteractive
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
