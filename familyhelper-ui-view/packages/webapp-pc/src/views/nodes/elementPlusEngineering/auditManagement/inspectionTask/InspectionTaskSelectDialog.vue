<template>
  <el-dialog
    class="inspection-task-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    :title="t('views.element_plus_engineering.audit_management.inspection_task_selection')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleInspectionTaskSearch">{{
              t('views.element_plus_engineering.audit_management.refresh_data')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleInspectionTaskSearch"
              @clear="handleInspectionTaskSearch"
            >
              <template v-slot:prepend>
                <span>{{ t('views.element_plus_engineering.audit_management.task_id') }}</span>
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
                :label="t('views.element_plus_engineering.audit_management.inspection_name')"
                min-width="120"
                show-overflow-tooltip
                :formatter="inspectionNameFormatter"
              />
              <el-table-column
                :label="t('views.element_plus_engineering.audit_management.status')"
                width="90px"
                show-overflow-tooltip
                :formatter="statusFormatter"
              />
              <el-table-column
                :label="t('views.element_plus_engineering.audit_management.created_time')"
                width="180px"
                show-overflow-tooltip
                :formatter="(row: DispInspectionTask) => formatNullableTimestamp(row.created_date)"
              />
              <el-table-column
                prop="anchor_message"
                :label="t('views.element_plus_engineering.audit_management.anchor_message')"
                show-overflow-tooltip
              />
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
        {{ t('views.element_plus_engineering.audit_management.confirm') }}
      </el-button>
      <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">{{
        t('views.element_plus_engineering.audit_management.cancel')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

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

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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
      return t('views.element_plus_engineering.audit_management.created')
    case 1:
      return t('views.element_plus_engineering.audit_management.processing')
    case 2:
      return t('views.element_plus_engineering.audit_management.completed')
    case 3:
      return t('views.element_plus_engineering.audit_management.failed')
    case 4:
      return t('views.element_plus_engineering.audit_management.expired')
    case 5:
      return t('views.element_plus_engineering.audit_management.dead')
    default:
      return t('views.element_plus_engineering.audit_management.unknown_status', { status })
  }
}

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return t('views.element_plus_engineering.audit_management.none_available_parenthesized')
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
    throw new Error(
      t('views.element_plus_engineering.audit_management.unexpected_execution_contact_developer'),
    )
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
