<template>
  <div class="item-record-panel-container">
    <header-layout-panel class="record-panel block">
      <template v-slot:header>
        <div class="header">
          <el-button type="primary" :disabled="readOnly" @click="handleShowRecordCreateDialog">
            新建记录
          </el-button>
          <el-button type="success" @click="handleSearchRecord">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-panel"
          v-loading="recordTableLoading"
          highlight-current-row
          v-model:current-page="recordTableCurrentPage"
          v-model:page-size="recordTablePageSize"
          :item-count="recordTableItemCount"
          :page-sizes="[10, 15, 20, 50]"
          :items="recordTableItems"
          v-model:selection="recordTableSelection"
          @onPagingAttributeChanged="handleRecordPagingAttributeChanged"
          @onCurrentChanged="handleRecordTableCurrentChanged"
        >
          <el-table-column
            prop="recorded_date"
            label="记录日期"
            show-overflow-tooltip
            :formatter="fileTableTimestampFormatter"
          />
          <el-table-column prop="value" label="记录值" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <template v-slot:operateColumn="{ index, row }">
            <el-button-group class="operate-column">
              <el-button
                class="table-button"
                size="small"
                :icon="SearchIcon"
                type="success"
                @click="handleShowRecordInspectDialog(index, row as PbRecord)"
              />
              <el-button
                class="table-button"
                size="small"
                :icon="EditPen"
                type="primary"
                :disabled="readOnly"
                @click="handleShowRecordEditDialog(index, row as PbRecord)"
              />
              <el-button
                class="table-button"
                size="small"
                :icon="DeleteIcon"
                type="danger"
                :disabled="readOnly"
                @click="handleRecordDelete(index, row as PbRecord)"
              />
            </el-button-group>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <header-layout-panel class="file-panel block">
      <template v-slot:header>
        <div class="header">
          <el-button
            type="primary"
            :disabled="readOnly || recordTableSelection === null"
            @click="fileUploadDialogVisible = true"
          >
            上传图片
          </el-button>
          <el-button type="success" @click="handleSearchFile">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-panel"
          v-loading="fileTableLoading"
          v-model:current-page="fileTableCurrentPage"
          v-model:page-size="fileTablePageSize"
          :item-count="fileTableItemCount"
          :page-sizes="[5, 10, 15, 20]"
          :items="fileTableItems"
          :operate-column-width="80"
          @onPagingAttributeChanged="handleFilePagingAttributeChanged"
        >
          <el-table-column label="内容" width="141px" :resizable="false">
            <template v-slot:default="{ row }">
              <div class="image-wrapper">
                <el-image
                  class="image"
                  fit="cover"
                  preview-teleported
                  :src="(row as FileTableItem).url"
                  :preview-src-list="[(row as FileTableItem).url]"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="length"
            label="大小"
            width="95px"
            show-overflow-tooltip
            :formatter="fileTableUnitFormatter"
          />
          <el-table-column
            prop="uploaded_date"
            label="上传日期"
            width="180px"
            show-overflow-tooltip
            :formatter="fileTableTimestampFormatter"
          />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <template v-slot:operateColumn="{ index, row }">
            <el-button-group class="operate-column">
              <el-button
                class="table-button"
                size="small"
                :icon="DownloadIcon"
                type="success"
                @click="handleFileDownload(row as FileTableItem)"
              />
              <el-button
                class="table-button"
                size="small"
                :icon="DeleteIcon"
                type="danger"
                :disabled="readOnly"
                @click="handleFileDelete(index, row as FileTableItem)"
              />
            </el-button-group>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="recordMaintainDialogVisible"
      label-width="100px"
      inspect-title="查看记录"
      create-title="创建记录"
      edit-title="编辑记录"
      :loading="recordMaintainDialogLoading"
      :mode="recordMaintainDialogMode"
      :item="recordMaintainDialogItem"
      :create-rules="recordMaintainDialogRules"
      :edit-rules="recordMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleRecordCreate"
      @onItemEdit="handleRecordEdit"
    >
      <el-form-item label="值" prop="value">
        <el-input
          v-model="recordMaintainDialogItem.value"
          placeholder="请填写当前值"
          :readonly="recordMaintainDialogMode === 'INSPECT'"
          @input="handleValueInput"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="recordMaintainDialogItem.remark"
          :readonly="recordMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <image-select-crop-dialog
      title="上传图片"
      v-model:visible="fileUploadDialogVisible"
      :loading="fileUploadDialogLoading"
      :output-size="0.95"
      :cropper-height="400"
      :cropper-width="680"
      :crop-box-height="360"
      :crop-box-width="640"
      :enlarge="3"
      @onConfirmed="handleFileUploadConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  EditPen,
  Search as SearchIcon,
} from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import ImageSelectCropDialog from '@/components/image/imageSelectCropDialog/ImageSelectCropDialog.vue'

import { type ImageSelectCropInfo } from '@/components/image/imageSelectCropDialog/types.ts'
import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import {
  childForPbItemRecordedDateDesc as lookupRecord,
  createPbRecord as createRecord,
  type PbRecord,
  removePbRecord as removeRecord,
  updatePbRecord as updateRecord,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbRecord.ts'
import {
  childForPbRecordUploadedDateAsc as lookupFile,
  downloadPbFile as downloadFile,
  type PbFileInfo,
  removePbFile as removeFile,
  uploadPbFile as uploadFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbFile.ts'
import { resolveResponse } from '@/util/response.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'ItemRecordPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  itemId: string
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onContextChanged'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------记录查询-----------------------------------------------------------
watch(
  () => props.itemId,
  () => {
    handleSearchRecord()
  },
)

function handleSearchRecord(): void {
  if (props.itemId === '') {
    return
  }
  inspectRecord()
}

async function inspectRecord(): Promise<void> {
  recordTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => lookupRecord({ long_id: props.itemId }, pagingInfo),
      recordTablePagingInfo.value,
    )
    updateRecordTableByLookup(res)
  } finally {
    recordTableLoading.value -= 1
  }
}

function handleRecordPagingAttributeChanged(): void {
  handleSearchRecord()
}

function handleRecordTableCurrentChanged(item: PbRecord | null): void {
  recordTableSelection.value = item
}

onMounted(() => {
  handleSearchRecord()
})

// -----------------------------------------------------------文件查询-----------------------------------------------------------
watch(
  () => recordTableSelection.value,
  () => {
    handleSearchFile()
  },
)

function handleSearchFile(): void {
  revokeFileTableDataUrl()
  if (recordTableSelection.value === null) {
    return
  }
  inspectFile()
}

async function inspectFile(): Promise<void> {
  if (recordTableSelection.value === null) {
    return
  }
  fileTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => lookupFile(recordTableSelection.value!.key, pagingInfo),
      recordTablePagingInfo.value,
    )
    const promises: Promise<FileTableItem>[] = []
    res.data.forEach((pbFileInfo) => {
      promises.push(
        downloadFile(pbFileInfo.key).then((blob) => {
          const neoPbFileInfo: FileTableItem = {
            ...pbFileInfo,
            url: window.URL.createObjectURL(blob ?? new Blob()),
          }
          return Promise.resolve(neoPbFileInfo)
        }),
      )
    })
    const fileTableItemsWithUrl = await Promise.all(promises)
    updateFileTableByLookup({
      ...res,
      data: fileTableItemsWithUrl,
    })
  } finally {
    fileTableLoading.value -= 1
  }
}

// -----------------------------------------------------------记录表格处理-----------------------------------------------------------
const recordTableLoading = ref<number>(0)

const {
  currentPage: recordTableCurrentPage,
  pageSize: recordTablePageSize,
  itemCount: recordTableItemCount,
  items: recordTableItems,
  pagingInfo: recordTablePagingInfo,
  updateByLookup: updateRecordTableByLookup,
} = useIdentityBackendPagingTablePanel<PbRecord>(10)

const recordTableSelection = ref<PbRecord | null>(null)

function handleFilePagingAttributeChanged(): void {
  handleSearchFile()
}

function handleShowRecordCreateDialog(): void {
  showRecordCreateDialog()
}

function handleShowRecordInspectDialog(_index: number, entity: PbRecord): void {
  showRecordInspectDialog(entity)
}

function handleShowRecordEditDialog(_index: number, entity: PbRecord): void {
  showRecordEditDialog(entity)
}

async function handleRecordDelete(_index: number, entity: PbRecord): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此条记录，与记录关联的图片也会一并删除。<br>是否继续?',
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
  try {
    await resolveResponse(removeRecord(entity.key))
    ElMessage({
      showClose: true,
      message: '记录删除成功',
      type: 'success',
    })
    handleSearchRecord()
    emit('onContextChanged')
  } catch {
    // 忽略错误
  }
}

// -----------------------------------------------------------文件表格处理-----------------------------------------------------------
type FileTableItem = PbFileInfo & {
  url: string
}

const fileTableLoading = ref<number>(0)

const {
  currentPage: fileTableCurrentPage,
  pageSize: fileTablePageSize,
  itemCount: fileTableItemCount,
  items: fileTableItems,
  updateByLookup: updateFileTableByLookup,
} = useIdentityBackendPagingTablePanel<FileTableItem>(5)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fileTableTimestampFormatter(row: FileTableItem, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property])
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fileTableUnitFormatter(row: FileTableItem, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatUnit((row as any)[column.property], dataSizePreset)
}

async function handleFileDownload(fileInfo: FileTableItem): Promise<void> {
  try {
    const blob = await downloadFile(fileInfo.key)
    if (!blob) {
      return
    }
    const fileName = fileInfo.origin_name
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(link.href)
  } catch {
    // 忽略错误
  }
}

async function handleFileDelete(_index: number, entity: FileTableItem): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此记录图片。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await resolveResponse(removeFile(entity.key))
    ElMessage({
      showClose: true,
      message: '记录图片删除成功',
      type: 'success',
    })
    handleSearchFile()
    emit('onContextChanged')
  } catch {
    // 忽略错误
  }
}

function revokeFileTableDataUrl(): void {
  // 释放旧图片的链接，并清空旧图片链接数组。
  fileTableItems.value.forEach((data) => {
    window.URL.revokeObjectURL(data.url)
  })
  fileTableItems.value.splice(0, fileTableItems.value.length)
}

onUnmounted(() => {
  revokeFileTableDataUrl()
})

// -----------------------------------------------------------记录维护对话框处理-----------------------------------------------------------
type RecordMaintainDialogItem = {
  long_id: string
  value: string
  remark: string
}

const {
  visible: recordMaintainDialogVisible,
  item: recordMaintainDialogItem,
  mode: recordMaintainDialogMode,
  showCreateDialog: showRecordCreateDialog,
  showEditDialog: showRecordEditDialog,
  showInspectDialog: showRecordInspectDialog,
} = useGeneralMaintainDialog<PbRecord, RecordMaintainDialogItem>(recordMaintainDialogItemMap, {
  long_id: '',
  value: '',
  remark: '',
})

const recordMaintainDialogLoading = ref<number>(0)
const recordMaintainDialogRules = ref({
  value: [{ required: true, message: '值不能为空', trigger: 'change' }],
})

function recordMaintainDialogItemMap(item: PbRecord): RecordMaintainDialogItem {
  return {
    long_id: item.key.long_id,
    value: item.value?.toString() ?? '',
    remark: item.remark,
  }
}

function handleValueInput(value: string): void {
  function limitInput(value: string): string {
    if (value === '' || value === null) {
      return ''
    }

    let lead = value[0]
    let val: string[]
    if (lead === '+' || lead === '-') {
      val = (value.substring(1) && value.substring(1).split('')) || []
    } else {
      lead = ''
      val = (value && value.split('')) || []
    }

    if (val.length === 0) {
      return lead
    }

    const reg1 = /\d/
    const reg2 = /\./

    // 第一个字符不能为小数点
    if (val[0] === '.') {
      return lead
    }
    // 过滤掉除数字和小数点外的字符
    val = val.filter((e) => reg1.test(e) || reg2.test(e))
    const tempResult = val.join('').match(/^\d*(\.?\d*)/g)?.[0] || ''

    return `${lead}${tempResult}`
  }

  recordMaintainDialogItem.value.value = limitInput(value)
}

async function handleRecordCreate(item: RecordMaintainDialogItem): Promise<void> {
  recordMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      createRecord({
        itemKey: { long_id: props.itemId },
        value: parseFloat(item.value) || null,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '记录创建成功',
      type: 'success',
    })
    handleSearchRecord()
    recordMaintainDialogVisible.value = false
    emit('onContextChanged')
  } finally {
    recordMaintainDialogLoading.value -= 1
  }
}

async function handleRecordEdit(item: RecordMaintainDialogItem): Promise<void> {
  recordMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      updateRecord({
        key: { long_id: item.long_id },
        value: parseFloat(item.value) || null,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '记录更新成功',
      type: 'success',
    })
    handleSearchRecord()
    recordMaintainDialogVisible.value = false
    emit('onContextChanged')
  } finally {
    recordMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------文件上传对话框处理-----------------------------------------------------------
const fileUploadDialogVisible = ref<boolean>(false)
const fileUploadDialogLoading = ref<number>(0)

async function handleFileUploadConfirmed(info: ImageSelectCropInfo): Promise<void> {
  if (recordTableSelection.value === null) {
    return
  }
  fileUploadDialogLoading.value += 1
  try {
    const formData = new FormData()
    formData.append('file', info.blob, info.name)
    await resolveResponse(uploadFile(recordTableSelection.value.key, formData))
    ElMessage({
      showClose: true,
      message: '记录图片上传成功',
      type: 'success',
    })
    handleSearchFile()
    emit('onContextChanged')
    fileUploadDialogVisible.value = false
  } finally {
    fileUploadDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.item-record-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.item-record-panel-container .block:not(:last-child) {
  margin-right: 10px;
}

.record-panel {
  width: 0;
  flex-grow: 4;
}

.file-panel {
  width: 0;
  flex-grow: 6;
}

.table-panel {
  width: 100%;
  height: 100%;
}

.table-panel .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.image-wrapper {
  line-height: 0;
}

.image {
  width: 100%;
  height: 67px;
}
</style>
