/** The id of a theme in hooks/themes/index.ts. */
export type LookId = string

declare module 'claude-code' {
  interface PluginState {
    looks: { active: LookId }
  }
}
