<template>
  <el-dialog
    class="state-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    title="状态选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="stateTableCurrentPage"
      v-model:page-size="stateTablePageSize"
      highlight-current-row
      :item-count="stateTableItemCount"
      :page-sizes="[5, 15]"
      :items="stateTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleStateTablePagingAttributeChanged"
      @onCurrentChanged="handleStateTableCurrentChanged"
    >
      <el-table-column prop="key.state_id" label="状态 ID" min-width="100" show-overflow-tooltip />
      <el-table-column prop="name" label="名称" show-overflow-tooltip />
      <el-table-column label="类型" width="90px" :formatter="stateTypeFormatter" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || stateTableCurrentRow === null"
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
  childForSection,
  type State,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/state.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'StateSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
  sectionId: string
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: State): void
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
      stateTableCurrentRow.value = null
      handleStateSearch()
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 搜索

function handleStateSearch(): void {
  void handleStateAllSearch()
}

async function handleStateAllSearch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForSection({ long_id: props.sectionId }, pagingInfo),
      stateTablePagingInfo.value,
    )
    updateStateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 状态表格处理

const {
  currentPage: stateTableCurrentPage,
  pageSize: stateTablePageSize,
  itemCount: stateTableItemCount,
  items: stateTableItems,
  pagingInfo: stateTablePagingInfo,
  updateByLookup: updateStateTableByLookup,
} = useIdentityBackendPagingTablePanel<State>(5)
const stateTableCurrentRow = ref<State | null>(null)

function stateTypeFormatter(row: State): string {
  switch (row.type) {
    case 0:
      return '初始'
    case 1:
      return '普通'
    case 2:
      return '结束'
    default:
      return `未知（${row.type}）`
  }
}

function handleStateTablePagingAttributeChanged(): void {
  stateTableCurrentRow.value = null
  handleStateSearch()
}

function handleStateTableCurrentChanged(current: State | null): void {
  stateTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const state: State | null = stateTableCurrentRow.value
  if (!state) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', state)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const state: State | null = stateTableCurrentRow.value
  if (!state) {
    return
  }
  emit('onConfirmed', state)
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
