<template>
  <Teleport to="body">
    <div
      v-show="visible"
      class="modal-dialog-root"
      :class="{ 'modal-dialog-root--align-center': alignCenter }"
      :style="rootStyle"
    >
      <div class="modal-dialog-backdrop" @click="onBackdropClick" />
      <div
        ref="panelRef"
        class="modal-dialog-panel"
        :style="panelStyle"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        @keydown.esc.stop.prevent="handleClose"
        @keydown.ctrl.enter.prevent="emit('hotConfirm')"
      >
        <div class="modal-dialog-header">
          <span :id="titleId" class="modal-dialog-title">{{ title }}</span>
          <native-button bare class="modal-dialog-close" aria-label="关闭" @click="handleClose">
            ×
          </native-button>
        </div>
        <div class="modal-dialog-body">
          <slot name="default" />
        </div>
        <div v-if="$slots.footer" class="modal-dialog-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

defineOptions({
  name: 'ModalDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  title?: string
  closeOnClickModal?: boolean
  /** 为 true 时对话框在 flex 容器中水平垂直居中，此时 top 不生效 */
  alignCenter?: boolean
  /** 非 alignCenter 时根容器的 padding-top，默认 15vh */
  top?: string
  /** 对话框宽度，数字视为 px；默认 50% */
  width?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  closeOnClickModal: false,
  alignCenter: false,
  top: '15vh',
  width: '50%',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'hotConfirm'): void
}

const emit = defineEmits<Emits>()

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  footer?: (props: {}) => any
}>()

// endregion

// region 模板引用与辅助

const panelRef = ref<HTMLElement | null>(null)
const titleId = useId()

const rootStyle = computed(() => ({
  paddingTop: props.alignCenter ? '0' : props.top,
}))

const panelStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}))

// endregion

// region 关闭与遮罩

function handleClose(): void {
  emit('update:visible', false)
}

function onBackdropClick(): void {
  if (props.closeOnClickModal) {
    handleClose()
  }
}

// endregion

// region 可见性与焦点

watch(
  () => props.visible,
  (v) => {
    if (v) {
      nextTick(() => {
        panelRef.value?.focus()
      })
    }
  },
)

// endregion
</script>

<style scoped>
.modal-dialog-root {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
}

.modal-dialog-root--align-center {
  align-items: center;
}

.modal-dialog-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.modal-dialog-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  max-width: min(100%, 92vw);
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  outline: none;
}

.modal-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.modal-dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.modal-dialog-body {
  padding: 16px;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.modal-dialog-footer {
  padding: 10px 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
