<template>
  <div class="long-text-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector class="file-selector" :multiple="false" @onFileSelected="handleUpload">
            <template v-slot:default="{ selectFile }">
              <el-button type="primary" :disabled="readonly" @click="selectFile">
                {{ t('views.element_plus_engineering.settingrepo.upload') }}
              </el-button>
            </template>
          </file-selector>
          <el-button type="primary" :disabled="nullFlag" @click="handleDownload">
            {{ t('views.element_plus_engineering.settingrepo.download') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleInspect">
            {{ t('views.element_plus_engineering.settingrepo.refresh') }}
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container-wrapper">
          <placeholder-panel
            v-if="nullFlag"
            :text="t('views.element_plus_engineering.settingrepo.text_not_uploaded')"
          />
          <div class="main-container" v-else>
            <title-layout-panel
              class="item property-container"
              :title="t('views.element_plus_engineering.settingrepo.text_properties')"
            >
              <el-form class="property-form" label-position="left" label-width="80px" inline>
                <el-form-item
                  :label="t('views.element_plus_engineering.settingrepo.text_length')"
                  style="width: 100%"
                >
                  {{ formattedLength }}
                </el-form-item>
              </el-form>
            </title-layout-panel>
            <el-divider direction="vertical" />
            <title-layout-panel
              class="item expand editor-container"
              :title="t('views.element_plus_engineering.settingrepo.text_preview')"
            >
              <text-editor class="text-editor" :model-value="preview" readonly />
            </title-layout-panel>
          </div>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import FileSelector from '@/components/elementPlusEngineering/file/fileSelector/FileSelector.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import {
  operateInspect,
  requestTextStreamVoucher,
  uploadStream,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/longTextNode.ts'
import { resolveResponse } from '@/util/response.ts'
import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'LongTextNodeSubEditPanel',
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

// region 长文本

const settingNodeInvalid = computed(() => {
  return props.category === null || props.args === null
})

const nullFlag = ref<boolean>(true)
const preview = ref<string>('')
const length = ref<number>(0)
const formattedLength = computed(() => formatUnit(length.value, dataSizePreset))

watch(
  () => props.category,
  () => {
    handleInspect()
  },
)

watch(
  () => props.args,
  () => {
    handleInspect()
  },
)

onMounted(() => {
  handleInspect()
})

let textDownloadAbortController: AbortController | null = null

onUnmounted(() => {
  textDownloadAbortController?.abort()
})

async function handleInspect(): Promise<void> {
  if (settingNodeInvalid.value) {
    nullFlag.value = true
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    const result = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!result || result.null_flag) {
      nullFlag.value = true
      preview.value = ''
      length.value = 0
      return
    }
    nullFlag.value = false
    preview.value = result.preview
    length.value = result.length
  } finally {
    loading.value -= 1
  }
}

type TextFileSavePicker = (options?: {
  suggestedName?: string
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
}) => Promise<FileSystemFileHandle>

function resolveTextFileSavePicker(): TextFileSavePicker | null {
  const picker = (window as Window & { showSaveFilePicker?: TextFileSavePicker }).showSaveFilePicker
  if (typeof picker !== 'function') {
    return null
  }
  return picker.bind(window)
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function saveResponseToFile(
  response: Response,
  fileHandle: FileSystemFileHandle,
  signal: AbortSignal,
): Promise<void> {
  if (!response.ok) {
    throw new Error(t('views.element_plus_engineering.settingrepo.download_failed'))
  }
  const writable = await fileHandle.createWritable()
  let committed = false
  try {
    if (response.body) {
      await response.body.pipeTo(writable, { signal })
    } else {
      await writable.write(await response.blob())
      await writable.close()
    }
    committed = true
  } finally {
    if (!committed) {
      await writable.abort().catch(() => undefined)
    }
  }
}

async function handleDownload(): Promise<void> {
  function throwUnexpectedExecution(): never {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }

  if (nullFlag.value || !props.category || !props.args) {
    return
  }
  // 保存对话框必须在后续请求之前打开，浏览器才会把它视为本次点击，并让用户选择文件位置。
  const savePicker = resolveTextFileSavePicker()
  if (!savePicker) {
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.save_location_unsupported'),
      type: 'warning',
    })
    return
  }
  let fileHandle: FileSystemFileHandle
  try {
    fileHandle = await savePicker({
      suggestedName: 'long-text.txt',
      types: [
        {
          description: t('views.element_plus_engineering.settingrepo.text_file'),
          accept: {
            'text/plain': ['.txt'],
          },
        },
      ],
    })
  } catch (error) {
    if (isAbortError(error)) {
      return
    }
    if (error instanceof DOMException && error.name === 'SecurityError') {
      ElMessage({
        showClose: true,
        message: t('views.element_plus_engineering.settingrepo.save_location_unsupported'),
        type: 'warning',
      })
      return
    }
    throw error
  }
  const abortController = new AbortController()
  textDownloadAbortController = abortController
  loading.value += 1
  try {
    const voucherKey = await resolveResponse(
      requestTextStreamVoucher({
        category: props.category,
        args: props.args,
      }),
    )
    if (!voucherKey) {
      throwUnexpectedExecution()
    }
    let url = `${vim.ctx().api().baseUrl()}`
    if (!url.endsWith('/')) {
      url += '/'
    }
    url += `settingrepo/long-text-node/download-text-by-voucher?voucher-id=${voucherKey.long_id}`
    const response = await fetch(url, {
      cache: 'no-store',
      signal: abortController.signal,
    })
    // 按服务端返回的原始字节写入，不改变纯文本内容。
    await saveResponseToFile(response, fileHandle, abortController.signal)
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.downloaded_successfully'),
      type: 'success',
    })
  } catch (error) {
    if (!error || isAbortError(error) || abortController.signal.aborted) {
      return
    }
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.download_failed'),
      type: 'error',
    })
  } finally {
    if (textDownloadAbortController === abortController) {
      textDownloadAbortController = null
    }
    loading.value -= 1
  }
}

async function handleUpload(files: File[]): Promise<void> {
  if (files.length <= 0 || !props.category || !props.args) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  const formData = new FormData()
  formData.append('category', props.category)
  formData.append('args', JSON.stringify(props.args))
  formData.append('file', files[0])
  loading.value += 1
  try {
    await resolveResponse(uploadStream(formData))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.uploaded_successfully'),
      type: 'success',
    })
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
  } finally {
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.long-text-node-edit-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .file-selector {
  margin-right: 10px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.main-container-wrapper {
  height: 100%;
  width: 100%;
}

.main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

/*noinspection CssUnusedSymbol*/
.main-container .el-divider--vertical {
  height: 100%;
  margin: 0 5px;
}

.main-container .item {
  height: 100%;
}

.main-container .expand {
  width: 0;
  flex-grow: 1;
}

.property-container {
  width: 280px;
}

.editor-container .text-editor {
  height: 100%;
  width: 100%;
}
</style>
