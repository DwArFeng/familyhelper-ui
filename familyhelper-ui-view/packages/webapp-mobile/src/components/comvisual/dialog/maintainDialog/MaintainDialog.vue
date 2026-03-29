<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    :title="resolvedTitle"
    :close-on-click-modal="closeOnClickModal"
    :align-center="alignCenter"
    :top="top"
    :width="width"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="maintain-dialog-body">
      <loading-overlay :loading="loadingActive" />
      <form
        class="maintain-dialog-form"
        :style="{ '--maintain-label-width': labelWidth }"
        @submit.prevent="handleFormSubmit"
      >
        <native-form v-if="item != null" :model="item" :label-width="labelWidth">
          <slot name="default" />
        </native-form>
        <slot v-else name="default" />
      </form>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <native-button
          v-if="mode !== 'INSPECT'"
          kind="primary"
          :disabled="loadingActive"
          @click="handleFirstButtonClicked"
        >
          {{ firstButtonLabel }}
        </native-button>
        <native-button :disabled="loadingActive" @click="handleSecondButtonClicked">
          {{ secondButtonLabel }}
        </native-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, onMounted, ref, watch } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'

defineOptions({
  name: 'MaintainDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  item?: CT
  mode?: 'CREATE' | 'EDIT' | 'INSPECT'
  labelWidth?: string
  createTitle?: string
  editTitle?: string
  inspectTitle?: string
  createConfirmButtonLabel?: string
  editConfirmButtonLabel?: string
  createCancelButtonLabel?: string
  editCancelButtonLabel?: string
  inspectCloseButtonLabel?: string
  closeOnClickModal?: boolean
  loading?: boolean | number
  alignCenter?: boolean
  top?: string
  width?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'INSPECT',
  labelWidth: '80px',
  createTitle: '新建',
  editTitle: '编辑',
  inspectTitle: '查看',
  createConfirmButtonLabel: '新建',
  editConfirmButtonLabel: '编辑',
  createCancelButtonLabel: '取消',
  editCancelButtonLabel: '取消',
  inspectCloseButtonLabel: '关闭',
  closeOnClickModal: true,
  loading: false,
  alignCenter: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onItemCreate', item: CT): void
  (e: 'onItemEdit', item: CT): void
}

const emit = defineEmits<Emits>()

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region 可见性处理

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 加载逻辑

const loadingActive = computed<boolean>(() => {
  if (typeof props.loading === 'number') {
    return props.loading > 0
  }
  return props.loading
})

// endregion

// region 标题/按钮标签处理

const resolvedTitle = computed(() => {
  switch (props.mode) {
    case 'CREATE':
      return props.createTitle
    case 'EDIT':
      return props.editTitle
    case 'INSPECT':
      return props.inspectTitle
    default:
      return ''
  }
})

const firstButtonLabel = computed(() => {
  switch (props.mode) {
    case 'CREATE':
      return props.createConfirmButtonLabel
    case 'EDIT':
      return props.editConfirmButtonLabel
    default:
      return ''
  }
})

const secondButtonLabel = computed(() => {
  switch (props.mode) {
    case 'CREATE':
      return props.createCancelButtonLabel
    case 'EDIT':
      return props.editCancelButtonLabel
    case 'INSPECT':
      return props.inspectCloseButtonLabel
    default:
      return ''
  }
})

// endregion

// region 按钮与快捷键

function handleFirstButtonClicked(): void {
  switch (props.mode) {
    case 'CREATE':
      if (props.item !== undefined) {
        emit('onItemCreate', props.item)
      }
      break
    case 'EDIT':
      if (props.item !== undefined) {
        emit('onItemEdit', props.item)
      }
      break
    default:
  }
}

function handleSecondButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  switch (props.mode) {
    case 'CREATE':
      handleFirstButtonClicked()
      break
    case 'EDIT':
      handleFirstButtonClicked()
      break
    case 'INSPECT':
      watchedVisible.value = false
      break
    default:
  }
}

function handleFormSubmit(): void {
  if (props.mode === 'CREATE' || props.mode === 'EDIT') {
    handleFirstButtonClicked()
  }
}

// endregion
</script>

<style scoped>
.maintain-dialog-body {
  position: relative;
  min-width: 0;
}

.maintain-dialog-form {
  margin: 0;
  padding: 0;
  border: none;
  min-width: 0;
}

.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
