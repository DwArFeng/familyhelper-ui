<template>
  <div class="inspection-alarm-type-indicator-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="insert-button"
            type="primary"
            @click="showInspectionAlarmTypeIndicatorCreateMaintainDialog"
          >
            新建类型
          </el-button>
          <el-button type="success" @click="handleInspectionAlarmTypeIndicatorSearch">
            刷新数据
          </el-button>
          <el-divider direction="vertical" />
          <el-input
            class="id-search-bar"
            v-model="idSearchBarValue"
            clearable
            @keydown.enter="handleInspectionAlarmTypeIndicatorSearch"
            @clear="handleInspectionAlarmTypeIndicatorSearch"
          >
            <template v-slot:prepend>
              <span>类型 ID</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleInspectionAlarmTypeIndicatorSearch" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="inspectionAlarmTypeIndicatorTableCurrentPage"
          v-model:page-size="inspectionAlarmTypeIndicatorTablePageSize"
          :item-count="inspectionAlarmTypeIndicatorTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="inspectionAlarmTypeIndicatorTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleInspectionAlarmTypeIndicatorPagingAttributeChanged"
          @onItemInspect="handleShowInspectionAlarmTypeIndicatorInspectDialog"
          @onItemEdit="handleShowInspectionAlarmTypeIndicatorEditDialog"
          @onItemDelete="handleInspectionAlarmTypeIndicatorDelete"
        >
          <template v-slot:default>
            <el-table-column prop="key.string_id" label="类型 ID" show-overflow-tooltip />
            <el-table-column prop="label" label="标签" show-overflow-tooltip />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </template>
          <template
            v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
          >
            <ul>
              <li
                @click="
                  handleInspectionAlarmTypeIndicatorCopyKeyContextmenuClicked(
                    row as InspectionAlarmTypeIndicator,
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
    </root-border-layout-panel>
    <maintain-dialog
      label-width="90px"
      v-model:visible="inspectionAlarmTypeIndicatorMaintainDialogVisible"
      :loading="inspectionAlarmTypeIndicatorMaintainDialogLoading"
      :mode="inspectionAlarmTypeIndicatorMaintainDialogMode"
      :item="inspectionAlarmTypeIndicatorMaintainDialogItem"
      :create-rules="inspectionAlarmTypeIndicatorMaintainDialogCreateRules"
      :edit-rules="inspectionAlarmTypeIndicatorMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleInspectionAlarmTypeIndicatorCreate"
      @onItemEdit="handleInspectionAlarmTypeIndicatorEdit"
    >
      <el-form-item label="类型 ID" prop="key_string_id">
        <el-input
          v-model="inspectionAlarmTypeIndicatorMaintainDialogItem.key_string_id"
          :readonly="inspectionAlarmTypeIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="inspectionAlarmTypeIndicatorMaintainDialogItem.label"
          :readonly="inspectionAlarmTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="inspectionAlarmTypeIndicatorMaintainDialogItem.remark"
          :readonly="inspectionAlarmTypeIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import {
  all,
  exists,
  get,
  insert,
  type InspectionAlarmTypeIndicator,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionAlarmTypeIndicator.ts'
import { type PagedData } from '@dwarfeng/familyhelper-ui-component-api/src/util/response.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'InspectionAlarmTypeIndicator',
})

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

const idSearchBarValue = ref<string>('')

// endregion

// region 告警类型搜索

function handleInspectionAlarmTypeIndicatorSearch(): void {
  if (idSearchBarValue.value !== '') {
    handleInspectionAlarmTypeIndicatorIdSearch()
  } else {
    handleInspectionAlarmTypeIndicatorAllSearch()
  }
}

async function handleInspectionAlarmTypeIndicatorIdSearch(): Promise<void> {
  loading.value += 1
  try {
    const existed = await resolveResponse(exists({ string_id: idSearchBarValue.value }))
    if (!existed) {
      const empty: PagedData<InspectionAlarmTypeIndicator> = {
        current_page: 0,
        total_pages: 0,
        rows: inspectionAlarmTypeIndicatorTablePageSize.value,
        count: '0',
        data: [],
      }
      updateInspectionAlarmTypeIndicatorTableByLookup(empty)
      return
    }
    const item = await resolveResponse(get({ string_id: idSearchBarValue.value }))
    updateInspectionAlarmTypeIndicatorTableByLookup({
      current_page: 0,
      total_pages: 1,
      rows: 1,
      count: '1',
      data: [item],
    })
  } finally {
    loading.value -= 1
  }
}

async function handleInspectionAlarmTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      inspectionAlarmTypeIndicatorTablePagingInfo.value,
    )
    updateInspectionAlarmTypeIndicatorTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleInspectionAlarmTypeIndicatorSearch()
})

// endregion

// region 告警类型表格处理

const {
  currentPage: inspectionAlarmTypeIndicatorTableCurrentPage,
  pageSize: inspectionAlarmTypeIndicatorTablePageSize,
  itemCount: inspectionAlarmTypeIndicatorTableItemCount,
  items: inspectionAlarmTypeIndicatorTableItems,
  pagingInfo: inspectionAlarmTypeIndicatorTablePagingInfo,
  updateByLookup: updateInspectionAlarmTypeIndicatorTableByLookup,
} = useIdentityBackendPagingTablePanel<InspectionAlarmTypeIndicator>(15)

function handleInspectionAlarmTypeIndicatorPagingAttributeChanged(): void {
  handleInspectionAlarmTypeIndicatorSearch()
}

async function handleInspectionAlarmTypeIndicatorCopyKeyContextmenuClicked(
  row: InspectionAlarmTypeIndicator,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.string_id)
  ElMessage({
    showClose: true,
    message: '复制成功',
    type: 'success',
  })
}

function handleShowInspectionAlarmTypeIndicatorInspectDialog(
  item: InspectionAlarmTypeIndicator,
): void {
  showInspectionAlarmTypeIndicatorInspectMaintainDialog(item)
}

function handleShowInspectionAlarmTypeIndicatorEditDialog(
  item: InspectionAlarmTypeIndicator,
): void {
  showInspectionAlarmTypeIndicatorEditMaintainDialog(item)
}

async function handleInspectionAlarmTypeIndicatorDelete(
  item: InspectionAlarmTypeIndicator,
): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此告警类型。<br>' +
        '删除后，巡检告警页可能无法解析对应类型标签，但不删除既有告警数据。<br>' +
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
      message: `告警类型 ${item.key.string_id} 删除成功`,
      type: 'success',
    })
    handleInspectionAlarmTypeIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 告警类型维护对话框处理

type InspectionAlarmTypeIndicatorMaintainDialogItem = {
  key_string_id: string
  label: string
  remark: string
}

const {
  visible: inspectionAlarmTypeIndicatorMaintainDialogVisible,
  item: inspectionAlarmTypeIndicatorMaintainDialogItem,
  mode: inspectionAlarmTypeIndicatorMaintainDialogMode,
  showCreateDialog: showInspectionAlarmTypeIndicatorCreateMaintainDialog,
  showEditDialog: showInspectionAlarmTypeIndicatorEditMaintainDialog,
  showInspectDialog: showInspectionAlarmTypeIndicatorInspectMaintainDialog,
} = useGeneralMaintainDialog<
  InspectionAlarmTypeIndicator,
  InspectionAlarmTypeIndicatorMaintainDialogItem
>(inspectionAlarmTypeIndicatorMaintainDialogItemMap, {
  key_string_id: '',
  label: '',
  remark: '',
})
const inspectionAlarmTypeIndicatorMaintainDialogLoading = ref<number>(0)
const inspectionAlarmTypeIndicatorMaintainDialogKeyValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('类型 ID 不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('类型 ID 已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const inspectionAlarmTypeIndicatorMaintainDialogCreateRules = ref({
  key_string_id: [
    {
      validator: inspectionAlarmTypeIndicatorMaintainDialogKeyValidator,
      trigger: 'blur',
    },
    { required: true, message: '类型 ID 不能为空', trigger: 'blur' },
  ],
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
})
const inspectionAlarmTypeIndicatorMaintainDialogEditRules = ref({
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
})

function inspectionAlarmTypeIndicatorMaintainDialogItemMap(
  t: InspectionAlarmTypeIndicator,
): InspectionAlarmTypeIndicatorMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    label: t.label,
    remark: t.remark,
  }
}

async function handleInspectionAlarmTypeIndicatorCreate(
  item: InspectionAlarmTypeIndicatorMaintainDialogItem,
): Promise<void> {
  inspectionAlarmTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `告警类型 ${item.key_string_id} 创建成功`,
      type: 'success',
    })
    handleInspectionAlarmTypeIndicatorSearch()
    inspectionAlarmTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    inspectionAlarmTypeIndicatorMaintainDialogLoading.value -= 1
  }
}

async function handleInspectionAlarmTypeIndicatorEdit(
  item: InspectionAlarmTypeIndicatorMaintainDialogItem,
): Promise<void> {
  inspectionAlarmTypeIndicatorMaintainDialogLoading.value += 1
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
      message: `告警类型 ${item.key_string_id} 更新成功`,
      type: 'success',
    })
    handleInspectionAlarmTypeIndicatorSearch()
    inspectionAlarmTypeIndicatorMaintainDialogVisible.value = false
  } finally {
    inspectionAlarmTypeIndicatorMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.inspection-alarm-type-indicator-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
