<template>
  <el-dialog
    class="inspector-info-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    title="检查器选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleInspectorInfoSearch">刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleInspectorInfoSearch"
              @clear="handleInspectorInfoSearch"
            >
              <template v-slot:prepend>
                <span>检查器 ID</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleInspectorInfoSearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="inspectorInfoTableCurrentPage"
            v-model:page-size="inspectorInfoTablePageSize"
            highlight-current-row
            :item-count="inspectorInfoTableItemCount"
            :page-sizes="[5, 15]"
            :items="inspectorInfoTableItems"
            :operate-column-visible="false"
            @onPagingAttributeChanged="handleInspectorInfoTablePagingAttributeChanged"
            @onCurrentChanged="handleInspectorInfoTableCurrentChanged"
          >
            <template v-slot:default>
              <el-table-column
                label="巡检名称"
                min-width="120"
                show-overflow-tooltip
                :formatter="inspectionNameFormatter"
              />
              <el-table-column prop="type" label="类型" show-overflow-tooltip />
              <el-table-column
                prop="enabled"
                label="使能"
                width="70"
                :formatter="enabledFormatter"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </template>
    <template v-slot:footer>
      <el-button
        type="primary"
        :disabled="loading > 0 || inspectorInfoTableCurrentRow === null"
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
  type DispInspectorInfo,
  exists,
  getDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectorInfo.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'InspectorInfoSelectDialog',
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
  (e: 'onConfirmed', value: DispInspectorInfo): void
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
      inspectorInfoTableCurrentRow.value = null
      handleInspectorInfoSearch()
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

// region 检查器查询

function handleInspectorInfoSearch(): void {
  if (idSearchBarValue.value !== '') {
    handleInspectorInfoIdSearch()
  } else {
    handleInspectorInfoAllSearch()
  }
}

async function handleInspectorInfoIdSearch(): Promise<void> {
  loading.value += 1
  try {
    const existed = await resolveResponse(exists({ long_id: idSearchBarValue.value }))
    if (!existed) {
      const empty: PagedData<DispInspectorInfo> = {
        current_page: 0,
        total_pages: 0,
        rows: inspectorInfoTablePageSize.value,
        count: '0',
        data: [],
      }
      updateInspectorInfoTableByLookup(empty)
      return
    }
    const item = await resolveResponse(getDisp({ long_id: idSearchBarValue.value }))
    updateInspectorInfoTableByLookup({
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

async function handleInspectorInfoAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allDisp(pagingInfo),
      inspectorInfoTablePagingInfo.value,
    )
    updateInspectorInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 检查器表格处理

const {
  currentPage: inspectorInfoTableCurrentPage,
  pageSize: inspectorInfoTablePageSize,
  itemCount: inspectorInfoTableItemCount,
  items: inspectorInfoTableItems,
  pagingInfo: inspectorInfoTablePagingInfo,
  updateByLookup: updateInspectorInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<DispInspectorInfo>(5)
const inspectorInfoTableCurrentRow = ref<DispInspectorInfo | null>(null)

function enabledFormatter(row: DispInspectorInfo): string {
  return row.enabled ? '是' : '否'
}

function inspectionNameFormatter(row: DispInspectorInfo): string {
  return row.inspection?.name ?? ''
}

function handleInspectorInfoTablePagingAttributeChanged(): void {
  inspectorInfoTableCurrentRow.value = null
  handleInspectorInfoSearch()
}

function handleInspectorInfoTableCurrentChanged(current: DispInspectorInfo | null): void {
  inspectorInfoTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const inspector: DispInspectorInfo | null = inspectorInfoTableCurrentRow.value
  if (!inspector) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', inspector)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const inspector: DispInspectorInfo | null = inspectorInfoTableCurrentRow.value
  if (!inspector) {
    return
  }
  emit('onConfirmed', inspector)
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
