<template>
  <div class="item-type-indicator-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="handleShowItemTypeIndicatorCreateDialog"
          >
            新建项目类型
          </el-button>
          <el-button type="success" @click="handleItemTypeIndicatorSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          v-model:current-page="itemTypeIndicatorTableCurrentPage"
          v-model:page-size="itemTypeIndicatorTablePageSize"
          :item-count="itemTypeIndicatorTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="itemTypeIndicatorTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleItemTypeIndicatorTablePagingAttributeChanged"
          @onItemInspect="handleShowItemTypeIndicatorInspectDialog"
          @onItemEdit="handleShowItemTypeIndicatorEditDialog"
          @onItemDelete="handleItemTypeIndicatorDelete"
        >
          <el-table-column prop="key.string_id" label="项目类型" show-overflow-tooltip />
          <el-table-column prop="label" label="标签" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="itemTypeIndicatorMaintainDialogVisible"
      :loading="itemTypeIndicatorMaintainDialogLoading"
      :mode="itemTypeIndicatorMaintainDialogMode"
      :item="itemTypeIndicatorMaintainDialogItem"
      :create-rules="itemTypeIndicatorMaintainDialogCreateRules"
      :edit-rules="itemTypeIndicatorMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleItemTypeIndicatorCreate"
      @onItemEdit="handleItemTypeIndicatorEdit"
    >
      <el-form-item label="项目类型" prop="key_string_id">
        <el-input
          v-model="itemTypeIndicatorMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="itemTypeIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="itemTypeIndicatorMaintainDialogItem.label"
          :readonly="itemTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="itemTypeIndicatorMaintainDialogItem.remark"
          :readonly="itemTypeIndicatorMaintainDialogMode === 'INSPECT'"
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
import { type ItemTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemTypeIndicator.ts'
import {
  all,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemTypeIndicator.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'ItemTypeIndicator',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowItemTypeIndicatorCreateDialog(): void {
  showItemTypeIndicatorCreateMaintainDialog()
}

// -----------------------------------------------------------项目类型指示器搜索-----------------------------------------------------------
function handleItemTypeIndicatorSearch(): void {
  handleItemTypeIndicatorAllSearch()
}

async function handleItemTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      itemTypeIndicatorTablePagingInfo.value,
    )
    updateItemTypeIndicatorTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------项目类型指示器表格处理-----------------------------------------------------------
const {
  currentPage: itemTypeIndicatorTableCurrentPage,
  pageSize: itemTypeIndicatorTablePageSize,
  itemCount: itemTypeIndicatorTableItemCount,
  items: itemTypeIndicatorTableItems,
  pagingInfo: itemTypeIndicatorTablePagingInfo,
  updateByLookup: updateItemTypeIndicatorTableByLookup,
} = useIdentityBackendPagingTablePanel<ItemTypeIndicator>(15)

function handleItemTypeIndicatorTablePagingAttributeChanged(): void {
  handleItemTypeIndicatorSearch()
}

function handleShowItemTypeIndicatorInspectDialog(item: ItemTypeIndicator): void {
  showItemTypeIndicatorInspectMaintainDialog(item)
}

function handleShowItemTypeIndicatorEditDialog(item: ItemTypeIndicator): void {
  showItemTypeIndicatorEditMaintainDialog(item)
}

async function handleItemTypeIndicatorDelete(item: ItemTypeIndicator): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此项目类型。<br>' +
        '如果已经有项目属于这个类型，那么该银行的类型将会变为"（未知）"！<br>' +
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
      message: `项目类型 ${item.key.string_id} 删除成功`,
      type: 'success',
    })
    handleItemTypeIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------项目类型指示器对话框-----------------------------------------------------------
type ItemTypeIndicatorMaintainDialogItem = {
  key_string_id: string
  label: string
  remark: string
}

const {
  visible: itemTypeIndicatorMaintainDialogVisible,
  item: itemTypeIndicatorMaintainDialogItem,
  mode: itemTypeIndicatorMaintainDialogMode,
  showCreateDialog: showItemTypeIndicatorCreateMaintainDialog,
  showEditDialog: showItemTypeIndicatorEditMaintainDialog,
  showInspectDialog: showItemTypeIndicatorInspectMaintainDialog,
} = useGeneralMaintainDialog<ItemTypeIndicator, ItemTypeIndicatorMaintainDialogItem>(
  itemTypeIndicatorMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    remark: '',
  },
)
const itemTypeIndicatorMaintainDialogLoading = ref<number>(0)
const itemTypeIndicatorKeyValidator: FormItemRule['validator'] = (
  _rule,
  value: string,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('项目类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('项目类型已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const itemTypeIndicatorMaintainDialogCreateRules = ref({
  key_string_id: [{ required: true, validator: itemTypeIndicatorKeyValidator, trigger: 'blur' }],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})
const itemTypeIndicatorMaintainDialogEditRules = ref({
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})

function itemTypeIndicatorMaintainDialogItemMap(
  item: ItemTypeIndicator,
): ItemTypeIndicatorMaintainDialogItem {
  return {
    key_string_id: item.key.string_id,
    label: item.label,
    remark: item.remark,
  }
}

async function handleItemTypeIndicatorCreate(
  item: ItemTypeIndicatorMaintainDialogItem,
): Promise<void> {
  itemTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `项目类型 ${item.key_string_id} 创建成功`,
      type: 'success',
    })
    handleItemTypeIndicatorSearch()
    itemTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    itemTypeIndicatorMaintainDialogLoading.value -= 1
  }
}

async function handleItemTypeIndicatorEdit(
  item: ItemTypeIndicatorMaintainDialogItem,
): Promise<void> {
  itemTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `项目类型 ${item.key_string_id} 更新成功`,
      type: 'success',
    })
    handleItemTypeIndicatorSearch()
    itemTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    itemTypeIndicatorMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.item-type-indicator-container {
  width: 100%;
  height: 100%;
}
</style>
