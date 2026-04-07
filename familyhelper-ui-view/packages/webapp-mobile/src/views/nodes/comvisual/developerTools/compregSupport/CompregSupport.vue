<template>
  <div class="compreg-support-container">
    <root-border-layout-panel
      class="border-layout-panel"
      :west-visible="true"
      west-width="45%"
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
                <div class="header-left">
                  <native-button kind="success" @click="handleLeftRefresh">刷新</native-button>
                  <vertical-divider />
                  <span class="search-label">搜索</span>
                  <input
                    v-model="searchKeyword"
                    class="search-input"
                    type="text"
                    placeholder="匹配 Key 或名称"
                    aria-label="搜索 Key 或名称"
                    @input="handleSearchInput"
                  />
                </div>
                <div class="tooltip">组件注册支持与程序相关，仅可查看，不能更改</div>
              </div>
            </template>
            <template v-slot:default>
              <paging-table-panel
                class="table"
                v-model:current-page="tableCurrentPage"
                v-model:page-size="tablePageSize"
                highlight-current-row
                :row-key="compregRowKey"
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
        <placeholder-panel v-if="selectedKey === null" text="请选择组件注册项" />
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
                <native-form-item class="form-item-grow form-item-grow--compact" label="描述">
                  <textarea
                    v-model="detailForm.description"
                    class="text-area text-area--readonly"
                    readonly
                    spellcheck="false"
                    aria-label="描述"
                  />
                </native-form-item>
                <native-form-item class="form-item-grow" label="参数示例">
                  <native-tabs
                    v-model="exampleParamTabName"
                    tab-position="top"
                    class="example-tabs"
                  >
                    <native-tab-pane
                      v-for="tab in exampleParamTabs"
                      :key="tab.paramKey"
                      :name="tab.paramKey"
                      :label="tab.label"
                    >
                      <textarea
                        :value="exampleJsonForParamKey(tab.paramKey)"
                        class="text-area text-area--readonly text-area--tab"
                        readonly
                        spellcheck="false"
                        :aria-label="tab.label"
                      />
                    </native-tab-pane>
                  </native-tabs>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import vim from '@/vim'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import VerticalDivider from '@/components/comvisual/form/divider/verticalDivider/VerticalDivider.vue'
import NativeForm from '@/components/comvisual/form/nativeForm/NativeForm.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { type CompregSupportRow } from './compregSupportRow.ts'

defineOptions({
  name: 'CompregSupport',
})

// region 类型与行数据

function compregRowKey(row: CompregSupportRow): string {
  return row.key
}

function buildRows(): CompregSupportRow[] {
  const infos = vim.ctx().compreg().componentInfos()
  const keys = Object.keys(infos).sort((a, b) => a.localeCompare(b))
  const rows: CompregSupportRow[] = []
  for (const key of keys) {
    const info = infos[key]
    rows.push({
      key: info.key,
      name: info.name,
      description: info.description,
      exampleRouterComponentParam: info.exampleRouterComponentParam,
    })
  }
  return rows
}

// endregion

// region 左侧列表与搜索

const loading = ref(0)

const searchKeyword = ref('')
const fullRows = ref<CompregSupportRow[]>([])

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  refreshPaging: tableRefreshPaging,
  updateByLookup: tableUpdateByLookup,
} = useIdentityFrontendPagingTablePanel<CompregSupportRow>(15)

const selectedKey = ref<string | null>(null)
const isRestoringSelection = ref(false)

function handleTablePagingAttributeChanged(): void {
  tableRefreshPaging()
}

function rowMatchesSearch(row: CompregSupportRow, query: string): boolean {
  const t = query.trim().toLowerCase()
  if (t === '') {
    return true
  }
  return row.key.toLowerCase().includes(t) || row.name.toLowerCase().includes(t)
}

function filteredRows(): CompregSupportRow[] {
  return fullRows.value.filter((r) => rowMatchesSearch(r, searchKeyword.value))
}

function applyFilteredRowsWithSelectionRestore(): void {
  const rows = filteredRows()
  const prev = selectedKey.value
  isRestoringSelection.value = true
  tableUpdateByLookup(rows)
  void nextTick(() => {
    try {
      if (prev !== null && rows.some((r) => r.key === prev)) {
        selectedKey.value = prev
        syncDetailFromCompreg()
      } else {
        selectedKey.value = null
        clearDetailFields()
      }
    } finally {
      isRestoringSelection.value = false
    }
  })
}

function handleSearchInput(): void {
  applyFilteredRowsWithSelectionRestore()
}

function handleTableCurrentChanged(row: CompregSupportRow | null): void {
  if (isRestoringSelection.value) {
    return
  }
  selectedKey.value = row?.key ?? null
  syncDetailFromCompreg()
}

function handleLeftRefresh(): void {
  loading.value += 1
  try {
    fullRows.value = buildRows()
    applyFilteredRowsWithSelectionRestore()
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleLeftRefresh()
})

// endregion

// region 右侧详情

const detailLoading = ref(0)

type DetailFormItem = {
  key: string
  name: string
  description: string
}

const detailForm = ref<DetailFormItem>({
  key: '',
  name: '',
  description: '',
})

const exampleParamTabs = computed(() => {
  const lib = vim.ctx().library()
  const tabs: { tabKey: string; paramKey: string; label: string }[] = []
  const keys = [...lib.visualizerInfoKeys()].sort((a, b) => a.localeCompare(b))
  tabs.push({ tabKey: '0', paramKey: '', label: '默认' })
  for (const k of keys) {
    if (k === '') {
      continue
    }
    const v = lib.visualizerInfo(k)
    if (v) {
      tabs.push({ tabKey: `0${k}`, paramKey: k, label: v.name })
    }
  }
  return tabs
})

const exampleParamTabName = ref('')

watch(
  () => exampleParamTabs.value,
  (tabs) => {
    if (tabs.length === 0) {
      exampleParamTabName.value = ''
      return
    }
    const names = new Set(tabs.map((t) => t.paramKey))
    if (!names.has(exampleParamTabName.value)) {
      exampleParamTabName.value = tabs[0]?.paramKey ?? ''
    }
  },
  { immediate: true },
)

watch(selectedKey, () => {
  const tabs = exampleParamTabs.value
  if (tabs.length > 0) {
    exampleParamTabName.value = tabs[0]?.paramKey ?? ''
  }
})

function exampleJsonForParamKey(paramKey: string): string {
  const key = selectedKey.value
  if (key === null) {
    return ''
  }
  const info = vim.ctx().compreg().componentInfo(key)
  if (!info) {
    return ''
  }
  const raw = info.exampleRouterComponentParam[paramKey]
  return JSON.stringify(raw ?? {}, null, 2)
}

function clearDetailFields(): void {
  detailForm.value = {
    key: '',
    name: '',
    description: '',
  }
}

function syncDetailFromCompreg(): void {
  const key = selectedKey.value
  if (key === null) {
    clearDetailFields()
    return
  }
  const info = vim.ctx().compreg().componentInfo(key)
  if (!info) {
    clearDetailFields()
    return
  }
  detailForm.value = {
    key: info.key,
    name: info.name,
    description: info.description,
  }
}

function handleDetailRefresh(): void {
  if (selectedKey.value === null) {
    return
  }
  detailLoading.value += 1
  try {
    syncDetailFromCompreg()
  } finally {
    detailLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.compreg-support-container {
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

.header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.search-label {
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.search-input {
  width: min(200px, 100%);
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
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

.form-item-grow--compact {
  flex-grow: 0.6;
  min-height: 100px;
}

/*noinspection CssUnusedSymbol*/
.form-item-grow :deep(.native-form-item__content) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
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

.text-area--tab {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
}

.example-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.example-tabs :deep(.native-tabs__content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/*noinspection CssUnusedSymbol*/
.example-tabs :deep(.native-tab-pane) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}
</style>
