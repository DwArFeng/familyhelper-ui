<template>
  <div class="native-form">
    <slot name="default" />
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, provide, shallowRef } from 'vue'

import {
  NATIVE_FORM_CONTEXT_KEY,
  type NativeFormContext,
  type NativeFormFieldHandle,
  type NativeFormFieldUnregister,
} from './context.ts'
import { getByPath } from './utils.ts'
import { normalizeRules, runFieldRules } from './rulesRunner.ts'
import {
  type FormValidateCallback,
  type NativeFormModel,
  type NativeFormRules,
  type ValidateFieldsError,
} from './types.ts'

defineOptions({
  name: 'NativeForm',
})

// region Props 定义

type Props = {
  model: CT
  rules?: NativeFormRules<CT>
  labelWidth?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  rules: undefined,
  labelWidth: '80px',
})

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region 标签宽度

function toLabelWidthCss(v: string | number | undefined): string {
  if (v === undefined) {
    return '80px'
  }
  if (v === 'auto') {
    return 'auto'
  }
  if (typeof v === 'number') {
    return `${v}px`
  }
  return v
}

const labelWidthCss = computed(() => toLabelWidthCss(props.labelWidth))

// endregion

// region 表单项注册

const fieldHandles = shallowRef<NativeFormFieldHandle[]>([])

function registerField(handle: NativeFormFieldHandle): NativeFormFieldUnregister {
  fieldHandles.value = [...fieldHandles.value, handle]
  return () => {
    fieldHandles.value = fieldHandles.value.filter((h) => h !== handle)
  }
}

// endregion

// region 表单上下文

// noinspection JSUnusedGlobalSymbols
const formContext: NativeFormContext<CT> = {
  get model() {
    return props.model
  },
  get rules() {
    return props.rules
  },
  get labelWidthCss() {
    return labelWidthCss.value
  },
  registerField,
}

provide(NATIVE_FORM_CONTEXT_KEY, formContext as NativeFormContext<NativeFormModel>)

// endregion

// region 校验

async function validate(callback?: FormValidateCallback): Promise<void> {
  const model = props.model
  const invalid: ValidateFieldsError = {}
  let allValid = true
  for (const field of fieldHandles.value) {
    const { prop } = field
    if (!prop) {
      field.setError(null)
      continue
    }
    const list = normalizeRules(props.rules?.[prop])
    if (list.length === 0) {
      field.setError(null)
      continue
    }
    const value = getByPath(model, prop)
    const msg = await runFieldRules(list, value, model)
    field.setError(msg)
    if (msg) {
      allValid = false
      invalid[prop] = [{ message: msg }]
    }
  }
  await callback?.(allValid, allValid ? undefined : invalid)
}

// endregion

// region Expose 定义

defineExpose({
  validate,
})

// endregion
</script>

<style scoped>
.native-form {
  display: block;
}
</style>
