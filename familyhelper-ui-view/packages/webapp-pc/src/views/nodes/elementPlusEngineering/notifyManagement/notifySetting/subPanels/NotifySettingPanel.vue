<template>
  <div class="notify-setting-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowNotifySettingCreateDialog">
            {{ t('views.element_plus_engineering.notify_management.create_notify_setting') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleNotifySettingSearch">{{
            t('views.element_plus_engineering.notify_management.refresh_data')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            {{ t('views.element_plus_engineering.notify_management.apply_changes') }}
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="notifySettingTableCurrentPage"
          v-model:page-size="notifySettingTablePageSize"
          highlight-current-row
          :item-count="notifySettingTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="notifySettingTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleNotifySettingTablePagingAttributeChanged"
          @onCurrentChanged="handleNotifySettingTableCurrentChanged"
          @onItemInspect="handleShowNotifySettingInspectDialog"
          @onItemEdit="handleShowNotifySettingEditDialog"
          @onItemDelete="handleNotifySettingDeleteButtonClicked"
        >
          <template v-slot:default>
            <el-table-column
              prop="label"
              :label="t('views.element_plus_engineering.notify_management.name')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="enabled"
              :label="t('views.element_plus_engineering.notify_management.enabled')"
              width="55px"
              :formatter="notifySettingTableBooleanFormatter"
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.notify_management.remark')"
              show-overflow-tooltip
            />
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li
                @click="
                  handleNotifySettingTableCopyKeyContextmenuClicked(row as NotifySetting, close)
                "
              >
                {{ t('views.element_plus_engineering.notify_management.copy_primary_key') }}
              </li>
              <el-divider />
              <li
                @click="
                  handleNotifySettingTableInspectContextmenuClicked(row as NotifySetting, close)
                "
              >
                {{ t('views.element_plus_engineering.notify_management.inspect_ellipsis') }}
              </li>
              <li
                @click="handleNotifySettingTableEditContextmenuClicked(row as NotifySetting, close)"
              >
                {{ t('views.element_plus_engineering.notify_management.edit_ellipsis') }}
              </li>
              <li
                @click="
                  handleNotifySettingTableDeleteContextmenuClicked(row as NotifySetting, close)
                "
              >
                {{ t('views.element_plus_engineering.notify_management.delete_ellipsis') }}
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="notifySettingMaintainDialogVisible"
      top="10vh"
      :loading="notifySettingMaintainDialogLoading"
      :mode="notifySettingMaintainDialogMode"
      :item="notifySettingMaintainDialogItem"
      :create-rules="notifySettingMaintainDialogRules"
      :edit-rules="notifySettingMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleNotifySettingCreate"
      @onItemEdit="handleNotifySettingEdit"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.name')"
        prop="label"
      >
        <el-input
          v-model="notifySettingMaintainDialogItem.label"
          :readonly="notifySettingMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.enabled')"
        prop="enabled"
      >
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="notifySettingMaintainDialogItem.enabled"
          :active-text="t('views.element_plus_engineering.notify_management.yes')"
          :inactive-text="t('views.element_plus_engineering.notify_management.no')"
          :disabled="notifySettingMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.remark')"
        prop="remark"
      >
        <el-input
          v-model="notifySettingMaintainDialogItem.remark"
          :readonly="notifySettingMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'
import { type NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import {
  all,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import { resetRoute } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/reset.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'NotifySettingPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentNotifySettingChanged', value: NotifySetting | null): void
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

const applyChangesButtonDisabled = ref<boolean>(false)

function handleShowNotifySettingCreateDialog(): void {
  showNotifySettingCreateMaintainDialog()
}

async function handleApplyChanges(): Promise<void> {
  applyChangesButtonDisabled.value = true
  try {
    await resolveResponse(resetRoute())
    ElMessage({
      showClose: true,
      message: t(
        'views.element_plus_engineering.notify_management.changes_applied_backend_refreshing',
      ),
      type: 'success',
    })
  } finally {
    setTimeout(() => {
      applyChangesButtonDisabled.value = false
    }, 3000)
  }
}

// endregion

// region 通知设置查询

function handleNotifySettingSearch(): void {
  handleNotifySettingAllSearch()
}

async function handleNotifySettingAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      notifySettingTablePagingInfo.value,
    )
    updateNotifySettingTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleNotifySettingSearch()
})

// endregion

// region 通知设置表格

const {
  currentPage: notifySettingTableCurrentPage,
  pageSize: notifySettingTablePageSize,
  itemCount: notifySettingTableItemCount,
  items: notifySettingTableItems,
  pagingInfo: notifySettingTablePagingInfo,
  updateByLookup: updateNotifySettingTableByLookup,
} = useIdentityBackendPagingTablePanel<NotifySetting>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifySettingTableBooleanFormatter(row: NotifySetting, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: boolean = (row as any)[column.property] as boolean
  return value
    ? t('views.element_plus_engineering.notify_management.yes')
    : t('views.element_plus_engineering.notify_management.no')
}

function handleNotifySettingTablePagingAttributeChanged(): void {
  handleNotifySettingSearch()
}

function handleNotifySettingTableCurrentChanged(current: NotifySetting | null): void {
  emit('onCurrentNotifySettingChanged', current)
}

async function handleNotifySettingTableCopyKeyContextmenuClicked(
  row: NotifySetting,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.notify_management.copy_succeeded'),
    type: 'success',
  })
}

function handleShowNotifySettingInspectDialog(row: NotifySetting): void {
  showNotifySettingInspectMaintainDialog(row)
}

function handleNotifySettingTableInspectContextmenuClicked(
  row: NotifySetting,
  close: () => void,
): void {
  close()
  showNotifySettingInspectMaintainDialog(row)
}

function handleShowNotifySettingEditDialog(row: NotifySetting): void {
  showNotifySettingEditMaintainDialog(row)
}

function handleNotifySettingTableEditContextmenuClicked(
  row: NotifySetting,
  close: () => void,
): void {
  close()
  showNotifySettingEditMaintainDialog(row)
}

function handleNotifySettingDeleteButtonClicked(row: NotifySetting): void {
  handleNotifySettingDelete(row)
}

function handleNotifySettingTableDeleteContextmenuClicked(
  row: NotifySetting,
  close: () => void,
): void {
  close()
  handleNotifySettingDelete(row)
}

async function handleNotifySettingDelete(row: NotifySetting): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t(
        'views.element_plus_engineering.notify_management.delete_notify_setting_confirmation_prefix',
      ) +
        t('views.element_plus_engineering.notify_management.operation_irreversible_warning') +
        t('views.element_plus_engineering.notify_management.continue_confirmation'),
      t('views.element_plus_engineering.notify_management.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.notify_management.confirm'),
        cancelButtonText: t('views.element_plus_engineering.notify_management.cancel'),
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
    await resolveResponse(remove(row.key))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.notify_management.notify_setting_deleted', {
        settingLabel: row.label,
      }),
      type: 'success',
    })
    handleNotifySettingSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 通知设置维护对话框

type NotifySettingMaintainDialogItem = {
  key_long_id: string
  label: string
  remark: string
  enabled: boolean
}

const {
  visible: notifySettingMaintainDialogVisible,
  item: notifySettingMaintainDialogItem,
  mode: notifySettingMaintainDialogMode,
  showCreateDialog: showNotifySettingCreateMaintainDialog,
  showEditDialog: showNotifySettingEditMaintainDialog,
  showInspectDialog: showNotifySettingInspectMaintainDialog,
} = useGeneralMaintainDialog<NotifySetting, NotifySettingMaintainDialogItem>(
  notifySettingMaintainDialogItemMap,
  {
    key_long_id: '',
    label: '',
    remark: '',
    enabled: false,
  },
)
const notifySettingMaintainDialogLoading = ref<number>(0)
const notifySettingMaintainDialogRules = ref({
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.notify_management.name_required'),
      trigger: 'blur',
    },
  ],
})

function notifySettingMaintainDialogItemMap(t: NotifySetting): NotifySettingMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    label: t.label,
    remark: t.remark,
    enabled: t.enabled,
  }
}

async function handleNotifySettingCreate(item: NotifySettingMaintainDialogItem): Promise<void> {
  notifySettingMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        label: item.label,
        remark: item.remark,
        enabled: item.enabled,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.notify_management.notify_setting_created', {
        settingLabel: item.label,
      }),
      type: 'success',
    })
    handleNotifySettingSearch()
    notifySettingMaintainDialogVisible.value = false
  } finally {
    notifySettingMaintainDialogLoading.value -= 1
  }
}

async function handleNotifySettingEdit(item: NotifySettingMaintainDialogItem): Promise<void> {
  notifySettingMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.key_long_id },
        label: item.label,
        remark: item.remark,
        enabled: item.enabled,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.notify_management.notify_setting_updated', {
        settingLabel: item.label,
      }),
      type: 'success',
    })
    handleNotifySettingSearch()
    notifySettingMaintainDialogVisible.value = false
  } finally {
    notifySettingMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.notify-setting-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.focusable-switch:focus {
  outline: none;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
