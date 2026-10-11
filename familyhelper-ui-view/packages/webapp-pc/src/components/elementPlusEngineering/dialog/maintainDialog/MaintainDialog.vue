<template>
  <el-dialog
    class="item-maintain-dialog-container"
    id="dialog"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    :top="top"
    :title="title"
    :close-on-click-modal="closeOnClickModal"
    :custom-class="customClass"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="item"
      :label-width="labelWidth"
      :rules="rules"
      :validate-on-rule-change="false"
      @submit.prevent
    >
      <slot name="default" />
    </el-form>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button
          type="primary"
          v-if="mode !== 'INSPECT'"
          :disabled="loading"
          @click="handleFirstButtonClicked"
        >
          {{ firstButtonLabel }}
        </el-button>
        <el-button :disabled="loading" @click="handleSecondButtonClicked">
          {{ secondButtonLabel }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { type FormRules } from 'element-plus'
import { ElForm } from 'element-plus'

defineOptions({
  name: 'MaintainDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  item?: CT
  mode?: 'CREATE' | 'EDIT' | 'INSPECT'
  labelWidth?: string
  createRules?: FormRules
  editRules?: FormRules
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
  top?: string
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'INSPECT',
  labelWidth: '80px',
  closeOnClickModal: true,
  loading: false,
  top: '15vh',
  customClass: '',
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

// region I18n 引入

const { t } = useI18n()

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

const loading = computed<boolean>(() => {
  if (typeof props.loading === 'number') {
    return props.loading > 0
  }
  return props.loading
})

// endregion

// region 标题/按钮标签处理

const title = computed(() => {
  switch (props.mode) {
    case 'CREATE':
      return (
        props.createTitle ??
        t('components.element_plus_engineering.dialog.maintain_dialog.create_title')
      )
    case 'EDIT':
      return (
        props.editTitle ??
        t('components.element_plus_engineering.dialog.maintain_dialog.edit_title')
      )
    case 'INSPECT':
      return (
        props.inspectTitle ??
        t('components.element_plus_engineering.dialog.maintain_dialog.inspect_title')
      )
    default:
      return ''
  }
})

const firstButtonLabel = computed(() => {
  switch (props.mode) {
    case 'CREATE':
      return (
        props.createConfirmButtonLabel ??
        t('components.element_plus_engineering.dialog.maintain_dialog.create_confirm')
      )
    case 'EDIT':
      return (
        props.editConfirmButtonLabel ??
        t('components.element_plus_engineering.dialog.maintain_dialog.edit_confirm')
      )
    default:
      return ''
  }
})

const secondButtonLabel = computed(() => {
  switch (props.mode) {
    case 'CREATE':
      return (
        props.createCancelButtonLabel ??
        t('components.element_plus_engineering.dialog.maintain_dialog.cancel')
      )
    case 'EDIT':
      return (
        props.editCancelButtonLabel ??
        t('components.element_plus_engineering.dialog.maintain_dialog.cancel')
      )
    case 'INSPECT':
      return (
        props.inspectCloseButtonLabel ??
        t('components.element_plus_engineering.dialog.maintain_dialog.close')
      )
    default:
      return ''
  }
})

// endregion

// region 规则处理

const rules = computed<FormRules | undefined>(() => {
  switch (props.mode) {
    case 'CREATE':
      return props.createRules as FormRules
    case 'EDIT':
      return props.editRules as FormRules
    case 'INSPECT':
      return undefined
    default:
      throw new Error('不应该执行到此处, 请联系开发人员')
  }
})

// endregion

// region 表单引用

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

// endregion

// region 模式处理

watch(
  () => props.mode,
  () => {
    if (!formRef.value) {
      return
    }
    formRef.value.clearValidate()
  },
)

// endregion

// region 按钮事件处理

function handleFirstButtonClicked(): void {
  if (!formRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  switch (props.mode) {
    case 'CREATE':
      formRef.value.validate((accept: boolean) => {
        if (accept && props.item) {
          emit('onItemCreate', props.item)
        }
      })
      break
    case 'EDIT':
      formRef.value.validate((accept: boolean) => {
        if (accept && props.item) {
          emit('onItemEdit', props.item)
        }
      })
      break
    default:
  }
}

function handleSecondButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (!formRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  switch (props.mode) {
    case 'CREATE':
      formRef.value.validate((accept: boolean) => {
        if (accept && props.item) {
          emit('onItemCreate', props.item)
        }
      })
      break
    case 'EDIT':
      formRef.value.validate((accept: boolean) => {
        if (accept && props.item) {
          emit('onItemEdit', props.item)
        }
      })
      break
    case 'INSPECT':
      watchedVisible.value = false
      break
    default:
  }
}

// endregion
</script>

<style scoped>
.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
