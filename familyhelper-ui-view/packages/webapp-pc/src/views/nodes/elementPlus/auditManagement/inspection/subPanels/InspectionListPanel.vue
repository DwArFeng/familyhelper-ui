<template>
  <div class="inspection-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="showInspectionCreateMaintainDialog">
            新建巡检
          </el-button>
          <el-button type="success" @click="handleInspectionSearch">刷新数据</el-button>
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
          ref="inspectionTablePanelRef"
          class="table"
          v-loading="loading"
          highlight-current-row
          v-model:current-page="inspectionTableCurrentPage"
          v-model:page-size="inspectionTablePageSize"
          :item-count="inspectionTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="inspectionTableItems"
          :show-contextmenu="true"
          :edit-button-visible="false"
          inspect-button-label="查看巡检"
          delete-button-label="删除巡检"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleInspectionPagingAttributeChanged"
          @onCurrentChanged="handleInspectionTableCurrentChanged"
          @onItemInspect="handleShowInspectionInspectDialog"
          @onItemDelete="handleInspectionDelete"
        >
          <template v-slot:default>
            <el-table-column prop="key.long_id" label="ID" show-overflow-tooltip />
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
          <template v-slot:contextmenu="{ row, close, fireItemInspect, fireItemDelete }">
            <ul>
              <li @click="handleInspectionCopyKeyContextmenuClicked(row as Inspection, close)">
                复制主键
              </li>
              <el-divider />
              <li @click="fireItemInspect">查看...</li>
              <li @click="fireItemDelete">删除...</li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      label-width="90px"
      v-model:visible="inspectionMaintainDialogVisible"
      :loading="inspectionMaintainDialogLoading"
      :mode="inspectionMaintainDialogMode"
      :item="inspectionMaintainDialogItem"
      :create-rules="inspectionMaintainDialogCreateRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInspectionCreate"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="inspectionMaintainDialogItem.name"
          :readonly="inspectionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="inspectionMaintainDialogItem.enabled"
          :disabled="inspectionMaintainDialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="inspectionMaintainDialogItem.remark"
          :readonly="inspectionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { type ComponentExposed } from 'vue-component-type-helpers'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import {
  all,
  insert,
  type Inspection,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspection.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'InspectionListPanel',
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
  (e: 'onCurrentChanged', inspectionId: string): void
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

// region 巡检搜索

async function handleInspectionSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      inspectionTablePagingInfo.value,
    )
    updateInspectionTableByLookup(res)
    restoreInspectionSelection()
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleInspectionSearch()
})

// endregion

// region 巡检表格处理

const inspectionTablePanelRef =
  useTemplateRef<ComponentExposed<typeof TablePanel>>('inspectionTablePanelRef')
const currentInspectionId = ref<string>('')
const {
  currentPage: inspectionTableCurrentPage,
  pageSize: inspectionTablePageSize,
  itemCount: inspectionTableItemCount,
  items: inspectionTableItems,
  pagingInfo: inspectionTablePagingInfo,
  updateByLookup: updateInspectionTableByLookup,
} = useIdentityBackendPagingTablePanel<Inspection>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: Inspection, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
}

function handleInspectionPagingAttributeChanged(): void {
  handleInspectionSearch()
}

function handleInspectionTableCurrentChanged(item: Inspection | null): void {
  if (!item) {
    return
  }
  currentInspectionId.value = item.key.long_id
  emit('onCurrentChanged', item.key.long_id)
}

function restoreInspectionSelection(): void {
  const selected = inspectionTableItems.value.find(
    (item) => item.key.long_id === currentInspectionId.value,
  )
  if (selected) {
    emit('onCurrentChanged', selected.key.long_id)
    void nextTick(() => inspectionTablePanelRef.value?.setCurrentRow(selected))
    return
  }
  const first = inspectionTableItems.value[0]
  if (!first) {
    currentInspectionId.value = ''
    emit('onCurrentChanged', '')
    return
  }
  currentInspectionId.value = first.key.long_id
  emit('onCurrentChanged', first.key.long_id)
  void nextTick(() => inspectionTablePanelRef.value?.setCurrentRow(first))
}

async function handleInspectionCopyKeyContextmenuClicked(
  row: Inspection,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: '复制成功',
    type: 'success',
  })
}

function handleShowInspectionInspectDialog(item: Inspection): void {
  showInspectionInspectMaintainDialog(item)
}

async function handleInspectionDelete(item: Inspection): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此巡检定义，以及其检查器、变量和驱动配置。<br>是否继续?',
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
      message: `巡检定义 ${item.key.long_id} 删除成功`,
      type: 'success',
    })
    if (currentInspectionId.value === item.key.long_id) {
      currentInspectionId.value = ''
    }
    await handleInspectionSearch()
  } finally {
    loading.value -= 1
  }
}

function applyPatch(item: Inspection): void {
  const index = inspectionTableItems.value.findIndex((row) => row.key.long_id === item.key.long_id)
  if (index >= 0) {
    inspectionTableItems.value.splice(index, 1, item)
  }
}

// endregion

// region 巡检维护对话框处理

type InspectionMaintainDialogItem = {
  name: string
  enabled: boolean
  remark: string
}

const {
  visible: inspectionMaintainDialogVisible,
  item: inspectionMaintainDialogItem,
  mode: inspectionMaintainDialogMode,
  showCreateDialog: showInspectionCreateMaintainDialog,
  showInspectDialog: showInspectionInspectMaintainDialog,
} = useGeneralMaintainDialog<Inspection, InspectionMaintainDialogItem>(
  inspectionMaintainDialogItemMap,
  {
    name: '',
    enabled: true,
    remark: '',
  },
)
const inspectionMaintainDialogLoading = ref<number>(0)
const inspectionMaintainDialogCreateRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

function inspectionMaintainDialogItemMap(t: Inspection): InspectionMaintainDialogItem {
  return {
    name: t.name,
    enabled: t.enabled,
    remark: t.remark,
  }
}

async function handleInspectionCreate(item: InspectionMaintainDialogItem): Promise<void> {
  inspectionMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        name: item.name,
        enabled: item.enabled,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '巡检定义创建成功',
      type: 'success',
    })
    await handleInspectionSearch()
    inspectionMaintainDialogVisible.value = false
  } finally {
    inspectionMaintainDialogLoading.value -= 1
  }
}

// endregion

// region Expose

defineExpose({
  applyPatch,
  refresh: handleInspectionSearch,
})

// endregion
</script>

<style scoped>
.inspection-list-panel-container {
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
