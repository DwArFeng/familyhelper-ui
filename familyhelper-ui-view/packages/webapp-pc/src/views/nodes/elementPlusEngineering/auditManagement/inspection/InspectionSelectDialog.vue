<template>
  <el-dialog
    class="inspection-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    :title="t('views.element_plus_engineering.audit_management.inspection_selection')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleInspectionSearch">{{
              t('views.element_plus_engineering.audit_management.refresh_data')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleInspectionSearch"
              @clear="handleInspectionSearch"
            >
              <template v-slot:prepend>
                <span>{{
                  t('views.element_plus_engineering.audit_management.inspection_id')
                }}</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleInspectionSearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="inspectionTableCurrentPage"
            v-model:page-size="inspectionTablePageSize"
            highlight-current-row
            :item-count="inspectionTableItemCount"
            :page-sizes="[5, 15]"
            :items="inspectionTableItems"
            :operate-column-visible="false"
            @onPagingAttributeChanged="handleInspectionTablePagingAttributeChanged"
            @onCurrentChanged="handleInspectionTableCurrentChanged"
          >
            <template v-slot:default>
              <el-table-column prop="key.long_id" label="ID" show-overflow-tooltip />
              <el-table-column
                prop="name"
                :label="t('views.element_plus_engineering.audit_management.name')"
                show-overflow-tooltip
              />
              <el-table-column
                prop="enabled"
                :label="t('views.element_plus_engineering.audit_management.enabled_state')"
                width="70"
                :formatter="enabledFormatter"
              />
              <el-table-column
                prop="remark"
                :label="t('views.element_plus_engineering.audit_management.remark')"
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
        :disabled="loading > 0 || inspectionTableCurrentRow === null"
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
  all,
  exists,
  get,
  type Inspection,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspection.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'InspectionSelectDialog',
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
  (e: 'onConfirmed', value: Inspection): void
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
      inspectionTableCurrentRow.value = null
      handleInspectionSearch()
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

// region 巡检查询

function handleInspectionSearch(): void {
  if (idSearchBarValue.value !== '') {
    handleInspectionIdSearch()
  } else {
    handleInspectionAllSearch()
  }
}

async function handleInspectionIdSearch(): Promise<void> {
  loading.value += 1
  try {
    const existed = await resolveResponse(exists({ long_id: idSearchBarValue.value }))
    if (!existed) {
      const empty: PagedData<Inspection> = {
        current_page: 0,
        total_pages: 0,
        rows: inspectionTablePageSize.value,
        count: '0',
        data: [],
      }
      updateInspectionTableByLookup(empty)
      return
    }
    const item = await resolveResponse(get({ long_id: idSearchBarValue.value }))
    updateInspectionTableByLookup({
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

async function handleInspectionAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      inspectionTablePagingInfo.value,
    )
    updateInspectionTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 巡检表格处理

const {
  currentPage: inspectionTableCurrentPage,
  pageSize: inspectionTablePageSize,
  itemCount: inspectionTableItemCount,
  items: inspectionTableItems,
  pagingInfo: inspectionTablePagingInfo,
  updateByLookup: updateInspectionTableByLookup,
} = useIdentityBackendPagingTablePanel<Inspection>(5)
const inspectionTableCurrentRow = ref<Inspection | null>(null)

function enabledFormatter(row: Inspection): string {
  return row.enabled
    ? t('views.element_plus_engineering.audit_management.yes')
    : t('views.element_plus_engineering.audit_management.no')
}

function handleInspectionTablePagingAttributeChanged(): void {
  inspectionTableCurrentRow.value = null
  handleInspectionSearch()
}

function handleInspectionTableCurrentChanged(current: Inspection | null): void {
  inspectionTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const inspection: Inspection | null = inspectionTableCurrentRow.value
  if (!inspection) {
    throw new Error(
      t('views.element_plus_engineering.audit_management.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', inspection)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const inspection: Inspection | null = inspectionTableCurrentRow.value
  if (!inspection) {
    return
  }
  emit('onConfirmed', inspection)
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
