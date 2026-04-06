<template>
  <div class="visualizer-support-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="45%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <div class="panel-wrap">
          <loading-overlay :loading="loading > 0" />
          <header-layout-panel class="left-panel">
            <template v-slot:header>
              <div class="header-container">
                <native-button kind="success" @click="handleLeftRefresh">刷新</native-button>
                <div class="tooltip">可视化器支持与程序相关，仅可查看，不能更改</div>
              </div>
            </template>
            <template v-slot:default>
              <paging-table-panel
                class="table"
                v-model:current-page="tableCurrentPage"
                v-model:page-size="tablePageSize"
                highlight-current-row
                :row-key="visualizerRowKey"
                :item-count="tableItemCount"
                :page-sizes="[10, 15, 20, 30]"
                :items="tableItems"
                :operate-column-visible="false"
                :inspect-button-visible="false"
                :edit-button-visible="false"
                :delete-button-visible="false"
                @on-paging-attribute-changed="handleTablePagingAttributeChanged"
                @on-current-changed="handleTableCurrentChanged"
              >
                <paging-table-column label="Key" prop="key" :min-width="140" />
                <paging-table-column label="名称" prop="name" :min-width="120" />
                <paging-table-column
                  label="描述"
                  prop="description"
                  :min-width="160"
                  cell-class="single-line"
                />
              </paging-table-panel>
            </template>
          </header-layout-panel>
        </div>
      </template>
      <template v-slot:default>
        <placeholder-panel v-if="selectedKey === null" text="请选择可视化器" />
        <div v-else class="panel-wrap detail-wrap">
          <loading-overlay :loading="detailLoading > 0" />
          <header-layout-panel class="right-panel">
            <template v-slot:header>
              <div class="header-container">
                <native-button kind="success" @click="handleDetailRefresh">刷新</native-button>
              </div>
            </template>
            <template v-slot:default>
              <native-form class="form" :model="detailForm" label-width="60px">
                <native-form-item label="Key">
                  <input
                    v-model="detailForm.key"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="Key"
                  />
                </native-form-item>
                <native-form-item label="名称">
                  <input
                    v-model="detailForm.name"
                    class="form-input form-input--readonly"
                    type="text"
                    readonly
                    aria-label="名称"
                  />
                </native-form-item>
                <native-form-item class="form-item-grow" label="描述">
                  <textarea
                    v-model="detailForm.description"
                    class="text-area text-area--readonly"
                    readonly
                    spellcheck="false"
                    aria-label="描述"
                  />
                </native-form-item>
                <native-form-item class="form-item-grow" label="参数示例">
                  <textarea
                    v-model="detailForm.exampleDisplayText"
                    class="text-area text-area--readonly"
                    readonly
                    spellcheck="false"
                    aria-label="参数示例"
                  />
                </native-form-item>
              </native-form>
            </template>
          </header-layout-panel>
        </div>
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import vim from '@/vim'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type VisualizerSupportRow } from './visualizerSupportRow.ts'

defineOptions({
  name: 'VisualizerSupport',
})

// region 类型与行数据

function visualizerRowKey(row: VisualizerSupportRow): string {
  return row.key
}

function buildRows(): VisualizerSupportRow[] {
  const lib = vim.ctx().library()
  const keys = [...lib.visualizerInfoKeys()].sort((a, b) => a.localeCompare(b))
  const rows: VisualizerSupportRow[] = []
  for (const key of keys) {
    const info = lib.visualizerInfo(key)
    if (!info) {
      continue
    }
    rows.push({
      key,
      name: info.name,
      description: info.description,
      exampleDisplay: info.exampleDisplay,
    })
  }
  return rows
}

// endregion

// region 加载

const loading = ref(0)
const detailLoading = ref(0)

// endregion

// region 左侧表格

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  refreshPaging: tableRefreshPaging,
  updateByLookup: tableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<VisualizerSupportRow>(15)

const selectedKey = ref<string | null>(null)
const isRestoringSelection = ref(false)

function handleTablePagingAttributeChanged(): void {
  tableRefreshPaging()
}

function handleTableCurrentChanged(row: VisualizerSupportRow | null): void {
  if (isRestoringSelection.value) {
    return
  }
  selectedKey.value = row?.key ?? null
  syncDetailFromLibrary()
}

function handleLeftRefresh(): void {
  loading.value += 1
  try {
    const rows = buildRows()
    const prev = selectedKey.value
    isRestoringSelection.value = true
    tableUpdateByLookup(rows)
    void nextTick(() => {
      try {
        if (prev !== null && rows.some((r) => r.key === prev)) {
          selectedKey.value = prev
          syncDetailFromLibrary()
        } else {
          selectedKey.value = null
          clearDetailFields()
        }
      } finally {
        isRestoringSelection.value = false
      }
    })
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleLeftRefresh()
})

// endregion

// region 右侧详情

type DetailFormItem = {
  key: string
  name: string
  description: string
  exampleDisplayText: string
}

const detailForm = ref<DetailFormItem>({
  key: '',
  name: '',
  description: '',
  exampleDisplayText: '',
})

function clearDetailFields(): void {
  detailForm.value = {
    key: '',
    name: '',
    description: '',
    exampleDisplayText: '',
  }
}

function syncDetailFromLibrary(): void {
  const key = selectedKey.value
  if (key === null) {
    clearDetailFields()
    return
  }
  const info = vim.ctx().library().visualizerInfo(key)
  if (!info) {
    clearDetailFields()
    return
  }
  detailForm.value = {
    key,
    name: info.name,
    description: info.description,
    exampleDisplayText: JSON.stringify(info.exampleDisplay as object, null, 2),
  }
}

function handleDetailRefresh(): void {
  if (selectedKey.value === null) {
    return
  }
  detailLoading.value += 1
  try {
    syncDetailFromLibrary()
  } finally {
    detailLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.visualizer-support-container {
  width: 100%;
  height: 100%;
}

.border-layout-panel {
  height: 100%;
}

.panel-wrap {
  position: relative;
  height: 100%;
  width: 100%;
}

.detail-wrap {
  background: #ffffff;
}

.left-panel,
.right-panel {
  height: 100%;
}

.table {
  height: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.header-container .tooltip {
  font-size: 14px;
  color: #909399;
}

.form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
  box-sizing: border-box;
}

.form-item-grow {
  height: 0;
  flex-grow: 1;
  min-height: 120px;
}

/*noinspection CssUnusedSymbol*/
.form-item-grow :deep(.native-form-item__content) {
  height: 100%;
}

.form-input {
  width: 100%;
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-input--readonly {
  background: #f5f7fa;
}

.text-area {
  width: 100%;
  height: 100%;
  min-height: 120px;
  box-sizing: border-box;
  padding: 8px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: none;
}

.text-area--readonly {
  background: #f5f7fa;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}
</style>
