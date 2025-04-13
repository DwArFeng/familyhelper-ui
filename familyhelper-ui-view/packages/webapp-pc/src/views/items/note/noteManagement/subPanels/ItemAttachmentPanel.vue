<template>
  <div class="item-attachment-panel-container">
    <div class="placeholder" v-if="noteItemId === ''">请选择项目</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="fileUploadDialogVisible = true"
            >
              上传附件
            </el-button>
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="fileCreateDialogVisible = true"
            >
              新建附件
            </el-button>
            <el-button class="item" type="success" @click="handleAttachmentFileInfoSearch">
              刷新附件
            </el-button>
            <el-divider direction="vertical" />
            <el-select
              class="select"
              v-model="orderSelectorValue"
              @change="handleAttachmentFileInfoSearch"
            >
              <el-option
                v-for="item in orderSelectorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div v-if="mode === 'DEFAULT'" style="flex-grow: 1" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="attachmentFileInfoTableCurrentPage"
            v-model:page-size="attachmentFileInfoTablePageSize"
            :item-count="attachmentFileInfoTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="attachmentFileInfoTableItems"
            :operate-column-width="134"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleAttachmentFileInfoTablePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column label="图标" width="53px" :resizable="false">
                <template v-slot:default="{ row }">
                  <div class="icon-wrapper">
                    <i class="iconfont icon">{{ attachmentFileInfoTableFileIndicatorIcon(row) }}</i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="origin_name" label="文件名称" show-overflow-tooltip />
              <el-table-column
                prop="length"
                label="大小"
                width="95px"
                show-overflow-tooltip
                :formatter="attachmentFileInfoTableUnitFormatter"
              />
              <el-table-column
                prop="inspected_date"
                label="查看日期"
                width="180px"
                show-overflow-tooltip
                :formatter="attachmentFileInfoTableTimestampFormatter"
              />
              <el-table-column
                prop="modified_date"
                label="编辑日期"
                width="180px"
                show-overflow-tooltip
                :formatter="attachmentFileInfoTableTimestampFormatter"
              />
              <el-table-column
                prop="created_date"
                label="创建日期"
                width="180px"
                show-overflow-tooltip
                :formatter="attachmentFileInfoTableTimestampFormatter"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
            <template v-slot:operateColumn="{ row }">
              <el-button-group class="operate-column">
                <el-button
                  class="table-button"
                  type="success"
                  :icon="SearchIcon"
                  :disabled="
                    !attachmentFileInfoTableFileRowInspectEnabled(row as AttachmentFileInfo)
                  "
                  @click="handleFileInspect(row as AttachmentFileInfo)"
                />
                <el-button
                  class="table-button"
                  type="primary"
                  :icon="EditPen"
                  :disabled="!attachmentFileInfoTableFileRowEditEnabled(row as AttachmentFileInfo)"
                  @click="handleFileEdit(row as AttachmentFileInfo)"
                />
                <el-button
                  class="table-button"
                  type="success"
                  :icon="DownloadIcon"
                  @click="handleFileDownload(row as AttachmentFileInfo)"
                />
                <el-button
                  class="table-button"
                  type="danger"
                  :icon="DeleteIcon"
                  :disabled="!attachmentFileInfoTableFileRowDeleteEnabled"
                  @click="handleFileDelete(row as AttachmentFileInfo)"
                />
              </el-button-group>
            </template>
            <template v-slot:contextmenu="{ row, close }">
              <ul>
                <li
                  v-if="attachmentFileInfoTableFileRowInspectEnabled(row as AttachmentFileInfo)"
                  @click="
                    handleFileInspectFloatyContextmenuClicked(row as AttachmentFileInfo, close)
                  "
                >
                  弹窗查看...
                </li>
                <li
                  v-if="attachmentFileInfoTableFileRowEditEnabled(row as AttachmentFileInfo)"
                  @click="handleFileEditFloatyContextmenuClicked(row as AttachmentFileInfo, close)"
                >
                  弹窗编辑...
                </li>
                <el-divider
                  v-if="
                    attachmentFileInfoTableFileRowInspectEnabled(row as AttachmentFileInfo) ||
                    attachmentFileInfoTableFileRowEditEnabled(row as AttachmentFileInfo)
                  "
                />
                <li
                  v-if="attachmentFileInfoTableFileRowInspectEnabled(row as AttachmentFileInfo)"
                  @click="handleFileInspectContextmenuClicked(row as AttachmentFileInfo, close)"
                >
                  查看...
                </li>
                <li
                  v-if="attachmentFileInfoTableFileRowEditEnabled(row as AttachmentFileInfo)"
                  @click="handleFileEditContextmenuClicked(row as AttachmentFileInfo, close)"
                >
                  编辑...
                </li>
                <el-divider
                  v-if="
                    attachmentFileInfoTableFileRowInspectEnabled(row as AttachmentFileInfo) ||
                    attachmentFileInfoTableFileRowEditEnabled(row as AttachmentFileInfo)
                  "
                />
                <li @click="handleFileDownloadContextmenuClicked(row as AttachmentFileInfo, close)">
                  下载...
                </li>
                <li
                  v-if="attachmentFileInfoTableFileRowDeleteEnabled"
                  @click="handleFileDeleteContextmenuClicked(row as AttachmentFileInfo, close)"
                >
                  删除...
                </li>
              </ul>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <file-upload-dialog
      v-model:visible="fileUploadDialogVisible"
      title="上传文件"
      :loading="fileUploadDialogLoading"
      @onConfirmed="handleFileUploadDialogConfirmed"
    />
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

import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import {
  Search as SearchIcon,
  EditPen,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@element-plus/icons-vue'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import FileUploadDialog from '@/components/file/fileUploadDialog/FileUploadDialog.vue'
import FileCreateDialog from '@/components/file/fileCreateDialog/FileCreateDialog.vue'

import type { FileCreateInfo } from '@/components/file/fileCreateDialog/types.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import type { FileEditMode } from '@/views/items/miscellaneous/fileEditor/type.ts'

import type { ExtensionInfo } from './extensionInfos.ts'
import { extensionInfo } from './extensionInfos.ts'

import type { AttachmentFileInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile.ts'
import {
  childForNoteItem,
  childForNoteItemCreatedDateAsc,
  childForNoteItemInspectedDateDesc,
  childForNoteItemModifiedDateDesc,
  childForNoteItemOriginNameAsc,
  download,
  remove,
  upload,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/attachmentFile.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { parseFileExtension } from '@dwarfeng/familyhelper-ui-component-util/src/util/file.ts'

defineOptions({
  name: 'ItemAttachmentPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  noteItemId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onAttachmentUpdated'): void
  (e: 'onFileFloaty', id: string, name: string, mode: FileEditMode): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
type OrderSelectorValue =
  | 'default'
  | 'inspected_date_desc'
  | 'modified_date_desc'
  | 'origin_name_asc'
  | 'created_date_asc'

const orderSelectorValue = ref<OrderSelectorValue>('default')

const orderSelectorOptions = computed<{ value: OrderSelectorValue; label: string }[]>(() => {
  return [
    { value: 'default', label: '默认' },
    { value: 'inspected_date_desc', label: '最近浏览' },
    { value: 'modified_date_desc', label: '最近编辑' },
    { value: 'origin_name_asc', label: '文件名称' },
    { value: 'created_date_asc', label: '创建时间' },
  ]
})

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// -----------------------------------------------------------附件文件信息查询-----------------------------------------------------------
watch(
  () => props.noteItemId,
  () => {
    handleAttachmentFileInfoSearch()
  },
)

function handleAttachmentFileInfoSearch(): void {
  if (props.noteItemId === '') {
    return
  }
  switch (orderSelectorValue.value) {
    case 'default':
      handleAttachmentFileInfoDefaultSearch()
      break
    case 'inspected_date_desc':
      handleAttachmentFileInfoInspectedDateDescSearch()
      break
    case 'modified_date_desc':
      handleAttachmentFileInfoModifiedDateDescSearch()
      break
    case 'origin_name_asc':
      handleAttachmentFileInfoOriginNameAscSearch()
      break
    case 'created_date_asc':
      handleAttachmentFileInfoCreatedDateAscSearch()
      break
    default:
      throw new Error('不应该执行到此处, 请联系开发人员')
  }
}

async function handleAttachmentFileInfoDefaultSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForNoteItem({ long_id: props.noteItemId }, pagingInfo),
      attachmentFileInfoTablePagingInfo.value,
    )
    updateAttachmentFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleAttachmentFileInfoInspectedDateDescSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForNoteItemInspectedDateDesc({ long_id: props.noteItemId }, pagingInfo),
      attachmentFileInfoTablePagingInfo.value,
    )
    updateAttachmentFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleAttachmentFileInfoModifiedDateDescSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForNoteItemModifiedDateDesc({ long_id: props.noteItemId }, pagingInfo),
      attachmentFileInfoTablePagingInfo.value,
    )
    updateAttachmentFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleAttachmentFileInfoOriginNameAscSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForNoteItemOriginNameAsc({ long_id: props.noteItemId }, pagingInfo),
      attachmentFileInfoTablePagingInfo.value,
    )
    updateAttachmentFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleAttachmentFileInfoCreatedDateAscSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForNoteItemCreatedDateAsc({ long_id: props.noteItemId }, pagingInfo),
      attachmentFileInfoTablePagingInfo.value,
    )
    updateAttachmentFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleAttachmentFileInfoSearch()
})

// -----------------------------------------------------------附件文件信息表格处理-----------------------------------------------------------
const {
  currentPage: attachmentFileInfoTableCurrentPage,
  pageSize: attachmentFileInfoTablePageSize,
  itemCount: attachmentFileInfoTableItemCount,
  items: attachmentFileInfoTableItems,
  pagingInfo: attachmentFileInfoTablePagingInfo,
  updateByLookup: updateAttachmentFileInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<AttachmentFileInfo>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function attachmentFileInfoTableUnitFormatter(row: AttachmentFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatUnit((row as any)[column.property] as number, dataSizePreset)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function attachmentFileInfoTableTimestampFormatter(row: AttachmentFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function attachmentFileInfoTableFileIndicatorIcon(
  attachmentFileInfo: AttachmentFileInfo,
): '\uffe3' | '\uffe4' | '\uffe5' {
  const _extension: string = parseFileExtension(attachmentFileInfo.origin_name)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return '\uffe5'
  }
  if (_extensionInfo.actionLevel === 'INSPECT') {
    return '\uffe3'
  }
  return '\uffe4'
}

function attachmentFileInfoTableFileRowInspectEnabled(row: AttachmentFileInfo): boolean {
  const _extension: string = parseFileExtension(row.origin_name)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return false
  }
  return _extensionInfo.actionLevel === 'INSPECT' || _extensionInfo.actionLevel === 'EDIT'
}

function attachmentFileInfoTableFileRowEditEnabled(row: AttachmentFileInfo): boolean {
  const _extension: string = parseFileExtension(row.origin_name)
  const _extensionInfo: ExtensionInfo | null = extensionInfo(_extension)
  if (!_extensionInfo) {
    return false
  }
  return _extensionInfo.actionLevel === 'EDIT' && !props.readonly
}

function attachmentFileInfoTableFileRowDeleteEnabled(): boolean {
  return !props.readonly
}

function handleAttachmentFileInfoTablePagingAttributeChanged(): void {
  handleAttachmentFileInfoSearch()
}

function handleFileInspect(row: AttachmentFileInfo): void {
  vim
    .ctx()
    .router()
    .vueRouter()
    .push({
      name: 'miscellaneous.fileEditor',
      query: {
        type: 'note-attachment-file',
        id: row.key.long_id,
        action: 'inspect',
      },
    })
}

function handleFileInspectContextmenuClicked(row: AttachmentFileInfo, close: () => void): void {
  close()
  handleFileInspect(row)
}

function handleFileEdit(row: AttachmentFileInfo): void {
  vim
    .ctx()
    .router()
    .vueRouter()
    .push({
      name: 'miscellaneous.fileEditor',
      query: {
        type: 'note-attachment-file',
        id: row.key.long_id,
        action: 'edit',
      },
    })
}

function handleFileEditContextmenuClicked(row: AttachmentFileInfo, close: () => void): void {
  close()
  handleFileEdit(row)
}

async function handleFileDownload(row: AttachmentFileInfo): Promise<void> {
  loading.value += 1
  try {
    const blob: Blob = await download(row.key)
    const fileName: string = row.origin_name
    const link: HTMLAnchorElement = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(link.href)
  } finally {
    loading.value -= 1
  }
}

function handleFileDownloadContextmenuClicked(row: AttachmentFileInfo, close: () => void): void {
  close()
  handleFileDownload(row)
}

async function handleFileDelete(row: AttachmentFileInfo): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此项目文件。<br>' + '该操作不可恢复！<br>' + '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove(row.key))
    ElMessage({
      showClose: true,
      message: `项目文件 ${row.origin_name} 删除成功`,
      type: 'success',
      center: true,
    })
    handleAttachmentFileInfoSearch()
  } finally {
    loading.value -= 1
  }
}

function handleFileDeleteContextmenuClicked(row: AttachmentFileInfo, close: () => void): void {
  close()
  handleFileDelete(row)
}

function handleFileInspectFloatyContextmenuClicked(
  row: AttachmentFileInfo,
  close: () => void,
): void {
  close()
  emit('onFileFloaty', row.key.long_id, row.origin_name, 'INSPECT')
}

function handleFileEditFloatyContextmenuClicked(row: AttachmentFileInfo, close: () => void): void {
  close()
  emit('onFileFloaty', row.key.long_id, row.origin_name, 'EDIT')
}

// -----------------------------------------------------------文件上传对话框处理-----------------------------------------------------------
const fileUploadDialogVisible = ref<boolean>(false)
const fileUploadDialogLoading = ref<number>(0)

async function handleFileUploadDialogConfirmed(files: File[]): Promise<void> {
  fileUploadDialogLoading.value += 1
  try {
    const promises: Promise<unknown>[] = []
    files.forEach((file: File) => {
      const formData: FormData = new FormData()
      formData.append('file', file, file.name)
      promises.push(resolveResponse(upload({ long_id: props.noteItemId }, formData)))
    })
    await Promise.all(promises)
    ElMessage({
      showClose: true,
      message: '文件上传成功',
      type: 'success',
      center: true,
    })
    handleAttachmentFileInfoSearch()
    emit('onAttachmentUpdated')
    fileUploadDialogVisible.value = false
  } finally {
    fileUploadDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------文件创建对话框处理-----------------------------------------------------------
const fileCreateDialogVisible = ref<boolean>(false)
const fileCreateDialogLoading = ref<number>(0)

async function handleFileCreateDialogConfirmed(file: FileCreateInfo): Promise<void> {
  fileCreateDialogLoading.value += 1
  try {
    const formData: FormData = new FormData()
    formData.append('file', file.blob, file.name)
    await resolveResponse(upload({ long_id: props.noteItemId }, formData))
    ElMessage({
      showClose: true,
      message: '文件新建成功',
      type: 'success',
      center: true,
    })
    handleAttachmentFileInfoSearch()
    emit('onAttachmentUpdated')
    fileCreateDialogVisible.value = false
  } finally {
    fileCreateDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function attachmentFileInfoSearch(): void {
  handleAttachmentFileInfoSearch()
}

defineExpose({
  attachmentFileInfoSearch,
})
</script>

<style scoped>
.item-attachment-panel-container {
  height: 100%;
  width: 100%;
  background: #ffffff;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .select {
  width: 110px;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

.table .icon-wrapper {
  height: 32px;
  line-height: 32px;
}

.table .icon {
  font-size: 32px;
  user-select: none;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu) .el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
