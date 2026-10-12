<template>
  <div class="task-overview-panel-container">
    <placeholder-panel
      v-if="taskId === ''"
      :text="t('views.element_plus_engineering.logic_engine.please_select_task')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="task.status !== 0" @click="handleExecuteJob">
              {{ t('views.element_plus_engineering.logic_engine.execute_job') }}
            </el-button>
            <el-button type="success" @click="handleSearch">{{
              t('views.element_plus_engineering.logic_engine.refresh_data')
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
          <overlay-scrollbars-component class="scroll-bar">
            <el-form class="property-form" label-position="left" label-width="110px" inline>
              <el-form-item
                v-for="item in propertyItems"
                :key="item.id"
                :label="item.label"
                :style="{ width: item.width ?? '50%' }"
              >
                <el-tooltip
                  placement="top"
                  :content="item.tooltip ?? item.display"
                  :disabled="item.tooltipAlways !== true && !isPropertyTextOverflow(item.id)"
                  :show-after="200"
                >
                  <span
                    class="property-ellipsis"
                    @mouseenter="handlePropertyTextMouseEnter($event, item.id)"
                  >
                    {{ item.display }}
                  </span>
                </el-tooltip>
              </el-form-item>
            </el-form>
          </overlay-scrollbars-component>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import {
  type DispTask,
  getDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/task.ts'
import { execute } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/job.ts'
import {
  formatDuration,
  formatTimestamp,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'TaskOverviewPanel',
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
  (e: 'onTaskUpdated'): void
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

// region 任务概览

const task = ref<DispTask>({
  key: { long_id: '' },
  section_key: { long_id: '' },
  current_state_key: null,
  status: 0,
  created_date: 0,
  started_date: null,
  ended_date: null,
  duration: null,
  should_expire_date: 0,
  should_die_date: null,
  expired_date: null,
  died_date: null,
  state_changed_date: null,
  anchor_message: null,
  section: {
    key: { long_id: '' },
    name: '',
    enabled: false,
    expire_timeout: '0',
    remark: '',
  },
  current_state: null,
})

function formatTaskStatus(status: number): string {
  switch (status) {
    case 0:
      return t('views.element_plus_engineering.logic_engine.created')
    case 1:
      return t('views.element_plus_engineering.logic_engine.processing')
    case 2:
      return t('views.element_plus_engineering.logic_engine.completed')
    case 3:
      return t('views.element_plus_engineering.logic_engine.failed')
    case 4:
      return t('views.element_plus_engineering.logic_engine.expired')
    case 5:
      return t('views.element_plus_engineering.logic_engine.dead')
    default:
      return t('views.element_plus_engineering.logic_engine.unknown_status', {
        status,
      })
  }
}

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  return formatTimestamp(value)
}

function formatTaskDuration(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return String(value)
  }
  return formatDuration(numeric)
}

function formatDurationRawTitle(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  return t('views.element_plus_engineering.logic_engine.original_value_milliseconds', { value })
}

function formatCurrentState(value: DispTask): string {
  if (!value.current_state) {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  return `${value.current_state.name}（${value.current_state.key.state_id}）`
}

async function handleSearch(): Promise<void> {
  if (props.taskId === '') {
    return
  }
  loading.value += 1
  try {
    task.value = await resolveResponse(getDisp({ long_id: props.taskId }))
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.taskId,
  () => {
    void handleSearch()
  },
)

onMounted(() => {
  void handleSearch()
})

function refresh(): void {
  void handleSearch()
}

defineExpose({
  refresh,
})

// endregion

// region 属性表单

type PropertyItem = {
  id: string
  label: string
  display: string
  tooltip?: string
  tooltipAlways?: boolean
  width?: '50%' | '100%'
}

const propertyItems = computed<PropertyItem[]>(() => {
  const value = task.value
  return [
    {
      id: 'section_name',
      label: t('views.element_plus_engineering.logic_engine.section_name'),
      display: value.section?.name ?? '',
    },
    {
      id: 'current_state',
      label: t('views.element_plus_engineering.logic_engine.current_state'),
      display: formatCurrentState(value),
    },
    {
      id: 'status',
      label: t('views.element_plus_engineering.logic_engine.state'),
      display: formatTaskStatus(value.status),
    },
    {
      id: 'created_date',
      label: t('views.element_plus_engineering.logic_engine.created_time'),
      display: formatNullableTimestamp(value.created_date),
    },
    {
      id: 'started_date',
      label: t('views.element_plus_engineering.logic_engine.starting_time'),
      display: formatNullableTimestamp(value.started_date),
    },
    {
      id: 'ended_date',
      label: t('views.element_plus_engineering.logic_engine.ending_time'),
      display: formatNullableTimestamp(value.ended_date),
    },
    {
      id: 'duration',
      label: t('views.element_plus_engineering.logic_engine.duration'),
      display: formatTaskDuration(value.duration),
      tooltip: formatDurationRawTitle(value.duration),
      tooltipAlways: value.duration !== null && value.duration !== '',
    },
    {
      id: 'should_expire_date',
      label: t('views.element_plus_engineering.logic_engine.expected_expiration_time'),
      display: formatNullableTimestamp(value.should_expire_date),
    },
    {
      id: 'should_die_date',
      label: t('views.element_plus_engineering.logic_engine.expected_dead_time'),
      display: formatNullableTimestamp(value.should_die_date),
    },
    {
      id: 'expired_date',
      label: t('views.element_plus_engineering.logic_engine.expired_time'),
      display: formatNullableTimestamp(value.expired_date),
    },
    {
      id: 'died_date',
      label: t('views.element_plus_engineering.logic_engine.dead_time'),
      display: formatNullableTimestamp(value.died_date),
    },
    {
      id: 'state_changed_date',
      label: t('views.element_plus_engineering.logic_engine.state_changed_time'),
      display: formatNullableTimestamp(value.state_changed_date),
    },
    {
      id: 'anchor_message',
      label: t('views.element_plus_engineering.logic_engine.anchor_message'),
      display:
        value.anchor_message ||
        t('views.element_plus_engineering.logic_engine.none_available_parenthesized'),
      width: '100%',
    },
  ]
})

const propertyTextOverflow = ref<Record<string, boolean>>({})

function isPropertyTextOverflow(propertyId: string): boolean {
  return propertyTextOverflow.value[propertyId] === true
}

function handlePropertyTextMouseEnter(event: MouseEvent, propertyId: string): void {
  const target = event.currentTarget as HTMLElement
  propertyTextOverflow.value[propertyId] = target.scrollWidth > target.clientWidth
}

watch(task, () => {
  propertyTextOverflow.value = {}
})

// endregion

// region 面板悬浮

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 执行作业

async function handleExecuteJob(): Promise<void> {
  if (task.value.status !== 0) {
    return
  }
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.logic_engine.execute_task_job_confirmation'),
      t('views.element_plus_engineering.logic_engine.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.logic_engine.ok'),
        cancelButtonText: t('views.element_plus_engineering.logic_engine.cancel'),
        type: 'warning',
      },
    )
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(execute({ task_key: { long_id: props.taskId } }))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.job_executed'),
      type: 'success',
    })
    await handleSearch()
    emit('onTaskUpdated')
  } finally {
    loading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.task-overview-panel-container {
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

.scroll-bar {
  height: 100%;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__label) {
  width: 240px;
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-ellipsis {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 30px;
}
</style>
