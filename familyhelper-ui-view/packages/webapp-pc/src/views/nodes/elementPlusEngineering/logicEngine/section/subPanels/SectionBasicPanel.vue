<template>
  <div class="section-basic-panel-container">
    <placeholder-panel
      v-if="sectionId === ''"
      :text="t('views.element_plus_engineering.logic_engine.please_select_section')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="handleShowEditDialog">{{
              t('views.element_plus_engineering.logic_engine.edit_section')
            }}</el-button>
            <el-button type="success" @click="handleSearch">{{
              t('views.element_plus_engineering.logic_engine.refresh_data')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              {{ t('views.element_plus_engineering.logic_engine.apply_changes') }}
            </el-button>
            <el-divider direction="vertical" />
            <el-button type="warning" @click="handleManualDispatch">{{
              t('views.element_plus_engineering.logic_engine.execute_manually')
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
                :label="t('views.element_plus_engineering.logic_engine.name')"
                style="width: 50%"
              >
                {{ sectionFormItem.name }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.logic_engine.enabled')"
                style="width: 50%"
              >
                {{ formatBoolean(sectionFormItem.enabled) }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.logic_engine.task_start_timeout')"
                style="width: 50%"
                :title="formatMillisRawTitle(sectionFormItem.expire_timeout)"
              >
                {{ formatMillis(sectionFormItem.expire_timeout) }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.logic_engine.remark')"
                style="width: 100%"
              >
                {{ sectionFormItem.remark }}
              </el-form-item>
            </el-form>
          </overlay-scrollbars-component>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      label-width="120px"
      v-model:visible="sectionMaintainDialogVisible"
      mode="EDIT"
      :edit-title="t('views.element_plus_engineering.logic_engine.edit_section')"
      :loading="sectionMaintainDialogLoading"
      :item="sectionMaintainDialogItem"
      :edit-rules="sectionMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemEdit="handleSectionEdit"
    >
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.name')" prop="name">
        <el-input v-model="sectionMaintainDialogItem.name" />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.enabled')"
        prop="enabled"
      >
        <el-switch
          v-model="sectionMaintainDialogItem.enabled"
          :active-text="t('views.element_plus_engineering.logic_engine.yes')"
          :inactive-text="t('views.element_plus_engineering.logic_engine.no')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.task_start_timeout')"
        prop="expire_timeout"
      >
        <el-input v-model="sectionMaintainDialogItem.expire_timeout">
          <template v-slot:append>{{
            t('views.element_plus_engineering.logic_engine.milliseconds')
          }}</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.remark')" prop="remark">
        <el-input v-model="sectionMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import {
  get,
  type Section,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/section.ts'
import { dispatch as manualDispatch } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/manualDispatch.ts'
import { formatDuration } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SectionBasicPanel',
})

// region Props 定义

type Props = {
  sectionId: string
  applyChangesDisabled?: boolean
  mode?: 'DEFAULT' | 'FLOATY'
}

const props = withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
  mode: 'DEFAULT',
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onSectionUpdated', section: Section): void
  (e: 'onApplyChanges'): void
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

// region 部件查询

async function handleSearch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await resolveResponse(get({ long_id: props.sectionId }))
    sectionFormItem.value.name = res.name
    sectionFormItem.value.enabled = res.enabled
    sectionFormItem.value.expire_timeout = res.expire_timeout
    sectionFormItem.value.remark = res.remark
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.sectionId,
  () => {
    handleSearch()
  },
)

onMounted(() => {
  handleSearch()
})

function refresh(): void {
  void handleSearch()
}

defineExpose({
  refresh,
})

// endregion

// region 手动执行

async function handleManualDispatch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.logic_engine.execute_section_manually_confirmation'),
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
    await resolveResponse(manualDispatch({ section_key: { long_id: props.sectionId } }))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.manual_execution_succeeded'),
      type: 'success',
    })
    await handleSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 面板悬浮

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 部件表单

type SectionFormItem = {
  name: string
  enabled: boolean
  expire_timeout: string
  remark: string
}

const sectionFormItem = ref<SectionFormItem>({
  name: '',
  enabled: false,
  expire_timeout: '0',
  remark: '',
})

function formatBoolean(value: boolean): string {
  return value
    ? t('views.element_plus_engineering.logic_engine.yes')
    : t('views.element_plus_engineering.logic_engine.no')
}

function formatMillis(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return String(value)
  }
  return formatDuration(numeric)
}

function formatMillisRawTitle(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  return t('views.element_plus_engineering.logic_engine.original_value_milliseconds', { value })
}

// endregion

// region 对话框

type SectionMaintainDialogItem = {
  name: string
  enabled: boolean
  expire_timeout: string
  remark: string
}

const sectionMaintainDialogVisible = ref<boolean>(false)
const sectionMaintainDialogLoading = ref<number>(0)
const sectionMaintainDialogItem = ref<SectionMaintainDialogItem>({
  name: '',
  enabled: true,
  expire_timeout: '0',
  remark: '',
})
const sectionMaintainDialogEditRules = {
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.name_required'),
      trigger: 'blur',
    },
  ],
  expire_timeout: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.task_start_timeout_required'),
      trigger: 'blur',
    },
  ],
}

function handleShowEditDialog(): void {
  sectionMaintainDialogItem.value = {
    name: sectionFormItem.value.name,
    enabled: sectionFormItem.value.enabled,
    expire_timeout: sectionFormItem.value.expire_timeout,
    remark: sectionFormItem.value.remark,
  }
  sectionMaintainDialogVisible.value = true
}

async function handleSectionEdit(item: SectionMaintainDialogItem): Promise<void> {
  sectionMaintainDialogLoading.value += 1
  try {
    const payload: Section = {
      key: { long_id: props.sectionId },
      name: item.name,
      enabled: item.enabled,
      expire_timeout: item.expire_timeout,
      remark: item.remark,
    }
    await resolveResponse(update(payload))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.section_updated'),
      type: 'success',
    })
    emit('onSectionUpdated', payload)
    sectionMaintainDialogVisible.value = false
    await handleSearch()
  } finally {
    sectionMaintainDialogLoading.value -= 1
  }
}

function handleApplyChangesClicked(): void {
  emit('onApplyChanges')
}

// endregion
</script>

<style scoped>
.section-basic-panel-container {
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
.header-container .el-divider--vertical {
  margin: 0 8px;
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
