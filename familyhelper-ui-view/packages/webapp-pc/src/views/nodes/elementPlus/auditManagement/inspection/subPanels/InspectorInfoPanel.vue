<template>
  <div class="inspector-info-panel-container">
    <placeholder-panel v-if="inspectionId === ''" text="请选择巡检" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showInspectorInfoCreateMaintainDialog">
              新建检查器
            </el-button>
            <el-button type="success" @click="handleInspectorInfoSearch">刷新数据</el-button>
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
            v-model:current-page="inspectorInfoTableCurrentPage"
            v-model:page-size="inspectorInfoTablePageSize"
            :item-count="inspectorInfoTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="inspectorInfoTableItems"
            :operate-column-width="134"
            :show-contextmenu="true"
            inspect-button-label="查看检查器"
            edit-button-label="编辑检查器"
            delete-button-label="删除检查器"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleInspectorInfoPagingAttributeChanged"
            @onItemInspect="handleShowInspectorInfoInspectDialog"
            @onItemEdit="handleShowInspectorInfoEditDialog"
            @onItemDelete="handleInspectorInfoDelete"
          >
            <template v-slot:default>
              <el-table-column prop="key.long_id" label="ID" show-overflow-tooltip />
              <el-table-column prop="index" label="顺序" width="70" />
              <el-table-column
                prop="enabled"
                label="使能"
                width="55px"
                :formatter="enabledFormatter"
              />
              <el-table-column prop="type" label="类型" show-overflow-tooltip />
              <el-table-column class-name="single-line" prop="param" label="参数" />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
            <template v-slot:operateColumn="{ row, fireItemInspect, fireItemEdit, fireItemDelete }">
              <el-button-group>
                <el-button
                  class="table-button"
                  type="success"
                  :icon="SearchIcon"
                  aria-label="查看检查器"
                  title="查看检查器"
                  @click="fireItemInspect"
                />
                <el-button
                  class="table-button"
                  type="primary"
                  :icon="EditPen"
                  aria-label="编辑检查器"
                  title="编辑检查器"
                  @click="fireItemEdit"
                />
                <el-button
                  class="table-button"
                  type="primary"
                  :icon="MoreFilled"
                  aria-label="检查器变量"
                  title="检查器变量"
                  @click="handleShowVariableDialog(row as InspectorInfo)"
                />
                <el-button
                  class="table-button"
                  type="danger"
                  :icon="DeleteIcon"
                  aria-label="删除检查器"
                  title="删除检查器"
                  @click="fireItemDelete"
                />
              </el-button-group>
            </template>
            <template
              v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
            >
              <ul>
                <li
                  @click="handleInspectorInfoCopyKeyContextmenuClicked(row as InspectorInfo, close)"
                >
                  复制主键
                </li>
                <el-divider />
                <li @click="handleInspectorVariableContextmenuClicked(row as InspectorInfo, close)">
                  变量...
                </li>
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
      v-model:visible="inspectorInfoMaintainDialogVisible"
      :loading="inspectorInfoMaintainDialogLoading"
      :mode="inspectorInfoMaintainDialogMode"
      :item="inspectorInfoMaintainDialogItem"
      :create-rules="inspectorInfoMaintainDialogCreateRules"
      :edit-rules="inspectorInfoMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInspectorInfoCreate"
      @onItemEdit="handleInspectorInfoEdit"
    >
      <el-form-item label="顺序" prop="index">
        <el-input-number
          class="form-input-number"
          v-model="inspectorInfoMaintainDialogItem.index"
          :precision="0"
          :disabled="inspectorInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="inspectorInfoMaintainDialogItem.enabled"
          :disabled="inspectorInfoMaintainDialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="inspectorInfoMaintainDialogItem.type"
          :readonly="inspectorInfoMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="inspectorInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="inspectorSupportDialogVisible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="参数" prop="param">
        <text-editor
          class="text-editor"
          v-model="inspectorInfoMaintainDialogItem.param"
          :readonly="inspectorInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="inspectorInfoMaintainDialogItem.remark"
          :readonly="inspectorInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <inspector-support-select-dialog
      v-model:visible="inspectorSupportDialogVisible"
      @onConfirmed="handleInspectorSupportSelected"
    />
    <el-dialog
      class="inspector-variable-dialog"
      v-model="variableDialogVisible"
      append-to-body
      :title="variableDialogTitle"
      width="900px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="variable-dialog-body">
        <inspector-variable-panel
          :inspector-id="variableDialogInspectorId"
          :apply-changes-disabled="applyChangesDisabled"
          @onApplyChanges="handleApplyChangesClicked"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import {
  Delete as DeleteIcon,
  EditPen,
  MoreFilled,
  Search as SearchIcon,
} from '@element-plus/icons-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import {
  childForInspection,
  insert,
  type InspectorInfo,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectorInfo.ts'
import {
  exists as existsInspectorSupport,
  type InspectorSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectorSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import InspectorSupportSelectDialog from '../../inspectorSupport/InspectorSupportSelectDialog.vue'
import InspectorVariablePanel from './InspectorVariablePanel.vue'

defineOptions({
  name: 'InspectorInfoPanel',
})

// region Props 定义

type Props = {
  inspectionId: string
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

// region 检查器搜索

async function handleInspectorInfoSearch(): Promise<void> {
  if (props.inspectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForInspection({ long_id: props.inspectionId }, pagingInfo),
      inspectorInfoTablePagingInfo.value,
    )
    updateInspectorInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.inspectionId,
  () => {
    variableDialogVisible.value = false
    variableDialogInspectorId.value = ''
    variableDialogInspectorType.value = ''
    inspectorInfoTableCurrentPage.value = 0
    handleInspectorInfoSearch()
  },
)

onMounted(() => {
  handleInspectorInfoSearch()
})

// endregion

// region 检查器表格处理

const {
  currentPage: inspectorInfoTableCurrentPage,
  pageSize: inspectorInfoTablePageSize,
  itemCount: inspectorInfoTableItemCount,
  items: inspectorInfoTableItems,
  pagingInfo: inspectorInfoTablePagingInfo,
  updateByLookup: updateInspectorInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectorInfo>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: InspectorInfo, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
}

function handleInspectorInfoPagingAttributeChanged(): void {
  handleInspectorInfoSearch()
}

async function handleInspectorInfoCopyKeyContextmenuClicked(
  row: InspectorInfo,
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

function handleShowInspectorInfoInspectDialog(item: InspectorInfo): void {
  showInspectorInfoInspectMaintainDialog(item)
}

function handleShowInspectorInfoEditDialog(item: InspectorInfo): void {
  showInspectorInfoEditMaintainDialog(item)
}

async function handleInspectorInfoDelete(item: InspectorInfo): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此检查器及其变量。是否继续?', '提示', {
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
      message: `检查器 ${item.key.long_id} 删除成功`,
      type: 'success',
    })
    if (variableDialogInspectorId.value === item.key.long_id) {
      variableDialogVisible.value = false
      variableDialogInspectorId.value = ''
      variableDialogInspectorType.value = ''
    }
    await handleInspectorInfoSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 检查器维护对话框处理

type InspectorInfoMaintainDialogItem = {
  long_id: string
  index: number
  enabled: boolean
  type: string
  param: string
  remark: string
}

const {
  visible: inspectorInfoMaintainDialogVisible,
  item: inspectorInfoMaintainDialogItem,
  mode: inspectorInfoMaintainDialogMode,
  showCreateDialog: showInspectorInfoCreateMaintainDialog,
  showEditDialog: showInspectorInfoEditMaintainDialog,
  showInspectDialog: showInspectorInfoInspectMaintainDialog,
} = useGeneralMaintainDialog<InspectorInfo, InspectorInfoMaintainDialogItem>(
  inspectorInfoMaintainDialogItemMap,
  {
    long_id: '',
    index: 0,
    enabled: true,
    type: '',
    param: '',
    remark: '',
  },
)
const inspectorInfoMaintainDialogLoading = ref<number>(0)
const inspectorInfoMaintainDialogTypeValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(existsInspectorSupport({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('检查器类型不支持'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const inspectorInfoMaintainDialogIndexValidator: FormItemRule['validator'] = (
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
const inspectorInfoMaintainDialogCreateRules = ref({
  type: [
    { validator: inspectorInfoMaintainDialogTypeValidator, trigger: 'blur' },
    { required: true, message: '类型不能为空', trigger: 'blur' },
  ],
  index: [{ validator: inspectorInfoMaintainDialogIndexValidator, trigger: 'blur' }],
})
const inspectorInfoMaintainDialogEditRules = ref({
  type: [
    { validator: inspectorInfoMaintainDialogTypeValidator, trigger: 'blur' },
    { required: true, message: '类型不能为空', trigger: 'blur' },
  ],
  index: [{ validator: inspectorInfoMaintainDialogIndexValidator, trigger: 'blur' }],
})

function inspectorInfoMaintainDialogItemMap(t: InspectorInfo): InspectorInfoMaintainDialogItem {
  return {
    long_id: t.key.long_id,
    index: t.index,
    enabled: t.enabled,
    type: t.type,
    param: t.param,
    remark: t.remark,
  }
}

async function handleInspectorInfoCreate(item: InspectorInfoMaintainDialogItem): Promise<void> {
  inspectorInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        inspection_key: { long_id: props.inspectionId },
        index: item.index,
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '检查器创建成功',
      type: 'success',
    })
    await handleInspectorInfoSearch()
    inspectorInfoMaintainDialogVisible.value = false
  } finally {
    inspectorInfoMaintainDialogLoading.value -= 1
  }
}

async function handleInspectorInfoEdit(item: InspectorInfoMaintainDialogItem): Promise<void> {
  inspectorInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        inspection_key: { long_id: props.inspectionId },
        index: item.index,
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `检查器 ${item.long_id} 更新成功`,
      type: 'success',
    })
    await handleInspectorInfoSearch()
    inspectorInfoMaintainDialogVisible.value = false
  } finally {
    inspectorInfoMaintainDialogLoading.value -= 1
  }
}

// endregion

// region 检查器变量对话框处理

const variableDialogVisible = ref<boolean>(false)
const variableDialogInspectorId = ref<string>('')
const variableDialogInspectorType = ref<string>('')
const variableDialogTitle = computed(() => {
  if (variableDialogInspectorId.value === '') {
    return '检查器变量'
  }
  if (variableDialogInspectorType.value) {
    return `检查器变量（${variableDialogInspectorId.value} · ${variableDialogInspectorType.value}）`
  }
  return `检查器变量（${variableDialogInspectorId.value}）`
})

function handleShowVariableDialog(row: InspectorInfo): void {
  variableDialogInspectorId.value = row.key.long_id
  variableDialogInspectorType.value = row.type
  variableDialogVisible.value = true
}

function handleInspectorVariableContextmenuClicked(row: InspectorInfo, close: () => void): void {
  close()
  handleShowVariableDialog(row)
}

// endregion

// region 检查器支持选择对话框处理

const inspectorSupportDialogVisible = ref<boolean>(false)

function handleInspectorSupportSelected(value: InspectorSupport): void {
  inspectorInfoMaintainDialogItem.value.type = value.key.string_id
  inspectorInfoMaintainDialogItem.value.param = value.example_param
}

// endregion
</script>

<style scoped>
.inspector-info-panel-container {
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
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}

.text-editor {
  height: 300px;
}

.form-input-number {
  width: 200px;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.variable-dialog-body {
  height: 480px;
}
</style>
