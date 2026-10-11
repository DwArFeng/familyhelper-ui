<template>
  <div class="inspection-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="showInspectionCreateMaintainDialog">
            {{ t('views.element_plus_engineering.audit_management.create_inspection') }}
          </el-button>
          <el-button type="success" @click="handleInspectionSearch">{{
            t('views.element_plus_engineering.audit_management.refresh_data')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesDisabled"
            @click="handleApplyChangesClicked"
          >
            {{ t('views.element_plus_engineering.audit_management.apply_changes') }}
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
          :inspect-button-label="
            t('views.element_plus_engineering.audit_management.inspect_inspection')
          "
          :delete-button-label="
            t('views.element_plus_engineering.audit_management.delete_inspection')
          "
          :operate-column-width="80"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleInspectionPagingAttributeChanged"
          @onCurrentChanged="handleInspectionTableCurrentChanged"
          @onItemInspect="handleShowInspectionInspectDialog"
          @onItemDelete="handleInspectionDelete"
        >
          <template v-slot:default>
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
              show-overflow-tooltip
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.audit_management.remark')"
              show-overflow-tooltip
            />
          </template>
          <template v-slot:contextmenu="{ row, close, fireItemInspect, fireItemDelete }">
            <ul>
              <li @click="handleInspectionCopyKeyContextmenuClicked(row as Inspection, close)">
                {{ t('views.element_plus_engineering.audit_management.copy_primary_key') }}
              </li>
              <el-divider />
              <li @click="fireItemInspect">
                {{ t('views.element_plus_engineering.audit_management.inspect_ellipsis') }}
              </li>
              <li @click="fireItemDelete">
                {{ t('views.element_plus_engineering.audit_management.delete_ellipsis') }}
              </li>
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
      <el-form-item :label="t('views.element_plus_engineering.audit_management.name')" prop="name">
        <el-input
          v-model="inspectionMaintainDialogItem.name"
          :readonly="inspectionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.enabled_state')"
        prop="enabled"
      >
        <el-switch
          v-model="inspectionMaintainDialogItem.enabled"
          :disabled="inspectionMaintainDialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.audit_management.yes')"
          :inactive-text="t('views.element_plus_engineering.audit_management.no')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.remark')"
        prop="remark"
      >
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

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  all,
  insert,
  type Inspection,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspection.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

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

// region I18n 引入

const { t } = useI18n()

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
  return ((row as Record<string, unknown>)[column.property] as boolean)
    ? t('views.element_plus_engineering.audit_management.yes')
    : t('views.element_plus_engineering.audit_management.no')
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
    message: t('views.element_plus_engineering.audit_management.copy_succeeded'),
    type: 'success',
  })
}

function handleShowInspectionInspectDialog(item: Inspection): void {
  showInspectionInspectMaintainDialog(item)
}

async function handleInspectionDelete(item: Inspection): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.audit_management.delete_inspection_confirmation'),
      t('views.element_plus_engineering.audit_management.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.audit_management.ok'),
        cancelButtonText: t('views.element_plus_engineering.audit_management.cancel'),
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
      message: t('views.element_plus_engineering.audit_management.inspection_deleted', {
        inspectionId: item.key.long_id,
      }),
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
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.name_required'),
      trigger: 'blur',
    },
  ],
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
      message: t('views.element_plus_engineering.audit_management.inspection_created'),
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
