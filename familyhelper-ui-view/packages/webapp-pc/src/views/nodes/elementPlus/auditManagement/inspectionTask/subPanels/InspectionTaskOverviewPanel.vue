<template>
  <div class="inspection-task-overview-panel-container">
    <placeholder-panel v-if="taskId === ''" text="请选择巡检任务" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="task.status !== 0" @click="handleExecuteJob">
              执行作业
            </el-button>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
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
              <el-form-item label="任务 ID" style="width: 50%">
                {{ task.key.long_id }}
              </el-form-item>
              <el-form-item label="巡检 ID" style="width: 50%">
                {{ task.inspection_key.long_id }}
              </el-form-item>
              <el-form-item label="巡检名称" style="width: 50%">
                {{ task.inspection?.name ?? '' }}
              </el-form-item>
              <el-form-item label="状态" style="width: 50%">
                {{ formatTaskStatus(task.status) }}
              </el-form-item>
              <el-form-item label="创建时间" style="width: 50%">
                {{ formatNullableTimestamp(task.created_date) }}
              </el-form-item>
              <el-form-item label="开始时间" style="width: 50%">
                {{ formatNullableTimestamp(task.started_date) }}
              </el-form-item>
              <el-form-item label="结束时间" style="width: 50%">
                {{ formatNullableTimestamp(task.ended_date) }}
              </el-form-item>
              <el-form-item
                label="持续时间"
                style="width: 50%"
                :title="formatInspectionDurationRawTitle(task.duration)"
              >
                {{ formatInspectionDuration(task.duration) }}
              </el-form-item>
              <el-form-item label="应过期时间" style="width: 50%">
                {{ formatNullableTimestamp(task.should_expire_date) }}
              </el-form-item>
              <el-form-item label="应僵死时间" style="width: 50%">
                {{ formatNullableTimestamp(task.should_die_date) }}
              </el-form-item>
              <el-form-item label="过期时间" style="width: 50%">
                {{ formatNullableTimestamp(task.expired_date) }}
              </el-form-item>
              <el-form-item label="僵死时间" style="width: 50%">
                {{ formatNullableTimestamp(task.died_date) }}
              </el-form-item>
              <el-form-item label="锚点消息" style="width: 100%">
                {{ task.anchor_message || '（暂无）' }}
              </el-form-item>
            </el-form>
          </overlay-scrollbars-component>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import {
  type DispInspectionTask,
  getDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionTask.ts'
import { execute } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/inspectionJob.ts'
import {
  formatDuration,
  formatTimestamp,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'InspectionTaskOverviewPanel',
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

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 任务概览

const task = ref<DispInspectionTask>({
  key: { long_id: '' },
  inspection_key: { long_id: '' },
  status: 0,
  created_date: 0,
  started_date: null,
  ended_date: null,
  duration: null,
  should_expire_date: 0,
  should_die_date: null,
  expired_date: null,
  died_date: null,
  anchor_message: null,
  inspection: {
    key: { long_id: '' },
    name: '',
    enabled: true,
    remark: '',
  },
})

function formatTaskStatus(status: number): string {
  switch (status) {
    case 0:
      return '已创建'
    case 1:
      return '处理中'
    case 2:
      return '已完成'
    case 3:
      return '失败'
    case 4:
      return '已过期'
    case 5:
      return '已僵死'
    default:
      return `未知（${status}）`
  }
}

function formatNullableTimestamp(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '（暂无）'
  }
  return formatTimestamp(value)
}

function formatInspectionDuration(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '（暂无）'
  }
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return String(value)
  }
  return formatDuration(numeric)
}

function formatInspectionDurationRawTitle(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '（暂无）'
  }
  return `原始值 ${value} ms`
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
    await ElMessageBox.confirm('此操作将对当前任务执行巡检作业。是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(execute({ inspection_task_key: { long_id: props.taskId } }))
    ElMessage({
      showClose: true,
      message: '作业执行成功',
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
.inspection-task-overview-panel-container {
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
</style>
