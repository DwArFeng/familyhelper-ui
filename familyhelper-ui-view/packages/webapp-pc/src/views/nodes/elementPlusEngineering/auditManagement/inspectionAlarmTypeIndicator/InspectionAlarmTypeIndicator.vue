<template>
  <div class="inspection-alarm-type-indicator-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="showInspectionAlarmTypeIndicatorCreateMaintainDialog"
          >
            {{ t('views.element_plus_engineering.audit_management.create_type') }}
          </el-button>
          <el-button type="success" @click="handleInspectionAlarmTypeIndicatorSearch">
            {{ t('views.element_plus_engineering.audit_management.refresh_data') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-input
            class="id-search-bar"
            v-model="idSearchBarValue"
            clearable
            @keydown.enter="handleInspectionAlarmTypeIndicatorSearch"
            @clear="handleInspectionAlarmTypeIndicatorSearch"
          >
            <template v-slot:prepend>
              <span>{{ t('views.element_plus_engineering.audit_management.type_id') }}</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleInspectionAlarmTypeIndicatorSearch" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="inspectionAlarmTypeIndicatorTableCurrentPage"
          v-model:page-size="inspectionAlarmTypeIndicatorTablePageSize"
          :item-count="inspectionAlarmTypeIndicatorTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="inspectionAlarmTypeIndicatorTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleInspectionAlarmTypeIndicatorPagingAttributeChanged"
          @onItemInspect="handleShowInspectionAlarmTypeIndicatorInspectDialog"
          @onItemEdit="handleShowInspectionAlarmTypeIndicatorEditDialog"
          @onItemDelete="handleInspectionAlarmTypeIndicatorDelete"
        >
          <template v-slot:default>
            <el-table-column
              prop="key.string_id"
              :label="t('views.element_plus_engineering.audit_management.type_id')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="label"
              :label="t('views.element_plus_engineering.audit_management.label')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.audit_management.remark')"
              show-overflow-tooltip
            />
          </template>
          <template
            v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
          >
            <ul>
              <li
                @click="
                  handleInspectionAlarmTypeIndicatorCopyKeyContextmenuClicked(
                    row as InspectionAlarmTypeIndicator,
                    close,
                  )
                "
              >
                {{ t('views.element_plus_engineering.audit_management.copy_primary_key') }}
              </li>
              <el-divider />
              <li @click="fireItemInspect">
                {{ t('views.element_plus_engineering.audit_management.inspect_ellipsis') }}
              </li>
              <li @click="fireItemEdit">
                {{ t('views.element_plus_engineering.audit_management.edit_ellipsis') }}
              </li>
              <li @click="fireItemDelete">
                {{ t('views.element_plus_engineering.audit_management.delete_ellipsis') }}
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      label-width="90px"
      v-model:visible="inspectionAlarmTypeIndicatorMaintainDialogVisible"
      :loading="inspectionAlarmTypeIndicatorMaintainDialogLoading"
      :mode="inspectionAlarmTypeIndicatorMaintainDialogMode"
      :item="inspectionAlarmTypeIndicatorMaintainDialogItem"
      :create-rules="inspectionAlarmTypeIndicatorMaintainDialogCreateRules"
      :edit-rules="inspectionAlarmTypeIndicatorMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInspectionAlarmTypeIndicatorCreate"
      @onItemEdit="handleInspectionAlarmTypeIndicatorEdit"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.type_id')"
        prop="key_string_id"
      >
        <el-input
          v-model="inspectionAlarmTypeIndicatorMaintainDialogItem.key_string_id"
          :readonly="inspectionAlarmTypeIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.label')"
        prop="label"
      >
        <el-input
          v-model="inspectionAlarmTypeIndicatorMaintainDialogItem.label"
          :readonly="inspectionAlarmTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.remark')"
        prop="remark"
      >
        <el-input
          v-model="inspectionAlarmTypeIndicatorMaintainDialogItem.remark"
          :readonly="inspectionAlarmTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  all,
  exists,
  get,
  insert,
  type InspectionAlarmTypeIndicator,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionAlarmTypeIndicator.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'InspectionAlarmTypeIndicator',
})

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

const idSearchBarValue = ref<string>('')

// endregion

// region 告警类型搜索

function handleInspectionAlarmTypeIndicatorSearch(): void {
  if (idSearchBarValue.value !== '') {
    handleInspectionAlarmTypeIndicatorIdSearch()
  } else {
    handleInspectionAlarmTypeIndicatorAllSearch()
  }
}

async function handleInspectionAlarmTypeIndicatorIdSearch(): Promise<void> {
  loading.value += 1
  try {
    const existed = await resolveResponse(exists({ string_id: idSearchBarValue.value }))
    if (!existed) {
      const empty: PagedData<InspectionAlarmTypeIndicator> = {
        current_page: 0,
        total_pages: 0,
        rows: inspectionAlarmTypeIndicatorTablePageSize.value,
        count: '0',
        data: [],
      }
      updateInspectionAlarmTypeIndicatorTableByLookup(empty)
      return
    }
    const item = await resolveResponse(get({ string_id: idSearchBarValue.value }))
    updateInspectionAlarmTypeIndicatorTableByLookup({
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

async function handleInspectionAlarmTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      inspectionAlarmTypeIndicatorTablePagingInfo.value,
    )
    updateInspectionAlarmTypeIndicatorTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleInspectionAlarmTypeIndicatorSearch()
})

// endregion

// region 告警类型表格处理

const {
  currentPage: inspectionAlarmTypeIndicatorTableCurrentPage,
  pageSize: inspectionAlarmTypeIndicatorTablePageSize,
  itemCount: inspectionAlarmTypeIndicatorTableItemCount,
  items: inspectionAlarmTypeIndicatorTableItems,
  pagingInfo: inspectionAlarmTypeIndicatorTablePagingInfo,
  updateByLookup: updateInspectionAlarmTypeIndicatorTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectionAlarmTypeIndicator>(15)

function handleInspectionAlarmTypeIndicatorPagingAttributeChanged(): void {
  handleInspectionAlarmTypeIndicatorSearch()
}

async function handleInspectionAlarmTypeIndicatorCopyKeyContextmenuClicked(
  row: InspectionAlarmTypeIndicator,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.string_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.audit_management.copy_succeeded'),
    type: 'success',
  })
}

function handleShowInspectionAlarmTypeIndicatorInspectDialog(
  item: InspectionAlarmTypeIndicator,
): void {
  showInspectionAlarmTypeIndicatorInspectMaintainDialog(item)
}

function handleShowInspectionAlarmTypeIndicatorEditDialog(
  item: InspectionAlarmTypeIndicator,
): void {
  showInspectionAlarmTypeIndicatorEditMaintainDialog(item)
}

async function handleInspectionAlarmTypeIndicatorDelete(
  item: InspectionAlarmTypeIndicator,
): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.audit_management.delete_alarm_type_confirmation') +
        t('views.element_plus_engineering.audit_management.delete_alarm_type_consequence') +
        t('views.element_plus_engineering.audit_management.continue_confirmation'),
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
      message: t('views.element_plus_engineering.audit_management.alarm_type_deleted', {
        typeId: item.key.string_id,
      }),
      type: 'success',
    })
    handleInspectionAlarmTypeIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 告警类型维护对话框处理

type InspectionAlarmTypeIndicatorMaintainDialogItem = {
  key_string_id: string
  label: string
  remark: string
}

const {
  visible: inspectionAlarmTypeIndicatorMaintainDialogVisible,
  item: inspectionAlarmTypeIndicatorMaintainDialogItem,
  mode: inspectionAlarmTypeIndicatorMaintainDialogMode,
  showCreateDialog: showInspectionAlarmTypeIndicatorCreateMaintainDialog,
  showEditDialog: showInspectionAlarmTypeIndicatorEditMaintainDialog,
  showInspectDialog: showInspectionAlarmTypeIndicatorInspectMaintainDialog,
} = useGeneralMaintainDialog<
  InspectionAlarmTypeIndicator,
  InspectionAlarmTypeIndicatorMaintainDialogItem
>(inspectionAlarmTypeIndicatorMaintainDialogItemMap, {
  key_string_id: '',
  label: '',
  remark: '',
})
const inspectionAlarmTypeIndicatorMaintainDialogLoading = ref<number>(0)
const inspectionAlarmTypeIndicatorMaintainDialogKeyValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error(t('views.element_plus_engineering.audit_management.type_id_required')))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(
          new Error(t('views.element_plus_engineering.audit_management.type_id_already_exists')),
        )
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const inspectionAlarmTypeIndicatorMaintainDialogCreateRules = ref({
  key_string_id: [
    {
      validator: inspectionAlarmTypeIndicatorMaintainDialogKeyValidator,
      trigger: 'blur',
    },
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.type_id_required'),
      trigger: 'blur',
    },
  ],
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.label_required'),
      trigger: 'blur',
    },
  ],
})
const inspectionAlarmTypeIndicatorMaintainDialogEditRules = ref({
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.label_required'),
      trigger: 'blur',
    },
  ],
})

function inspectionAlarmTypeIndicatorMaintainDialogItemMap(
  t: InspectionAlarmTypeIndicator,
): InspectionAlarmTypeIndicatorMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    label: t.label,
    remark: t.remark,
  }
}

async function handleInspectionAlarmTypeIndicatorCreate(
  item: InspectionAlarmTypeIndicatorMaintainDialogItem,
): Promise<void> {
  inspectionAlarmTypeIndicatorMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: { string_id: item.key_string_id },
        label: item.label,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.alarm_type_created', {
        typeId: item.key_string_id,
      }),
      type: 'success',
    })
    handleInspectionAlarmTypeIndicatorSearch()
    inspectionAlarmTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    inspectionAlarmTypeIndicatorMaintainDialogLoading.value -= 1
  }
}

async function handleInspectionAlarmTypeIndicatorEdit(
  item: InspectionAlarmTypeIndicatorMaintainDialogItem,
): Promise<void> {
  inspectionAlarmTypeIndicatorMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { string_id: item.key_string_id },
        label: item.label,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.alarm_type_updated', {
        typeId: item.key_string_id,
      }),
      type: 'success',
    })
    handleInspectionAlarmTypeIndicatorSearch()
    inspectionAlarmTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    inspectionAlarmTypeIndicatorMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.inspection-alarm-type-indicator-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
