/** The id of a theme in hooks/themes/index.ts. */
export type LookId = string

/** How messages are drawn, with any theme. */
export type TextStyle = 'normal' | 'mono'

declare module 'claude-code' {
  interface PluginState {
    looks: { active: LookId; text: TextStyle }
  }
}
