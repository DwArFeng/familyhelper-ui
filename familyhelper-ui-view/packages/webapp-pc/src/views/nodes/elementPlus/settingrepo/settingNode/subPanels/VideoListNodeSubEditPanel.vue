<template>
  <div class="video-list-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector
            class="file-selector"
            accept="video/*"
            :tester="videoFileSelectorTester"
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
          <title-layout-panel class="item list-container" title="视频列表">
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
              accept="video/*"
              :tester="videoFileSelectorTester"
              :multiple="false"
              @onFileSelected="handleItemUpdateFileSelectorSelected"
            />
          </title-layout-panel>
          <el-divider direction="vertical" />
          <title-layout-panel class="item expand image-container" title="缩略图">
            <placeholder-panel v-if="!itemTableCurrentRow" text="请选择视频" />
            <placeholder-panel v-else-if="itemTableCurrentRow.null_flag" text="无视频" />
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
    <el-dialog
      class="video-cover-dialog"
      v-model="coverDialogVisible"
      append-to-body
      destroy-on-close
      tabindex="0"
      width="720px"
      :close-on-click-modal="false"
      title="选择视频封面"
      @open="handleCoverDialogOpen"
      @closed="handleCoverDialogClosed"
      @keydown.ctrl.enter="handleCoverDialogHotKey"
    >
      <div class="video-cover-dialog-body" v-loading="coverDialogLoading">
        <div class="video-cover-preview">
          <video
            ref="coverDialogVideoRef"
            class="video-cover-video"
            v-show="coverDialogUsable || coverDialogLoading > 0"
            muted
            playsinline
            preload="auto"
          />
          <img
            v-show="
              !coverDialogUsable && coverDialogLoading === 0 && coverDialogBlackPreviewUrl !== ''
            "
            class="video-cover-black"
            alt=""
            :src="coverDialogBlackPreviewUrl"
          />
        </div>
        <el-slider
          v-model="coverDialogPercentage"
          :min="0"
          :max="100"
          :step="0.01"
          :show-tooltip="false"
          :disabled="!coverDialogUsable || coverDialogLoading > 0"
          @change="handleCoverSliderChange"
        />
      </div>
      <template v-slot:footer>
        <el-button
          type="primary"
          :disabled="coverDialogLoading > 0 || coverDialogCover === null"
          @click="handleCoverDialogConfirm"
        >
          确认
        </el-button>
        <el-button @click="handleCoverDialogCancel">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
  Upload as UploadIcon,
} from '@element-plus/icons-vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import FileSelector from '@/components/elementPlus/file/fileSelector/FileSelector.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralFileSelector } from '@/components/elementPlus/file/fileSelector/composables.ts'
import { useEditOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type VideoListNodeInspectResultItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/videoListNode.ts'
import {
  downloadThumbnail,
  operateInspect,
  uploadStream,
  requestFileStreamVoucher,
  updateStream,
  operateSize,
  operateChangeOrder,
  operateRemove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/videoListNode.ts'
import { resolveResponse } from '@/util/response.ts'
import { captureVideoFrameAtRatio, type VideoFrameImageOptions } from '@/util/video.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

defineOptions({
  name: 'VideoListNodeSubEditPanel',
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

// region 编辑器逻辑

type TableItem = VideoListNodeInspectResultItem & { index: number }
type ChangeOrderDialogItem = {
  index: number
  neo_index: number
}

const { tester: videoFileSelectorTester } = useGeneralFileSelector()
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
        operateSize({
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
  if (!itemTableCurrentRow.value || files.length <= 0) {
    return
  }
  openCoverDialog(files[0], itemTableCurrentRow.value.index)
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
    if (!res) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
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
    if (!blob) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    anchorImageOriginName.value = itemTableCurrentRow.value.origin_name
    anchorImageLength.value = itemTableCurrentRow.value.length
    anchorImageThumbnailUrl.value = window.URL.createObjectURL(blob)
  } finally {
    anchorImageLoading.value -= 1
  }
}

function handleUpload(files: File[]): void {
  if (!props.category || !props.args || files.length <= 0) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  openCoverDialog(files[0], null)
}

async function uploadVideoWithCover(file: File, cover: File): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const formData = new FormData()
    formData.append('category', props.category)
    formData.append('args', JSON.stringify(props.args))
    formData.append('file', file)
    formData.append('cover', cover)
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
    url += `settingrepo/video-list-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`
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

async function updateVideoWithCover(index: number, file: File, cover: File): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const formData = new FormData()
    formData.append('category', props.category)
    formData.append('args', JSON.stringify(props.args))
    formData.append('file', file)
    formData.append('index', `${index}`)
    formData.append('cover', cover)
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
      operateChangeOrder({
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
    await ElMessageBox.confirm('此操作将永久删除此视频项。<br>是否继续?', {
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
      operateRemove({
        category: props.category,
        args: props.args,
        index: row.index,
      }),
    )
    ElMessage({
      showClose: true,
      message: '视频项删除成功',
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

// region 视频封面

const COVER_MIME = 'image/jpeg'
const COVER_FILE_NAME = 'cover.jpg'
const COVER_QUALITY = 0.85
const MAX_COVER_EDGE = 1280
const BLACK_COVER_WIDTH = 320
const BLACK_COVER_HEIGHT = 180
const CAPTURE_TIMEOUT_MS = 15000
const MIN_USABLE_DURATION_SECONDS = 1
const INITIAL_COVER_PERCENTAGE = 1
const UNEXPECTED_EXECUTION_MESSAGE = '不应该执行到此处，请联系开发人员'

type PendingCoverUpload = {
  file: File
  cover: File
  index: number | null
}

const coverDialogVisible = ref<boolean>(false)
const coverDialogLoading = ref<number>(0)
const coverDialogUsable = ref<boolean>(false)
const coverDialogPercentage = ref<number>(INITIAL_COVER_PERCENTAGE)
const coverDialogFile = ref<File | null>(null)
const coverDialogCover = ref<File | null>(null)
const coverDialogReplaceIndex = ref<number | null>(null)
const coverDialogVideoUrl = ref<string>('')
const coverDialogBlackPreviewUrl = ref<string>('')
const coverDialogPendingUpload = ref<PendingCoverUpload | null>(null)
const coverDialogVideoRef = useTemplateRef<HTMLVideoElement>('coverDialogVideoRef')

let coverDialogSession = 0

/**
 * 选中本地视频后打开封面对话框。
 *
 * 先进入加载状态再显示对话框，避免进度条在初始帧完成前被操作。
 * replaceIndex 为空时表示新增，有值时表示替换该索引上的视频。
 */
function openCoverDialog(file: File, replaceIndex: number | null): void {
  coverDialogSession += 1
  coverDialogFile.value = file
  coverDialogReplaceIndex.value = replaceIndex
  coverDialogCover.value = null
  coverDialogUsable.value = false
  coverDialogPercentage.value = INITIAL_COVER_PERCENTAGE
  coverDialogPendingUpload.value = null
  coverDialogLoading.value = 1
  coverDialogVisible.value = true
}

async function handleCoverDialogOpen(): Promise<void> {
  const session = coverDialogSession
  const file = coverDialogFile.value
  if (!file) {
    if (session === coverDialogSession) {
      coverDialogLoading.value = 0
    }
    return
  }
  try {
    await nextTick()
    if (session !== coverDialogSession) {
      return
    }
    const video = coverDialogVideoRef.value
    if (!video) {
      await enterUnusableState()
      return
    }
    video.muted = true
    video.playsInline = true
    const objectUrl = window.URL.createObjectURL(file)
    coverDialogVideoUrl.value = objectUrl
    const loaded = waitForVideoLoaded(video, CAPTURE_TIMEOUT_MS)
    video.src = objectUrl
    await loaded
    if (session !== coverDialogSession) {
      return
    }
    if (!isVideoUsable(video)) {
      await enterUnusableState()
      return
    }
    coverDialogUsable.value = true
    const blob = await captureVideoFrameAtRatio(
      video,
      INITIAL_COVER_PERCENTAGE / 100,
      coverFrameOptions(),
    )
    if (session !== coverDialogSession) {
      return
    }
    coverDialogCover.value = createCoverFile(blob)
  } catch {
    if (session !== coverDialogSession) {
      return
    }
    try {
      await enterUnusableState()
    } catch {
      coverDialogCover.value = null
      ElMessage({
        showClose: true,
        message: UNEXPECTED_EXECUTION_MESSAGE,
        type: 'error',
      })
    }
  } finally {
    if (session === coverDialogSession) {
      coverDialogLoading.value = Math.max(0, coverDialogLoading.value - 1)
    }
  }
}

async function handleCoverSliderChange(value: number | number[]): Promise<void> {
  if (coverDialogLoading.value > 0 || !coverDialogUsable.value || typeof value !== 'number') {
    return
  }
  const video = coverDialogVideoRef.value
  if (!video) {
    return
  }
  const session = coverDialogSession
  coverDialogLoading.value += 1
  try {
    const blob = await captureVideoFrameAtRatio(video, value / 100, coverFrameOptions())
    if (session !== coverDialogSession) {
      return
    }
    coverDialogCover.value = createCoverFile(blob)
  } catch {
    if (session !== coverDialogSession) {
      return
    }
    try {
      await enterUnusableState()
    } catch {
      coverDialogCover.value = null
      ElMessage({
        showClose: true,
        message: UNEXPECTED_EXECUTION_MESSAGE,
        type: 'error',
      })
    }
  } finally {
    if (session === coverDialogSession) {
      coverDialogLoading.value -= 1
    }
  }
}

function handleCoverDialogConfirm(): void {
  if (
    coverDialogLoading.value > 0 ||
    coverDialogCover.value === null ||
    coverDialogFile.value === null
  ) {
    return
  }
  coverDialogPendingUpload.value = {
    file: coverDialogFile.value,
    cover: coverDialogCover.value,
    index: coverDialogReplaceIndex.value,
  }
  coverDialogVisible.value = false
}

function handleCoverDialogCancel(): void {
  coverDialogPendingUpload.value = null
  coverDialogVisible.value = false
}

function handleCoverDialogHotKey(): void {
  handleCoverDialogConfirm()
}

function handleCoverDialogClosed(): void {
  coverDialogSession += 1
  const pending = coverDialogPendingUpload.value
  coverDialogPendingUpload.value = null
  releaseCoverDialogMedia()
  coverDialogLoading.value = 0
  coverDialogFile.value = null
  coverDialogCover.value = null
  coverDialogReplaceIndex.value = null
  coverDialogUsable.value = false
  coverDialogPercentage.value = INITIAL_COVER_PERCENTAGE
  if (!pending) {
    return
  }
  const asyncWrapper = () => {
    submitPendingCoverUpload(pending)
  }
  asyncWrapper()
}

async function submitPendingCoverUpload(pending: PendingCoverUpload): Promise<void> {
  if (pending.index === null) {
    await uploadVideoWithCover(pending.file, pending.cover)
    return
  }
  await updateVideoWithCover(pending.index, pending.file, pending.cover)
}

function coverFrameOptions(): VideoFrameImageOptions {
  return {
    maxEdge: MAX_COVER_EDGE,
    quality: COVER_QUALITY,
    timeoutMs: CAPTURE_TIMEOUT_MS,
  }
}

function isVideoUsable(video: HTMLVideoElement): boolean {
  return (
    video.videoWidth > 0 &&
    video.videoHeight > 0 &&
    Number.isFinite(video.duration) &&
    video.duration >= MIN_USABLE_DURATION_SECONDS
  )
}

async function enterUnusableState(): Promise<void> {
  coverDialogUsable.value = false
  const cover = await createBlackCoverFile()
  if (coverDialogBlackPreviewUrl.value !== '') {
    window.URL.revokeObjectURL(coverDialogBlackPreviewUrl.value)
  }
  coverDialogCover.value = cover
  coverDialogBlackPreviewUrl.value = window.URL.createObjectURL(cover)
}

function createCoverFile(blob: Blob): File {
  return new File([blob], COVER_FILE_NAME, { type: COVER_MIME })
}

function createBlackCoverFile(): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = BLACK_COVER_WIDTH
  canvas.height = BLACK_COVER_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) {
    return Promise.reject(new Error(UNEXPECTED_EXECUTION_MESSAGE))
  }
  context.fillStyle = '#000000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size <= 0) {
          reject(new Error(UNEXPECTED_EXECUTION_MESSAGE))
          return
        }
        resolve(createCoverFile(blob))
      },
      COVER_MIME,
      COVER_QUALITY,
    )
  })
}

function waitForVideoLoaded(video: HTMLVideoElement, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('等待视频解码超时'))
    }, timeoutMs)
    const onLoaded = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('浏览器无法解码该视频'))
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('loadeddata', onLoaded, { once: true })
    video.addEventListener('error', onError, { once: true })
  })
}

function releaseCoverDialogMedia(): void {
  const video = coverDialogVideoRef.value
  if (video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
  }
  if (coverDialogVideoUrl.value !== '') {
    window.URL.revokeObjectURL(coverDialogVideoUrl.value)
    coverDialogVideoUrl.value = ''
  }
  if (coverDialogBlackPreviewUrl.value !== '') {
    window.URL.revokeObjectURL(coverDialogBlackPreviewUrl.value)
    coverDialogBlackPreviewUrl.value = ''
  }
}

onUnmounted(() => {
  coverDialogSession += 1
  releaseCoverDialogMedia()
})

// endregion
</script>

<style scoped>
.video-list-node-edit-panel-container {
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
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.image-container .image {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.image-container .image :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-cover-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-cover-preview {
  position: relative;
  height: 405px;
  background-color: #000000;
}

.video-cover-video,
.video-cover-black {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
