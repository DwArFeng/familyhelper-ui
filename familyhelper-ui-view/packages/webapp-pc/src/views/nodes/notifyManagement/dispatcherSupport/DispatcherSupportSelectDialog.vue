<template>
  <el-dialog
    class="dispatcher-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    title="模板选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="dispatcherSupportTableCurrentPage"
      v-model:page-size="dispatcherSupportTablePageSize"
      highlight-current-row
      :item-count="dispatcherSupportTableItemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="dispatcherSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleDispatcherSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleDispatcherSupportTableCurrentChanged"
    >
      <el-table-column prop="label" label="名称" show-overflow-tooltip />
      <el-table-column prop="key.string_id" label="ID" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="example_param" label="参数示例" show-overflow-tooltip />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || dispatcherSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked"> 取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import type { DispatcherSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'DispatcherSupportSelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: DispatcherSupport): void
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

// -----------------------------------------------------------搜索-----------------------------------------------------------
function handleDispatcherSupportSearch(): void {
  handleDispatcherSupportAllSearch()
}

async function handleDispatcherSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      dispatcherSupportTablePagingInfo.value,
    )
    updateDispatcherSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------调度器支持表格处理-----------------------------------------------------------
const {
  currentPage: dispatcherSupportTableCurrentPage,
  pageSize: dispatcherSupportTablePageSize,
  itemCount: dispatcherSupportTableItemCount,
  items: dispatcherSupportTableItems,
  pagingInfo: dispatcherSupportTablePagingInfo,
  updateByLookup: updateDispatcherSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<DispatcherSupport>(15)
const dispatcherSupportTableCurrentRow = ref<DispatcherSupport | null>(null)

function handleDispatcherSupportTablePagingAttributeChanged(): void {
  handleDispatcherSupportSearch()
}

function handleDispatcherSupportTableCurrentChanged(current: DispatcherSupport | null): void {
  dispatcherSupportTableCurrentRow.value = current
}

// -----------------------------------------------------------对话框处理-----------------------------------------------------------
function handleConfirmButtonClicked(): void {
  const formatSupport: DispatcherSupport | null = dispatcherSupportTableCurrentRow.value
  if (!formatSupport) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const formatSupport: DispatcherSupport | null = dispatcherSupportTableCurrentRow.value
  if (!formatSupport) {
    return
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
