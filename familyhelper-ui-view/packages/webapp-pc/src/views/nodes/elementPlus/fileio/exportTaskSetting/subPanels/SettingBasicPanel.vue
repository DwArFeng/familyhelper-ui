<template>
  <div class="task-setting-basic-panel-container">
    <placeholder-panel v-if="settingId === ''" text="请选择任务设置" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="handleShowEditDialog">编辑设置</el-button>
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
            <el-form class="property-form" label-position="left" label-width="80px" inline>
              <el-form-item label="名称" style="width: 67%">{{ taskSetting.name }}</el-form-item>
              <el-form-item label="启用" style="width: 33%">{{
                formatBoolean(taskSetting.enabled)
              }}</el-form-item>
              <el-form-item label="备注" style="width: 100%">{{ taskSetting.remark }}</el-form-item>
            </el-form>
          </overlay-scrollbars-component>
        </template>
      </header-layout-panel>

      <maintain-dialog
        v-model:visible="dialogVisible"
        edit-title="编辑设置"
        mode="EDIT"
        :item="dialogItem"
        :loading="dialogLoading"
        :close-on-click-modal="false"
        @onItemEdit="handleEntityEdit"
      >
        <el-form-item label="名称" prop="name"><el-input v-model="dialogItem.name" /></el-form-item>
        <el-form-item label="启用" prop="enabled"
          ><el-switch v-model="dialogItem.enabled" active-text="是" inactive-text="否"
        /></el-form-item>
        <el-form-item label="备注" prop="remark"
          ><el-input v-model="dialogItem.remark"
        /></el-form-item>
      </maintain-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { ElMessage } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { resolveResponse } from '@/util/response.ts'
import {
  type ExportTaskSetting,
  get,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/fileio/exportTaskSetting.ts'

defineOptions({
  name: 'SettingBasicPanel',
})

type Props = {
  settingId: string
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  settingId: '',
  mode: 'DEFAULT',
})

type Emits = {
  (e: 'onSettingPropertyUpdated'): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

const loading = ref<number>(0)
const taskSetting = ref<ExportTaskSetting>({
  key: { long_id: '' },
  name: '',
  enabled: true,
  remark: '',
})
const dialogVisible = ref<boolean>(false)
const dialogLoading = ref<number>(0)
const dialogItem = ref<{ name: string; enabled: boolean; remark: string }>({
  name: '',
  enabled: true,
  remark: '',
})

function formatBoolean(value: boolean): string {
  return value ? '是' : '否'
}

async function handleSearch(): Promise<void> {
  if (props.settingId === '') {
    return
  }
  loading.value += 1
  try {
    taskSetting.value = await resolveResponse(get(props.settingId))
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.settingId,
  () => {
    void handleSearch()
  },
)

onMounted(() => {
  void handleSearch()
})

function handleShowEditDialog(): void {
  dialogItem.value = {
    name: taskSetting.value.name,
    enabled: taskSetting.value.enabled,
    remark: taskSetting.value.remark ?? '',
  }
  dialogVisible.value = true
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

async function handleEntityEdit(): Promise<void> {
  dialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: props.settingId },
        name: dialogItem.value.name,
        enabled: dialogItem.value.enabled,
        remark: dialogItem.value.remark,
      }),
    )
    dialogVisible.value = false
    ElMessage({
      showClose: true,
      type: 'success',
      message: `设置 ${dialogItem.value.name} 更新成功`,
    })
    emit('onSettingPropertyUpdated')
    await handleSearch()
  } finally {
    dialogLoading.value -= 1
  }
}

function refresh(): void {
  void handleSearch()
}

defineExpose({
  refresh,
})
</script>

<style scoped>
.task-setting-basic-panel-container {
  height: 100%;
  width: 100%;
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
</style>
