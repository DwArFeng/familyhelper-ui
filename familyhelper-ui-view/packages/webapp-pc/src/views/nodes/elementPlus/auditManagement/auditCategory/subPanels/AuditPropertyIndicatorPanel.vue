<template>
  <div class="audit-property-indicator-panel-container">
    <placeholder-panel v-if="categoryId === ''" text="请选择审计类别" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showAuditPropertyIndicatorCreateMaintainDialog">
              新建属性
            </el-button>
            <el-button type="success" @click="handleAuditPropertyIndicatorSearch">
              刷新数据
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              应用变更
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
                label="属性 ID"
                show-overflow-tooltip
              />
              <el-table-column prop="label" label="标签" show-overflow-tooltip />
              <el-table-column
                prop="property_type"
                label="属性类型"
                width="100"
                :formatter="propertyTypeFormatter"
              />
              <el-table-column
                label="默认值"
                show-overflow-tooltip
                :formatter="defaultValueFormatter"
              />
              <el-table-column prop="order" label="顺序" width="70" />
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
      <el-form-item label="属性 ID" prop="property_id">
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.property_id"
          :readonly="auditPropertyIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.label"
          :readonly="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="属性类型" prop="property_type">
        <el-select
          v-model="auditPropertyIndicatorMaintainDialogItem.property_type"
          :disabled="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
          style="width: 100%"
        >
          <el-option :value="0" label="字符串" />
          <el-option :value="1" label="长整数" />
          <el-option :value="2" label="浮点数" />
          <el-option :value="3" label="布尔" />
          <el-option :value="4" label="日期" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 0"
        label="默认值"
        prop="default_string_value"
      >
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.default_string_value"
          :readonly="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 1"
        label="默认值"
        prop="default_long_value"
      >
        <el-input
          v-model="auditPropertyIndicatorMaintainDialogItem.default_long_value"
          :readonly="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 2"
        label="默认值"
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
        label="默认值"
        prop="default_boolean_value"
      >
        <el-switch
          v-model="auditPropertyIndicatorMaintainDialogItem.default_boolean_value"
          :disabled="auditPropertyIndicatorMaintainDialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item
        v-if="auditPropertyIndicatorMaintainDialogItem.property_type === 4"
        label="默认值"
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
      <el-form-item label="顺序" prop="order">
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
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
      return '字符串'
    case 1:
      return '长整数'
    case 2:
      return '浮点数'
    case 3:
      return '布尔'
    case 4:
      return '日期'
    default:
      return `未知（${type}）`
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
      return row.default_boolean_value ? '是' : '否'
    case 4:
      return typeof row.default_date_value === 'number'
        ? formatTimestamp(row.default_date_value)
        : '（暂无）'
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
    message: '复制成功',
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
    await ElMessageBox.confirm('此操作将永久删除此属性指标。是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: '属性指标删除成功',
      type: 'success',
    })
    handleAuditPropertyIndicatorSearch()
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
        callback(new Error('属性 ID 不能为空'))
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
        callback(new Error('属性 ID 已经存在'))
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
    callback(new Error('长整数默认值必须是有符号整数'))
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
    callback(new Error('顺序必须为整数'))
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
    { required: true, message: '属性 ID 不能为空', trigger: 'blur' },
  ],
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
  default_long_value: [
    { validator: auditPropertyIndicatorMaintainDialogLongValidator, trigger: 'blur' },
  ],
  order: [{ validator: auditPropertyIndicatorMaintainDialogOrderValidator, trigger: 'blur' }],
})
const auditPropertyIndicatorMaintainDialogEditRules = ref({
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
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
      message: `属性指标 ${item.property_id} 创建成功`,
      type: 'success',
    })
    handleAuditPropertyIndicatorSearch()
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
      message: `属性指标 ${item.property_id} 更新成功`,
      type: 'success',
    })
    handleAuditPropertyIndicatorSearch()
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
