// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ComputedRef, type InjectionKey } from 'vue'

export type NativeTabPosition = 'top' | 'right' | 'bottom' | 'left'

export type NativeTabPaneItem = {
  name: string
  label: string
}

export type NativeTabsContext = {
  modelValue: ComputedRef<string>
  registerPane: (pane: NativeTabPaneItem) => void
  unregisterPane: (name: string) => void
}

export const NATIVE_TABS_CONTEXT_KEY: InjectionKey<NativeTabsContext> = Symbol.for(
  'vim.comvisual.nativeTabs.context',
)
