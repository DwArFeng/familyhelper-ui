<template>
  <div class="task-variable-panel-container">
    <placeholder-panel v-if="taskId === ''" text="请选择任务" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleVariableSearch">刷新数据</el-button>
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
            v-model:current-page="variableTableCurrentPage"
            v-model:page-size="variableTablePageSize"
            :item-count="variableTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="variableTableItems"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :edit-menu-item-visible="false"
            :delete-menu-item-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleVariableSearch"
            @onItemInspect="handleShowInspectMaintainDialog"
          >
            <el-table-column
              prop="key.variable_string_id"
              label="变量 ID"
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column label="值类型" width="90" :formatter="valueTypeFormatter" />
            <el-table-column
              label="值"
              min-width="80"
              show-overflow-tooltip
              :formatter="valueFormatter"
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="inspectMaintainDialogVisible"
      mode="INSPECT"
      :item="inspectMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item label="变量 ID">
        <el-input v-model="inspectMaintainDialogItem.variable_string_id" readonly />
      </el-form-item>
      <el-form-item label="值类型">
        <el-input v-model="inspectMaintainDialogItem.value_type_label" readonly />
      </el-form-item>
      <el-form-item label="文本">
        <el-input v-model="inspectMaintainDialogItem.string_value" readonly />
      </el-form-item>
      <el-form-item label="整数">
        <el-input v-model="inspectMaintainDialogItem.long_value" readonly />
      </el-form-item>
      <el-form-item label="浮点数">
        <el-input v-model="inspectMaintainDialogItem.double_value" readonly />
      </el-form-item>
      <el-form-item label="布尔">
        <el-input v-model="inspectMaintainDialogItem.boolean_value" readonly />
      </el-form-item>
      <el-form-item label="日期">
        <el-input v-model="inspectMaintainDialogItem.date_value" readonly />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import {
  childForTaskDisp,
  type DispTaskVariable,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/taskVariable.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'TaskVariablePanel',
})

// region Props 定义

type Props = {
  taskId: string
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 任务变量表格处理

const {
  currentPage: variableTableCurrentPage,
  pageSize: variableTablePageSize,
  itemCount: variableTableItemCount,
  items: variableTableItems,
  pagingInfo: variableTablePagingInfo,
  updateByLookup: updateVariableTableByLookup,
} = useIdentityBackendPagingTablePanel<DispTaskVariable>(15)

function formatValueType(valueType: number): string {
  switch (valueType) {
    case 0:
      return '文本'
    case 1:
      return '整数'
    case 2:
      return '浮点数'
    case 3:
      return '布尔'
    case 4:
      return '日期'
    default:
      return `未知（${valueType}）`
  }
}

function formatVariableValue(row: DispTaskVariable): string {
  switch (row.value_type) {
    case 0:
      return row.string_value
    case 1:
      return row.long_value
    case 2:
      return String(row.double_value)
    case 3:
      return row.boolean_value ? '是' : '否'
    case 4:
      return formatTimestamp(row.date_value)
    default:
      return `未知（${row.value_type}）`
  }
}

function valueTypeFormatter(row: DispTaskVariable): string {
  return formatValueType(row.value_type)
}

function valueFormatter(row: DispTaskVariable): string {
  return formatVariableValue(row)
}

async function handleVariableSearch(): Promise<void> {
  if (props.taskId === '') {
    return
  }
  loading.value += 1
  try {
    updateVariableTableByLookup(
      await lookupWithAdjustPage(
        (pagingInfo) => childForTaskDisp({ long_id: props.taskId }, pagingInfo),
        variableTablePagingInfo.value,
      ),
    )
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.taskId,
  () => {
    void handleVariableSearch()
  },
)

onMounted(() => {
  void handleVariableSearch()
})

function refresh(): void {
  void handleVariableSearch()
}

defineExpose({
  refresh,
})

// endregion

// region 查看对话框

type InspectMaintainDialogItem = {
  variable_string_id: string
  value_type_label: string
  string_value: string
  long_value: string
  double_value: string
  boolean_value: string
  date_value: string
}

const {
  visible: inspectMaintainDialogVisible,
  item: inspectMaintainDialogItem,
  showDialog: showInspectMaintainDialog,
} = useInspectOnlyMaintainDialog<DispTaskVariable, InspectMaintainDialogItem>(
  (item) => ({
    variable_string_id: item.key.variable_string_id,
    value_type_label: formatValueType(item.value_type),
    string_value: item.string_value,
    long_value: item.long_value,
    double_value: String(item.double_value),
    boolean_value: item.boolean_value ? '是' : '否',
    date_value: formatTimestamp(item.date_value),
  }),
  {
    variable_string_id: '',
    value_type_label: '',
    string_value: '',
    long_value: '',
    double_value: '',
    boolean_value: '',
    date_value: '',
  },
)

function handleShowInspectMaintainDialog(item: DispTaskVariable): void {
  showInspectMaintainDialog(item)
}

// endregion

// region 面板悬浮

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion
</script>

<style scoped>
.task-variable-panel-container {
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
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
}
</style>
