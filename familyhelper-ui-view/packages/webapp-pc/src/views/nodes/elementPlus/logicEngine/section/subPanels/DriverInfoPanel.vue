<template>
  <div class="driver-info-panel-container">
    <placeholder-panel v-if="sectionId === ''" text="请选择部件" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showDriverInfoCreateMaintainDialog"
              >新建驱动器</el-button
            >
            <el-button type="success" @click="handleDriverInfoSearch">刷新数据</el-button>
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
            v-model:current-page="driverInfoTableCurrentPage"
            v-model:page-size="driverInfoTablePageSize"
            :item-count="driverInfoTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="driverInfoTableItems"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleDriverInfoPagingAttributeChanged"
            @onItemInspect="handleShowDriverInfoInspectDialog"
            @onItemEdit="handleShowDriverInfoEditDialog"
            @onItemDelete="handleDriverInfoDelete"
          >
            <template v-slot:default>
              <el-table-column
                prop="enabled"
                label="使能"
                width="70"
                :formatter="enabledFormatter"
              />
              <el-table-column prop="type" label="类型" min-width="80" show-overflow-tooltip />
              <el-table-column class-name="single-line" prop="param" label="参数" min-width="80" />
              <el-table-column prop="remark" label="备注" min-width="80" show-overflow-tooltip />
            </template>
            <template
              v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
            >
              <ul>
                <li @click="handleDriverInfoCopyKeyContextmenuClicked(row as DriverInfo, close)">
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
      v-model:visible="driverInfoMaintainDialogVisible"
      :loading="driverInfoMaintainDialogLoading"
      :mode="driverInfoMaintainDialogMode"
      :item="driverInfoMaintainDialogItem"
      :create-rules="driverInfoMaintainDialogCreateRules"
      :edit-rules="driverInfoMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleDriverInfoCreate"
      @onItemEdit="handleDriverInfoEdit"
    >
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="driverInfoMaintainDialogItem.enabled"
          :disabled="driverInfoMaintainDialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="driverInfoMaintainDialogItem.type"
          :readonly="driverInfoMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="driverInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="driverSupportDialogVisible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="参数" prop="param">
        <text-editor
          class="text-editor"
          v-model="driverInfoMaintainDialogItem.param"
          :readonly="driverInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="driverInfoMaintainDialogItem.remark"
          :readonly="driverInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <driver-support-select-dialog
      v-model:visible="driverSupportDialogVisible"
      @onConfirmed="handleDriverSupportSelected"
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
  childForSection,
  type DriverInfo,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/driverInfo.ts'
import {
  type DriverSupport,
  exists as existsDriverSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/driverSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import DriverSupportSelectDialog from '../../driverSupport/DriverSupportSelectDialog.vue'

defineOptions({
  name: 'DriverInfoPanel',
})

// region Props 定义

type Props = {
  sectionId: string
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

// region 驱动器搜索

async function handleDriverInfoSearch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForSection({ long_id: props.sectionId }, pagingInfo),
      driverInfoTablePagingInfo.value,
    )
    updateDriverInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.sectionId,
  () => {
    driverInfoTableCurrentPage.value = 0
    handleDriverInfoSearch()
  },
)

onMounted(() => {
  handleDriverInfoSearch()
})

// endregion

// region 驱动器表格处理

const {
  currentPage: driverInfoTableCurrentPage,
  pageSize: driverInfoTablePageSize,
  itemCount: driverInfoTableItemCount,
  items: driverInfoTableItems,
  pagingInfo: driverInfoTablePagingInfo,
  updateByLookup: updateDriverInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<DriverInfo>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: DriverInfo, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
}

function handleDriverInfoPagingAttributeChanged(): void {
  handleDriverInfoSearch()
}

async function handleDriverInfoCopyKeyContextmenuClicked(
  row: DriverInfo,
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

function handleShowDriverInfoInspectDialog(item: DriverInfo): void {
  showDriverInfoInspectMaintainDialog(item)
}

function handleShowDriverInfoEditDialog(item: DriverInfo): void {
  showDriverInfoEditMaintainDialog(item)
}

async function handleDriverInfoDelete(item: DriverInfo): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此驱动器。是否继续?', '提示', {
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
      message: '驱动器删除成功',
      type: 'success',
    })
    await handleDriverInfoSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 驱动器维护对话框处理

type DriverInfoMaintainDialogItem = {
  long_id: string
  enabled: boolean
  type: string
  param: string
  remark: string
}

const {
  visible: driverInfoMaintainDialogVisible,
  item: driverInfoMaintainDialogItem,
  mode: driverInfoMaintainDialogMode,
  showCreateDialog: showDriverInfoCreateMaintainDialog,
  showEditDialog: showDriverInfoEditMaintainDialog,
  showInspectDialog: showDriverInfoInspectMaintainDialog,
} = useGeneralMaintainDialog<DriverInfo, DriverInfoMaintainDialogItem>(
  driverInfoMaintainDialogItemMap,
  {
    long_id: '',
    enabled: true,
    type: '',
    param: '',
    remark: '',
  },
)
const driverInfoMaintainDialogLoading = ref<number>(0)
const driverInfoMaintainDialogTypeValidator: FormItemRule['validator'] = (
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
      return resolveResponse(existsDriverSupport({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('驱动器类型不支持'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const driverInfoMaintainDialogCreateRules = ref({
  type: [
    { validator: driverInfoMaintainDialogTypeValidator, trigger: 'blur' },
    { required: true, message: '类型不能为空', trigger: 'blur' },
  ],
})
const driverInfoMaintainDialogEditRules = ref({
  type: [
    { validator: driverInfoMaintainDialogTypeValidator, trigger: 'blur' },
    { required: true, message: '类型不能为空', trigger: 'blur' },
  ],
})

function driverInfoMaintainDialogItemMap(t: DriverInfo): DriverInfoMaintainDialogItem {
  return {
    long_id: t.key.long_id,
    enabled: t.enabled,
    type: t.type,
    param: t.param,
    remark: t.remark,
  }
}

async function handleDriverInfoCreate(item: DriverInfoMaintainDialogItem): Promise<void> {
  driverInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        section_key: { long_id: props.sectionId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '驱动器创建成功',
      type: 'success',
    })
    await handleDriverInfoSearch()
    driverInfoMaintainDialogVisible.value = false
  } finally {
    driverInfoMaintainDialogLoading.value -= 1
  }
}

async function handleDriverInfoEdit(item: DriverInfoMaintainDialogItem): Promise<void> {
  driverInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        section_key: { long_id: props.sectionId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '驱动器更新成功',
      type: 'success',
    })
    await handleDriverInfoSearch()
    driverInfoMaintainDialogVisible.value = false
  } finally {
    driverInfoMaintainDialogLoading.value -= 1
  }
}

// endregion

// region 驱动器支持选择对话框处理

const driverSupportDialogVisible = ref<boolean>(false)

function handleDriverSupportSelected(value: DriverSupport): void {
  driverInfoMaintainDialogItem.value.type = value.key.string_id
  driverInfoMaintainDialogItem.value.param = value.example_param
}

// endregion
</script>

<style scoped>
.driver-info-panel-container {
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
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
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
