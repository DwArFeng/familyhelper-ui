<template>
  <el-dialog
    class="inspector-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    title="检查器支持选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="inspectorSupportTableCurrentPage"
      v-model:page-size="inspectorSupportTablePageSize"
      highlight-current-row
      :item-count="inspectorSupportTableItemCount"
      :page-sizes="[5, 15]"
      :items="inspectorSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleInspectorSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleInspectorSupportTableCurrentChanged"
    >
      <el-table-column prop="label" label="标签" show-overflow-tooltip />
      <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="example_param" label="示例参数" show-overflow-tooltip />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || inspectorSupportTableCurrentRow === null"
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

import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import {
  all,
  type InspectorSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectorSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'InspectorSupportSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: InspectorSupport): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 可见性处理

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
    if (value) {
      inspectorSupportTableCurrentRow.value = null
      handleInspectorSupportSearch()
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 搜索

function handleInspectorSupportSearch(): void {
  handleInspectorSupportAllSearch()
}

async function handleInspectorSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      inspectorSupportTablePagingInfo.value,
    )
    updateInspectorSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 检查器支持表格处理

const {
  currentPage: inspectorSupportTableCurrentPage,
  pageSize: inspectorSupportTablePageSize,
  itemCount: inspectorSupportTableItemCount,
  items: inspectorSupportTableItems,
  pagingInfo: inspectorSupportTablePagingInfo,
  updateByLookup: updateInspectorSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectorSupport>(5)
const inspectorSupportTableCurrentRow = ref<InspectorSupport | null>(null)

function handleInspectorSupportTablePagingAttributeChanged(): void {
  inspectorSupportTableCurrentRow.value = null
  handleInspectorSupportSearch()
}

function handleInspectorSupportTableCurrentChanged(current: InspectorSupport | null): void {
  inspectorSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const inspectorSupport: InspectorSupport | null = inspectorSupportTableCurrentRow.value
  if (!inspectorSupport) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', inspectorSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const inspectorSupport: InspectorSupport | null = inspectorSupportTableCurrentRow.value
  if (!inspectorSupport) {
    return
  }
  emit('onConfirmed', inspectorSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
