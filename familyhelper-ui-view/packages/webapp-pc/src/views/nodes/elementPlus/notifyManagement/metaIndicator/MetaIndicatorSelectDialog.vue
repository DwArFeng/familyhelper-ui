<template>
  <el-dialog
    class="meta-indicator-select-dialog-container"
    v-model="watchedVisible"
    id="dialog"
    tabindex="0"
    destroy-on-close
    title="选择缺少的元数据项"
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <div class="main-container">
      <child-for-meta-missing-sub-panel
        :notify-setting-id="notifySettingId"
        :topic-id="topicId"
        :account-id="accountId"
        @onSelectionChanged="handleSelectionChanged"
      />
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button type="primary" :disabled="loading > 0 || notConfirmable" @click="handleConfirm">
          确认
        </el-button>
        <el-button :disabled="loading > 0" @click="watchedVisible = false"> 取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import ChildForMetaMissingSubPanel from './subPanels/ChildForMetaMissingSubPanel.vue'

import { type MetaIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'

defineOptions({
  name: 'MetaIndicatorSelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  notifySettingId: string
  topicId: string
  accountId: string
  mode?: 'CHILD_FOR_META_MISSING'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'CHILD_FOR_META_MISSING',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', selection: MetaIndicator[]): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

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

// -----------------------------------------------------------选区逻辑-----------------------------------------------------------
const selection = ref<MetaIndicator[]>([])

function handleSelectionChanged(value: MetaIndicator[]): void {
  selection.value = value
}

// -----------------------------------------------------------确认逻辑-----------------------------------------------------------
const notConfirmable = computed<boolean>(() => {
  if (props.mode === 'CHILD_FOR_META_MISSING') {
    return selection.value.length === 0
  }
  return true
})

function handleHotKeyDown(): void {
  if (notConfirmable.value) {
    return
  }
  handleConfirm()
}

function handleConfirm(): void {
  if (props.mode === 'CHILD_FOR_META_MISSING') {
    emit('onConfirmed', selection.value)
  }
}
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 512px;
}

.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
