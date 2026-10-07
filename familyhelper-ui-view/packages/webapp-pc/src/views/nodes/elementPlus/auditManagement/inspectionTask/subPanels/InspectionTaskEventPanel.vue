<template>
  <div class="inspection-task-event-panel-container">
    <placeholder-panel v-if="taskId === ''" text="请选择巡检任务" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleEventSearch">刷新数据</el-button>
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
            v-model:current-page="eventTableCurrentPage"
            v-model:page-size="eventTablePageSize"
            :item-count="eventTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="eventTableItems"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :edit-menu-item-visible="false"
            :delete-menu-item-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleEventSearch"
            @onItemInspect="handleShowInspectMaintainDialog"
          >
            <el-table-column
              label="发生时间"
              width="180px"
              show-overflow-tooltip
              :formatter="
                (row: DispInspectionTaskEvent) => formatNullableTimestamp(row.happened_date)
              "
            />
            <el-table-column prop="message" label="消息" show-overflow-tooltip />
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
      <el-form-item label="发生时间">
        <el-input v-model="inspectMaintainDialogItem.happened_date" readonly />
      </el-form-item>
      <el-form-item label="消息">
        <text-editor class="text-editor" v-model="inspectMaintainDialogItem.message" readonly />
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
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import {
  childForInspectionTaskDisp as childEventForTaskDisp,
  type DispInspectionTaskEvent,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionTaskEvent.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'InspectionTaskEventPanel',
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

// region 任务事件表格处理

const {
  currentPage: eventTableCurrentPage,
  pageSize: eventTablePageSize,
  itemCount: eventTableItemCount,
  items: eventTableItems,
  pagingInfo: eventTablePagingInfo,
  updateByLookup: updateEventTableByLookup,
} = useIdentityBackendPagingTablePanel<DispInspectionTaskEvent>(15)

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '（暂无）'
  }
  return formatTimestamp(value)
}

async function handleEventSearch(): Promise<void> {
  if (props.taskId === '') {
    return
  }
  loading.value += 1
  try {
    updateEventTableByLookup(
      await lookupWithAdjustPage(
        (pagingInfo) => childEventForTaskDisp({ long_id: props.taskId }, pagingInfo),
        eventTablePagingInfo.value,
      ),
    )
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.taskId,
  () => {
    void handleEventSearch()
  },
)

onMounted(() => {
  void handleEventSearch()
})

function refresh(): void {
  void handleEventSearch()
}

defineExpose({
  refresh,
})

// endregion

// region 查看对话框

type InspectMaintainDialogItem = {
  happened_date: string
  message: string
}

const {
  visible: inspectMaintainDialogVisible,
  item: inspectMaintainDialogItem,
  showDialog: showInspectMaintainDialog,
} = useInspectOnlyMaintainDialog<DispInspectionTaskEvent, InspectMaintainDialogItem>(
  (item) => ({
    happened_date: formatNullableTimestamp(item.happened_date),
    message: item.message,
  }),
  {
    happened_date: '',
    message: '',
  },
)

function handleShowInspectMaintainDialog(item: DispInspectionTaskEvent): void {
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
.inspection-task-event-panel-container {
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

.text-editor {
  height: 300px;
}
</style>
