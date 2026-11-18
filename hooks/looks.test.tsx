import { expect, test } from 'claude-code/testing'

import { THEMES } from './themes'

const PANE = {
  plugin: 'looks',
  component: 'Pane',
  requestId: 'looks',
  props: {
    title: 'Looks',
    isFocused: true,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('every theme is well formed and paints on Desktop', () => {
  const ids = new Set<string>()
  for (const t of THEMES) {
    expect(/^[A-Za-z0-9_-]{1,64}$/.test(t.id)).toBe(true)
    expect(ids.has(t.id)).toBe(false)
    ids.add(t.id)
    expect(t.preview.length < 131072).toBe(true)
    expect((t.scene ?? '').length < 131072).toBe(true)
    const blocking = (t.problems ?? []).filter(l => l.startsWith("Desktop won't paint"))
    expect(blocking).toEqual([])
  }
})

test('/looks <name> sets that theme and remembers it', async ($, on) => {
  const sets: unknown[] = []
  const stored: Record<string, unknown> = {}
  on('command.register', () => ({ value: { command: 'looks' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', (_, e) => {
    sets.push(e)
    return { value: { isDrawn: true, requestId: 'r1' } }
  })
  on('store.set', (_, e) => {
    stored[e.key] = e.value
    return { value: undefined }
  })
  on('store.get', () => ({ value: undefined }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const out = await $.command.run({
    command: 'looks',
    args: 'midnight-kingdom',
  } as Parameters<typeof $.command.run>[0])

  expect(out.text).toBe('Look set: Midnight Kingdom')
  expect(sets.length).toBe(1)
  expect(stored.active).toBe('midnight-kingdom')
})

test('the picker lists every theme and a press applies one', async ($, on) => {
  let setCount = 0
  on('theme.set', () => {
    setCount++
    return { value: { isDrawn: true, requestId: 'r1' } }
  })
  on('store.set', () => ({ value: undefined }))

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    for (const t of THEMES) {
      expect((await ui.find({ type: 'Text', text: t.name }))?.text).toBe(t.name)
    }
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'use-midnight-kingdom' })
  expect(setCount).toBe(1)
  await ui.unmount()
})

test('a choice saved by the old version (palette/scene/text) carries over', async ($, on) => {
  const stored: Record<string, unknown> = { settings: { palette: 'hypr', scene: 'hypr-night', text: 'terminal' } }
  on('command.register', () => ({ value: { command: 'looks' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'r1' } }))
  on('store.get', (_, e) => ({ value: stored[e.key] }))
  on('store.set', (_, e) => {
    stored[e.key] = e.value
    return { value: undefined }
  })
  on('store.delete', (_, e) => {
    delete stored[e.key]
    return { value: undefined }
  })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(stored.active).toBe('hypr-mono')
  expect(stored.settings).toBe(undefined)
})
