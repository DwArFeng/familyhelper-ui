<template>
  <div class="section-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="showSectionCreateMaintainDialog">{{
            t('views.element_plus_engineering.logic_engine.create_section')
          }}</el-button>
          <el-button type="success" @click="handleSectionSearch">{{
            t('views.element_plus_engineering.logic_engine.refresh_data')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesDisabled"
            @click="handleApplyChangesClicked"
          >
            {{ t('views.element_plus_engineering.logic_engine.apply_changes') }}
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          ref="sectionTablePanelRef"
          class="table"
          v-loading="loading"
          highlight-current-row
          v-model:current-page="sectionTableCurrentPage"
          v-model:page-size="sectionTablePageSize"
          :item-count="sectionTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="sectionTableItems"
          :show-contextmenu="true"
          :edit-button-visible="false"
          :inspect-button-label="t('views.element_plus_engineering.logic_engine.inspect_section')"
          :delete-button-label="t('views.element_plus_engineering.logic_engine.delete_section')"
          :operate-column-width="80"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleSectionPagingAttributeChanged"
          @onCurrentChanged="handleSectionTableCurrentChanged"
          @onItemInspect="handleShowSectionInspectDialog"
          @onItemDelete="handleSectionDelete"
        >
          <template v-slot:default>
            <el-table-column
              prop="name"
              :label="t('views.element_plus_engineering.logic_engine.name')"
              min-width="80"
              show-overflow-tooltip
            />
            <el-table-column
              prop="enabled"
              :label="t('views.element_plus_engineering.logic_engine.enabled')"
              width="70"
              :formatter="enabledFormatter"
              show-overflow-tooltip
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.logic_engine.remark')"
              min-width="80"
              show-overflow-tooltip
            />
          </template>
          <template v-slot:contextmenu="{ row, close, fireItemInspect, fireItemDelete }">
            <ul>
              <li @click="handleSectionManualDispatchContextmenuClicked(row as Section, close)">
                {{ t('views.element_plus_engineering.logic_engine.execute_manually') }}
              </li>
              <el-divider />
              <li @click="handleSectionCopyKeyContextmenuClicked(row as Section, close)">
                {{ t('views.element_plus_engineering.logic_engine.copy_primary_key') }}
              </li>
              <el-divider />
              <li @click="fireItemInspect">
                {{ t('views.element_plus_engineering.logic_engine.inspect_ellipsis') }}
              </li>
              <li @click="fireItemDelete">
                {{ t('views.element_plus_engineering.logic_engine.delete_ellipsis') }}
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      label-width="120px"
      v-model:visible="sectionMaintainDialogVisible"
      :loading="sectionMaintainDialogLoading"
      :mode="sectionMaintainDialogMode"
      :item="sectionMaintainDialogItem"
      :create-rules="sectionMaintainDialogCreateRules"
      :close-on-click-modal="false"
      @onItemCreate="handleSectionCreate"
    >
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.name')" prop="name">
        <el-input
          v-model="sectionMaintainDialogItem.name"
          :readonly="sectionMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.enabled')"
        prop="enabled"
      >
        <el-switch
          v-model="sectionMaintainDialogItem.enabled"
          :disabled="sectionMaintainDialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.logic_engine.yes')"
          :inactive-text="t('views.element_plus_engineering.logic_engine.no')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.task_start_timeout')"
        prop="expire_timeout"
      >
        <el-input
          v-model="sectionMaintainDialogItem.expire_timeout"
          :readonly="sectionMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>{{
            t('views.element_plus_engineering.logic_engine.milliseconds')
          }}</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.remark')" prop="remark">
        <el-input
          v-model="sectionMaintainDialogItem.remark"
          :readonly="sectionMaintainDialogMode === 'INSPECT'"
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
  remove,
  type Section,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/section.ts'
import { dispatch as manualDispatch } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/manualDispatch.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SectionListPanel',
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
  (e: 'onCurrentChanged', sectionId: string): void
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

// region 部件搜索

async function handleSectionSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      sectionTablePagingInfo.value,
    )
    updateSectionTableByLookup(res)
    restoreSectionSelection()
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSectionSearch()
})

// endregion

// region 部件表格处理

const sectionTablePanelRef =
  useTemplateRef<ComponentExposed<typeof TablePanel>>('sectionTablePanelRef')
const currentSectionId = ref<string>('')
const {
  currentPage: sectionTableCurrentPage,
  pageSize: sectionTablePageSize,
  itemCount: sectionTableItemCount,
  items: sectionTableItems,
  pagingInfo: sectionTablePagingInfo,
  updateByLookup: updateSectionTableByLookup,
} = useIdentityBackendPagingTablePanel<Section>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: Section, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean)
    ? t('views.element_plus_engineering.logic_engine.yes')
    : t('views.element_plus_engineering.logic_engine.no')
}

function handleSectionPagingAttributeChanged(): void {
  handleSectionSearch()
}

function handleSectionTableCurrentChanged(item: Section | null): void {
  if (!item) {
    return
  }
  currentSectionId.value = item.key.long_id
  emit('onCurrentChanged', item.key.long_id)
}

function restoreSectionSelection(): void {
  const selected = sectionTableItems.value.find(
    (item) => item.key.long_id === currentSectionId.value,
  )
  if (selected) {
    emit('onCurrentChanged', selected.key.long_id)
    void nextTick(() => sectionTablePanelRef.value?.setCurrentRow(selected))
    return
  }
  const first = sectionTableItems.value[0]
  if (!first) {
    currentSectionId.value = ''
    emit('onCurrentChanged', '')
    return
  }
  currentSectionId.value = first.key.long_id
  emit('onCurrentChanged', first.key.long_id)
  void nextTick(() => sectionTablePanelRef.value?.setCurrentRow(first))
}

async function handleSectionCopyKeyContextmenuClicked(
  row: Section,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.logic_engine.copy_succeeded'),
    type: 'success',
  })
}

async function handleSectionManualDispatchContextmenuClicked(
  row: Section,
  close: () => void,
): Promise<void> {
  close()
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.logic_engine.execute_section_manually_confirmation'),
      t('views.element_plus_engineering.logic_engine.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.logic_engine.ok'),
        cancelButtonText: t('views.element_plus_engineering.logic_engine.cancel'),
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(manualDispatch({ section_key: row.key }))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.manual_execution_succeeded'),
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
}

function handleShowSectionInspectDialog(item: Section): void {
  showSectionInspectMaintainDialog(item)
}

async function handleSectionDelete(item: Section): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.logic_engine.delete_section_confirmation'),
      t('views.element_plus_engineering.logic_engine.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.logic_engine.ok'),
        cancelButtonText: t('views.element_plus_engineering.logic_engine.cancel'),
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
      message: t('views.element_plus_engineering.logic_engine.section_deleted'),
      type: 'success',
    })
    if (currentSectionId.value === item.key.long_id) {
      currentSectionId.value = ''
    }
    await handleSectionSearch()
  } finally {
    loading.value -= 1
  }
}

function applyPatch(item: Section): void {
  const index = sectionTableItems.value.findIndex((row) => row.key.long_id === item.key.long_id)
  if (index >= 0) {
    sectionTableItems.value.splice(index, 1, item)
  }
}

// endregion

// region 部件维护对话框处理

type SectionMaintainDialogItem = {
  name: string
  enabled: boolean
  expire_timeout: string
  remark: string
}

const {
  visible: sectionMaintainDialogVisible,
  item: sectionMaintainDialogItem,
  mode: sectionMaintainDialogMode,
  showCreateDialog: showSectionCreateMaintainDialog,
  showInspectDialog: showSectionInspectMaintainDialog,
} = useGeneralMaintainDialog<Section, SectionMaintainDialogItem>(sectionMaintainDialogItemMap, {
  name: '',
  enabled: true,
  expire_timeout: '0',
  remark: '',
})
const sectionMaintainDialogLoading = ref<number>(0)
const sectionMaintainDialogCreateRules = ref({
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.name_required'),
      trigger: 'blur',
    },
  ],
  expire_timeout: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.task_start_timeout_required'),
      trigger: 'blur',
    },
  ],
})

function sectionMaintainDialogItemMap(t: Section): SectionMaintainDialogItem {
  return {
    name: t.name,
    enabled: t.enabled,
    expire_timeout: t.expire_timeout,
    remark: t.remark,
  }
}

async function handleSectionCreate(item: SectionMaintainDialogItem): Promise<void> {
  sectionMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        name: item.name,
        enabled: item.enabled,
        expire_timeout: item.expire_timeout,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.section_created'),
      type: 'success',
    })
    await handleSectionSearch()
    sectionMaintainDialogVisible.value = false
  } finally {
    sectionMaintainDialogLoading.value -= 1
  }
}

// endregion

// region Expose

defineExpose({
  applyPatch,
  refresh: handleSectionSearch,
})

// endregion
</script>

<style scoped>
.section-list-panel-container {
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
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
