<template>
  <el-dialog
    class="inspection-task-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    title="巡检任务选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleInspectionTaskSearch">刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleInspectionTaskSearch"
              @clear="handleInspectionTaskSearch"
            >
              <template v-slot:prepend>
                <span>任务 ID</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleInspectionTaskSearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="inspectionTaskTableCurrentPage"
            v-model:page-size="inspectionTaskTablePageSize"
            highlight-current-row
            :item-count="inspectionTaskTableItemCount"
            :page-sizes="[5, 15]"
            :items="inspectionTaskTableItems"
            :operate-column-visible="false"
            @onPagingAttributeChanged="handleInspectionTaskTablePagingAttributeChanged"
            @onCurrentChanged="handleInspectionTaskTableCurrentChanged"
          >
            <template v-slot:default>
              <el-table-column
                label="巡检名称"
                min-width="120"
                show-overflow-tooltip
                :formatter="inspectionNameFormatter"
              />
              <el-table-column
                label="状态"
                width="90"
                show-overflow-tooltip
                :formatter="statusFormatter"
              />
              <el-table-column
                label="创建时间"
                width="180"
                show-overflow-tooltip
                :formatter="(row: DispInspectionTask) => formatNullableTimestamp(row.created_date)"
              />
              <el-table-column prop="anchor_message" label="锚点消息" show-overflow-tooltip />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </template>
    <template v-slot:footer>
      <el-button
        type="primary"
        :disabled="loading > 0 || inspectionTaskTableCurrentRow === null"
        @click="handleConfirmButtonClicked"
      >
        确认
      </el-button>
      <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import {
  allDisp,
  type DispInspectionTask,
  exists,
  getDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionTask.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'InspectionTaskSelectDialog',
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
  (e: 'onConfirmed', value: DispInspectionTask): void
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
      idSearchBarValue.value = ''
      inspectionTaskTableCurrentRow.value = null
      handleInspectionTaskSearch()
    }
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 头部面板

const idSearchBarValue = ref<string>('')

// endregion

// region 巡检任务查询

function handleInspectionTaskSearch(): void {
  if (idSearchBarValue.value !== '') {
    handleInspectionTaskIdSearch()
  } else {
    handleInspectionTaskAllSearch()
  }
}

async function handleInspectionTaskIdSearch(): Promise<void> {
  loading.value += 1
  try {
    const existed = await resolveResponse(exists({ long_id: idSearchBarValue.value }))
    if (!existed) {
      const empty: PagedData<DispInspectionTask> = {
        current_page: 0,
        total_pages: 0,
        rows: inspectionTaskTablePageSize.value,
        count: '0',
        data: [],
      }
      updateInspectionTaskTableByLookup(empty)
      return
    }
    const item = await resolveResponse(getDisp({ long_id: idSearchBarValue.value }))
    updateInspectionTaskTableByLookup({
      current_page: 0,
      total_pages: 1,
      rows: 1,
      count: '1',
      data: [item],
    })
  } finally {
    loading.value -= 1
  }
}

async function handleInspectionTaskAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allDisp(pagingInfo),
      inspectionTaskTablePagingInfo.value,
    )
    updateInspectionTaskTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 巡检任务表格处理

const {
  currentPage: inspectionTaskTableCurrentPage,
  pageSize: inspectionTaskTablePageSize,
  itemCount: inspectionTaskTableItemCount,
  items: inspectionTaskTableItems,
  pagingInfo: inspectionTaskTablePagingInfo,
  updateByLookup: updateInspectionTaskTableByLookup,
} = useIdentityBackendPagingTablePanel<DispInspectionTask>(5)
const inspectionTaskTableCurrentRow = ref<DispInspectionTask | null>(null)

function formatTaskStatus(status: number): string {
  switch (status) {
    case 0:
      return '已创建'
    case 1:
      return '处理中'
    case 2:
      return '已完成'
    case 3:
      return '失败'
    case 4:
      return '已过期'
    case 5:
      return '已僵死'
    default:
      return `未知（${status}）`
  }
}

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '（暂无）'
  }
  return formatTimestamp(value)
}

function inspectionNameFormatter(row: DispInspectionTask): string {
  return row.inspection?.name ?? ''
}

function statusFormatter(row: DispInspectionTask): string {
  return formatTaskStatus(row.status)
}

function handleInspectionTaskTablePagingAttributeChanged(): void {
  inspectionTaskTableCurrentRow.value = null
  handleInspectionTaskSearch()
}

function handleInspectionTaskTableCurrentChanged(current: DispInspectionTask | null): void {
  inspectionTaskTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const task: DispInspectionTask | null = inspectionTaskTableCurrentRow.value
  if (!task) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', task)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const task: DispInspectionTask | null = inspectionTaskTableCurrentRow.value
  if (!task) {
    return
  }
  emit('onConfirmed', task)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .id-search-bar {
  width: 360px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.table {
  height: 450px;
}
</style>
