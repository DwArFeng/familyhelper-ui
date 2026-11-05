<template>
  <div class="video-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector
            class="file-selector"
            accept="video/*"
            :multiple="false"
            @onFileSelected="handleUpload"
          >
            <template v-slot:default="{ selectFile }">
              <el-button type="primary" :disabled="readonly" @click="selectFile">上传</el-button>
            </template>
          </file-selector>
          <el-button type="primary" :disabled="videoMissing" @click="handleDownload"
            >下载</el-button
          >
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleInspect">刷新</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container-wrapper">
          <placeholder-panel v-if="videoMissing" text="未上传视频" />
          <div class="main-container" v-else>
            <title-layout-panel class="item property-container" title="视频属性">
              <el-form class="property-form" label-position="left" label-width="80px" inline>
                <el-form-item label="文件名称" style="width: 100%">
                  <el-tooltip
                    placement="top"
                    :content="originName"
                    :disabled="!isPropertyTextOverflow('originName')"
                    :show-after="200"
                  >
                    <span
                      class="property-ellipsis"
                      @mouseenter="handlePropertyTextMouseEnter($event, 'originName')"
                    >
                      {{ originName }}
                    </span>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="文件大小" style="width: 100%">
                  <el-tooltip
                    placement="top"
                    :content="formattedLength"
                    :disabled="!isPropertyTextOverflow('length')"
                    :show-after="200"
                  >
                    <span
                      class="property-ellipsis"
                      @mouseenter="handlePropertyTextMouseEnter($event, 'length')"
                    >
                      {{ formattedLength }}
                    </span>
                  </el-tooltip>
                </el-form-item>
              </el-form>
            </title-layout-panel>
            <el-divider direction="vertical" />
            <title-layout-panel class="item expand image-container" title="缩略图">
              <el-image class="image" fit="contain" :src="thumbnailUrl" />
            </title-layout-panel>
          </div>
        </div>
      </template>
    </header-layout-panel>
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

import { ElMessage } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/comvisual/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import FileSelector from '@/components/elementPlus/file/fileSelector/FileSelector.vue'

import {
  downloadThumbnail,
  operateInspect,
  requestFileStreamVoucher,
  uploadStream,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/videoNode.ts'
import { resolveResponse } from '@/util/response.ts'
import { captureVideoFrameAtRatio, type VideoFrameImageOptions } from '@/util/video.ts'
import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

defineOptions({
  name: 'VideoNodeSubEditPanel',
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

// region 视频

const settingNodeInvalid = computed(() => props.category === null || props.args === null)
const videoMissing = ref<boolean>(true)
const originName = ref<string>('')
const length = ref<number>(0)
const thumbnailUrl = ref<string>('')
const formattedLength = computed(() => formatUnit(length.value, dataSizePreset))
const propertyTextOverflow = ref<Record<string, boolean>>({})

function isPropertyTextOverflow(propertyId: string): boolean {
  return propertyTextOverflow.value[propertyId] ?? false
}

function handlePropertyTextMouseEnter(event: MouseEvent, propertyId: string): void {
  const target = event.currentTarget as HTMLElement
  propertyTextOverflow.value[propertyId] = target.scrollWidth > target.clientWidth
}

watch([originName, formattedLength], () => {
  propertyTextOverflow.value = {}
})

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

function revokeThumbnail(): void {
  if (thumbnailUrl.value !== '') {
    window.URL.revokeObjectURL(thumbnailUrl.value)
    thumbnailUrl.value = ''
  }
}

async function handleInspect(): Promise<void> {
  if (settingNodeInvalid.value) {
    videoMissing.value = true
    return
  }
  revokeThumbnail()
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const result = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    if (!result) {
      videoMissing.value = true
      return
    }
    videoMissing.value = false
    originName.value = result.origin_name
    length.value = result.length
    const thumbnail = await downloadThumbnail({
      category: props.category,
      args: props.args,
    })
    if (!thumbnail) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    thumbnailUrl.value = window.URL.createObjectURL(thumbnail)
  } finally {
    loading.value -= 1
  }
}

async function handleDownload(): Promise<void> {
  if (videoMissing.value || !props.category || !props.args) {
    return
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
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    ElMessage({
      showClose: true,
      message: '后台正在准备文件，文件越大，准备时间越长，请耐心等待...',
      type: 'success',
      duration: 10000,
    })
    let url = `${vim.ctx().api().baseUrl()}`
    if (!url.endsWith('/')) {
      url += '/'
    }
    url += `settingrepo/video-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`
    const iframe = document.createElement('iframe')
    iframe.setAttribute('hidden', 'hidden')
    document.body.appendChild(iframe)
    iframe.setAttribute('src', url)
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 3600000)
  } finally {
    loading.value -= 1
  }
}

function handleUpload(files: File[]): void {
  if (files.length <= 0 || !props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  openCoverDialog(files[0])
}

async function submitPendingCoverUpload(pending: PendingCoverUpload): Promise<void> {
  if (!props.category || !props.args) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  loading.value += 1
  try {
    const formData = new FormData()
    formData.append('category', props.category)
    formData.append('args', JSON.stringify(props.args))
    formData.append('file', pending.file)
    formData.append('cover', pending.cover)
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

onUnmounted(() => {
  revokeThumbnail()
})

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
}

const coverDialogVisible = ref<boolean>(false)
const coverDialogLoading = ref<number>(0)
const coverDialogUsable = ref<boolean>(false)
const coverDialogPercentage = ref<number>(INITIAL_COVER_PERCENTAGE)
const coverDialogFile = ref<File | null>(null)
const coverDialogCover = ref<File | null>(null)
const coverDialogVideoUrl = ref<string>('')
const coverDialogBlackPreviewUrl = ref<string>('')
const coverDialogPendingUpload = ref<PendingCoverUpload | null>(null)
const coverDialogVideoRef = useTemplateRef<HTMLVideoElement>('coverDialogVideoRef')

let coverDialogSession = 0

/**
 * 选中本地视频后打开封面对话框。
 *
 * 先进入加载状态再显示对话框，避免进度条在初始帧完成前被操作。
 */
function openCoverDialog(file: File): void {
  coverDialogSession += 1
  coverDialogFile.value = file
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
  coverDialogUsable.value = false
  coverDialogPercentage.value = INITIAL_COVER_PERCENTAGE
  if (pending) {
    const asyncWrapper = () => {
      submitPendingCoverUpload(pending)
    }
    asyncWrapper()
  }
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
.video-node-edit-panel-container {
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

.main-container-wrapper,
.main-container {
  height: 100%;
  width: 100%;
}

.main-container {
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
}

.property-ellipsis {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 32px;
}

/*noinspection CssUnusedSymbol*/
.image-container :deep(.content) {
  position: relative;
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
