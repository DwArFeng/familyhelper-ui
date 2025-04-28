<template>
  <div class="item-label-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button class="insert-button" type="primary" @click="handleShowItemLabelCreateDialog">
            新建项目标签
          </el-button>
          <el-button type="success" @click="handleItemLabelSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          v-model:current-page="itemLabelTableCurrentPage"
          v-model:page-size="itemLabelTablePageSize"
          :item-count="itemLabelTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="itemLabelTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleItemLabelTablePagingAttributeChanged"
          @onItemInspect="handleShowItemLabelInspectDialog"
          @onItemEdit="handleShowItemLabelEditDialog"
          @onItemDelete="handleItemLabelDelete"
        >
          <el-table-column prop="key.string_id" label="项目标签" show-overflow-tooltip />
          <el-table-column prop="label" label="标签" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="itemLabelMaintainDialogVisible"
      :loading="itemLabelMaintainDialogLoading"
      :mode="itemLabelMaintainDialogMode"
      :item="itemLabelMaintainDialogItem"
      :create-rules="itemLabelMaintainDialogCreateRules"
      :edit-rules="itemLabelMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleItemLabelCreate"
      @onItemEdit="handleItemLabelEdit"
    >
      <el-form-item label="项目标签" prop="key_string_id">
        <el-input
          v-model="itemLabelMaintainDialogItem.key_string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="itemLabelMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="itemLabelMaintainDialogItem.label"
          :readonly="itemLabelMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="itemLabelMaintainDialogItem.remark"
          :readonly="itemLabelMaintainDialogMode === 'INSPECT'"
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
import { type ItemLabel } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import {
  all,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'ItemLabel',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowItemLabelCreateDialog(): void {
  showItemLabelCreateMaintainDialog()
}

// -----------------------------------------------------------项目标签指示器搜索-----------------------------------------------------------
function handleItemLabelSearch(): void {
  handleItemLabelAllSearch()
}

async function handleItemLabelAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      itemLabelTablePagingInfo.value,
    )
    updateItemLabelTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------项目标签指示器表格处理-----------------------------------------------------------
const {
  currentPage: itemLabelTableCurrentPage,
  pageSize: itemLabelTablePageSize,
  itemCount: itemLabelTableItemCount,
  items: itemLabelTableItems,
  pagingInfo: itemLabelTablePagingInfo,
  updateByLookup: updateItemLabelTableByLookup,
} = useIdentityBackendPagingTablePanel<ItemLabel>(15)

function handleItemLabelTablePagingAttributeChanged(): void {
  handleItemLabelSearch()
}

function handleShowItemLabelInspectDialog(item: ItemLabel): void {
  showItemLabelInspectMaintainDialog(item)
}

function handleShowItemLabelEditDialog(item: ItemLabel): void {
  showItemLabelEditMaintainDialog(item)
}

async function handleItemLabelDelete(item: ItemLabel): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此项目标签。<br>' +
        '任何与该标签关联的项目将会解除与该标签的关联<br>' +
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
      message: `项目标签 ${item.key.string_id} 删除成功`,
      type: 'success',
      center: true,
    })
    handleItemLabelSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------项目标签指示器对话框-----------------------------------------------------------
type ItemLabelMaintainDialogItem = {
  key_string_id: string
  label: string
  remark: string
}

const {
  visible: itemLabelMaintainDialogVisible,
  item: itemLabelMaintainDialogItem,
  mode: itemLabelMaintainDialogMode,
  showCreateDialog: showItemLabelCreateMaintainDialog,
  showEditDialog: showItemLabelEditMaintainDialog,
  showInspectDialog: showItemLabelInspectMaintainDialog,
} = useGeneralMaintainDialog<ItemLabel, ItemLabelMaintainDialogItem>(
  itemLabelMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    remark: '',
  },
)
const itemLabelMaintainDialogLoading = ref<number>(0)
const itemLabelKeyValidator: FormItemRule['validator'] = (_rule, value: string, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('项目标签不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('项目标签已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const itemLabelMaintainDialogCreateRules = ref({
  key_string_id: [{ required: true, validator: itemLabelKeyValidator, trigger: 'blur' }],
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})
const itemLabelMaintainDialogEditRules = ref({
  name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
})

function itemLabelMaintainDialogItemMap(item: ItemLabel): ItemLabelMaintainDialogItem {
  return {
    key_string_id: item.key.string_id,
    label: item.label,
    remark: item.remark,
  }
}

async function handleItemLabelCreate(item: ItemLabelMaintainDialogItem): Promise<void> {
  itemLabelMaintainDialogLoading.value += 1
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
      message: `项目标签 ${item.key_string_id} 创建成功`,
      type: 'success',
      center: true,
    })
    handleItemLabelSearch()
    itemLabelMaintainDialogVisible.value = false
  } finally {
    itemLabelMaintainDialogLoading.value -= 1
  }
}

async function handleItemLabelEdit(item: ItemLabelMaintainDialogItem): Promise<void> {
  itemLabelMaintainDialogLoading.value += 1
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
      message: `项目标签 ${item.key_string_id} 更新成功`,
      type: 'success',
      center: true,
    })
    handleItemLabelSearch()
    itemLabelMaintainDialogVisible.value = false
  } finally {
    itemLabelMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.item-label-container {
  width: 100%;
  height: 100%;
}
</style>
