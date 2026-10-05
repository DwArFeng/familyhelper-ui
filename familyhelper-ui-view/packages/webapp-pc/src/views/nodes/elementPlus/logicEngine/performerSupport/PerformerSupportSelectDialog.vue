<template>
  <el-dialog
    class="performer-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    title="执行器支持选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="performerSupportTableCurrentPage"
      v-model:page-size="performerSupportTablePageSize"
      highlight-current-row
      :item-count="performerSupportTableItemCount"
      :page-sizes="[5, 15]"
      :items="performerSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handlePerformerSupportTablePagingAttributeChanged"
      @onCurrentChanged="handlePerformerSupportTableCurrentChanged"
    >
      <el-table-column prop="label" label="标签" show-overflow-tooltip />
      <el-table-column prop="key.string_id" label="类型" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column
        prop="example_param"
        label="示例参数"
        min-width="110"
        show-overflow-tooltip
      />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || performerSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">取消</el-button>
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
  type PerformerSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/performerSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'PerformerSupportSelectDialog',
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
  (e: 'onConfirmed', value: PerformerSupport): void
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
      performerSupportTableCurrentRow.value = null
      handlePerformerSupportSearch()
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 搜索

function handlePerformerSupportSearch(): void {
  handlePerformerSupportAllSearch()
}

async function handlePerformerSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      performerSupportTablePagingInfo.value,
    )
    updatePerformerSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 执行器支持表格处理

const {
  currentPage: performerSupportTableCurrentPage,
  pageSize: performerSupportTablePageSize,
  itemCount: performerSupportTableItemCount,
  items: performerSupportTableItems,
  pagingInfo: performerSupportTablePagingInfo,
  updateByLookup: updatePerformerSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<PerformerSupport>(5)
const performerSupportTableCurrentRow = ref<PerformerSupport | null>(null)

function handlePerformerSupportTablePagingAttributeChanged(): void {
  performerSupportTableCurrentRow.value = null
  handlePerformerSupportSearch()
}

function handlePerformerSupportTableCurrentChanged(current: PerformerSupport | null): void {
  performerSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const performerSupport: PerformerSupport | null = performerSupportTableCurrentRow.value
  if (!performerSupport) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', performerSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const performerSupport: PerformerSupport | null = performerSupportTableCurrentRow.value
  if (!performerSupport) {
    return
  }
  emit('onConfirmed', performerSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 450px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
}
</style>
