<template>
  <el-dialog
    class="file-create-dialog-container"
    v-model="watchedVisible"
    append-to-body
    destroy-on-close
    :title="title"
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <div>
      <div class="placeholder" v-if="validCreateInfos.length === 0">
        您没有创建任何类型文件的权限！
      </div>
      <div
        class="editor-container"
        v-else
        v-loading="loading"
        element-loading-text="作者偷懒没有做进度显示，长时间转圈是正常现象，请耐心等待"
      >
        <div class="type-selector">
          <div
            class="item-wrapper"
            :class="index === selectedIndex ? 'selected' : 'unselected'"
            v-for="(createInfo, index) in validCreateInfos"
            :key="index"
            @click="selectedIndex = index"
          >
            <el-tooltip placement="top" :open-delay="1000" :content="createInfo.description">
              <div class="item">
                <component class="icon" :is="useCreateIcon(createInfo.indicator)" />
                <span>{{ createInfo.label }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
        <!--suppress RegExpDuplicateCharacterInClass, RegExpRedundantEscape -->
        <el-input
          class="input"
          placeholder="请输入文件名称（不用输入后缀名），注意不要输入非法字符"
          v-model="fileName"
          oninput="this.value = this.value.replace(/[&\|\\\*^%$'&quot;#@:;，。？！\,@\$]/g,'')"
        >
          <template v-slot:append>{{ currentCreateInfo?.extension ?? '' }}</template>
        </el-input>
      </div>
    </div>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading || fileName === '' || currentCreateInfo === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </el-button>
        <el-button :disabled="loading" @click="handleCancelButtonClicked"> 取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

import { computed, onMounted, ref, watch } from 'vue'

import { useCreateIcon } from '@/composables/file.ts'

import type { CreateInfo, CreatePermissionInfo } from '@/util/file.ts'
import { getCreateInfos } from '@/util/file.ts'

import type { ExtensionFilter, FileCreateInfo } from './types.ts'

defineOptions({
  name: 'FileCreateDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  title?: string
  filter?: ExtensionFilter
  loading?: boolean | number
}

const props = withDefaults(defineProps<Props>(), {
  title: '上传文件',
  mode: 'PERMITTED',
  filter: () => true,
  loading: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', info: FileCreateInfo): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = computed<boolean>(() => {
  if (typeof props.loading === 'number') {
    return props.loading > 0
  }
  return props.loading
})

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// -----------------------------------------------------------逻辑处理-----------------------------------------------------------
const selectedIndex = ref<number>(0)
const fileName = ref<string>('')

const currentCreateInfo = computed<CreateInfo | null>(() => {
  // 如果 selectedIndex 越界，则返回 null。
  if (selectedIndex.value < 0 || selectedIndex.value >= validCreateInfos.value.length) {
    return null
  }
  // 否则返回当前选中的 CreateInfo。
  return validCreateInfos.value[selectedIndex.value]
})

const validCreateInfos = computed<CreateInfo[]>(() => {
  return getCreateInfos()
    .filter((createInfo) => {
      const permissionInfo: CreatePermissionInfo | undefined = createInfo.permission
      if (!permissionInfo) {
        return true
      }
      const required: boolean = permissionInfo.required
      if (!required) {
        return true
      }
      const node: string | undefined = permissionInfo.node
      if (node === undefined) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      return lnpStore.hasPermission(node)
    })
    .filter((createInfo) => {
      const extension: string = createInfo.extension
      return props.filter(extension)
    })
})

watch(
  () => validCreateInfos.value,
  () => {
    selectedIndex.value = 0
    fileName.value = ''
  },
)

// -----------------------------------------------------------对话框处理-----------------------------------------------------------
function handleConfirmButtonClicked(): void {
  if (props.loading || fileName.value === '' || currentCreateInfo.value === null) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const blob: Blob = new Blob([])
  const name: string = `${fileName.value}${currentCreateInfo.value.extension}`
  const fileCreateInfo: FileCreateInfo = { blob, name }
  emit('onConfirmed', fileCreateInfo)
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (props.loading || fileName.value === '' || currentCreateInfo.value === null) {
    return
  }
  const blob: Blob = new Blob([])
  const name: string = `${fileName.value}${currentCreateInfo.value.extension}`
  const fileCreateInfo: FileCreateInfo = { blob, name }
  emit('onConfirmed', fileCreateInfo)
}
</script>

<style scoped>
.editor-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.type-selector {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
  margin-bottom: 15px;
}

.type-selector .item-wrapper {
  height: 100px;
  width: 85px;
  background: rgba(0, 0, 0, 0.025);
  cursor: pointer;
}

.type-selector .item-wrapper:hover {
  background: rgba(0, 0, 0, 0.05);
}

/*noinspection CssUnusedSymbol*/
.item-wrapper.unselected {
  padding: 2px;
}

/*noinspection CssUnusedSymbol*/
.item-wrapper.selected {
  padding: 0;
  border-style: solid;
  border-width: 2px;
  border-color: #409eff;
}

.type-selector .item-wrapper:not(:nth-child(1)) {
  margin-left: 10px;
}

.type-selector .item-wrapper .item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.type-selector .item-wrapper .item .icon {
  height: 48px;
  width: 48px;
  font-size: 48px;
  user-select: none;
}

.type-selector .item-wrapper .item span {
  user-select: none;
  margin-bottom: 10px;
}

.editor-container .input {
  width: 85%;
}

.placeholder {
  width: 100%;
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
