<template>
  <div class="bank-card-type-indicator-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="handleShowBankCardTypeIndicatorCreateDialog"
          >
            新建银行卡类型
          </el-button>
          <el-button type="success" @click="handleBankCardTypeIndicatorSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          v-model:current-page="bankCardTypeIndicatorTableCurrentPage"
          v-model:page-size="bankCardTypeIndicatorTablePageSize"
          :item-count="bankCardTypeIndicatorTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="bankCardTypeIndicatorTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleBankCardTypeIndicatorTablePagingAttributeChanged"
          @onItemInspect="handleShowBankCardTypeIndicatorInspectDialog"
          @onItemEdit="handleShowBankCardTypeIndicatorEditDialog"
          @onItemDelete="handleBankCardTypeIndicatorDelete"
        >
          <el-table-column prop="key.string_id" label="银行卡类型" show-overflow-tooltip />
          <el-table-column prop="label" label="标签" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="bankCardTypeIndicatorMaintainDialogVisible"
      :loading="bankCardTypeIndicatorMaintainDialogLoading"
      :mode="bankCardTypeIndicatorMaintainDialogMode"
      :item="bankCardTypeIndicatorMaintainDialogItem"
      :create-rules="bankCardTypeIndicatorMaintainDialogCreateRules"
      :edit-rules="bankCardTypeIndicatorMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleBankCardTypeIndicatorCreate"
      @onItemEdit="handleBankCardTypeIndicatorEdit"
    >
      <el-form-item label="银行卡类型" prop="key_string_id">
        <el-input
          v-model="bankCardTypeIndicatorMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="bankCardTypeIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="bankCardTypeIndicatorMaintainDialogItem.label"
          :readonly="bankCardTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="bankCardTypeIndicatorMaintainDialogItem.remark"
          :readonly="bankCardTypeIndicatorMaintainDialogMode === 'INSPECT'"
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
import { type BankCardTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCardTypeIndicator.ts'
import {
  all,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/bankCardTypeIndicator.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'BankCardTypeIndicator',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowBankCardTypeIndicatorCreateDialog(): void {
  showBankCardTypeIndicatorCreateMaintainDialog()
}

// -----------------------------------------------------------银行卡类型指示器搜索-----------------------------------------------------------
function handleBankCardTypeIndicatorSearch(): void {
  handleBankCardTypeIndicatorAllSearch()
}

async function handleBankCardTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      bankCardTypeIndicatorTablePagingInfo.value,
    )
    updateBankCardTypeIndicatorTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------银行卡类型指示器表格处理-----------------------------------------------------------
const {
  currentPage: bankCardTypeIndicatorTableCurrentPage,
  pageSize: bankCardTypeIndicatorTablePageSize,
  itemCount: bankCardTypeIndicatorTableItemCount,
  items: bankCardTypeIndicatorTableItems,
  pagingInfo: bankCardTypeIndicatorTablePagingInfo,
  updateByLookup: updateBankCardTypeIndicatorTableByLookup,
} = useIdentityBackendPagingTablePanel<BankCardTypeIndicator>(15)

function handleBankCardTypeIndicatorTablePagingAttributeChanged(): void {
  handleBankCardTypeIndicatorSearch()
}

function handleShowBankCardTypeIndicatorInspectDialog(item: BankCardTypeIndicator): void {
  showBankCardTypeIndicatorInspectMaintainDialog(item)
}

function handleShowBankCardTypeIndicatorEditDialog(item: BankCardTypeIndicator): void {
  showBankCardTypeIndicatorEditMaintainDialog(item)
}

async function handleBankCardTypeIndicatorDelete(item: BankCardTypeIndicator): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此银行卡类型。<br>' +
        '如果已经有银行卡属于这个类型，那么该银行的类型将会变为"（未知）"！<br>' +
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
      message: `银行卡类型 ${item.key.string_id} 删除成功`,
      type: 'success',
    })
    handleBankCardTypeIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------银行卡类型指示器对话框-----------------------------------------------------------
type BankCardTypeIndicatorMaintainDialogItem = {
  key_string_id: string
  label: string
  remark: string
}

const {
  visible: bankCardTypeIndicatorMaintainDialogVisible,
  item: bankCardTypeIndicatorMaintainDialogItem,
  mode: bankCardTypeIndicatorMaintainDialogMode,
  showCreateDialog: showBankCardTypeIndicatorCreateMaintainDialog,
  showEditDialog: showBankCardTypeIndicatorEditMaintainDialog,
  showInspectDialog: showBankCardTypeIndicatorInspectMaintainDialog,
} = useGeneralMaintainDialog<BankCardTypeIndicator, BankCardTypeIndicatorMaintainDialogItem>(
  bankCardTypeIndicatorMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    remark: '',
  },
)
const bankCardTypeIndicatorMaintainDialogLoading = ref<number>(0)
const bankCardTypeIndicatorKeyValidator: FormItemRule['validator'] = (
  _rule,
  value: string,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('银行卡类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('银行卡类型已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const bankCardTypeIndicatorMaintainDialogCreateRules = ref({
  key_string_id: [
    { required: true, validator: bankCardTypeIndicatorKeyValidator, trigger: 'blur' },
  ],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})
const bankCardTypeIndicatorMaintainDialogEditRules = ref({
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})

function bankCardTypeIndicatorMaintainDialogItemMap(
  item: BankCardTypeIndicator,
): BankCardTypeIndicatorMaintainDialogItem {
  return {
    key_string_id: item.key.string_id,
    label: item.label,
    remark: item.remark,
  }
}

async function handleBankCardTypeIndicatorCreate(
  item: BankCardTypeIndicatorMaintainDialogItem,
): Promise<void> {
  bankCardTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `银行卡类型 ${item.key_string_id} 创建成功`,
      type: 'success',
    })
    handleBankCardTypeIndicatorSearch()
    bankCardTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    bankCardTypeIndicatorMaintainDialogLoading.value -= 1
  }
}

async function handleBankCardTypeIndicatorEdit(
  item: BankCardTypeIndicatorMaintainDialogItem,
): Promise<void> {
  bankCardTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `银行卡类型 ${item.key_string_id} 更新成功`,
      type: 'success',
    })
    handleBankCardTypeIndicatorSearch()
    bankCardTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    bankCardTypeIndicatorMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.bank-card-type-indicator-container {
  width: 100%;
  height: 100%;
}
</style>
