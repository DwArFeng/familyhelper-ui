<template>
  <div class="image-list-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector
            class="file-selector"
            :accept="imageFileSelectorAccept"
            :tester="imageFileSelectorTester"
            :multiple="false"
            @onFileSelected="handleUpload"
          >
            <template v-slot:default="{ selectFile }">
              <el-button type="primary" :disabled="readonly" @click="selectFile"> 上传</el-button>
            </template>
          </file-selector>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleInspect"> 刷新</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container">
          <title-layout-panel class="item list-container" title="图片列表">
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
              :accept="imageFileSelectorAccept"
              :tester="imageFileSelectorTester"
              :multiple="false"
              @onFileSelected="handleItemUpdateFileSelectorSelected"
            />
          </title-layout-panel>
          <el-divider direction="vertical" />
          <title-layout-panel class="item expand image-container" title="图片预览">
            <div v-if="!itemTableCurrentRow" class="placeholder">请选择图片</div>
            <div v-else-if="itemTableCurrentRow.null_flag" class="placeholder">无图片</div>
            <div class="image-wrapper" v-else v-loading="anchorImageLoading">
              <el-image class="image" fit="contain" :src="anchorImageThumbnailUrl" />
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

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import FileSelector from '@/components/file/fileSelector/FileSelector.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useImageFileSelector } from '@/components/file/fileSelector/composables.ts'
import { useEditOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type ImageListNodeInspectResultItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageListNode.ts'
import {
  downloadThumbnail,
  operateInspect,
  uploadStream,
  requestFileStreamVoucher,
  updateStream,
  size,
  changeOrder,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageListNode.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

defineOptions({
  name: 'ImageListNodeEditPanel',
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
type TableItem = ImageListNodeInspectResultItem & { index: number }
type ChangeOrderDialogItem = {
  index: number
  neo_index: number
}

const { tester: imageFileSelectorTester, accept: imageFileSelectorAccept } = useImageFileSelector()
const {
  currentPage: itemTableCurrentPage,
  pageSize: itemTablePageSize,
  items: itemTableItems,
  itemCount: itemTableItemCount,
  updateByLookup: updateItemTableByLookup,
  refreshPaging: refreshItemTablePaging,
} = useIdentityFrontendPagingTablePanel<TableItem>(15)
const itemTableCurrentRow = ref<TableItem | null>(null)
const anchorImageLoading = ref<number>(0)
const anchorImageOriginName = ref<string>('')
const anchorImageLength = ref<number>(0)
const anchorImageThumbnailUrl = ref<string>('')
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

const itemUpdateFileSelectorRef = useTemplateRef<InstanceType<typeof FileSelector>>(
  'itemUpdateFileSelectorRef',
)

watch(itemTableCurrentRow, refreshThumbnail)

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

function handleClickFileSelector(): void {
  const itemUpdateFileSelector = itemUpdateFileSelectorRef.value
  if (!itemUpdateFileSelector) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  itemUpdateFileSelector.selectFile()
}

function handleShowChangeOrderDialog(row: TableItem): void {
  showChangeOrderDialog(row)
}

function changeOrderDialogItemMap(t: TableItem): ChangeOrderDialogItem {
  return {
    index: t.index,
    neo_index: t.index,
  }
}

function handleItemUpdateFileSelectorSelected(files: File[]): void {
  if (!itemTableCurrentRow.value) {
    return
  }
  handleUpdate(itemTableCurrentRow.value, files[0])
}

async function handleInspect(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  if (anchorImageThumbnailUrl.value !== '') {
    window.URL.revokeObjectURL(anchorImageThumbnailUrl.value)
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
    updateItemTableByLookup(res.items.map((item, index) => ({ ...item, index })))
  } finally {
    loading.value -= 1
  }
}

async function refreshThumbnail(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  if (anchorImageThumbnailUrl.value !== '') {
    window.URL.revokeObjectURL(anchorImageThumbnailUrl.value)
    anchorImageThumbnailUrl.value = ''
  }
  if (!itemTableCurrentRow.value) {
    return
  }
  if (itemTableCurrentRow.value.null_flag) {
    return
  }
  anchorImageLoading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const blob = await downloadThumbnail({
      category: props.category,
      args: props.args,
      index: itemTableCurrentRow.value.index,
    })
    anchorImageOriginName.value = itemTableCurrentRow.value.origin_name
    anchorImageLength.value = itemTableCurrentRow.value.length
    anchorImageThumbnailUrl.value = window.URL.createObjectURL(blob)
  } finally {
    anchorImageLoading.value -= 1
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
      center: true,
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
    ElMessage({
      showClose: true,
      message: '后台正在准备文件，文件越大，准备时间越长，请耐心等待...',
      type: 'success',
      center: true,
      duration: 10000,
    })
    // 构造下载地址。
    let url = `${vim.ctx().api().baseUrl()}`
    if (!url.endsWith('/')) {
      url += '/'
    }
    url += `settingrepo/image-list-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`
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
      center: true,
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
      center: true,
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
    await ElMessageBox.confirm('此操作将永久删除此图片项。<br>是否继续?', {
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
      message: '图片项删除成功',
      type: 'success',
      center: true,
    })
    const asyncWrapper = () => {
      handleInspect()
    }
    asyncWrapper()
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.image-list-node-edit-panel-container {
  height: 100%;
  width: 100%;
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

.image-container .image-wrapper {
  height: 100%;
  width: 100%;
  display: block;
}

.image-container .image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.placeholder {
  width: 100%;
  height: 100%;
  line-height: 184px;
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
