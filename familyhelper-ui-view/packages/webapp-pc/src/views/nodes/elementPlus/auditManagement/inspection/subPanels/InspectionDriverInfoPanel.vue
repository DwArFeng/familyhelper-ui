<template>
  <div class="inspection-driver-info-panel-container">
    <placeholder-panel v-if="inspectionId === ''" text="请选择巡检" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showInspectionDriverInfoCreateMaintainDialog">
              新建驱动
            </el-button>
            <el-button type="success" @click="handleInspectionDriverInfoSearch">刷新数据</el-button>
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
            v-model:current-page="inspectionDriverInfoTableCurrentPage"
            v-model:page-size="inspectionDriverInfoTablePageSize"
            :item-count="inspectionDriverInfoTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="inspectionDriverInfoTableItems"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleInspectionDriverInfoPagingAttributeChanged"
            @onItemInspect="handleShowInspectionDriverInfoInspectDialog"
            @onItemEdit="handleShowInspectionDriverInfoEditDialog"
            @onItemDelete="handleInspectionDriverInfoDelete"
          >
            <template v-slot:default>
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
            <template
              v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
            >
              <ul>
                <li
                  @click="
                    handleInspectionDriverInfoCopyKeyContextmenuClicked(
                      row as InspectionDriverInfo,
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
      v-model:visible="inspectionDriverInfoMaintainDialogVisible"
      :loading="inspectionDriverInfoMaintainDialogLoading"
      :mode="inspectionDriverInfoMaintainDialogMode"
      :item="inspectionDriverInfoMaintainDialogItem"
      :create-rules="inspectionDriverInfoMaintainDialogCreateRules"
      :edit-rules="inspectionDriverInfoMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInspectionDriverInfoCreate"
      @onItemEdit="handleInspectionDriverInfoEdit"
    >
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="inspectionDriverInfoMaintainDialogItem.enabled"
          :disabled="inspectionDriverInfoMaintainDialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="inspectionDriverInfoMaintainDialogItem.type"
          :readonly="inspectionDriverInfoMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="inspectionDriverInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="inspectionDriverSupportDialogVisible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="参数" prop="param">
        <text-editor
          class="text-editor"
          v-model="inspectionDriverInfoMaintainDialogItem.param"
          :readonly="inspectionDriverInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="inspectionDriverInfoMaintainDialogItem.remark"
          :readonly="inspectionDriverInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <inspection-driver-support-select-dialog
      v-model:visible="inspectionDriverSupportDialogVisible"
      @onConfirmed="handleInspectionDriverSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

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
  type InspectionDriverInfo,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionDriverInfo.ts'
import {
  exists as existsInspectionDriverSupport,
  type InspectionDriverSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionDriverSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import InspectionDriverSupportSelectDialog from '../../inspectionDriverSupport/InspectionDriverSupportSelectDialog.vue'

defineOptions({
  name: 'InspectionDriverInfoPanel',
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

// region 巡检驱动搜索

async function handleInspectionDriverInfoSearch(): Promise<void> {
  if (props.inspectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForInspection({ long_id: props.inspectionId }, pagingInfo),
      inspectionDriverInfoTablePagingInfo.value,
    )
    updateInspectionDriverInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.inspectionId,
  () => {
    inspectionDriverInfoTableCurrentPage.value = 0
    handleInspectionDriverInfoSearch()
  },
)

onMounted(() => {
  handleInspectionDriverInfoSearch()
})

// endregion

// region 巡检驱动表格处理

const {
  currentPage: inspectionDriverInfoTableCurrentPage,
  pageSize: inspectionDriverInfoTablePageSize,
  itemCount: inspectionDriverInfoTableItemCount,
  items: inspectionDriverInfoTableItems,
  pagingInfo: inspectionDriverInfoTablePagingInfo,
  updateByLookup: updateInspectionDriverInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectionDriverInfo>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: InspectionDriverInfo, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
}

function handleInspectionDriverInfoPagingAttributeChanged(): void {
  handleInspectionDriverInfoSearch()
}

async function handleInspectionDriverInfoCopyKeyContextmenuClicked(
  row: InspectionDriverInfo,
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

function handleShowInspectionDriverInfoInspectDialog(item: InspectionDriverInfo): void {
  showInspectionDriverInfoInspectMaintainDialog(item)
}

function handleShowInspectionDriverInfoEditDialog(item: InspectionDriverInfo): void {
  showInspectionDriverInfoEditMaintainDialog(item)
}

async function handleInspectionDriverInfoDelete(item: InspectionDriverInfo): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此巡检驱动。是否继续?', '提示', {
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
      message: `巡检驱动 ${item.key.long_id} 删除成功`,
      type: 'success',
    })
    handleInspectionDriverInfoSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 巡检驱动维护对话框处理

type InspectionDriverInfoMaintainDialogItem = {
  long_id: string
  enabled: boolean
  type: string
  param: string
  remark: string
}

const {
  visible: inspectionDriverInfoMaintainDialogVisible,
  item: inspectionDriverInfoMaintainDialogItem,
  mode: inspectionDriverInfoMaintainDialogMode,
  showCreateDialog: showInspectionDriverInfoCreateMaintainDialog,
  showEditDialog: showInspectionDriverInfoEditMaintainDialog,
  showInspectDialog: showInspectionDriverInfoInspectMaintainDialog,
} = useGeneralMaintainDialog<InspectionDriverInfo, InspectionDriverInfoMaintainDialogItem>(
  inspectionDriverInfoMaintainDialogItemMap,
  {
    long_id: '',
    enabled: true,
    type: '',
    param: '',
    remark: '',
  },
)
const inspectionDriverInfoMaintainDialogLoading = ref<number>(0)
const inspectionDriverInfoMaintainDialogTypeValidator: FormItemRule['validator'] = (
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
      return resolveResponse(existsInspectionDriverSupport({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('巡检驱动类型不支持'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const inspectionDriverInfoMaintainDialogCreateRules = ref({
  type: [
    { validator: inspectionDriverInfoMaintainDialogTypeValidator, trigger: 'blur' },
    { required: true, message: '类型不能为空', trigger: 'blur' },
  ],
})
const inspectionDriverInfoMaintainDialogEditRules = ref({
  type: [
    { validator: inspectionDriverInfoMaintainDialogTypeValidator, trigger: 'blur' },
    { required: true, message: '类型不能为空', trigger: 'blur' },
  ],
})

function inspectionDriverInfoMaintainDialogItemMap(
  t: InspectionDriverInfo,
): InspectionDriverInfoMaintainDialogItem {
  return {
    long_id: t.key.long_id,
    enabled: t.enabled,
    type: t.type,
    param: t.param,
    remark: t.remark,
  }
}

async function handleInspectionDriverInfoCreate(
  item: InspectionDriverInfoMaintainDialogItem,
): Promise<void> {
  inspectionDriverInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        inspection_key: { long_id: props.inspectionId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '巡检驱动创建成功',
      type: 'success',
    })
    handleInspectionDriverInfoSearch()
    inspectionDriverInfoMaintainDialogVisible.value = false
  } finally {
    inspectionDriverInfoMaintainDialogLoading.value -= 1
  }
}

async function handleInspectionDriverInfoEdit(
  item: InspectionDriverInfoMaintainDialogItem,
): Promise<void> {
  inspectionDriverInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        inspection_key: { long_id: props.inspectionId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `巡检驱动 ${item.long_id} 更新成功`,
      type: 'success',
    })
    handleInspectionDriverInfoSearch()
    inspectionDriverInfoMaintainDialogVisible.value = false
  } finally {
    inspectionDriverInfoMaintainDialogLoading.value -= 1
  }
}

// endregion

// region 巡检驱动支持选择对话框处理

const inspectionDriverSupportDialogVisible = ref<boolean>(false)

function handleInspectionDriverSupportSelected(value: InspectionDriverSupport): void {
  inspectionDriverInfoMaintainDialogItem.value.type = value.key.string_id
  inspectionDriverInfoMaintainDialogItem.value.param = value.example_param
}

// endregion
</script>

<style scoped>
.inspection-driver-info-panel-container {
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
</style>
