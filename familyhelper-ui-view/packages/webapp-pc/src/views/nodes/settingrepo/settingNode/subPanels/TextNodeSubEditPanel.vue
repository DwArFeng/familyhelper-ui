<template>
  <div class="text-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="confirm-button"
            type="primary"
            :disabled="readonly"
            @click="handleEditorCommitButtonClicked"
          >
            <span class="unsaved-emphasis" v-if="editorContentChanged" />
            <span class="text">提交</span>
          </el-button>
          <el-button type="danger" :disabled="readonly" @click="handleEditorResetButtonClicked">
            重置
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <text-editor
          v-model="editorContent"
          :readonly="readonly"
          @keydown.ctrl.s.prevent="handleEditorCommitHotKeyDown"
        />
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'

import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'TextNodeSubEditPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  category: string | null
  args: string[] | null
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------Props 处理-----------------------------------------------------------
const settingNodeInvalid = computed(() => {
  return props.category === null || props.args === null
})

watch(
  () => props.category,
  () => {
    handlePropsUpdate()
  },
)

watch(
  () => props.args,
  () => {
    handlePropsUpdate()
  },
)

onMounted(() => {
  handlePropsUpdate()
})

function handlePropsUpdate(): void {
  handleInspect()
}

// -----------------------------------------------------------编辑器逻辑-----------------------------------------------------------
const editorContent = ref<string>('')
const editorBackupContent = ref<string>('')

const editorContentChanged = computed(() => {
  return editorContent.value !== editorBackupContent.value
})

const editorCommitButtonWidth = computed(() => {
  return `${editorContentChanged.value ? 70 : 60}px`
})

async function handleInspect(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const res = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    editorContent.value = res?.value ?? ''
    editorBackupContent.value = res?.value ?? ''
  } finally {
    loading.value -= 1
  }
}

function handleEditorCommitButtonClicked(): void {
  putTextNode()
}

function handleEditorCommitHotKeyDown(): void {
  putTextNode()
}

async function putTextNode(): Promise<void> {
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      operatePut({
        category: props.category,
        args: props.args,
        value: editorContent.value,
      }),
    )
    editorBackupContent.value = editorContent.value
    ElMessage({
      showClose: true,
      message: '提交成功',
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

function handleEditorResetButtonClicked(): void {
  editorContent.value = editorBackupContent.value
}
</script>

<style scoped>
.text-node-edit-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .confirm-button {
  width: v-bind(editorCommitButtonWidth);
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.header-container .confirm-button .unsaved-emphasis {
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  margin-left: -6px;
}
</style>
