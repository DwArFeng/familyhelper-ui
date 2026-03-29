// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type InjectionKey } from 'vue'

import { type NativeFormModel, type NativeFormRules } from './types.ts'

export type NativeFormFieldUnregister = () => void

export type NativeFormFieldHandle = {
  prop: string
  setError: (message: string | null) => void
}

export type NativeFormContext<CT extends NativeFormModel> = {
  model: CT
  rules: NativeFormRules<CT> | undefined
  labelWidthCss: string
  registerField: (handle: NativeFormFieldHandle) => NativeFormFieldUnregister
}

export const NATIVE_FORM_CONTEXT_KEY: InjectionKey<NativeFormContext<NativeFormModel>> = Symbol.for(
  'vim.comvisual.nativeForm.context',
)
