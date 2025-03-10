<template>
  <div class="text-editor-container">
    <div class="header">
      <div class="function-panel">
        <el-select class="item selector" v-model="selectorValue" size="small">
          <!--suppress VueUnrecognizedSlot -->
          <template v-slot:prefix>
            <el-icon>
              <histogram-icon />
            </el-icon>
          </template>
          <el-option
            v-for="item in selectorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-tag class="item none-transaction">长度：{{ watchedModelValue.length }}</el-tag>
        <el-link
          class="item"
          type="primary"
          icon="el-icon-document"
          :underline="false"
          @click="handleCopy"
        >
          复制
        </el-link>
      </div>
      <div>
        <slot name="addon" :replace="addonReplace" />
      </div>
    </div>
    <div class="body">
      <plain-sub-editor
        v-model="watchedModelValue"
        v-if="selectorValue === 'plain'"
        :readonly="readonly"
      />
      <json-sub-editor
        v-model="watchedModelValue"
        v-else-if="selectorValue === 'json'"
        :readonly="readonly"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import { Histogram as HistogramIcon } from '@element-plus/icons-vue'

import PlainSubEditor from './subEditors/PlainSubEditor.vue'
import JsonSubEditor from '@/components/text/textEditor/subEditors/JsonSubEditor.vue'

defineOptions({
  name: 'TextEditor',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  modelValue: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:modelValue', value: string): void
}

const emits = defineEmits<Emits>()

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
type AddonSlotProps = {
  replace: (value: string) => void
}

defineSlots<{
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addon?: (props: AddonSlotProps) => any
}>()

// -----------------------------------------------------------值处理逻辑-----------------------------------------------------------
const watchedModelValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    watchedModelValue.value = value
  },
)

watch(
  () => watchedModelValue.value,
  (value) => {
    emits('update:modelValue', value)
  },
)

onMounted(() => {
  watchedModelValue.value = props.modelValue
})

// -----------------------------------------------------------模式处理-----------------------------------------------------------
type Mode = 'plain' | 'json'
type ModeOption = { value: Mode; label: string }

const selectorValue = ref<Mode>('plain')
const selectorOptions = ref<ModeOption[]>([
  { value: 'plain', label: 'Text' },
  { value: 'json', label: 'JSON' },
])

// -----------------------------------------------------------文本操作-----------------------------------------------------------
function handleCopy(): void {
  navigator.clipboard.writeText(watchedModelValue.value).then(() => {
    ElMessage({
      showClose: true,
      message: '复制成功',
      type: 'success',
      center: true,
    })
  })
}

function addonReplace(value: string): void {
  watchedModelValue.value = value
}
</script>

<style scoped>
.text-editor-container {
  height: 100%;
  width: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  padding: 7px 5px;
  box-sizing: border-box;
}

.header {
  height: 24px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.body {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.function-panel {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.function-panel .item:not(:first-child) {
  margin-left: 5px;
}

.function-panel .item.none-transaction {
  transition: none;
}

.function-panel .selector {
  width: 140px;
}

.function-panel .selector :deep(input) {
  padding-left: 20px;
}

/*noinspection CssUnusedSymbol*/
.header :deep(.el-link--inner) {
  margin: 0;
}
</style>
