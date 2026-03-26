<template>
  <div class="file-list-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector class="file-selector" :multiple="false" @onFileSelected="handleUpload">
            <template v-slot:default="{ selectFile }">
              <el-button type="primary" :disabled="readonly" @click="selectFile"> 上传</el-button>
            </template>
          </file-selector>
          <el-button type="primary" :disabled="readonly" @click="fileCreateDialogVisible = true">
            新建
          </el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleInspect"> 刷新</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container">
          <title-layout-panel class="item list-container" title="文件列表">
            <table-panel
              class="table"
              v-model:current-page="itemTableCurrentPage"
              v-model:page-size="itemTablePageSize"
              pagination-adjust-strategy="FORCE_COMPACT"
              :item-count="itemTableItemCount"
              :page-sizes="[15, 20, 30, 50]"
              :items="itemTableItems"
              :operate-column-width="134"
              @onPagingAttributeChanged="handleItemTablePagingAttributeChanged"
              @onCurrentChanged="handleItemTableCurrentChanged"
            >
              <template v-slot:default>
                <el-table-column
                  prop="index"
                  label="索引"
                  width="53px"
                  align="right"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="origin_name"
                  label="文件名称"
                  show-overflow-tooltip
                  :formatter="itemTableOriginNameFormatter"
                />
                <el-table-column
                  prop="length"
                  label="文件大小"
                  width="95px"
                  show-overflow-tooltip
                  :formatter="itemTableUnitFormatter"
                />
              </template>
              <template v-slot:operateColumn="{ row }">
                <el-button-group class="operate-column">
                  <el-button
                    class="table-button"
                    type="success"
                    :icon="DownloadIcon"
                    :disabled="!itemTableRowDownloadEnabled(row as TableItem)"
                    @click="handleDownload(row as TableItem)"
                  />
                  <el-button
                    class="table-button"
                    type="primary"
                    :icon="UploadIcon"
                    :disabled="!itemTableRowUploadEnabled"
                    @click="handleClickFileSelector"
                  />
                  <el-button
                    class="table-button"
                    type="primary"
                    :icon="SortIcon"
                    :disabled="!itemTableRowChangeOrderEnabled"
                    @click="handleShowChangeOrderDialog(row as TableItem)"
                  />
                  <el-button
                    class="table-button"
                    type="danger"
                    :icon="DeleteIcon"
                    :disabled="!itemTableRowRemoveEnabled"
                    @click="handleRemove(row as TableItem)"
                  />
                </el-button-group>
              </template>
            </table-panel>
            <file-selector
              class="update-file-selector"
              ref="itemUpdateFileSelectorRef"
              :multiple="false"
              @onFileSelected="handleItemUpdateFileSelectorSelected"
            />
          </title-layout-panel>
          <el-divider direction="vertical" />
          <title-layout-panel class="item expand editor-container" title="文件编辑器">
            <div v-if="!itemTableCurrentRow" class="placeholder">请选择文件</div>
            <div v-else-if="itemTableCurrentRow.null_flag" class="placeholder">无文件</div>
            <div v-else-if="!canInspect" class="placeholder">文件不可展示</div>
            <div
              class="placeholder"
              v-else-if="!readonly && canEdit && isLargeFile && !userConfirmedLargeFile"
            >
              文件大小超过 5MB，编辑操作可能影响性能
              <br />
              如需继续编辑，请点击下方链接
              <br />
              <el-link type="primary" @click="handleConfirmLargeFile"> 点击此处编辑 </el-link>
            </div>
            <div
              class="placeholder"
              v-else-if="!readonly && isLargeFile && !userConfirmedLargeFile"
            >
              该文件不可编辑，只可查看
              <br />
              文件大小超过 5MB，查看操作可能影响性能
              <br />
              如需继续查看，请点击下方链接
              <br />
              <el-link type="primary" @click="handleConfirmLargeFile"> 点击此处查看 </el-link>
            </div>
            <div class="placeholder" v-else-if="isLargeFile && !userConfirmedLargeFile">
              文件大小超过 5MB，查看操作可能影响性能
              <br />
              如需继续查看，请点击下方链接
              <br />
              <el-link type="primary" @click="handleConfirmLargeFile">点击此处查看 </el-link>
            </div>
            <div class="editor-wrapper" v-else-if="shouldShowEditor">
              <el-tag
                class="inspect-notice"
                v-if="!readonly && fileEditInfo?.actionLevel === 'INSPECT' && !inspectNoticeClosed"
                type="info"
                closable
                disable-transitions
                @close="inspectNoticeClosed = true"
              >
                该文件不可编辑，只可查看
              </el-tag>
              <file-edit-panel
                type="SETTINGREPO_FILE_LIST_NODE"
                :id="editorId"
                :mode="editorMode"
                @onFileCommitted="handleFileCommitted"
              />
            </div>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="changeOrderDialogVisible"
      label-width="55px"
      edit-title="变更顺序"
      edit-confirm-button-label="确认"
      edit-cancel-button-label="取消"
      :mode="changeOrderDialogMode"
      :item="changeOrderDialogItem"
      :edit-rules="changeOrderDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handleChangeOrder"
    >
      <el-form-item label="旧索引" prop="index">
        <el-input v-model="changeOrderDialogItem.index" readonly />
      </el-form-item>
      <el-form-item label="新索引" prop="neo_index">
        <el-input-number v-model="changeOrderDialogItem.neo_index" :min="0" />
      </el-form-item>
    </maintain-dialog>
    <file-create-dialog
      v-model:visible="fileCreateDialogVisible"
      title="新建文件"
      :loading="fileCreateDialogLoading"
      @onConfirmed="handleFileCreateDialogConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
  Upload as UploadIcon,
} from '@element-plus/icons-vue'

import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/common/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import FileSelector from '@/components/elementPlus/file/fileSelector/FileSelector.vue'
import FileEditPanel from '@/views/nodes/elementPlus/miscellaneous/fileEditor/FileEditPanel.vue'
import FileCreateDialog from '@/components/elementPlus/file/fileCreateDialog/FileCreateDialog.vue'

import { type FileCreateInfo } from '@/components/elementPlus/file/fileCreateDialog/types.ts'

import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useEditOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type FileListNodeInspectResultItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/fileListNode.ts'
import {
  operateInspect,
  uploadStream,
  requestFileStreamVoucher,
  updateStream,
  size,
  changeOrder,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/fileListNode.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { parseFileExtension } from '@dwarfeng/familyhelper-ui-component-util/src/util/file.ts'

import { type EditInfo } from '@/util/file.ts'
import { getEditInfo } from '@/util/file.ts'

import { Base64 } from 'js-base64'

defineOptions({
  name: 'FileListNodeSubEditPanel',
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

// region 头部面板

function handleClickFileSelector(): void {
  const itemUpdateFileSelector = itemUpdateFileSelectorRef.value
  if (!itemUpdateFileSelector) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  itemUpdateFileSelector.selectFile()
}

// endregion

// region 文件选择器

function handleItemUpdateFileSelectorSelected(files: File[]): void {
  if (!itemTableCurrentRow.value) {
    return
  }
  handleUpdate(itemTableCurrentRow.value, files[0])
}

// endregion

// region 文件列表条目表格

type TableItem = FileListNodeInspectResultItem & { index: number }

const {
  currentPage: itemTableCurrentPage,
  pageSize: itemTablePageSize,
  items: itemTableItems,
  itemCount: itemTableItemCount,
  updateByLookup: updateItemTableByLookup,
  refreshPaging: refreshItemTablePaging,
} = useIdentityFrontendPagingTablePanel<TableItem>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemTableOriginNameFormatter(row: TableItem, column: any): string {
  // noinspection JSUnresolvedReference
  if (row.null_flag) {
    return '（无文件）'
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[column.property] as string
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemTableUnitFormatter(row: TableItem, column: any): string {
  // noinspection JSUnresolvedReference
  if (row.null_flag) {
    return '（无文件）'
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatUnit((row as any)[column.property] as number, dataSizePreset)
}

const itemTableCurrentRow = ref<TableItem | null>(null)

watch(itemTableCurrentRow, () => {
  userConfirmedLargeFile.value = false
  inspectNoticeClosed.value = false
})

function itemTableRowDownloadEnabled(row: TableItem): boolean {
  return !row.null_flag
}

function itemTableRowUploadEnabled(): boolean {
  return !props.readonly
}

function itemTableRowChangeOrderEnabled(): boolean {
  return !props.readonly
}

function itemTableRowRemoveEnabled(): boolean {
  return !props.readonly
}

function handleItemTablePagingAttributeChanged(): void {
  refreshItemTablePaging()
}

function handleItemTableCurrentChanged(current: TableItem | null): void {
  itemTableCurrentRow.value = current
}

function handleShowChangeOrderDialog(row: TableItem): void {
  showChangeOrderDialog(row)
}

// endregion

// region 文件列表条目调整顺序维护对话框

type ChangeOrderDialogItem = {
  index: number
  neo_index: number
}

const {
  visible: changeOrderDialogVisible,
  item: changeOrderDialogItem,
  mode: changeOrderDialogMode,
  showDialog: showChangeOrderDialog,
} = useEditOnlyMaintainDialog<TableItem, ChangeOrderDialogItem>(changeOrderDialogItemMap, {
  index: 0,
  neo_index: 0,
})

const changeOrderDialogNeoIndexValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res < 0) {
        callback(new Error('新索引不能小于 0'))
        return Promise.reject()
      }
      if (!props.category || !props.args) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      return resolveResponse(
        size({
          category: props.category,
          args: props.args,
        }),
      )
    })
    .then((res) => {
      if (!res) {
        throw new Error('不应该执行到此处，请联系开发人员')
      }
      if (res.size <= 0) {
        callback(new Error('没有可变更的索引'))
        return Promise.reject()
      }
      if (value > res.size - 1) {
        callback(new Error('新索引不能大于等于当前索引总数'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const changeOrderDialogRules = ref({
  neo_index: [{ validator: changeOrderDialogNeoIndexValidator, trigger: 'blur' }],
})

function changeOrderDialogItemMap(t: TableItem): ChangeOrderDialogItem {
  return {
    index: t.index,
    neo_index: t.index,
  }
}

const itemUpdateFileSelectorRef = useTemplateRef<InstanceType<typeof FileSelector>>(
  'itemUpdateFileSelectorRef',
)

// endregion

// region 文件创建对话框

const fileCreateDialogVisible = ref<boolean>(false)
const fileCreateDialogLoading = ref<number>(0)

async function handleFileCreateDialogConfirmed(file: FileCreateInfo): Promise<void> {
  if (props.category === null || props.args === null) {
    throw new Error('不应该执行到此处, 请联系开发人员')
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
      message: '文件新建成功',
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

// region 文件编辑器

const userConfirmedLargeFile = ref<boolean>(false)
const inspectNoticeClosed = ref<boolean>(false)

const fileExtension = computed<string>(() => {
  if (!itemTableCurrentRow.value || itemTableCurrentRow.value.null_flag) {
    return ''
  }
  return parseFileExtension(itemTableCurrentRow.value.origin_name).toUpperCase()
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
  if (!itemTableCurrentRow.value || itemTableCurrentRow.value.null_flag) {
    return false
  }
  return itemTableCurrentRow.value.length >= 5 * 1024 * 1024
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
  if (!props.category || !props.args || !itemTableCurrentRow.value) {
    return ''
  }
  const idData = {
    category: props.category,
    args: props.args,
    index: itemTableCurrentRow.value.index,
  }
  return Base64.encode(JSON.stringify(idData))
})

function handleConfirmLargeFile(): void {
  userConfirmedLargeFile.value = true
}

async function handleFileCommitted(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const indexToUpdate: number | null = itemTableCurrentRow.value?.index ?? null
    if (!indexToUpdate) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const res = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!res) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    // 基于文件编辑器的提交只可能影响文件的长度，因此这里只更新长度字段。
    itemTableItems.value[indexToUpdate].length = res.items[indexToUpdate].length
  } finally {
    loading.value -= 1
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
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const res = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!res) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    updateItemTableByLookup(res.items.map((item, index) => ({ ...item, index })))
  } finally {
    loading.value -= 1
  }
}

async function handleUpload(files: File[]): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  // 构造表单数据。
  const file: File = files[0]
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
      message: '上传成功',
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

async function handleDownload(row: TableItem): Promise<void> {
  if (row.null_flag) {
    return
  }
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const voucherKey = await resolveResponse(
      requestFileStreamVoucher({
        category: props.category,
        args: props.args,
        index: row.index,
      }),
    )
    if (!voucherKey) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    ElMessage({
      showClose: true,
      message: '后台正在准备文件，文件越大，准备时间越长，请耐心等待...',
      type: 'success',
      duration: 10000,
    })
    // 构造下载地址。
    let url = `${vim.ctx().api().baseUrl()}`
    if (!url.endsWith('/')) {
      url += '/'
    }
    url += `settingrepo/file-list-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`
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

async function handleUpdate(row: TableItem, file: File): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  // 构造表单数据。
  const formData = new FormData()
  formData.append('category', props.category)
  formData.append('args', JSON.stringify(props.args))
  formData.append('file', file)
  formData.append('index', `${row.index}`)
  // 执行更新。
  loading.value += 1
  try {
    await resolveResponse(updateStream(formData))
    ElMessage({
      showClose: true,
      message: '更新成功',
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

async function handleChangeOrder(): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    await resolveResponse(
      changeOrder({
        category: props.category,
        args: props.args,
        old_index: changeOrderDialogItem.value.index,
        neo_index: changeOrderDialogItem.value.neo_index,
      }),
    )
    ElMessage({
      showClose: true,
      message: '变更顺序成功',
      type: 'success',
    })
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
    changeOrderDialogVisible.value = false
  } finally {
    loading.value -= 1
  }
}

async function handleRemove(row: TableItem): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此文件项。<br>是否继续?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      remove({
        category: props.category,
        args: props.args,
        index: row.index,
      }),
    )
    ElMessage({
      showClose: true,
      message: '文件项删除成功',
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
.file-list-node-edit-panel-container {
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

.main-container .table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.main-container .update-file-selector {
  display: none;
}

.list-container {
  width: 500px;
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

.inspect-notice {
  padding: 5px 10px;
  font-size: 14px;
  margin-bottom: 5px;
}
</style>
