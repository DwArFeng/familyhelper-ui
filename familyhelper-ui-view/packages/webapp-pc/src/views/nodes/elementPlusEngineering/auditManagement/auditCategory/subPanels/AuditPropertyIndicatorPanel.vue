<template>
  <div class="audit-property-indicator-panel-container">
    <placeholder-panel
      v-if="categoryId === ''"
      :text="t('views.element_plus_engineering.audit_management.please_select_audit_category')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showAuditPropertyIndicatorCreateMaintainDialog">
              {{ t('views.element_plus_engineering.audit_management.create_property') }}
            </el-button>
            <el-button type="success" @click="handleAuditPropertyIndicatorSearch">
              {{ t('views.element_plus_engineering.audit_management.refresh_data') }}
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              {{ t('views.element_plus_engineering.audit_management.apply_changes') }}
            </el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="auditPropertyIndicatorTableCurrentPage"
            v-model:page-size="auditPropertyIndicatorTablePageSize"
            :item-count="auditPropertyIndicatorTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="auditPropertyIndicatorTableItems"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleAuditPropertyIndicatorPagingAttributeChanged"
            @onItemInspect="handleShowAuditPropertyIndicatorInspectDialog"
            @onItemEdit="handleShowAuditPropertyIndicatorEditDialog"
            @onItemDelete="handleAuditPropertyIndicatorDelete"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.property_string_id"
                :label="t('views.element_plus_engineering.audit_management.property_id')"
                show-overflow-tooltip
              />
              <el-table-column
                prop="label"
                :label="t('views.element_plus_engineering.audit_management.label')"
                show-overflow-tooltip
              />
              <el-table-column
                prop="property_type"
                :label="t('views.element_plus_engineering.audit_management.property_type')"
                width="100"
                :formatter="propertyTypeFormatter"
              />
              <el-table-column
                :label="t('views.element_plus_engineering.audit_management.default_value')"
                show-overflow-tooltip
                :formatter="defaultValueFormatter"
              />
              <el-table-column
                prop="order"
                :label="t('views.element_plus_engineering.audit_management.order')"
                width="70"
              />
            </template>
            <template
              v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
            >
              <ul>
                <li
                  @click="
                    handleAuditPropertyIndicatorCopyKeyContextmenuClicked(
                      row as AuditPropertyIndicator,
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
      v-model:visible="auditPropertyIndicatorMaintainDialogVisible"
      :loading="auditPropertyIndicatorMaintainDialogLoading"
      :mode="auditPropertyIndicatorMaintainDialogMode"
      :item="auditPropertyIndicatorMaintainDialogItem"
      :create-rules="auditPropertyIndicatorMaintainDialogCreateRules"
      :edit-rules="auditPropertyIndicatorMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleAuditPropertyIndicatorCreate"
      @onItemEdit="handleAuditPropertyIndicatorEdit"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.property_id')"
        prop="property_id"
      >
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.property_id"
          :readonly="auditPropertyIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.label')"
        prop="label"
      >
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.label"
          :readonly="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.property_type')"
        prop="property_type"
      >
        <el-select
          v-model="auditPropertyIndicatorMaintainDialogItem.property_type"
          :disabled="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
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
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 0"
        :label="t('views.element_plus_engineering.audit_management.default_value')"
        prop="default_string_value"
      >
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.default_string_value"
          :readonly="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 1"
        :label="t('views.element_plus_engineering.audit_management.default_value')"
        prop="default_long_value"
      >
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.default_long_value"
          :readonly="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 2"
        :label="t('views.element_plus_engineering.audit_management.default_value')"
        prop="default_double_value"
      >
        <el-input-number
          class="form-input-number"
          v-model="auditPropertyIndicatorMaintainDialogItem.default_double_value"
          :disabled="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 3"
        :label="t('views.element_plus_engineering.audit_management.default_value')"
        prop="default_boolean_value"
      >
        <el-switch
          v-model="auditPropertyIndicatorMaintainDialogItem.default_boolean_value"
          :disabled="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.audit_management.yes')"
          :inactive-text="t('views.element_plus_engineering.audit_management.no')"
        />
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 4"
        :label="t('views.element_plus_engineering.audit_management.default_value')"
        prop="default_date_value"
      >
        <el-date-picker
          v-model="auditPropertyIndicatorMaintainDialogItem.default_date_value"
          type="datetime"
          value-format="x"
          :disabled="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.audit_management.order')"
        prop="order"
      >
        <el-input-number
          class="form-input-number"
          v-model="auditPropertyIndicatorMaintainDialogItem.order"
          :precision="0"
          :disabled="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  type AuditPropertyIndicator,
  type AuditPropertyType,
  childForAuditCategory,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditPropertyIndicator.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AuditPropertyIndicatorPanel',
})

// region Props 定义

type Props = {
  categoryId: string
  applyChangesDisabled?: boolean
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
  mode: 'DEFAULT',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onApplyChanges'): void
  (e: 'onPanelFloatyButtonClicked'): void
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

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 属性指标搜索

async function handleAuditPropertyIndicatorSearch(): Promise<void> {
  if (props.categoryId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForAuditCategory({ string_id: props.categoryId }, pagingInfo),
      auditPropertyIndicatorTablePagingInfo.value,
    )
    updateAuditPropertyIndicatorTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.categoryId,
  () => {
    auditPropertyIndicatorTableCurrentPage.value = 0
    handleAuditPropertyIndicatorSearch()
  },
)

onMounted(() => {
  handleAuditPropertyIndicatorSearch()
})

// endregion

// region 属性指标表格处理

const {
  currentPage: auditPropertyIndicatorTableCurrentPage,
  pageSize: auditPropertyIndicatorTablePageSize,
  itemCount: auditPropertyIndicatorTableItemCount,
  items: auditPropertyIndicatorTableItems,
  pagingInfo: auditPropertyIndicatorTablePagingInfo,
  updateByLookup: updateAuditPropertyIndicatorTableByLookup,
} = useIdentityBackendPagingTablePanel<AuditPropertyIndicator>(15)

function handleAuditPropertyIndicatorPagingAttributeChanged(): void {
  handleAuditPropertyIndicatorSearch()
}

function formatPropertyType(type: number): string {
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

function propertyTypeFormatter(row: AuditPropertyIndicator): string {
  return formatPropertyType(row.property_type)
}

function defaultValueFormatter(row: AuditPropertyIndicator): string {
  switch (row.property_type) {
    case 0:
      return row.default_string_value ?? ''
    case 1:
      return row.default_long_value ?? ''
    case 2:
      return String(row.default_double_value)
    case 3:
      return row.default_boolean_value
        ? t('views.element_plus_engineering.audit_management.yes')
        : t('views.element_plus_engineering.audit_management.no')
    case 4:
      return typeof row.default_date_value === 'number'
        ? formatTimestamp(row.default_date_value)
        : t('views.element_plus_engineering.audit_management.none_available_parenthesized')
    default:
      return ''
  }
}

async function handleAuditPropertyIndicatorCopyKeyContextmenuClicked(
  row: AuditPropertyIndicator,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(
    `${row.key.audit_category_string_id}&${row.key.property_string_id}`,
  )
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.audit_management.copy_succeeded'),
    type: 'success',
  })
}

function handleShowAuditPropertyIndicatorInspectDialog(item: AuditPropertyIndicator): void {
  showAuditPropertyIndicatorInspectMaintainDialog(item)
}

function handleShowAuditPropertyIndicatorEditDialog(item: AuditPropertyIndicator): void {
  showAuditPropertyIndicatorEditMaintainDialog(item)
}

async function handleAuditPropertyIndicatorDelete(item: AuditPropertyIndicator): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.audit_management.delete_audit_property_confirmation'),
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
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.audit_property_deleted'),
      type: 'success',
    })
    await await handleAuditPropertyIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 属性指标维护对话框处理

type AuditPropertyIndicatorMaintainDialogItem = {
  category_id: string
  property_id: string
  label: string
  property_type: AuditPropertyType
  default_string_value: string
  default_long_value: string
  default_double_value: number
  default_boolean_value: boolean
  default_date_value: number | string | null
  order: number
}

const {
  visible: auditPropertyIndicatorMaintainDialogVisible,
  item: auditPropertyIndicatorMaintainDialogItem,
  mode: auditPropertyIndicatorMaintainDialogMode,
  showCreateDialog: showAuditPropertyIndicatorCreateMaintainDialogInner,
  showEditDialog: showAuditPropertyIndicatorEditMaintainDialog,
  showInspectDialog: showAuditPropertyIndicatorInspectMaintainDialog,
} = useGeneralMaintainDialog<AuditPropertyIndicator, AuditPropertyIndicatorMaintainDialogItem>(
  auditPropertyIndicatorMaintainDialogItemMap,
  {
    category_id: props.categoryId,
    property_id: '',
    label: '',
    property_type: 0,
    default_string_value: '',
    default_long_value: '0',
    default_double_value: 0,
    default_boolean_value: false,
    default_date_value: null,
    order: 0,
  },
)
const auditPropertyIndicatorMaintainDialogLoading = ref<number>(0)
const auditPropertyIndicatorMaintainDialogPropertyIdValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value as string)
    .then((res) => {
      if (res === '') {
        callback(
          new Error(t('views.element_plus_engineering.audit_management.property_id_required')),
        )
        return Promise.reject()
      }
      return resolveResponse(
        exists({
          audit_category_string_id: props.categoryId,
          property_string_id: res,
        }),
      )
    })
    .then((res) => {
      if (res) {
        callback(
          new Error(
            t('views.element_plus_engineering.audit_management.property_id_already_exists'),
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
const auditPropertyIndicatorMaintainDialogLongValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  if (auditPropertyIndicatorMaintainDialogItem.value.property_type !== 1) {
    callback()
    return
  }
  if (!/^-?\d+$/.test(String(value ?? ''))) {
    callback(
      new Error(
        t('views.element_plus_engineering.audit_management.long_integer_default_must_be_signed'),
      ),
    )
    return
  }
  callback()
}
const auditPropertyIndicatorMaintainDialogOrderValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  if (!Number.isInteger(value)) {
    callback(new Error(t('views.element_plus_engineering.audit_management.order_must_be_integer')))
    return
  }
  callback()
}
const auditPropertyIndicatorMaintainDialogCreateRules = ref({
  property_id: [
    {
      validator: auditPropertyIndicatorMaintainDialogPropertyIdValidator,
      trigger: 'blur',
    },
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.property_id_required'),
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
  default_long_value: [
    { validator: auditPropertyIndicatorMaintainDialogLongValidator, trigger: 'blur' },
  ],
  order: [{ validator: auditPropertyIndicatorMaintainDialogOrderValidator, trigger: 'blur' }],
})
const auditPropertyIndicatorMaintainDialogEditRules = ref({
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.audit_management.label_required'),
      trigger: 'blur',
    },
  ],
  default_long_value: [
    { validator: auditPropertyIndicatorMaintainDialogLongValidator, trigger: 'blur' },
  ],
  order: [{ validator: auditPropertyIndicatorMaintainDialogOrderValidator, trigger: 'blur' }],
})

function auditPropertyIndicatorMaintainDialogItemMap(
  t: AuditPropertyIndicator,
): AuditPropertyIndicatorMaintainDialogItem {
  return {
    category_id: t.key.audit_category_string_id,
    property_id: t.key.property_string_id,
    label: t.label,
    property_type: t.property_type,
    default_string_value: t.default_string_value ?? '',
    default_long_value: t.default_long_value ?? '0',
    default_double_value: t.default_double_value ?? 0,
    default_boolean_value: t.default_boolean_value ?? false,
    default_date_value: t.default_date_value ?? null,
    order: t.order,
  }
}

function showAuditPropertyIndicatorCreateMaintainDialog(): void {
  auditPropertyIndicatorMaintainDialogItem.value.category_id = props.categoryId
  showAuditPropertyIndicatorCreateMaintainDialogInner()
}

function toAuditPropertyIndicatorPayload(
  item: AuditPropertyIndicatorMaintainDialogItem,
): AuditPropertyIndicator {
  const dateValue =
    item.default_date_value === null || item.default_date_value === undefined
      ? 0
      : Number(item.default_date_value)
  return {
    key: {
      audit_category_string_id: item.category_id,
      property_string_id: item.property_id,
    },
    label: item.label,
    property_type: item.property_type,
    default_string_value: item.default_string_value ?? '',
    default_long_value: /^-?\d+$/.test(item.default_long_value) ? item.default_long_value : '0',
    default_double_value: item.default_double_value ?? 0,
    default_boolean_value: item.default_boolean_value ?? false,
    default_date_value: Number.isFinite(dateValue) ? dateValue : 0,
    order: item.order,
  }
}

async function handleAuditPropertyIndicatorCreate(
  item: AuditPropertyIndicatorMaintainDialogItem,
): Promise<void> {
  auditPropertyIndicatorMaintainDialogLoading.value += 1
  try {
    await resolveResponse(insert(toAuditPropertyIndicatorPayload(item)))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.audit_property_created', {
        propertyId: item.property_id,
      }),
      type: 'success',
    })
    await await handleAuditPropertyIndicatorSearch()
    auditPropertyIndicatorMaintainDialogVisible.value = false
  } finally {
    auditPropertyIndicatorMaintainDialogLoading.value -= 1
  }
}

async function handleAuditPropertyIndicatorEdit(
  item: AuditPropertyIndicatorMaintainDialogItem,
): Promise<void> {
  auditPropertyIndicatorMaintainDialogLoading.value += 1
  try {
    await resolveResponse(update(toAuditPropertyIndicatorPayload(item)))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.audit_management.audit_property_updated', {
        propertyId: item.property_id,
      }),
      type: 'success',
    })
    await await handleAuditPropertyIndicatorSearch()
    auditPropertyIndicatorMaintainDialogVisible.value = false
  } finally {
    auditPropertyIndicatorMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.audit-property-indicator-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
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
