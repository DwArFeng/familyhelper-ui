<template>
  <div class="image-cropper-container">
    <div
      class="main-container"
      ref="mainContainerRef"
      tabindex="0"
      @keydown="handleHotKeyDown($event)"
    >
      <div class="header item">
        <div class="toolbar">
          <el-button type="primary" :disabled="imageUrl === ''" @click="handleCropperZoomIn">
            <i class="iconfont">&#xffe8;</i>
          </el-button>
          <el-button
            type="primary"
            :icon="useIconfontButtonIcon('&#xffe9;')"
            :disabled="imageUrl === ''"
            @click="handleCropperZoomOut"
          />
          <el-button
            type="primary"
            :icon="useIconfontButtonIcon('&#xffeb;')"
            :disabled="imageUrl === ''"
            @click="handleCropperRotateRight"
          />
          <el-button
            type="primary"
            :icon="useIconfontButtonIcon('&#xffea;')"
            :disabled="imageUrl === ''"
            @click="handleCropperRotateLeft"
          />
          <el-button
            type="primary"
            :icon="useIconfontButtonIcon('&#xffe6;')"
            :disabled="imageUrl === ''"
            @click="handleCropperReload"
          />
        </div>
        <vue-cropper
          class="cropper"
          ref="cropperRef"
          outputType="jpeg"
          mode="cover"
          :img="imageUrl"
          :outputSize="outputSize"
          :info="true"
          :canScale="true"
          :autoCrop="true"
          :autoCropWidth="`${cropBoxWidth}px`"
          :autoCropHeight="`${cropBoxHeight}px`"
          :fixed="false"
          :full="false"
          :fixedBox="true"
          :canMove="true"
          :canMoveBox="false"
          :original="false"
          :centerBox="false"
          :height="true"
          :infoTrue="true"
          :maxImgSize="3000"
          :enlarge="enlarge"
          @mousedown="handleCropperFocus"
          @mousewheel="handleCropperFocus"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'

import { VueCropper } from 'vue-cropper'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

defineOptions({
  name: 'ImageCropper',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  imageUrl: string
  outputSize?: number
  cropperWidth?: number
  cropperHeight?: number
  cropBoxWidth?: number
  cropBoxHeight?: number
  enlarge?: number
}

const props = withDefaults(defineProps<Props>(), {
  outputSize: 1,
  cropperWidth: 400,
  cropperHeight: 300,
  cropBoxWidth: 400,
  cropBoxHeight: 300,
  enlarge: 1,
})

// -----------------------------------------------------------样式处理-----------------------------------------------------------
const cropperMinHeight = computed<string>(() => {
  return `max(${props.cropperHeight}px, ${props.cropBoxHeight}px)`
})
const cropperMinWidth = computed<string>(() => {
  return `max(${props.cropperWidth}px, ${props.cropBoxWidth}px)`
})

// -----------------------------------------------------------主容器处理-----------------------------------------------------------
const mainContainerRef = useTemplateRef<HTMLElement>('mainContainerRef')

function handleCropperFocus(): void {
  if (!mainContainerRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  mainContainerRef.value.focus()
}

// -----------------------------------------------------------Cropper 处理-----------------------------------------------------------
const cropperRef = useTemplateRef<InstanceType<typeof VueCropper>>('cropperRef')

function handleCropperZoomIn(): void {
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  cropperRef.value.changeScale(1)
}

function handleCropperZoomOut(): void {
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  cropperRef.value.changeScale(-1)
}

function handleCropperRotateRight(): void {
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  cropperRef.value.rotateRight()
}

function handleCropperRotateLeft(): void {
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  cropperRef.value.rotateLeft()
}

function handleCropperReload(): void {
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  cropperRef.value.reload()
}

// -----------------------------------------------------------热键处理-----------------------------------------------------------
function handleHotKeyDown(event: KeyboardEvent): void {
  if (props.imageUrl === '') {
    return
  }
  let delta: number = 1
  if (event.ctrlKey) {
    delta = 5
  }
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  switch (event.key) {
    case 'ArrowUp':
      cropperRef.value.y -= delta
      break
    case 'ArrowDown':
      cropperRef.value.y += delta
      break
    case 'ArrowLeft':
      cropperRef.value.x -= delta
      break
    case 'ArrowRight':
      cropperRef.value.x += delta
      break
    default:
  }
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function getCropBlob(callback: (blob: Blob) => void): void {
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  cropperRef.value.getCropBlob(callback)
}

function reload(): void {
  if (!cropperRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  cropperRef.value.reload()
}

defineExpose({
  getCropBlob,
  reload,
})
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-container:focus {
  outline: none;
}

.main-container .item {
  width: 100%;
}

.main-container .header {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-content: center;
}

.cropper {
  width: 0;
  flex-grow: 1;
  min-height: v-bind(cropperMinHeight);
  min-width: v-bind(cropperMinWidth);
}

.toolbar {
  display: flex;
  flex-direction: column;
  padding: 3px;
  background: #d6d6d6;
}

.toolbar button {
  padding: 2px;
  height: 22px;
  width: 22px;
  box-sizing: content-box;
  margin: 0;
}

.toolbar button:not(:last-child) {
  margin-bottom: 2px;
}

.toolbar i {
  font-size: 18px;
  color: white;
}
</style>
