<template>
  <div class="item-file-panel-container">
    <div class="placeholder" v-if="itemId === ''">请选择项目</div>
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
            <el-button class="item" type="success" @click="handleItemFileInfoSearch">
              刷新附件
            </el-button>
            <el-divider direction="vertical" />
            <el-select
              class="select"
              v-model="orderSelectorValue"
              @change="handleItemFileInfoSearch"
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
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="itemFileInfoTableCurrentPage"
            v-model:page-size="itemFileInfoTablePageSize"
            :item-count="itemFileInfoTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="itemFileInfoTableItems"
            :operate-column-width="134"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleItemFileInfoTablePagingAttributeChanged"
          >
            <template v-slot:default>
              <el-table-column label="图标" width="53px" :resizable="false">
                <template v-slot:default="{ row }">
                  <div class="icon-wrapper">
                    <component class="icon" :is="itemFileInfoTableFileIndicatorIcon(row)" />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="origin_name" label="文件名称" show-overflow-tooltip />
              <el-table-column
                prop="length"
                label="大小"
                width="95px"
                show-overflow-tooltip
                :formatter="itemFileInfoTableUnitFormatter"
              />
              <el-table-column
                prop="inspected_date"
                label="查看日期"
                width="180px"
                show-overflow-tooltip
                :formatter="itemFileInfoTableTimestampFormatter"
              />
              <el-table-column
                prop="modified_date"
                label="编辑日期"
                width="180px"
                show-overflow-tooltip
                :formatter="itemFileInfoTableTimestampFormatter"
              />
              <el-table-column
                prop="created_date"
                label="创建日期"
                width="180px"
                show-overflow-tooltip
                :formatter="itemFileInfoTableTimestampFormatter"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
            <template v-slot:operateColumn="{ row }">
              <el-button-group class="operate-column">
                <el-button
                  class="table-button"
                  type="success"
                  :icon="SearchIcon"
                  :disabled="!itemFileInfoTableFileRowInspectEnabled(row as ItemFileInfo)"
                  @click="handleFileInspect(row as ItemFileInfo)"
                />
                <el-button
                  class="table-button"
                  type="primary"
                  :icon="EditPen"
                  :disabled="!itemFileInfoTableFileRowEditEnabled(row as ItemFileInfo)"
                  @click="handleFileEdit(row as ItemFileInfo)"
                />
                <el-button
                  class="table-button"
                  type="success"
                  :icon="DownloadIcon"
                  @click="handleFileDownload(row as ItemFileInfo)"
                />
                <el-button
                  class="table-button"
                  type="danger"
                  :icon="DeleteIcon"
                  :disabled="!itemFileInfoTableFileRowDeleteEnabled"
                  @click="handleFileDelete(row as ItemFileInfo)"
                />
              </el-button-group>
            </template>
            <template v-slot:contextmenu="{ row, close }">
              <ul>
                <li
                  v-if="itemFileInfoTableFileRowInspectEnabled(row as ItemFileInfo)"
                  @click="handleFileInspectFloatyContextmenuClicked(row as ItemFileInfo, close)"
                >
                  弹窗查看...
                </li>
                <li
                  v-if="itemFileInfoTableFileRowEditEnabled(row as ItemFileInfo)"
                  @click="handleFileEditFloatyContextmenuClicked(row as ItemFileInfo, close)"
                >
                  弹窗编辑...
                </li>
                <el-divider
                  v-if="
                    itemFileInfoTableFileRowInspectEnabled(row as ItemFileInfo) ||
                    itemFileInfoTableFileRowEditEnabled(row as ItemFileInfo)
                  "
                />
                <li
                  v-if="itemFileInfoTableFileRowInspectEnabled(row as ItemFileInfo)"
                  @click="handleFileInspectContextmenuClicked(row as ItemFileInfo, close)"
                >
                  查看...
                </li>
                <li
                  v-if="itemFileInfoTableFileRowEditEnabled(row as ItemFileInfo)"
                  @click="handleFileEditContextmenuClicked(row as ItemFileInfo, close)"
                >
                  编辑...
                </li>
                <el-divider
                  v-if="
                    itemFileInfoTableFileRowInspectEnabled(row as ItemFileInfo) ||
                    itemFileInfoTableFileRowEditEnabled(row as ItemFileInfo)
                  "
                />
                <li @click="handleFileDownloadContextmenuClicked(row as ItemFileInfo, close)">
                  下载...
                </li>
                <li
                  v-if="itemFileInfoTableFileRowDeleteEnabled"
                  @click="handleFileDeleteContextmenuClicked(row as ItemFileInfo, close)"
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

import { type VNode } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import {
  Search as SearchIcon,
  EditPen,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@element-plus/icons-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'
import { useDisplayIconWithDefaults } from '@/composables/file'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import FileUploadDialog from '@/components/file/fileUploadDialog/FileUploadDialog.vue'
import FileCreateDialog from '@/components/file/fileCreateDialog/FileCreateDialog.vue'

import { type FileCreateInfo } from '@/components/file/fileCreateDialog/types.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import { type FileEditMode } from '@/views/nodes/miscellaneous/fileEditor/type.ts'

import { type ItemFileInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemFile.ts'
import {
  childForItem,
  childForItemCreatedDateAsc,
  childForItemInspectedDateDesc,
  childForItemModifiedDateDesc,
  childForItemOriginNameAsc,
  download,
  remove,
  upload,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemFile.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { parseFileExtension } from '@dwarfeng/familyhelper-ui-component-util/src/util/file.ts'

import { type EditInfo } from '@/util/file.ts'
import { getEditInfo } from '@/util/file.ts'

defineOptions({
  name: 'ItemFilePanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  itemId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onItemFileUpdated'): void
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

// -----------------------------------------------------------项目文件信息查询-----------------------------------------------------------
watch(
  () => props.itemId,
  () => {
    handleItemFileInfoSearch()
  },
)

function handleItemFileInfoSearch(): void {
  if (props.itemId === '') {
    return
  }
  switch (orderSelectorValue.value) {
    case 'default':
      handleItemFileInfoDefaultSearch()
      break
    case 'inspected_date_desc':
      handleItemFileInfoInspectedDateDescSearch()
      break
    case 'modified_date_desc':
      handleItemFileInfoModifiedDateDescSearch()
      break
    case 'origin_name_asc':
      handleItemFileInfoOriginNameAscSearch()
      break
    case 'created_date_asc':
      handleItemFileInfoCreatedDateAscSearch()
      break
    default:
      throw new Error('不应该执行到此处, 请联系开发人员')
  }
}

async function handleItemFileInfoDefaultSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForItem({ long_id: props.itemId }, pagingInfo),
      itemFileInfoTablePagingInfo.value,
    )
    updateItemFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleItemFileInfoInspectedDateDescSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForItemInspectedDateDesc({ long_id: props.itemId }, pagingInfo),
      itemFileInfoTablePagingInfo.value,
    )
    updateItemFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleItemFileInfoModifiedDateDescSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForItemModifiedDateDesc({ long_id: props.itemId }, pagingInfo),
      itemFileInfoTablePagingInfo.value,
    )
    updateItemFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleItemFileInfoOriginNameAscSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForItemOriginNameAsc({ long_id: props.itemId }, pagingInfo),
      itemFileInfoTablePagingInfo.value,
    )
    updateItemFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleItemFileInfoCreatedDateAscSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForItemCreatedDateAsc({ long_id: props.itemId }, pagingInfo),
      itemFileInfoTablePagingInfo.value,
    )
    updateItemFileInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleItemFileInfoSearch()
})

// -----------------------------------------------------------附件文件信息表格处理-----------------------------------------------------------
const {
  currentPage: itemFileInfoTableCurrentPage,
  pageSize: itemFileInfoTablePageSize,
  itemCount: itemFileInfoTableItemCount,
  items: itemFileInfoTableItems,
  pagingInfo: itemFileInfoTablePagingInfo,
  updateByLookup: updateItemFileInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<ItemFileInfo>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemFileInfoTableUnitFormatter(row: ItemFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatUnit((row as any)[column.property] as number, dataSizePreset)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemFileInfoTableTimestampFormatter(row: ItemFileInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function itemFileInfoTableFileIndicatorIcon(itemFileInfo: ItemFileInfo): VNode {
  const indicator: unknown = parseFileExtension(itemFileInfo.origin_name).toUpperCase()
  return useDisplayIconWithDefaults(indicator, { type: 'iconfont', content: '\uffe5' })
}

function itemFileInfoTableFileRowInspectEnabled(row: ItemFileInfo): boolean {
  const indicator: unknown = parseFileExtension(row.origin_name).toUpperCase()
  const editInfo: EditInfo | null = getEditInfo(indicator)
  if (!editInfo) {
    return false
  }
  if (!editInfo) {
    return false
  }
  return editInfo.actionLevel === 'INSPECT' || editInfo.actionLevel === 'EDIT'
}

function itemFileInfoTableFileRowEditEnabled(row: ItemFileInfo): boolean {
  const indicator: unknown = parseFileExtension(row.origin_name).toUpperCase()
  const editInfo: EditInfo | null = getEditInfo(indicator)
  if (!editInfo) {
    return false
  }
  return editInfo.actionLevel === 'EDIT' && !props.readonly
}

function itemFileInfoTableFileRowDeleteEnabled(): boolean {
  return !props.readonly
}

function handleItemFileInfoTablePagingAttributeChanged(): void {
  handleItemFileInfoSearch()
}

function handleFileInspect(row: ItemFileInfo): void {
  vim
    .ctx()
    .router()
    .vueRouter()
    .push({
      name: 'miscellaneous.fileEditor',
      query: {
        type: 'assets-item-file',
        id: row.key.long_id,
        action: 'inspect',
      },
    })
}

function handleFileInspectContextmenuClicked(row: ItemFileInfo, close: () => void): void {
  close()
  handleFileInspect(row)
}

function handleFileEdit(row: ItemFileInfo): void {
  vim
    .ctx()
    .router()
    .vueRouter()
    .push({
      name: 'miscellaneous.fileEditor',
      query: {
        type: 'assets-item-file',
        id: row.key.long_id,
        action: 'edit',
      },
    })
}

function handleFileEditContextmenuClicked(row: ItemFileInfo, close: () => void): void {
  close()
  handleFileEdit(row)
}

async function handleFileDownload(row: ItemFileInfo): Promise<void> {
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

function handleFileDownloadContextmenuClicked(row: ItemFileInfo, close: () => void): void {
  close()
  handleFileDownload(row)
}

async function handleFileDelete(row: ItemFileInfo): Promise<void> {
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
    handleItemFileInfoSearch()
  } finally {
    loading.value -= 1
  }
}

function handleFileDeleteContextmenuClicked(row: ItemFileInfo, close: () => void): void {
  close()
  handleFileDelete(row)
}

function handleFileInspectFloatyContextmenuClicked(row: ItemFileInfo, close: () => void): void {
  close()
  emit('onFileFloaty', row.key.long_id, row.origin_name, 'INSPECT')
}

function handleFileEditFloatyContextmenuClicked(row: ItemFileInfo, close: () => void): void {
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
      promises.push(resolveResponse(upload({ long_id: props.itemId }, formData)))
    })
    await Promise.all(promises)
    ElMessage({
      showClose: true,
      message: '文件上传成功',
      type: 'success',
      center: true,
    })
    handleItemFileInfoSearch()
    emit('onItemFileUpdated')
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
    await resolveResponse(upload({ long_id: props.itemId }, formData))
    ElMessage({
      showClose: true,
      message: '文件新建成功',
      type: 'success',
      center: true,
    })
    handleItemFileInfoSearch()
    emit('onItemFileUpdated')
    fileCreateDialogVisible.value = false
  } finally {
    fileCreateDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function itemFileInfoSearch(): void {
  handleItemFileInfoSearch()
}

defineExpose({
  itemFileInfoSearch,
})
</script>

<style scoped>
.item-file-panel-container {
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
  height: 32px;
  width: 32px;
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
