<template>
  <div class="item-maintain-dialog-container">
    <el-dialog
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
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'

import type { FormRules } from 'element-plus'
import { ElForm } from 'element-plus'

defineOptions({
  name: 'MaintainDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible?: boolean
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
  visible: false,
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
  top: '15vh',
  customClass: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onItemCreate', item: CT): void
  (e: 'onItemEdit', item: CT): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
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

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = computed<boolean>(() => {
  if (typeof props.loading === 'number') {
    return props.loading > 0
  }
  return props.loading
})

// -----------------------------------------------------------标题/按钮标签处理-----------------------------------------------------------
const title = computed(() => {
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

// -----------------------------------------------------------规则处理-----------------------------------------------------------
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

// -----------------------------------------------------------表单引用-----------------------------------------------------------
const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef')

// -----------------------------------------------------------模式处理-----------------------------------------------------------
watch(
  () => props.mode,
  () => {
    if (!formRef.value) {
      return
    }
    formRef.value.clearValidate()
  },
)

// -----------------------------------------------------------按钮事件处理-----------------------------------------------------------
function handleFirstButtonClicked() {
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

function handleSecondButtonClicked() {
  watchedVisible.value = false
}

function handleHotKeyDown() {
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
</script>

<style scoped>
.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
