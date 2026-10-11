<template>
  <div class="inspector-variable-panel-container">
    <placeholder-panel
      v-if="inspectorId === ''"
      :text="t('views.element_plus_engineering.audit_management.please_select_inspector')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showInspectorVariableCreateMaintainDialog">
              {{ t('views.element_plus_engineering.audit_management.create_variable') }}
            </el-button>
            <el-button type="success" @click="handleInspectorVariableSearch">{{
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
            class="table"
            v-model:current-page="inspectorVariableTableCurrentPage"
            v-model:page-size="inspectorVariableTablePageSize"
            :item-count="inspectorVariableTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="inspectorVariableTableItems"
            :show-contextmenu="true"
            :inspect-button-label="
              t('views.element_plus_engineering.audit_management.inspect_variable')
            "
            :edit-button-label="t('views.element_plus_engineering.audit_management.edit_variable')"
            :delete-button-label="
              t('views.element_plus_engineering.audit_management.delete_variable')
            "
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleInspectorVariablePagingAttributeChanged"
            @onItemInspect="handleShowInspectorVariableInspectDialog"
            @onItemEdit="handleShowInspectorVariableEditDialog"
            @onItemDelete="handleInspectorVariableDelete"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.variable_string_id"
                :label="t('views.element_plus_engineering.audit_management.variable_id')"
                show-overflow-tooltip
              />
              <el-table-column
                prop="value_type"
                :label="t('views.element_plus_engineering.audit_management.value_type')"
                width="100"
                :formatter="valueTypeFormatter"
              />
              <el-table-column
                :label="t('views.element_plus_engineering.audit_management.value')"
                show-overflow-tooltip
                :formatter="valueFormatter"
              />
            </template>
            <template
              v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
            >
              <ul>
                <li
                  @click="
                    handleInspectorVariableCopyKeyContextmenuClicked(
                      row as InspectorVariable,
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
      </header-layout-panel>
    </div>
    <maintain-dialog
      label-width="90px"
      v-model:visible="inspectorVariableMaintainDialogVisible"
      :loading="inspectorVariableMaintainDialogLoading"
      :mode="inspectorVariableMaintainDialogMode"
      :item="inspectorVariableMaintainDialogItem"
      :create-rules="inspectorVariableMaintainDialogCreateRules"
      :edit-rules="inspectorVariableMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInspectorVariableUpsert"
      @onItemEdit="handleInspectorVariableUpsert"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.variable_id')"
        prop="variable_id"
      >
        <el-input
          v-model="inspectorVariableMaintainDialogItem.variable_id"
          :readonly="inspectorVariableMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.value_type')"
        prop="value_type"
      >
        <el-select
          v-model="inspectorVariableMaintainDialogItem.value_type"
          :disabled="inspectorVariableMaintainDialogMode === 'INSPECT'"
          style="width: 100%"
        >
          <el-option
            :value="0"
            :label="t('views.element_plus_engineering.audit_management.string')"
          />
          <el-option
            :value="1"
            :label="t('views.element_plus_engineering.audit_management.long_integer')"
          />
          <el-option
            :value="2"
            :label="t('views.element_plus_engineering.audit_management.floating_point')"
          />
          <el-option
            :value="3"
            :label="t('views.element_plus_engineering.audit_management.boolean')"
          />
          <el-option
            :value="4"
            :label="t('views.element_plus_engineering.audit_management.date')"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="inspectorVariableMaintainDialogItem.value_type === 0"
        :label="t('views.element_plus_engineering.audit_management.value')"
        prop="string_value"
      >
        <el-input
          v-model="inspectorVariableMaintainDialogItem.string_value"
          :readonly="inspectorVariableMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="inspectorVariableMaintainDialogItem.value_type === 1"
        :label="t('views.element_plus_engineering.audit_management.value')"
        prop="long_value"
      >
        <el-input
          v-model="inspectorVariableMaintainDialogItem.long_value"
          :readonly="inspectorVariableMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="inspectorVariableMaintainDialogItem.value_type === 2"
        :label="t('views.element_plus_engineering.audit_management.value')"
        prop="double_value"
      >
        <el-input-number
          class="form-input-number"
          v-model="inspectorVariableMaintainDialogItem.double_value"
          :disabled="inspectorVariableMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="inspectorVariableMaintainDialogItem.value_type === 3"
        :label="t('views.element_plus_engineering.audit_management.value')"
        prop="boolean_value"
      >
        <el-switch
          v-model="inspectorVariableMaintainDialogItem.boolean_value"
          :disabled="inspectorVariableMaintainDialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.audit_management.yes')"
          :inactive-text="t('views.element_plus_engineering.audit_management.no')"
        />
      </el-form-item>
      <el-form-item
        v-if="inspectorVariableMaintainDialogItem.value_type === 4"
        :label="t('views.element_plus_engineering.audit_management.value')"
        prop="date_value"
      >
        <el-date-picker
          v-model="inspectorVariableMaintainDialogItem.date_value"
          type="datetime"
          value-format="x"
          :disabled="inspectorVariableMaintainDialogMode === 'INSPECT'"
          style="width: 100%"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  childForInspectorInfo,
  exists,
  type InspectorVariable,
  type InspectorVariableValueType,
  remove,
  upsert,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectorVariable.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'InspectorVariablePanel',
})

// region Props 定义

type Props = {
  inspectorId: string
  applyChangesDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
})

// endregion

// region Emits 定义

type Emits = {
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

// region 检查器变量搜索

async function handleInspectorVariableSearch(): Promise<void> {
  if (props.inspectorId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForInspectorInfo({ long_id: props.inspectorId }, pagingInfo),
      inspectorVariableTablePagingInfo.value,
    )
    updateInspectorVariableTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.inspectorId,
  () => {
    inspectorVariableTableCurrentPage.value = 0
    if (props.inspectorId === '') {
      updateInspectorVariableTableByLookup({
        current_page: 0,
        total_pages: 0,
        rows: inspectorVariableTablePageSize.value,
        count: '0',
        data: [],
      })
      return
    }
    handleInspectorVariableSearch()
  },
)

onMounted(() => {
  handleInspectorVariableSearch()
})

// endregion

// region 检查器变量表格处理

const {
  currentPage: inspectorVariableTableCurrentPage,
  pageSize: inspectorVariableTablePageSize,
  itemCount: inspectorVariableTableItemCount,
  items: inspectorVariableTableItems,
  pagingInfo: inspectorVariableTablePagingInfo,
  updateByLookup: updateInspectorVariableTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectorVariable>(15)

function formatValueType(type: number): string {
  switch (type) {
    case 0:
      return t('views.element_plus_engineering.audit_management.string')
    case 1:
      return t('views.element_plus_engineering.audit_management.long_integer')
    case 2:
      return t('views.element_plus_engineering.audit_management.floating_point')
    case 3:
      return t('views.element_plus_engineering.audit_management.boolean')
    case 4:
      return t('views.element_plus_engineering.audit_management.date')
    default:
      return t('views.element_plus_engineering.audit_management.unknown_type', { type })
  }
}

function valueTypeFormatter(row: InspectorVariable): string {
  return formatValueType(row.value_type)
}

function valueFormatter(row: InspectorVariable): string {
  switch (row.value_type) {
    case 0:
      return row.string_value ?? ''
    case 1:
      return row.long_value ?? ''
    case 2:
      return String(row.double_value)
    case 3:
      return row.boolean_value
        ? t('views.element_plus_engineering.audit_management.yes')
        : t('views.element_plus_engineering.audit_management.no')
    case 4:
      return typeof row.date_value === 'number'
        ? formatTimestamp(row.date_value)
        : t('views.element_plus_engineering.audit_management.none_available_parenthesized')
    default:
      return ''
  }
}

function handleInspectorVariablePagingAttributeChanged(): void {
  handleInspectorVariableSearch()
}

async function handleInspectorVariableCopyKeyContextmenuClicked(
  row: InspectorVariable,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(
    `${row.key.inspector_info_long_id}&${row.key.variable_string_id}`,
  )
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.audit_management.copy_succeeded'),
    type: 'success',
  })
}

function handleShowInspectorVariableInspectDialog(item: InspectorVariable): void {
  showInspectorVariableInspectMaintainDialog(item)
}

function handleShowInspectorVariableEditDialog(item: InspectorVariable): void {
  showInspectorVariableEditMaintainDialog(item)
}

async function handleInspectorVariableDelete(item: InspectorVariable): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.audit_management.delete_inspector_variable_confirmation'),
      t('views.element_plus_engineering.audit_management.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.audit_management.ok'),
        cancelButtonText: t('views.element_plus_engineering.audit_management.cancel'),
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      remove({
        inspector_info_key: { long_id: item.key.inspector_info_long_id },
        inspector_variable_id: item.key.variable_string_id,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.variable_deleted', {
        variableId: item.key.variable_string_id,
      }),
      type: 'success',
    })
    await handleInspectorVariableSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 检查器变量维护对话框处理

type InspectorVariableMaintainDialogItem = {
  variable_id: string
  value_type: InspectorVariableValueType
  string_value: string
  long_value: string
  double_value: number
  boolean_value: boolean
  date_value: number | string | null
}

const {
  visible: inspectorVariableMaintainDialogVisible,
  item: inspectorVariableMaintainDialogItem,
  mode: inspectorVariableMaintainDialogMode,
  showCreateDialog: showInspectorVariableCreateMaintainDialog,
  showEditDialog: showInspectorVariableEditMaintainDialog,
  showInspectDialog: showInspectorVariableInspectMaintainDialog,
} = useGeneralMaintainDialog<InspectorVariable, InspectorVariableMaintainDialogItem>(
  inspectorVariableMaintainDialogItemMap,
  {
    variable_id: '',
    value_type: 0,
    string_value: '',
    long_value: '0',
    double_value: 0,
    boolean_value: false,
    date_value: null,
  },
)
const inspectorVariableMaintainDialogLoading = ref<number>(0)
const inspectorVariableMaintainDialogIdValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value as string)
    .then((res) => {
      if (res === '') {
        callback(
          new Error(t('views.element_plus_engineering.audit_management.variable_id_required')),
        )
        return Promise.reject()
      }
      return resolveResponse(
        exists({
          inspector_info_long_id: props.inspectorId,
          variable_string_id: res,
        }),
      )
    })
    .then((res) => {
      if (res) {
        callback(
          new Error(
            t('views.element_plus_engineering.audit_management.variable_id_already_exists'),
          ),
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
const inspectorVariableMaintainDialogLongValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  if (inspectorVariableMaintainDialogItem.value.value_type !== 1) {
    callback()
    return
  }
  if (!/^-?\d+$/.test(String(value ?? ''))) {
    callback(
      new Error(
        t('views.element_plus_engineering.audit_management.long_integer_value_must_be_signed'),
      ),
    )
    return
  }
  callback()
}
const inspectorVariableMaintainDialogCreateRules = ref({
  variable_id: [
    { validator: inspectorVariableMaintainDialogIdValidator, trigger: 'blur' },
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.variable_id_required'),
      trigger: 'blur',
    },
  ],
  long_value: [{ validator: inspectorVariableMaintainDialogLongValidator, trigger: 'blur' }],
})
const inspectorVariableMaintainDialogEditRules = ref({
  long_value: [{ validator: inspectorVariableMaintainDialogLongValidator, trigger: 'blur' }],
})

function inspectorVariableMaintainDialogItemMap(
  t: InspectorVariable,
): InspectorVariableMaintainDialogItem {
  return {
    variable_id: t.key.variable_string_id,
    value_type: t.value_type,
    string_value: t.string_value ?? '',
    long_value: t.long_value ?? '0',
    double_value: t.double_value ?? 0,
    boolean_value: t.boolean_value ?? false,
    date_value: t.date_value ?? null,
  }
}

function toValueString(item: InspectorVariableMaintainDialogItem): string {
  switch (item.value_type) {
    case 0:
      return item.string_value ?? ''
    case 1:
      return /^-?\d+$/.test(item.long_value) ? item.long_value : '0'
    case 2:
      return String(item.double_value ?? 0)
    case 3:
      return item.boolean_value ? 'true' : 'false'
    case 4: {
      const dateValue =
        item.date_value === null || item.date_value === undefined ? 0 : Number(item.date_value)
      return String(Number.isFinite(dateValue) ? dateValue : 0)
    }
    default:
      return ''
  }
}

async function handleInspectorVariableUpsert(
  item: InspectorVariableMaintainDialogItem,
): Promise<void> {
  inspectorVariableMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      upsert({
        inspector_info_key: { long_id: props.inspectorId },
        inspector_variable_id: item.variable_id,
        value_type: item.value_type,
        value_string: toValueString(item),
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.variable_saved', {
        variableId: item.variable_id,
      }),
      type: 'success',
    })
    await handleInspectorVariableSearch()
    inspectorVariableMaintainDialogVisible.value = false
  } finally {
    inspectorVariableMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.inspector-variable-panel-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #ffffff;
}

.main-container {
  width: 100%;
  height: 100%;
  min-height: 0;
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

.form-input-number {
  width: 200px;
}
</style>
