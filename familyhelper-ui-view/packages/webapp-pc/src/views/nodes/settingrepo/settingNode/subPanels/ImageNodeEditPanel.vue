<template>
  <div class="image-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <file-selector
            class="file-selector"
            :accept="fileSelectorAccept"
            :tester="fileSelectorTester"
            :multiple="false"
            @onFileSelected="handleUpload"
          >
            <template v-slot:default="{ selectFile }">
              <el-button type="primary" :disabled="readonly" @click="selectFile"> 上传</el-button>
            </template>
          </file-selector>
          <el-button type="primary" @click="handleDownload"> 下载</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleInspect"> 刷新</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="main-container">
          <title-layout-panel class="item property-container" title="图片属性">
            <el-form class="property-form" label-position="left" label-width="80px" inline>
              <el-form-item label="文件名称" style="width: 100%">
                {{ imageOriginName }}
              </el-form-item>
              <el-form-item label="文件大小" style="width: 100%">
                {{ imageFormattedLength }}
              </el-form-item>
            </el-form>
          </title-layout-panel>
          <el-divider direction="vertical" />
          <title-layout-panel class="item expand image-container" title="图片预览">
            <el-image class="image" fit="contain" :src="imageThumbnailUrl" />
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import FileSelector from '@/components/file/fileSelector/FileSelector.vue'

import { useImageFileSelector } from '@/components/file/fileSelector/composables.ts'

import {
  downloadThumbnail,
  operateInspect,
  requestFileStreamVoucher,
  uploadStream,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageNode.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  dataSizePreset,
  formatUnit,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'

defineOptions({
  name: 'ImageNodeEditPanel',
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
const { tester: fileSelectorTester, accept: fileSelectorAccept } = useImageFileSelector()
const imageOriginName = ref<string>('')
const imageLength = ref<number>(0)
const imageThumbnailUrl = ref<string>('')

const imageFormattedLength = computed(() => {
  return formatUnit(imageLength.value, dataSizePreset)
})

async function handleInspect(): Promise<void> {
  if (settingNodeInvalid.value) {
    return
  }
  loading.value += 1
  try {
    if (!props.category || !props.args) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    if (imageThumbnailUrl.value !== '') {
      window.URL.revokeObjectURL(imageThumbnailUrl.value)
    }
    const imageNodeInspectResult = await resolveResponse(
      operateInspect({
        category: props.category,
        args: props.args,
      }),
    )
    imageOriginName.value = imageNodeInspectResult.origin_name
    imageLength.value = imageNodeInspectResult.length
    const thumbnail = await downloadThumbnail({
      category: props.category,
      args: props.args,
    })
    imageThumbnailUrl.value = window.URL.createObjectURL(thumbnail)
  } finally {
    loading.value -= 1
  }
}

async function handleDownload(): Promise<void> {
  if (props.category === null || props.args === null) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const voucherKey = await resolveResponse(
      requestFileStreamVoucher({
        category: props.category,
        args: props.args,
      }),
    )
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
    url += `settingrepo/image-node/download-file-by-voucher?voucher-id=${voucherKey.long_id}`
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
    throw new Error('不应该执行到此处, 请联系开发人员')
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
  if (imageThumbnailUrl.value !== '') {
    window.URL.revokeObjectURL(imageThumbnailUrl.value)
  }
})
</script>

<style scoped>
.image-node-edit-panel-container {
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

.property-container {
  width: 500px;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
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
.property-container .property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.image-container .image {
  width: 100%;
  height: 100%;
}
</style>
