<template>
  <div class="warmup-driver-info-panel-container">
    <placeholder-panel
      v-if="warmupSettingId === ''"
      :text="t('views.element_plus_engineering.settingrepo.select_warmup_setting')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showCreateDialog">
              {{ t('views.element_plus_engineering.settingrepo.create_driver') }}
            </el-button>
            <el-button type="success" @click="handleSearch">
              {{ t('views.element_plus_engineering.settingrepo.refresh_data') }}
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              {{ t('views.element_plus_engineering.settingrepo.apply_changes') }}
            </el-button>
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
            v-model:current-page="tableCurrentPage"
            v-model:page-size="tablePageSize"
            :item-count="tableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="tableItems"
            :operate-column-width="134"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
            @onItemInspect="showInspectDialog"
            @onItemEdit="showEditDialog"
            @onItemDelete="handleDelete"
          >
            <template v-slot:default>
              <el-table-column
                prop="enabled"
                :label="t('views.element_plus_engineering.settingrepo.enabled')"
                width="70"
                :formatter="enabledFormatter"
              />
              <el-table-column
                prop="type"
                :label="t('views.element_plus_engineering.settingrepo.type')"
                min-width="80"
                show-overflow-tooltip
              />
              <el-table-column
                class-name="single-line"
                prop="param"
                :label="t('views.element_plus_engineering.settingrepo.parameter')"
                min-width="80"
              />
              <el-table-column
                prop="remark"
                :label="t('views.element_plus_engineering.settingrepo.remark')"
                min-width="80"
                show-overflow-tooltip
              />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      label-width="90px"
      v-model:visible="dialogVisible"
      :loading="dialogLoading"
      :mode="dialogMode"
      :item="dialogItem"
      :create-rules="dialogRules"
      :edit-rules="dialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleCreate"
      @onItemEdit="handleUpdate"
    >
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.enabled')" prop="enabled">
        <el-switch
          v-model="dialogItem.enabled"
          :disabled="dialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.settingrepo.yes')"
          :inactive-text="t('views.element_plus_engineering.settingrepo.no')"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.type')" prop="type">
        <el-input v-model="dialogItem.type" :readonly="dialogMode === 'INSPECT'">
          <template v-slot:append>
            <el-button
              v-if="dialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="supportDialogVisible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.parameter')" prop="param">
        <text-editor
          class="text-editor"
          v-model="dialogItem.param"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.remark')" prop="remark">
        <el-input v-model="dialogItem.remark" :readonly="dialogMode === 'INSPECT'" />
      </el-form-item>
    </maintain-dialog>
    <warmup-driver-support-select-dialog
      v-model:visible="supportDialogVisible"
      @onConfirmed="handleSupportSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type DispWarmupDriverInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupDriverInfo.ts'
import {
  childForWarmupSettingDisp,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupDriverInfo.ts'
import {
  type WarmupDriverSupport,
  exists as existsDriverSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupDriverSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import WarmupDriverSupportSelectDialog from '@/views/nodes/elementPlusEngineering/settingrepo/warmupDriverSupport/WarmupDriverSupportSelectDialog.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'WarmupDriverInfoPanel',
})

// region Props 定义

type Props = {
  warmupSettingId: string
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

// region 头部面板

function handleApplyChangesClicked(): void {
  emit('onApplyChanges')
}

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 驱动器表格

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<DispWarmupDriverInfo>(15)

watch(
  () => props.warmupSettingId,
  () => {
    handleSearch()
  },
)

function handleSearch(): void {
  handleChildSearch()
}

async function handleChildSearch(): Promise<void> {
  if (props.warmupSettingId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForWarmupSettingDisp({ long_id: props.warmupSettingId }, pagingInfo),
      tablePagingInfo.value,
    )
    updateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSearch()
})

function handlePagingAttributeChanged(): void {
  handleSearch()
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: DispWarmupDriverInfo, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[column.property]
    ? t('views.element_plus_engineering.settingrepo.yes')
    : t('views.element_plus_engineering.settingrepo.no')
}

async function handleDelete(item: DispWarmupDriverInfo): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.delete_driver_confirmation'),
      t('views.element_plus_engineering.settingrepo.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.settingrepo.confirm'),
        cancelButtonText: t('views.element_plus_engineering.settingrepo.cancel'),
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
      message: t('views.element_plus_engineering.settingrepo.driver_deleted_successfully'),
      type: 'success',
    })
  } finally {
    loading.value -= 1
  }
  handleSearch()
}

// endregion

// region 驱动器维护对话框

type DialogItem = {
  long_id: string
  enabled: boolean
  type: string
  param: string
  remark: string
}

const {
  visible: dialogVisible,
  item: dialogItem,
  mode: dialogMode,
  showCreateDialog,
  showEditDialog,
  showInspectDialog,
} = useGeneralMaintainDialog<DispWarmupDriverInfo, DialogItem>(dialogItemMap, {
  long_id: '',
  enabled: true,
  type: '',
  param: '',
  remark: '',
})
const dialogLoading = ref<number>(0)
const supportDialogVisible = ref<boolean>(false)

const typeValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error(t('views.element_plus_engineering.settingrepo.type_required')))
        return Promise.reject()
      }
      return resolveResponse(existsDriverSupport({ string_id: res as string }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error(t('views.element_plus_engineering.settingrepo.driver_type_unsupported')))
        return Promise.reject()
      }
      callback()
    })
    .catch(() => {})
}

const dialogRules = ref({
  type: [
    { validator: typeValidator, trigger: 'blur' },
    {
      required: true,
      message: t('views.element_plus_engineering.settingrepo.type_required'),
      trigger: 'blur',
    },
  ],
})

function dialogItemMap(source: DispWarmupDriverInfo): DialogItem {
  return {
    long_id: source.key.long_id,
    enabled: source.enabled,
    type: source.type,
    param: source.param ?? '',
    remark: source.remark ?? '',
  }
}

function handleSupportSelected(value: WarmupDriverSupport): void {
  dialogItem.value.type = value.key.string_id
  dialogItem.value.param = value.example_param
}

async function handleCreate(item: DialogItem): Promise<void> {
  if (props.warmupSettingId === '') {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  dialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        warmup_setting_key: { long_id: props.warmupSettingId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.driver_created_successfully'),
      type: 'success',
    })
    dialogVisible.value = false
  } finally {
    dialogLoading.value -= 1
  }
  handleSearch()
}

async function handleUpdate(item: DialogItem): Promise<void> {
  if (props.warmupSettingId === '') {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  dialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        warmup_setting_key: { long_id: props.warmupSettingId },
        enabled: item.enabled,
        type: item.type,
        param: item.param,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.driver_updated_successfully'),
      type: 'success',
    })
    dialogVisible.value = false
  } finally {
    dialogLoading.value -= 1
  }
  handleSearch()
}

// endregion
</script>

<style scoped>
.warmup-driver-info-panel-container {
  height: 100%;
  width: 100%;
  background: var(--el-bg-color);
}

.main-container {
  height: 100%;
  width: 100%;
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

.table {
  height: 100%;
}

.text-editor {
  height: 300px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
