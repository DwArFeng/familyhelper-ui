<template>
  <div class="file-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector class="file-selector" :multiple="false" @onFileSelected="handleUpload">
            <template v-slot:default="{ selectFile }">
              <el-button type="primary" :disabled="readonly" @click="selectFile">
                {{ t('views.element_plus_engineering.settingrepo.upload') }}</el-button
              >
            </template>
          </file-selector>
          <el-button type="primary" :disabled="readonly" @click="fileCreateDialogVisible = true">
            {{ t('views.element_plus_engineering.settingrepo.create') }}
          </el-button>
          <el-button type="primary" :disabled="fileNullFlag" @click="handleDownload">
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
            v-if="fileNullFlag"
            :text="t('views.element_plus_engineering.settingrepo.file_not_uploaded')"
          />
          <div class="main-container" v-else>
            <title-layout-panel
              class="item property-container"
              :title="t('views.element_plus_engineering.settingrepo.file_properties')"
            >
              <el-form class="property-form" label-position="left" label-width="80px" inline>
                <el-form-item
                  :label="t('views.element_plus_engineering.settingrepo.file_name')"
                  style="width: 100%"
                >
                  {{ fileOriginName }}
                </el-form-item>
                <el-form-item
                  :label="t('views.element_plus_engineering.settingrepo.file_size')"
                  style="width: 100%"
                >
                  {{ fileFormattedLength }}
                </el-form-item>
              </el-form>
            </title-layout-panel>
            <el-divider direction="vertical" />
            <title-layout-panel
              class="item expand editor-container"
              :title="t('views.element_plus_engineering.settingrepo.file_editor')"
            >
              <placeholder-panel
                v-if="!canInspect"
                :text="t('views.element_plus_engineering.settingrepo.file_cannot_be_displayed')"
              />
              <div
                class="placeholder"
                v-else-if="!readonly && canEdit && isLargeFile && !userConfirmedLargeFile"
              >
                {{
                  t('views.element_plus_engineering.settingrepo.file_size_edit_performance_warning')
                }}
                <br />
                {{ t('views.element_plus_engineering.settingrepo.continue_editing_link_hint') }}
                <br />
                <el-link type="primary" @click="handleConfirmLargeFile">
                  {{ t('views.element_plus_engineering.settingrepo.click_to_edit') }}
                </el-link>
              </div>
              <div
                class="placeholder"
                v-else-if="!readonly && isLargeFile && !userConfirmedLargeFile"
              >
                {{ t('views.element_plus_engineering.settingrepo.file_inspect_only') }}
                <br />
                {{
                  t(
                    'views.element_plus_engineering.settingrepo.file_size_inspect_performance_warning',
                  )
                }}
                <br />
                {{ t('views.element_plus_engineering.settingrepo.continue_inspection_link_hint') }}
                <br />
                <el-link type="primary" @click="handleConfirmLargeFile">
                  {{ t('views.element_plus_engineering.settingrepo.click_to_inspect') }}
                </el-link>
              </div>
              <div class="placeholder" v-else-if="isLargeFile && !userConfirmedLargeFile">
                {{
                  t(
                    'views.element_plus_engineering.settingrepo.file_size_inspect_performance_warning',
                  )
                }}
                <br />
                {{ t('views.element_plus_engineering.settingrepo.continue_inspection_link_hint') }}
                <br />
                <el-link type="primary" @click="handleConfirmLargeFile"
                  >{{ t('views.element_plus_engineering.settingrepo.click_to_inspect') }}
                </el-link>
              </div>
              <div class="editor-wrapper" v-else-if="shouldShowEditor">
                <el-tag
                  class="inspect-notice"
                  v-if="
                    !readonly && fileEditInfo?.actionLevel === 'INSPECT' && !inspectNoticeClosed
                  "
                  type="info"
                  closable
                  disable-transitions
                  @close="inspectNoticeClosed = true"
                >
                  {{ t('views.element_plus_engineering.settingrepo.file_inspect_only') }}
                </el-tag>
                <file-edit-panel
                  type="SETTINGREPO_FILE_NODE"
                  :id="editorId"
                  :mode="editorMode"
                  @onFileCommitted="handleFileCommitted"
                />
              </div>
            </title-layout-panel>
          </div>
        </div>
      </template>
    </header-layout-panel>
    <file-create-dialog
      v-model:visible="fileCreateDialogVisible"
      :title="t('views.element_plus_engineering.settingrepo.create_file')"
      :loading="fileCreateDialogLoading"
      @onConfirmed="handleFileCreateDialogConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import FileSelector from '@/components/elementPlusEngineering/file/fileSelector/FileSelector.vue'
import FileEditPanel from '@/views/nodes/elementPlus/miscellaneous/fileEditor/FileEditPanel.vue'
import FileCreateDialog from '@/components/elementPlusEngineering/file/fileCreateDialog/FileCreateDialog.vue'

import { type FileCreateInfo } from '@/components/elementPlusEngineering/file/fileCreateDialog/types.ts'

import {
  operateInspect,
  requestFileStreamVoucher,
  uploadStream,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/fileNode.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { parseFileExtension } from '@dwarfeng/familyhelper-ui-component-util/src/util/file.ts'

import { type EditInfo } from '@/util/file.ts'
import { getEditInfo } from '@/util/file.ts'

import { Base64 } from 'js-base64'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'FileNodeSubEditPanel',
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

// region 文件属性面板

const fileNullFlag = ref<boolean>(true)
const fileOriginName = ref<string>('')
const fileLength = ref<number>(0)

// endregion

// region 文件编辑器

const userConfirmedLargeFile = ref<boolean>(false)
const inspectNoticeClosed = ref<boolean>(false)

const fileFormattedLength = computed(() => {
  return formatUnit(fileLength.value, dataSizePreset)
})

const fileExtension = computed<string>(() => {
  return parseFileExtension(fileOriginName.value).toUpperCase()
})

const fileEditInfo = computed<EditInfo | null>(() => {
  return getEditInfo(fileExtension.value)
})

const canInspect = computed<boolean>(() => {
  if (!fileEditInfo.value) {
    return false
  }
  return fileEditInfo.value.actionLevel === 'INSPECT' || fileEditInfo.value.actionLevel === 'EDIT'
})

const canEdit = computed<boolean>(() => {
  if (!fileEditInfo.value) {
    return false
  }
  return fileEditInfo.value.actionLevel === 'EDIT' && !props.readonly
})

const isLargeFile = computed<boolean>(() => {
  return fileLength.value >= 5 * 1024 * 1024
})

const shouldShowEditor = computed<boolean>(() => {
  if (!canInspect.value) {
    return false
  }
  return !(isLargeFile.value && !userConfirmedLargeFile.value)
})

const editorMode = computed<'INSPECT' | 'EDIT'>(() => {
  if (canEdit.value) {
    return 'EDIT'
  }
  return 'INSPECT'
})

const editorId = computed<string>(() => {
  if (!props.category || !props.args) {
    return ''
  }
  const idData = {
    category: props.category,
    args: props.args,
  }
  return Base64.encode(JSON.stringify(idData))
})

function handleConfirmLargeFile(): void {
  userConfirmedLargeFile.value = true
}

function handleFileCommitted(): void {
  handleInspect()
}

// endregion

// region 文件创建对话框

const fileCreateDialogVisible = ref<boolean>(false)
const fileCreateDialogLoading = ref<number>(0)

async function handleFileCreateDialogConfirmed(file: FileCreateInfo): Promise<void> {
  if (props.category === null || props.args === null) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  fileCreateDialogLoading.value += 1
  try {
    // 将 Blob 转换为 File
    const fileBlob = new File([file.blob], file.name, { type: 'application/octet-stream' })
    // 构造表单数据
    const formData = new FormData()
    formData.append('category', props.category)
    formData.append('args', JSON.stringify(props.args))
    formData.append('file', fileBlob)
    // 执行上传
    await resolveResponse(uploadStream(formData))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.file_created'),
      type: 'success',
    })
    // 刷新文件信息
    await handleInspect()
    // 关闭对话框
    fileCreateDialogVisible.value = false
  } finally {
    fileCreateDialogLoading.value -= 1
  }
}

// endregion

// region 文件操作

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
    userConfirmedLargeFile.value = false
    inspectNoticeClosed.value = false
    const fileNodeInspectResult = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!fileNodeInspectResult) {
      fileNullFlag.value = true
      return
    }
    fileNullFlag.value = false
    fileOriginName.value = fileNodeInspectResult.origin_name
    fileLength.value = fileNodeInspectResult.length
  } finally {
    loading.value -= 1
  }
}

async function handleDownload(): Promise<void> {
  if (props.category === null || props.args === null) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  loading.value += 1
  try {
    const voucherKey = await resolveResponse(
      requestFileStreamVoucher({
        category: props.category,
        args: props.args,
      }),
    )
    if (!voucherKey) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.file_preparing_wait_hint'),
      type: 'success',
      duration: 10000,
    })
    // 构造下载地址。
    let url = `${vim.ctx().api().baseUrl()}`
    if (!url.endsWith('/')) {
      url += '/'
    }
    url += `settingrepo/file-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`
    // 执行下载。
    const iframe = document.createElement('iframe')
    iframe.setAttribute('hidden', 'hidden')
    document.body.appendChild(iframe)
    iframe.setAttribute('src', url)
    // 在下载开始后移除 iframe。
    // 由于 iframe 的 onload 方法对于链接下载无效，因此采用 setTimeout 方法，设置一个较大的值，
    // 假定这段时间内下载已经开始。
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 3600000)
  } finally {
    loading.value -= 1
  }
}

async function handleUpload(files: File[]): Promise<void> {
  if (files.length <= 0 || props.category === null || props.args === null) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  // 获取文件。
  const file: File = files[0]
  // 构造表单数据。
  const formData = new FormData()
  formData.append('category', props.category)
  formData.append('args', JSON.stringify(props.args))
  formData.append('file', file)
  // 执行上传。
  loading.value += 1
  try {
    await resolveResponse(uploadStream(formData))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.upload_succeeded'),
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
.file-node-edit-panel-container {
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

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
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
  width: 500px;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__label) {
  width: 240px;
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.editor-container {
  width: 100%;
  height: 100%;
}

.editor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inspect-notice {
  padding: 5px 10px;
  font-size: 14px;
  margin-bottom: 5px;
}
</style>
