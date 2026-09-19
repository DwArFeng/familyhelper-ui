<template>
  <el-dialog
    class="audit-category-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    title="审计类别选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleAuditCategorySearch">刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleAuditCategorySearch"
              @clear="handleAuditCategorySearch"
            >
              <template v-slot:prepend>
                <span>类别 ID</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleAuditCategorySearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="auditCategoryTableCurrentPage"
            v-model:page-size="auditCategoryTablePageSize"
            highlight-current-row
            :item-count="auditCategoryTableItemCount"
            :page-sizes="[5, 15]"
            :items="auditCategoryTableItems"
            :operate-column-visible="false"
            @onPagingAttributeChanged="handleAuditCategoryTablePagingAttributeChanged"
            @onCurrentChanged="handleAuditCategoryTableCurrentChanged"
          >
            <template v-slot:default>
              <el-table-column prop="key.string_id" label="类别 ID" show-overflow-tooltip />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
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
        :disabled="loading > 0 || auditCategoryTableCurrentRow === null"
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
  all,
  type AuditCategory,
  exists,
  get,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditCategory.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'AuditCategorySelectDialog',
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
  (e: 'onConfirmed', value: AuditCategory): void
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
      auditCategoryTableCurrentRow.value = null
      handleAuditCategorySearch()
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

// region 审计类别搜索

function handleAuditCategorySearch(): void {
  if (idSearchBarValue.value !== '') {
    handleAuditCategoryIdSearch()
  } else {
    handleAuditCategoryAllSearch()
  }
}

async function handleAuditCategoryIdSearch(): Promise<void> {
  loading.value += 1
  try {
    const existed = await resolveResponse(exists({ string_id: idSearchBarValue.value }))
    if (!existed) {
      const empty: PagedData<AuditCategory> = {
        current_page: 0,
        total_pages: 0,
        rows: auditCategoryTablePageSize.value,
        count: '0',
        data: [],
      }
      updateAuditCategoryTableByLookup(empty)
      return
    }
    const item = await resolveResponse(get({ string_id: idSearchBarValue.value }))
    updateAuditCategoryTableByLookup({
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

async function handleAuditCategoryAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      auditCategoryTablePagingInfo.value,
    )
    updateAuditCategoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 审计类别表格处理

const {
  currentPage: auditCategoryTableCurrentPage,
  pageSize: auditCategoryTablePageSize,
  itemCount: auditCategoryTableItemCount,
  items: auditCategoryTableItems,
  pagingInfo: auditCategoryTablePagingInfo,
  updateByLookup: updateAuditCategoryTableByLookup,
} = useIdentityBackendPagingTablePanel<AuditCategory>(5)
const auditCategoryTableCurrentRow = ref<AuditCategory | null>(null)

function enabledFormatter(row: AuditCategory): string {
  return row.enabled ? '是' : '否'
}

function handleAuditCategoryTablePagingAttributeChanged(): void {
  auditCategoryTableCurrentRow.value = null
  handleAuditCategorySearch()
}

function handleAuditCategoryTableCurrentChanged(current: AuditCategory | null): void {
  auditCategoryTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const auditCategory: AuditCategory | null = auditCategoryTableCurrentRow.value
  if (!auditCategory) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  emit('onConfirmed', auditCategory)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const auditCategory: AuditCategory | null = auditCategoryTableCurrentRow.value
  if (!auditCategory) {
    return
  }
  emit('onConfirmed', auditCategory)
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
