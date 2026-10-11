<template>
  <div class="inspection-task-alarm-panel-container">
    <placeholder-panel
      v-if="taskId === ''"
      :text="t('views.element_plus_engineering.audit_management.please_select_inspection_task')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleAlarmSearch">{{
              t('views.element_plus_engineering.audit_management.refresh_data')
            }}</el-button>
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
            v-model:current-page="alarmTableCurrentPage"
            v-model:page-size="alarmTablePageSize"
            :item-count="alarmTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="alarmTableItems"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :edit-menu-item-visible="false"
            :delete-menu-item-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handleAlarmSearch"
            @onItemInspect="handleShowInspectMaintainDialog"
          >
            <el-table-column
              prop="type"
              :label="t('views.element_plus_engineering.audit_management.type')"
              show-overflow-tooltip
            />
            <el-table-column
              :label="t('views.element_plus_engineering.audit_management.occurred_time')"
              width="180px"
              show-overflow-tooltip
              :formatter="(row: DispInspectionAlarm) => formatNullableTimestamp(row.happened_date)"
            />
            <el-table-column
              prop="message"
              :label="t('views.element_plus_engineering.audit_management.message')"
              show-overflow-tooltip
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
      <el-form-item :label="t('views.element_plus_engineering.audit_management.type')">
        <el-input v-model="inspectMaintainDialogItem.type" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.audit_management.occurred_time')">
        <el-input v-model="inspectMaintainDialogItem.happened_date" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.audit_management.message')">
        <text-editor class="text-editor" v-model="inspectMaintainDialogItem.message" readonly />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  childForInspectionTaskDisp as childAlarmForTaskDisp,
  type DispInspectionAlarm,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionAlarm.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'InspectionTaskAlarmPanel',
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

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 任务告警表格处理

const {
  currentPage: alarmTableCurrentPage,
  pageSize: alarmTablePageSize,
  itemCount: alarmTableItemCount,
  items: alarmTableItems,
  pagingInfo: alarmTablePagingInfo,
  updateByLookup: updateAlarmTableByLookup,
} = useIdentityBackendPagingTablePanel<DispInspectionAlarm>(15)

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return t('views.element_plus_engineering.audit_management.none_available_parenthesized')
  }
  return formatTimestamp(value)
}

async function handleAlarmSearch(): Promise<void> {
  if (props.taskId === '') {
    return
  }
  loading.value += 1
  try {
    updateAlarmTableByLookup(
      await lookupWithAdjustPage(
        (pagingInfo) => childAlarmForTaskDisp({ long_id: props.taskId }, pagingInfo),
        alarmTablePagingInfo.value,
      ),
    )
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.taskId,
  () => {
    void handleAlarmSearch()
  },
)

onMounted(() => {
  void handleAlarmSearch()
})

function refresh(): void {
  void handleAlarmSearch()
}

defineExpose({
  refresh,
})

// endregion

// region 查看对话框

type InspectMaintainDialogItem = {
  type: string
  happened_date: string
  message: string
}

const {
  visible: inspectMaintainDialogVisible,
  item: inspectMaintainDialogItem,
  showDialog: showInspectMaintainDialog,
} = useInspectOnlyMaintainDialog<DispInspectionAlarm, InspectMaintainDialogItem>(
  (item) => ({
    type: item.type,
    happened_date: formatNullableTimestamp(item.happened_date),
    message: item.message,
  }),
  {
    type: '',
    happened_date: '',
    message: '',
  },
)

function handleShowInspectMaintainDialog(item: DispInspectionAlarm): void {
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
.inspection-task-alarm-panel-container {
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
