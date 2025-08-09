<template>
  <div class="bill-file-panel-container">
    <div class="center-panel-wrapper">
      <div class="placeholder" v-if="!accountBook">请选择账本</div>
      <div class="placeholder" v-else-if="!fundChange">请选择资金变更记录</div>
      <header-layout-panel v-else>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="readonly" @click="handleShowBillFileUploadDialog">
              上传票据
            </el-button>
            <el-button type="success" @click="handleBillFileSearch"> 刷新数据</el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-loading="billFileTableLoading"
            v-model:current-page="billFileTableCurrentPage"
            v-model:page-size="billFileTablePageSize"
            :item-count="billFileTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="billFileTableItems"
            :operate-column-width="80"
            @onPagingAttributeChanged="handleBillFileTablePagingAttributeChanged"
          >
            <el-table-column label="内容" width="141px" :resizable="false">
              <template v-slot:default="{ row }">
                <div class="image-wrapper">
                  <el-image
                    class="image"
                    fit="cover"
                    preview-teleported
                    :src="row.url"
                    :preview-src-list="[row.url]"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="length"
              label="大小"
              width="95px"
              show-overflow-tooltip
              :formatter="billFileTableUnitFormatter"
            />
            <el-table-column
              prop="created_date"
              label="上传日期"
              width="180px"
              show-overflow-tooltip
              :formatter="billFileTableTimestampFormatter"
            />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            <template v-slot:operateColumn="{ index, row }">
              <el-button-group class="operate-column">
                <el-button
                  class="table-button"
                  type="success"
                  :icon="DownloadIcon"
                  @click="handleBillFileDownload(index, row as BillFileTableItem)"
                />
                <el-button
                  class="table-button"
                  type="danger"
                  :disabled="readonly"
                  :icon="DeleteIcon"
                  @click="handleBillFileDelete(index, row as BillFileTableItem)"
                />
              </el-button-group>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
      <image-select-crop-dialog
        title="上传票据图片"
        v-model:visible="billFileUploadDialogVisible"
        :loading="billFileUploadDialogLoading"
        :output-size="0.95"
        :cropper-height="400"
        :cropper-width="680"
        :crop-box-height="360"
        :crop-box-width="640"
        :enlarge="3"
        @onConfirmed="handleBillFileUploadConfirmed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Download as DownloadIcon, Delete as DeleteIcon } from '@element-plus/icons-vue'

import { type ImageSelectCropInfo } from '@/components/image/imageSelectCropDialog/types.ts'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import ImageSelectCropDialog from '@/components/image/imageSelectCropDialog/ImageSelectCropDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import { type DispAccountBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { type DispFundChange } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChange.ts'
import {
  childForFundChangeIndexAsc,
  download,
  upload,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/billFile.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  formatUnit,
  dataSizePreset,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'BillPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountBook: DispAccountBook | null
  fundChange: DispFundChange | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------只读计算-----------------------------------------------------------
const readonly = computed<boolean>(() => {
  if (!props.accountBook) {
    return true
  }
  return props.accountBook.permission_level !== 0
})

// -----------------------------------------------------------查询逻辑-----------------------------------------------------------
watch(
  () => props.fundChange,
  () => {
    handleBillFileSearch()
  },
)

function handleBillFileSearch(): void {
  if (!props.accountBook) {
    return
  }
  if (!props.fundChange) {
    return
  }
  handleBillFileChildForFundChangeSearch()
}

function revokeBillFileTableDataUrl(): void {
  billFileTableItems.value.forEach((data) => {
    window.URL.revokeObjectURL(data.url)
    data.url = ''
  })
}

async function handleBillFileChildForFundChangeSearch(): Promise<void> {
  const _fundChange = props.fundChange
  if (!_fundChange) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  billFileTableLoading.value += 1
  try {
    // 查询票据文件的基本信息。
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForFundChangeIndexAsc(_fundChange.key, pagingInfo),
      billFileTablePagingInfo.value,
    )
    // 基于票据文件基本信息，构造文件内容下载请求数组，将下载后的文件内容转换为 Blob 对象，并生成 URL。
    const promises: Promise<BillFileTableItem>[] = res.data.map(async (billFileInfo) => {
      const blob: Blob = await download(billFileInfo.key)
      const url: string = window.URL.createObjectURL(blob)
      return {
        key: billFileInfo.key,
        fund_change_key: billFileInfo.fund_change_key,
        origin_name: billFileInfo.origin_name,
        index: billFileInfo.index,
        length: billFileInfo.length,
        created_date: billFileInfo.created_date,
        remark: billFileInfo.remark,
        url, // 直接使用生成的 URL。
      }
    })
    // 等待所有的下载请求完成，并将结果转换为新的 neoData。
    const neoData: BillFileTableItem[] = await Promise.all(promises)
    // 基于新的 neoData 构造新的 neoRes。
    const neoRes: PagedData<BillFileTableItem> = {
      ...res,
      data: neoData,
    }
    // 释放旧图片的链接。
    revokeBillFileTableDataUrl()
    // 使用 neoRes 更新表格数据。
    updateBillFileTableByLookup(neoRes)
  } finally {
    billFileTableLoading.value -= 1
  }
}

onMounted(() => {
  handleBillFileSearch()
})

onUnmounted(() => {
  revokeBillFileTableDataUrl()
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowBillFileUploadDialog(): void {
  billFileUploadDialogVisible.value = true
}

// -----------------------------------------------------------票据文件表格处理-----------------------------------------------------------
type BillFileTableItem = {
  key: LongIdKey
  fund_change_key: LongIdKey
  origin_name: string
  index: number
  length: number
  created_date: number
  remark: string
  url: string
}

const {
  currentPage: billFileTableCurrentPage,
  pageSize: billFileTablePageSize,
  itemCount: billFileTableItemCount,
  items: billFileTableItems,
  pagingInfo: billFileTablePagingInfo,
  updateByLookup: updateBillFileTableByLookup,
} = useIdentityBackendPagingTablePanel<BillFileTableItem>(15)
const billFileTableLoading = ref<number>(0)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function billFileTableUnitFormatter(row: DispFundChange, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatUnit((row as any)[column.property], dataSizePreset)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function billFileTableTimestampFormatter(row: DispFundChange, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function handleBillFileTablePagingAttributeChanged(): void {
  handleBillFileSearch()
}

async function handleBillFileDownload(_index: number, item: BillFileTableItem): Promise<void> {
  // 由于票据文件不大，因此直接使用 a 标签生成 + 模拟点击实现下载功能。
  const blob: Blob = await download(item.key)
  const fileName: string = item.origin_name
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  window.URL.revokeObjectURL(link.href)
}

async function handleBillFileDelete(_index: number, item: BillFileTableItem): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此票据图片。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  billFileTableLoading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: '票据图片删除成功',
      type: 'success',
    })
    handleBillFileSearch()
  } finally {
    billFileTableLoading.value -= 1
  }
}

// -----------------------------------------------------------票据文件上传对话框-----------------------------------------------------------
const billFileUploadDialogVisible = ref<boolean>(false)
const billFileUploadDialogLoading = ref<number>(0)

async function handleBillFileUploadConfirmed(info: ImageSelectCropInfo): Promise<void> {
  const _fundChange = props.fundChange
  if (!_fundChange) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  billFileUploadDialogLoading.value += 1
  try {
    const formData: FormData = new FormData()
    formData.append('file', info.blob, info.name)
    await resolveResponse(upload(_fundChange.key, formData))
    ElMessage({
      showClose: true,
      message: '票据图片上传成功',
      type: 'success',
    })
    handleBillFileSearch()
    billFileUploadDialogVisible.value = false
  } finally {
    billFileUploadDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.bill-file-panel-container {
  height: 100%;
  width: 100%;
}

.table .image-wrapper {
  line-height: 0;
}

.table .image {
  width: 100%;
  height: 67px;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.center-panel-wrapper {
  width: 100%;
  height: 100%;
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
</style>
