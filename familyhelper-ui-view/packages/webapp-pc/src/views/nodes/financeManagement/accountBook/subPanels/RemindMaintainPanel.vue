<template>
  <div class="remind-maintain-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="handleShowRemindDriverInfoCreateDialog"
          >
            新建驱动器
          </el-button>
          <el-button type="success" @click="handleRemindDriverInfoSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:page-size="remindDriverInfoTablePageSize"
          v-model:current-page="remindDriverInfoTableCurrentPage"
          :item-count="remindDriverInfoTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="remindDriverInfoTableItems"
          @onPagingAttributeChanged="handleRemindDriverInfoTablePagingAttributeChanged"
          @onItemInspect="handleShowRemindDriverInfoInspectDialog"
          @onItemEdit="handleShowRemindDriverInfoEditDialog"
          @onItemDelete="handleRemindDriverInfoDelete"
        >
          <el-table-column
            prop="enabled"
            label="使能"
            show-overflow-tooltip
            :formatter="remindDriverInfoTableBooleanFormatter"
          />
          <el-table-column prop="type" label="类型" show-overflow-tooltip />
          <el-table-column prop="param" label="参数" class-name="single-line" />
          <el-table-column
            prop="remind_scope_type"
            label="提醒范围"
            :formatter="remindDriverInfoTableRemindScopeTypeFormatter"
          />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      label-width="100px"
      top="15vh"
      v-model:visible="remindDriverInfoMaintainDialogVisible"
      :loading="remindDriverInfoMaintainDialogLoading"
      :mode="remindDriverInfoMaintainDialogMode"
      :item="remindDriverInfoMaintainDialogItem"
      :create-rules="remindDriverInfoMaintainDialogRules"
      :edit-rules="remindDriverInfoMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleRemindDriverInfoCreate"
      @onItemEdit="handleRemindDriverInfoEdit"
    >
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="remindDriverInfoMaintainDialogItem.enabled"
          active-text="是"
          inactive-text="否"
          :disabled="remindDriverInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input
          v-model="remindDriverInfoMaintainDialogItem.type"
          :readonly="remindDriverInfoMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="remindDriverInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchButton"
              @click="remindDriverSupportSelectDialogVisible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="参数" prop="param">
        <text-editor
          class="text-editor"
          v-model="remindDriverInfoMaintainDialogItem.param"
          :readonly="remindDriverInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="提醒范围" prop="remind_scope_type">
        <el-select
          v-model="remindDriverInfoMaintainDialogItem.remind_scope_type"
          placeholder="请选择"
          :disabled="remindDriverInfoMaintainDialogMode === 'INSPECT'"
        >
          <el-option
            v-for="indicator in remindDriverInfoMaintainDialogRemindScopeIndicators"
            :key="indicator.key"
            :label="indicator.label"
            :value="indicator.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="remindDriverInfoMaintainDialogItem.remark"
          :readonly="remindDriverInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <remind-driver-support-select-dialog
      v-model:visible="remindDriverSupportSelectDialogVisible"
      @onConfirmed="handleRemindDriverSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { Search as SearchButton } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import RemindDriverSupportSelectDialog from '@/views/nodes/financeManagement/remindDriverSupport/RemindDriverSupportSelectDialog.vue'

import {
  type RemindDriverInfo,
  type RemindScopeType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/remindDriverInfo.ts'
import {
  childForAccountBook,
  insert,
  update,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/remindDriverInfo.ts'
import { type RemindDriverSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/remindDriverSupport.ts'
import { exists as existsRemindDriverSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/remindDriverSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'RemindMaintainPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountBookId?: string
}

const props = withDefaults(defineProps<Props>(), {
  accountBookId: '',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowRemindDriverInfoCreateDialog(): void {
  showRemindDriverInfoCreateMaintainDialog()
}

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
function handleRemindDriverInfoSearch(): void {
  if (!props.accountBookId) {
    return
  }
  handleRemindDriverInfoChildForAccountBookSearch()
}

async function handleRemindDriverInfoChildForAccountBookSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForAccountBook({ long_id: props.accountBookId }, pagingInfo),
      remindDriverInfoTablePagingInfo.value,
    )
    updateRemindDriverInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.accountBookId,
  () => {
    handleRemindDriverInfoSearch()
  },
)

onMounted(() => {
  handleRemindDriverInfoSearch()
})

// -----------------------------------------------------------提醒驱动器信息表格-----------------------------------------------------------
const {
  currentPage: remindDriverInfoTableCurrentPage,
  pageSize: remindDriverInfoTablePageSize,
  itemCount: remindDriverInfoTableItemCount,
  items: remindDriverInfoTableItems,
  pagingInfo: remindDriverInfoTablePagingInfo,
  updateByLookup: updateRemindDriverInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<RemindDriverInfo>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function remindDriverInfoTableBooleanFormatter(row: RemindDriverInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: boolean = (row as any)[column.property] as boolean
  return value ? '是' : '否'
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function remindDriverInfoTableRemindScopeTypeFormatter(row: RemindDriverInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as RemindScopeType
  switch (value) {
    case 0:
      return '仅自己'
    case 1:
      return '写权限者'
    case 2:
      return '读权限者'
    default:
      return '（未知）'
  }
}

function handleRemindDriverInfoTablePagingAttributeChanged(): void {
  handleRemindDriverInfoSearch()
}

function handleShowRemindDriverInfoInspectDialog(item: RemindDriverInfo): void {
  showRemindDriverInfoInspectMaintainDialog(item)
}

function handleShowRemindDriverInfoEditDialog(item: RemindDriverInfo): void {
  showRemindDriverInfoEditMaintainDialog(item)
}

async function handleRemindDriverInfoDelete(item: RemindDriverInfo): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此提醒驱动器。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove({ long_id: item.key.long_id }))
    ElMessage({
      showClose: true,
      message: '提醒驱动器删除成功',
      type: 'success',
    })
    handleRemindDriverInfoSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------提醒驱动器信息维护对话框-----------------------------------------------------------
type RemindDriverInfoMaintainDialogItem = {
  key_long_id: string
  enabled: boolean
  type: string
  param: string
  remind_scope_type: RemindScopeType
  remark: string
}
type RemindDriverInfoMaintainDialogRemindScopeIndicator = {
  key: RemindScopeType
  label: string
}

const {
  visible: remindDriverInfoMaintainDialogVisible,
  item: remindDriverInfoMaintainDialogItem,
  mode: remindDriverInfoMaintainDialogMode,
  showCreateDialog: showRemindDriverInfoCreateMaintainDialog,
  showEditDialog: showRemindDriverInfoEditMaintainDialog,
  showInspectDialog: showRemindDriverInfoInspectMaintainDialog,
} = useGeneralMaintainDialog<RemindDriverInfo, RemindDriverInfoMaintainDialogItem>(
  remindDriverInfoMaintainDialogItemMap,
  {
    key_long_id: '',
    enabled: false,
    type: '',
    param: '',
    remind_scope_type: 0,
    remark: '',
  },
)
const remindDriverInfoMaintainDialogLoading = ref<number>(0)
const remindDriverInfoTypeValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(existsRemindDriverSupport({ string_id: res }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('类型不支持'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const remindDriverInfoMaintainDialogRules = ref({
  type: [
    {
      required: true,
      validator: remindDriverInfoTypeValidator,
      trigger: 'blur',
    },
  ],
})
const remindDriverInfoMaintainDialogRemindScopeIndicators = ref<
  RemindDriverInfoMaintainDialogRemindScopeIndicator[]
>([
  { key: 0, label: '仅自己' },
  { key: 1, label: '写权限者' },
  { key: 2, label: '读权限者' },
])

function remindDriverInfoMaintainDialogItemMap(
  t: RemindDriverInfo,
): RemindDriverInfoMaintainDialogItem {
  return {
    key_long_id: t.key.long_id,
    enabled: t.enabled,
    type: t.type,
    param: t.param,
    remind_scope_type: t.remind_scope_type,
    remark: t.remark,
  }
}

async function handleRemindDriverInfoCreate(
  item: RemindDriverInfoMaintainDialogItem,
): Promise<void> {
  remindDriverInfoMaintainDialogLoading.value += 1
  try {
    const _accountBookId = props.accountBookId
    if (!_accountBookId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      insert({
        key: null,
        account_book_key: { long_id: _accountBookId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remind_scope_type: item.remind_scope_type,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '提醒驱动器创建成功',
      type: 'success',
    })
    handleRemindDriverInfoSearch()
    remindDriverInfoMaintainDialogVisible.value = false
  } finally {
    remindDriverInfoMaintainDialogLoading.value -= 1
  }
}

async function handleRemindDriverInfoEdit(item: RemindDriverInfoMaintainDialogItem): Promise<void> {
  remindDriverInfoMaintainDialogLoading.value += 1
  try {
    const _accountBookId = props.accountBookId
    if (!_accountBookId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      update({
        key: { long_id: item.key_long_id },
        account_book_key: { long_id: _accountBookId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remind_scope_type: item.remind_scope_type,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '提醒驱动器更新成功',
      type: 'success',
    })
    handleRemindDriverInfoSearch()
    remindDriverInfoMaintainDialogVisible.value = false
  } finally {
    remindDriverInfoMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------提醒驱动器支持选择对话框-----------------------------------------------------------
const remindDriverSupportSelectDialogVisible = ref<boolean>(false)

function handleRemindDriverSupportSelected(remindDriverSupport: RemindDriverSupport): void {
  remindDriverInfoMaintainDialogItem.value.type = remindDriverSupport.key.string_id
  remindDriverInfoMaintainDialogItem.value.param = remindDriverSupport.example_param
  remindDriverSupportSelectDialogVisible.value = false
}
</script>

<style scoped>
.remind-maintain-panel-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor {
  height: 300px;
}
</style>
