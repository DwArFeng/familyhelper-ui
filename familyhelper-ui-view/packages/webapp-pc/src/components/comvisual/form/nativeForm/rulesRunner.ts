// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NativeFormModel, type NativeFormRule } from './types.ts'

export function normalizeRules<CT extends NativeFormModel>(
  raw: NativeFormRule<CT> | NativeFormRule<CT>[] | undefined,
): NativeFormRule<CT>[] {
  if (raw == null) {
    return []
  }
  return Array.isArray(raw) ? raw : [raw]
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true
  }
  if (typeof value === 'string') {
    return value.trim() === ''
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  return false
}

export async function runFieldRules<CT extends NativeFormModel>(
  rules: NativeFormRule<CT>[],
  value: unknown,
  model: CT,
): Promise<string | null> {
  for (const r of rules) {
    if (r.required && isEmptyValue(value)) {
      return r.message ?? '该字段为必填项'
    }
    if (r.validator) {
      const outcome = await r.validator(value, model)
      if (outcome === false) {
        return r.message ?? '校验未通过'
      }
      if (typeof outcome === 'string' && outcome !== '') {
        return outcome
      }
    }
  }
  return null
}
