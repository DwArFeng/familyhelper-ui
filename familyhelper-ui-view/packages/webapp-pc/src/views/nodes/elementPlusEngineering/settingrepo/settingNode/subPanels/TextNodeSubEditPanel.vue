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
            <span class="text">{{ t('views.element_plus_engineering.settingrepo.commit') }}</span>
          </el-button>
          <el-button type="danger" :disabled="readonly" @click="handleEditorResetButtonClicked">
            {{ t('views.element_plus_engineering.settingrepo.reset') }}
          </el-button>
          <el-button type="success" @click="handleInspect">
            {{ t('views.element_plus_engineering.settingrepo.refresh') }}
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

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'TextNodeSubEditPanel',
})

// region Props 定义

type Props = {
  category: string | null
  args: string[] | null
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region Props 处理

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

// endregion

// region 编辑器逻辑

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
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
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
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
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
      message: t('views.element_plus_engineering.settingrepo.commit_succeeded'),
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

function handleEditorResetButtonClicked(): void {
  editorContent.value = editorBackupContent.value
}

// endregion
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
