<template>
  <label class="native-switch" :class="{ 'is-disabled': disabled }">
    <input
      type="checkbox"
      class="native-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="native-switch__track" aria-hidden="true" />
    <span v-if="activeText || inactiveText" class="native-switch__text">
      {{ modelValue ? activeText : inactiveText }}
    </span>
  </label>
</template>

<script setup lang="ts">
defineOptions({
  name: 'NativeSwitch',
})

// region Props 定义

type Props = {
  modelValue: boolean
  activeText?: string
  inactiveText?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  activeText: '',
  inactiveText: '',
  disabled: false,
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// endregion

// region 事件

function onChange(ev: Event): void {
  const checked = (ev.target as HTMLInputElement).checked
  emit('update:modelValue', checked)
}

// endregion
</script>

<style scoped>
.native-switch {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #606266;
}

.native-switch.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.native-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.native-switch__track {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #dcdfe6;
  transition: background 0.2s;
  flex-shrink: 0;
}

.native-switch__track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.native-switch__input:checked + .native-switch__track {
  background: #409eff;
}

.native-switch__input:checked + .native-switch__track::after {
  transform: translateX(18px);
}

.native-switch__input:focus-visible + .native-switch__track {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
</style>
