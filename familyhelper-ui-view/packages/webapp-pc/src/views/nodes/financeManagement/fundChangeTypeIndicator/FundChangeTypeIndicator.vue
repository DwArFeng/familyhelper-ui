<template>
  <div class="fund-change-type-indicator-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="handleShowFundChangeTypeIndicatorCreateDialog"
          >
            新建资金变更类型
          </el-button>
          <el-button type="success" @click="handleFundChangeTypeIndicatorSearch"
            >刷新数据</el-button
          >
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          v-model:current-page="fundChangeTypeIndicatorTableCurrentPage"
          v-model:page-size="fundChangeTypeIndicatorTablePageSize"
          :item-count="fundChangeTypeIndicatorTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="fundChangeTypeIndicatorTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleFundChangeTypeIndicatorTablePagingAttributeChanged"
          @onItemInspect="handleShowFundChangeTypeIndicatorInspectDialog"
          @onItemEdit="handleShowFundChangeTypeIndicatorEditDialog"
          @onItemDelete="handleFundChangeTypeIndicatorDelete"
        >
          <el-table-column prop="key.string_id" label="资金变更类型" show-overflow-tooltip />
          <el-table-column prop="label" label="标签" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="fundChangeTypeIndicatorMaintainDialogVisible"
      :loading="fundChangeTypeIndicatorMaintainDialogLoading"
      :mode="fundChangeTypeIndicatorMaintainDialogMode"
      :item="fundChangeTypeIndicatorMaintainDialogItem"
      :create-rules="fundChangeTypeIndicatorMaintainDialogCreateRules"
      :edit-rules="fundChangeTypeIndicatorMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleFundChangeTypeIndicatorCreate"
      @onItemEdit="handleFundChangeTypeIndicatorEdit"
    >
      <el-form-item label="资金变更类型" prop="key_string_id">
        <el-input
          v-model="fundChangeTypeIndicatorMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="fundChangeTypeIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="fundChangeTypeIndicatorMaintainDialogItem.label"
          :readonly="fundChangeTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="fundChangeTypeIndicatorMaintainDialogItem.remark"
          :readonly="fundChangeTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'
import { type FundChangeTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import {
  all,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'FundChangeTypeIndicator',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowFundChangeTypeIndicatorCreateDialog(): void {
  showFundChangeTypeIndicatorCreateMaintainDialog()
}

// -----------------------------------------------------------资金变更类型指示器搜索-----------------------------------------------------------
function handleFundChangeTypeIndicatorSearch(): void {
  handleFundChangeTypeIndicatorAllSearch()
}

async function handleFundChangeTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      fundChangeTypeIndicatorTablePagingInfo.value,
    )
    updateFundChangeTypeIndicatorTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------资金变更类型指示器表格处理-----------------------------------------------------------
const {
  currentPage: fundChangeTypeIndicatorTableCurrentPage,
  pageSize: fundChangeTypeIndicatorTablePageSize,
  itemCount: fundChangeTypeIndicatorTableItemCount,
  items: fundChangeTypeIndicatorTableItems,
  pagingInfo: fundChangeTypeIndicatorTablePagingInfo,
  updateByLookup: updateFundChangeTypeIndicatorTableByLookup,
} = useIdentityBackendPagingTablePanel<FundChangeTypeIndicator>(15)

function handleFundChangeTypeIndicatorTablePagingAttributeChanged(): void {
  handleFundChangeTypeIndicatorSearch()
}

function handleShowFundChangeTypeIndicatorInspectDialog(item: FundChangeTypeIndicator): void {
  showFundChangeTypeIndicatorInspectMaintainDialog(item)
}

function handleShowFundChangeTypeIndicatorEditDialog(item: FundChangeTypeIndicator): void {
  showFundChangeTypeIndicatorEditMaintainDialog(item)
}

async function handleFundChangeTypeIndicatorDelete(item: FundChangeTypeIndicator): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此资金变更类型。<br>' +
        '如果已经有资金变更属于这个类型，那么该银行的类型将会变为"（未知）"！<br>' +
        '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
      message: `资金变更类型 ${item.key.string_id} 删除成功`,
      type: 'success',
    })
    handleFundChangeTypeIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------资金变更类型指示器对话框-----------------------------------------------------------
type FundChangeTypeIndicatorMaintainDialogItem = {
  key_string_id: string
  label: string
  remark: string
}

const {
  visible: fundChangeTypeIndicatorMaintainDialogVisible,
  item: fundChangeTypeIndicatorMaintainDialogItem,
  mode: fundChangeTypeIndicatorMaintainDialogMode,
  showCreateDialog: showFundChangeTypeIndicatorCreateMaintainDialog,
  showEditDialog: showFundChangeTypeIndicatorEditMaintainDialog,
  showInspectDialog: showFundChangeTypeIndicatorInspectMaintainDialog,
} = useGeneralMaintainDialog<FundChangeTypeIndicator, FundChangeTypeIndicatorMaintainDialogItem>(
  fundChangeTypeIndicatorMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    remark: '',
  },
)
const fundChangeTypeIndicatorMaintainDialogLoading = ref<number>(0)
const fundChangeTypeIndicatorKeyValidator: FormItemRule['validator'] = (
  _rule,
  value: string,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('资金变更类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('资金变更类型已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const fundChangeTypeIndicatorMaintainDialogCreateRules = ref({
  key_string_id: [
    { required: true, validator: fundChangeTypeIndicatorKeyValidator, trigger: 'blur' },
  ],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})
const fundChangeTypeIndicatorMaintainDialogEditRules = ref({
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})

function fundChangeTypeIndicatorMaintainDialogItemMap(
  item: FundChangeTypeIndicator,
): FundChangeTypeIndicatorMaintainDialogItem {
  return {
    key_string_id: item.key.string_id,
    label: item.label,
    remark: item.remark,
  }
}

async function handleFundChangeTypeIndicatorCreate(
  item: FundChangeTypeIndicatorMaintainDialogItem,
): Promise<void> {
  fundChangeTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `资金变更类型 ${item.key_string_id} 创建成功`,
      type: 'success',
    })
    handleFundChangeTypeIndicatorSearch()
    fundChangeTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    fundChangeTypeIndicatorMaintainDialogLoading.value -= 1
  }
}

async function handleFundChangeTypeIndicatorEdit(
  item: FundChangeTypeIndicatorMaintainDialogItem,
): Promise<void> {
  fundChangeTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `资金变更类型 ${item.key_string_id} 更新成功`,
      type: 'success',
    })
    handleFundChangeTypeIndicatorSearch()
    fundChangeTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    fundChangeTypeIndicatorMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.fund-change-type-indicator-container {
  width: 100%;
  height: 100%;
}
</style>
