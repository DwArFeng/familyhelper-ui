<template>
  <div class="file-selector-container">
    <input
      ref="fileSelectorRef"
      hidden
      type="file"
      :multiple="multiple"
      :accept="accept"
      @change="handleFileSelected($event)"
    />
    <slot :selectFile="handleFileSelect">
      <!--suppress JSValidateTypes -->
      <el-button
        class="avatar-editor-header"
        :type="buttonType"
        :size="buttonSize"
        @click="handleFileSelect"
      >
        选择文件
      </el-button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { ElMessageBox } from 'element-plus'

import { type FileTester, type FileTestResult } from './types.ts'

defineOptions({
  name: 'FileSelector',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accept?: string
  multiple?: boolean
  tester?: FileTester
  buttonSize?: 'large' | 'default' | 'small'
  buttonType?: 'primary' | 'success' | 'info' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  accept: '',
  multiple: false,
  tester: () => true as FileTestResult,
  buttonSize: 'default',
  buttonType: 'success',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onFileSelected', files: File[]): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
type DefaultSlotProps = {
  selectFile: () => void
}

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
}>()

// -----------------------------------------------------------选择逻辑-----------------------------------------------------------
const fileSelectorRef = useTemplateRef<HTMLInputElement>('fileSelectorRef')

function handleFileSelect(): void {
  const selector = fileSelectorRef.value
  if (!selector) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  selector.click()
}

function handleFileSelected(event: Event): void {
  try {
    // 获取文件列表。
    const fileList: FileList = (event.target as HTMLInputElement).files as FileList
    // 如果没有选择文件，那么直接返回。
    if (fileList.length === 0) {
      return
    }
    // 定义未通过测试的信息列表。
    const failedInfos: { file: File; message: string }[] = []
    // 对每个文件进行测试，如果未通过测试，则登记至 failedInfos。
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i]
      const result: true | { passed: boolean; message: string } = props.tester(file)
      if (result !== true && !result.passed) {
        failedInfos.push({ file, message: result.message })
      }
    }
    // 如果未通过测试向下列表不为空，则使用 ElMessage 提示用户，并退出。
    if (failedInfos.length > 0) {
      let failedMessage: string = ''
      for (let i = 0; i < failedInfos.length; i++) {
        const { file, message } = failedInfos[i]
        if (i > 0) {
          failedMessage += '<br>'
        }
        failedMessage += `文件名: ${file.name}，原因：${message}`
      }
      ElMessageBox.alert('<b>至少一个文件未通过测试，相关信息如下：</b><br>' + failedMessage, {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'error',
      })
      return
    }
    // 如果通过测试，则抛出事件。
    const files: File[] = Array.from(fileList)
    emit('onFileSelected', files)
  } finally {
    // 重置 input 的值，这样选择相同文件时也会触发 change 事件。
    ;(event.target as HTMLInputElement).value = ''
  }
}

// -----------------------------------------------------------文件选择-----------------------------------------------------------
function selectFile(): void {
  const selector = fileSelectorRef.value
  if (!selector) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  selector.click()
}

defineExpose({
  selectFile,
})
</script>

<style scoped></style>
