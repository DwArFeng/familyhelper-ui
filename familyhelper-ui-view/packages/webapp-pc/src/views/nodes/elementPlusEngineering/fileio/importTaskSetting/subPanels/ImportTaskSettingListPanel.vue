<template>
  <div class="import-task-setting-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowCreateDialog">{{
            t('views.element_plus_engineering.fileio.create_task_setting')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleSearch">{{
            t('views.element_plus_engineering.fileio.refresh_data')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-button type="primary" :disabled="applyChangesDisabled" @click="handleApplyChanges">
            {{ t('views.element_plus_engineering.fileio.apply_changes') }}
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          v-loading="tableLoading"
          highlight-current-row
          v-model:page-size="tablePageSize"
          v-model:current-page="tableCurrentPage"
          :item-count="tableItemCount"
          :items="tableItems"
          :page-sizes="[15, 20, 30, 50]"
          :show-contextmenu="true"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="true"
          :operate-column-width="53"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleSearch"
          @onItemDelete="handleEntityDelete"
          @onCurrentChanged="handleCurrentChanged"
        >
          <el-table-column
            prop="name"
            :label="t('views.element_plus_engineering.fileio.name')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="remark"
            :label="t('views.element_plus_engineering.fileio.remark')"
            show-overflow-tooltip
          />
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li @click="handleCopyKeyContextmenuClicked(row as ImportTaskSetting, close)">
                {{ t('views.element_plus_engineering.fileio.copy_primary_key') }}
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="dialogVisible"
      mode="CREATE"
      :item="dialogItem"
      :loading="dialogLoading"
      :close-on-click-modal="false"
      @onItemCreate="handleEntityCreate"
    >
      <el-form-item :label="t('views.element_plus_engineering.fileio.name')" prop="name"
        ><el-input v-model="dialogItem.name"
      /></el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.fileio.enabled')" prop="enabled"
        ><el-switch
          v-model="dialogItem.enabled"
          :active-text="t('views.element_plus_engineering.fileio.yes')"
          :inactive-text="t('views.element_plus_engineering.fileio.no')"
      /></el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.fileio.remark')" prop="remark"
        ><el-input v-model="dialogItem.remark"
      /></el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'
import {
  all,
  type ImportTaskSetting,
  insert,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/importTaskSetting.ts'
import { resetImport } from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/reset.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ImportTaskSettingListPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: ImportTaskSetting | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

const applyChangesDisabled = ref<boolean>(false)
const currentSetting = ref<ImportTaskSetting | null>(null)

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<ImportTaskSetting>(15)
const tableLoading = ref<number>(0)

const dialogVisible = ref<boolean>(false)
const dialogLoading = ref<boolean>(false)
const dialogItem = ref<{ name: string; enabled: boolean; remark: string }>({
  name: '',
  enabled: true,
  remark: '',
})

async function handleSearch(): Promise<void> {
  tableLoading.value += 1
  try {
    updateTableByLookup(
      await lookupWithAdjustPage((pagingInfo) => all(pagingInfo), tablePagingInfo.value),
    )
  } finally {
    tableLoading.value -= 1
  }
}

function handleCurrentChanged(current: ImportTaskSetting | null): void {
  currentSetting.value = current
  emit('onCurrentChanged', current)
}

function handleShowCreateDialog(): void {
  dialogItem.value = { name: '', enabled: true, remark: '' }
  dialogVisible.value = true
}

async function handleEntityDelete(item: ImportTaskSetting): Promise<void> {
  if (!item.key?.long_id) return
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.fileio.delete_data_point_confirmation'),
      t('views.element_plus_engineering.fileio.prompt'),
      { type: 'warning' },
    )
  } catch {
    return
  }
  tableLoading.value += 1
  try {
    await resolveResponse(remove(item.key.long_id))
    ElMessage({
      showClose: true,
      type: 'success',
      message: t('views.element_plus_engineering.fileio.task_setting_deleted'),
    })
    if (currentSetting.value?.key?.long_id === item.key.long_id) {
      currentSetting.value = null
      emit('onCurrentChanged', null)
    }
    await handleSearch()
  } finally {
    tableLoading.value -= 1
  }
}

async function handleEntityCreate(): Promise<void> {
  dialogLoading.value = true
  try {
    await resolveResponse(
      insert({
        key: { long_id: '' },
        name: dialogItem.value.name,
        enabled: dialogItem.value.enabled,
        remark: dialogItem.value.remark,
      }),
    )
    dialogVisible.value = false
    ElMessage({
      showClose: true,
      type: 'success',
      message: t('views.element_plus_engineering.fileio.task_setting_created'),
    })
    await handleSearch()
  } finally {
    dialogLoading.value = false
  }
}

async function handleCopyKeyContextmenuClicked(
  row: ImportTaskSetting,
  close: () => void,
): Promise<void> {
  close()
  if (!row.key?.long_id) return
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.fileio.copy_succeeded'),
    type: 'success',
  })
}

async function handleApplyChanges(): Promise<void> {
  applyChangesDisabled.value = true
  try {
    await resolveResponse(resetImport())
    ElMessage({
      showClose: true,
      type: 'success',
      message: t('views.element_plus_engineering.fileio.changes_applied'),
    })
  } finally {
    setTimeout(() => {
      applyChangesDisabled.value = false
    }, 3000)
  }
}

onMounted(() => {
  void handleSearch()
})

defineExpose({
  refresh: handleSearch,
})
</script>

<style scoped>
.import-task-setting-list-panel-container {
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
</style>
