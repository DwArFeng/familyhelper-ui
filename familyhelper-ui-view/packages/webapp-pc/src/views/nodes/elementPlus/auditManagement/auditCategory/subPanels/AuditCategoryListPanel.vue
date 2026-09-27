<template>
  <div class="audit-category-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="showAuditCategoryCreateMaintainDialog"
          >
            新建类别
          </el-button>
          <el-button type="success" @click="handleAuditCategorySearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-input
            class="search-bar"
            v-model="searchBarValue"
            clearable
            @keydown.enter="handleAuditCategorySearch"
            @clear="handleAuditCategorySearch"
          >
            <template v-slot:prepend>
              <el-select
                class="search-field-select"
                v-model="searchField"
                @change="handleAuditCategorySearch"
              >
                <el-option label="类别 ID" value="ID" />
                <el-option label="名称" value="NAME" />
              </el-select>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleAuditCategorySearch" />
            </template>
          </el-input>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesDisabled"
            @click="handleApplyChangesClicked"
          >
            应用变更
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          ref="auditCategoryTablePanelRef"
          class="table"
          v-loading="loading"
          pagination-adjust-strategy="FORCE_COMPACT"
          highlight-current-row
          v-model:current-page="auditCategoryTableCurrentPage"
          v-model:page-size="auditCategoryTablePageSize"
          :item-count="auditCategoryTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="auditCategoryTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleAuditCategoryPagingAttributeChanged"
          @onCurrentChanged="handleAuditCategoryTableCurrentChanged"
          @onItemInspect="handleShowAuditCategoryInspectDialog"
          @onItemEdit="handleShowAuditCategoryEditDialog"
          @onItemDelete="handleAuditCategoryDelete"
        >
          <template v-slot:default>
            <el-table-column prop="key.string_id" label="类别 ID" show-overflow-tooltip />
            <el-table-column prop="name" label="名称" show-overflow-tooltip />
            <el-table-column
              prop="enabled"
              label="使能"
              width="55px"
              :formatter="enabledFormatter"
              show-overflow-tooltip
            />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </template>
          <template
            v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
          >
            <ul>
              <li
                @click="handleAuditCategoryCopyKeyContextmenuClicked(row as AuditCategory, close)"
              >
                复制主键
              </li>
              <el-divider />
              <li @click="fireItemInspect">查看...</li>
              <li @click="fireItemEdit">编辑...</li>
              <li @click="fireItemDelete">删除...</li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      label-width="90px"
      v-model:visible="auditCategoryMaintainDialogVisible"
      :loading="auditCategoryMaintainDialogLoading"
      :mode="auditCategoryMaintainDialogMode"
      :item="auditCategoryMaintainDialogItem"
      :create-rules="auditCategoryMaintainDialogCreateRules"
      :edit-rules="auditCategoryMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleAuditCategoryCreate"
      @onItemEdit="handleAuditCategoryEdit"
    >
      <el-form-item label="类别 ID" prop="key_string_id">
        <el-input
          v-model="auditCategoryMaintainDialogItem.key_string_id"
          :readonly="auditCategoryMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="auditCategoryMaintainDialogItem.name"
          :readonly="auditCategoryMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="auditCategoryMaintainDialogItem.enabled"
          :disabled="auditCategoryMaintainDialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="auditCategoryMaintainDialogItem.remark"
          :readonly="auditCategoryMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import { type ComponentExposed } from 'vue-component-type-helpers'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import {
  all,
  type AuditCategory,
  exists,
  idLike,
  insert,
  nameLike,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditCategory.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'AuditCategoryListPanel',
})

// region Props 定义

type Props = {
  applyChangesDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', categoryId: string): void
  (e: 'onApplyChanges'): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

function handleApplyChangesClicked(): void {
  emit('onApplyChanges')
}

// endregion

// region 审计类别搜索

type AuditCategorySearchField = 'ID' | 'NAME'

const searchField = ref<AuditCategorySearchField>('ID')
const searchBarValue = ref<string>('')

async function handleAuditCategorySearch(): Promise<void> {
  // 未输入关键字时查询全部数据，否则按照下拉框中选择的字段进行模糊查询。
  const pattern = searchBarValue.value.trim()
  if (pattern === '') {
    await handleAuditCategoryAllSearch()
  } else if (searchField.value === 'ID') {
    await handleAuditCategoryIdLikeSearch(pattern)
  } else {
    await handleAuditCategoryNameLikeSearch(pattern)
  }
}

async function handleAuditCategoryIdLikeSearch(pattern: string): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => idLike(pattern, pagingInfo),
      auditCategoryTablePagingInfo.value,
    )
    updateAuditCategoryTableByLookup(res)
    restoreAuditCategorySelection()
  } finally {
    loading.value -= 1
  }
}

async function handleAuditCategoryNameLikeSearch(pattern: string): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => nameLike(pattern, pagingInfo),
      auditCategoryTablePagingInfo.value,
    )
    updateAuditCategoryTableByLookup(res)
    restoreAuditCategorySelection()
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
    restoreAuditCategorySelection()
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleAuditCategorySearch()
})

// endregion

// region 审计类别表格处理

const auditCategoryTablePanelRef = useTemplateRef<ComponentExposed<typeof TablePanel>>(
  'auditCategoryTablePanelRef',
)
const currentCategoryId = ref<string>('')
const {
  currentPage: auditCategoryTableCurrentPage,
  pageSize: auditCategoryTablePageSize,
  itemCount: auditCategoryTableItemCount,
  items: auditCategoryTableItems,
  pagingInfo: auditCategoryTablePagingInfo,
  updateByLookup: updateAuditCategoryTableByLookup,
} = useIdentityBackendPagingTablePanel<AuditCategory>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: AuditCategory, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
}

function handleAuditCategoryPagingAttributeChanged(): void {
  handleAuditCategorySearch()
}

function handleAuditCategoryTableCurrentChanged(item: AuditCategory | null): void {
  if (!item) {
    return
  }
  currentCategoryId.value = item.key.string_id
  emit('onCurrentChanged', item.key.string_id)
}

function restoreAuditCategorySelection(): void {
  const selected = auditCategoryTableItems.value.find(
    (item) => item.key.string_id === currentCategoryId.value,
  )
  if (selected) {
    emit('onCurrentChanged', selected.key.string_id)
    void nextTick(() => auditCategoryTablePanelRef.value?.setCurrentRow(selected))
    return
  }
  const first = auditCategoryTableItems.value[0]
  if (!first) {
    currentCategoryId.value = ''
    emit('onCurrentChanged', '')
    return
  }
  currentCategoryId.value = first.key.string_id
  emit('onCurrentChanged', first.key.string_id)
  void nextTick(() => auditCategoryTablePanelRef.value?.setCurrentRow(first))
}

async function handleAuditCategoryCopyKeyContextmenuClicked(
  row: AuditCategory,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.string_id)
  ElMessage({
    showClose: true,
    message: '复制成功',
    type: 'success',
  })
}

function handleShowAuditCategoryInspectDialog(item: AuditCategory): void {
  showAuditCategoryInspectMaintainDialog(item)
}

function handleShowAuditCategoryEditDialog(item: AuditCategory): void {
  showAuditCategoryEditMaintainDialog(item)
}

async function handleAuditCategoryDelete(item: AuditCategory): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此审计类别，以及该类别下的全部属性。<br>' +
        '删除后，已落地的审计记录不会被级联删除，但按类别查询将无法命中该类别。<br>' +
        '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `审计类别 ${item.key.string_id} 删除成功`,
      type: 'success',
    })
    if (currentCategoryId.value === item.key.string_id) {
      currentCategoryId.value = ''
    }
    await handleAuditCategorySearch()
  } finally {
    loading.value -= 1
  }
}

function applyPatch(category: AuditCategory): void {
  const items = auditCategoryTableItems.value
  const index = items.findIndex((item) => item.key.string_id === category.key.string_id)
  if (index >= 0) {
    items.splice(index, 1, category)
  }
}

// endregion

// region 审计类别维护对话框处理

type AuditCategoryMaintainDialogItem = {
  key_string_id: string
  name: string
  enabled: boolean
  remark: string
}

const {
  visible: auditCategoryMaintainDialogVisible,
  item: auditCategoryMaintainDialogItem,
  mode: auditCategoryMaintainDialogMode,
  showCreateDialog: showAuditCategoryCreateMaintainDialog,
  showEditDialog: showAuditCategoryEditMaintainDialog,
  showInspectDialog: showAuditCategoryInspectMaintainDialog,
} = useGeneralMaintainDialog<AuditCategory, AuditCategoryMaintainDialogItem>(
  auditCategoryMaintainDialogItemMap,
  {
    key_string_id: '',
    name: '',
    enabled: true,
    remark: '',
  },
)
const auditCategoryMaintainDialogLoading = ref<number>(0)
const auditCategoryMaintainDialogKeyValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('类别 ID 不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('类别 ID 已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const auditCategoryMaintainDialogCreateRules = ref({
  key_string_id: [
    {
      validator: auditCategoryMaintainDialogKeyValidator,
      trigger: 'blur',
    },
    { required: true, message: '类别 ID 不能为空', trigger: 'blur' },
  ],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})
const auditCategoryMaintainDialogEditRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

function auditCategoryMaintainDialogItemMap(t: AuditCategory): AuditCategoryMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    name: t.name,
    enabled: t.enabled,
    remark: t.remark,
  }
}

async function handleAuditCategoryCreate(item: AuditCategoryMaintainDialogItem): Promise<void> {
  auditCategoryMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: { string_id: item.key_string_id },
        name: item.name,
        enabled: item.enabled,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `审计类别 ${item.key_string_id} 创建成功`,
      type: 'success',
    })
    await handleAuditCategorySearch()
    auditCategoryMaintainDialogVisible.value = false
  } finally {
    auditCategoryMaintainDialogLoading.value -= 1
  }
}

async function handleAuditCategoryEdit(item: AuditCategoryMaintainDialogItem): Promise<void> {
  auditCategoryMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { string_id: item.key_string_id },
        name: item.name,
        enabled: item.enabled,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `审计类别 ${item.key_string_id} 更新成功`,
      type: 'success',
    })
    await handleAuditCategorySearch()
    auditCategoryMaintainDialogVisible.value = false
  } finally {
    auditCategoryMaintainDialogLoading.value -= 1
  }
}

// endregion

// region Expose

defineExpose({
  applyPatch,
  refresh: handleAuditCategorySearch,
})

// endregion
</script>

<style scoped>
.audit-category-list-panel-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
}

.header-container .search-bar {
  width: 0;
  min-width: 400px;
  flex-grow: 1;
}

.header-container .search-field-select {
  width: 100px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
