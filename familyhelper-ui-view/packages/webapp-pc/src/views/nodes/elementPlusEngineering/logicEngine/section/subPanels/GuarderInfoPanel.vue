<template>
  <div class="guarder-info-panel-container">
    <placeholder-panel
      v-if="sectionId === ''"
      :text="t('views.element_plus_engineering.logic_engine.please_select_section')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showGuarderInfoCreateMaintainDialog">
              {{ t('views.element_plus_engineering.logic_engine.create_guarder') }}
            </el-button>
            <el-button type="success" @click="handleGuarderInfoSearch">{{
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
            v-model:current-page="guarderInfoTableCurrentPage"
            v-model:page-size="guarderInfoTablePageSize"
            :item-count="guarderInfoTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="guarderInfoTableItems"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleGuarderInfoPagingAttributeChanged"
            @onItemInspect="handleShowGuarderInfoInspectDialog"
            @onItemEdit="handleShowGuarderInfoEditDialog"
            @onItemDelete="handleGuarderInfoDelete"
          >
            <template v-slot:default>
              <el-table-column
                prop="index"
                :label="t('views.element_plus_engineering.logic_engine.order')"
                width="70"
              />
              <el-table-column
                prop="enabled"
                :label="t('views.element_plus_engineering.logic_engine.enabled')"
                width="70"
                :formatter="enabledFormatter"
              />
              <el-table-column
                :label="t('views.element_plus_engineering.logic_engine.condition_anchor_state')"
                min-width="140"
                show-overflow-tooltip
              >
                <template v-slot="{ row }">
                  {{ formatStateLabel((row as DispGuarderInfo).anchor_state) }}
                </template>
              </el-table-column>
              <el-table-column
                :label="t('views.element_plus_engineering.logic_engine.condition_target_state')"
                min-width="140"
                show-overflow-tooltip
              >
                <template v-slot="{ row }">
                  {{ formatStateLabel((row as DispGuarderInfo).target_state) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="type"
                :label="t('views.element_plus_engineering.logic_engine.type')"
                min-width="80"
                show-overflow-tooltip
              />
              <el-table-column
                class-name="single-line"
                prop="param"
                :label="t('views.element_plus_engineering.logic_engine.parameters')"
                min-width="80"
              />
              <el-table-column
                prop="remark"
                :label="t('views.element_plus_engineering.logic_engine.remark')"
                min-width="80"
                show-overflow-tooltip
              />
            </template>
            <template
              v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
            >
              <ul>
                <li
                  @click="handleGuarderInfoCopyKeyContextmenuClicked(row as DispGuarderInfo, close)"
                >
                  {{ t('views.element_plus_engineering.logic_engine.copy_primary_key') }}
                </li>
                <el-divider />
                <li @click="fireItemInspect">
                  {{ t('views.element_plus_engineering.logic_engine.inspect_ellipsis') }}
                </li>
                <li @click="fireItemEdit">
                  {{ t('views.element_plus_engineering.logic_engine.edit_ellipsis') }}
                </li>
                <li @click="fireItemDelete">
                  {{ t('views.element_plus_engineering.logic_engine.delete_ellipsis') }}
                </li>
              </ul>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      label-width="120px"
      v-model:visible="guarderInfoMaintainDialogVisible"
      :loading="guarderInfoMaintainDialogLoading"
      :mode="guarderInfoMaintainDialogMode"
      :item="guarderInfoMaintainDialogItem"
      :create-rules="guarderInfoMaintainDialogCreateRules"
      :edit-rules="guarderInfoMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleGuarderInfoCreate"
      @onItemEdit="handleGuarderInfoEdit"
    >
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.order')" prop="index">
        <el-input-number
          v-model="guarderInfoMaintainDialogItem.index"
          :disabled="guarderInfoMaintainDialogMode === 'INSPECT'"
          :min="0"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.enabled')"
        prop="enabled"
      >
        <el-switch
          v-model="guarderInfoMaintainDialogItem.enabled"
          :disabled="guarderInfoMaintainDialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.logic_engine.yes')"
          :inactive-text="t('views.element_plus_engineering.logic_engine.no')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.condition_anchor_state')"
        prop="anchor_state_id"
      >
        <el-input v-model="guarderInfoMaintainDialogItem.anchor_state_label" readonly>
          <template v-slot:append>
            <el-button
              v-if="guarderInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="openStateSelect('anchor')"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.condition_target_state')"
        prop="target_state_id"
      >
        <el-input v-model="guarderInfoMaintainDialogItem.target_state_label" readonly>
          <template v-slot:append>
            <el-button
              v-if="guarderInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="openStateSelect('target')"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.type')" prop="type">
        <el-input
          v-model="guarderInfoMaintainDialogItem.type"
          :readonly="guarderInfoMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="guarderInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="guarderSupportDialogVisible = true"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.parameters')"
        prop="param"
      >
        <text-editor
          class="text-editor"
          v-model="guarderInfoMaintainDialogItem.param"
          :readonly="guarderInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.remark')" prop="remark">
        <el-input
          v-model="guarderInfoMaintainDialogItem.remark"
          :readonly="guarderInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <state-select-dialog
      v-model:visible="stateSelectDialogVisible"
      :section-id="sectionId"
      @onConfirmed="handleStateSelected"
    />
    <guarder-support-select-dialog
      v-model:visible="guarderSupportDialogVisible"
      @onConfirmed="handleGuarderSupportSelected"
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

import {
  childForSectionDisp,
  type DispGuarderInfo,
  type GuarderInfo,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/guarderInfo.ts'
import {
  exists as existsGuarderSupport,
  type GuarderSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/guarderSupport.ts'
import { type State } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/state.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import StateSelectDialog from './StateSelectDialog.vue'
import GuarderSupportSelectDialog from '../../guarderSupport/GuarderSupportSelectDialog.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'GuarderInfoPanel',
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

// region 守卫器搜索

async function handleGuarderInfoSearch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForSectionDisp({ long_id: props.sectionId }, pagingInfo),
      guarderInfoTablePagingInfo.value,
    )
    updateGuarderInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.sectionId,
  () => {
    guarderInfoTableCurrentPage.value = 0
    handleGuarderInfoSearch()
  },
)

onMounted(() => {
  handleGuarderInfoSearch()
})

// endregion

// region 守卫器表格处理

const {
  currentPage: guarderInfoTableCurrentPage,
  pageSize: guarderInfoTablePageSize,
  itemCount: guarderInfoTableItemCount,
  items: guarderInfoTableItems,
  pagingInfo: guarderInfoTablePagingInfo,
  updateByLookup: updateGuarderInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<DispGuarderInfo>(15)

function formatStateLabel(state: State | null | undefined): string {
  if (!state) {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  return `${state.name}（${state.key.state_id}）`
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: DispGuarderInfo, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean)
    ? t('views.element_plus_engineering.logic_engine.yes')
    : t('views.element_plus_engineering.logic_engine.no')
}

function handleGuarderInfoPagingAttributeChanged(): void {
  handleGuarderInfoSearch()
}

async function handleGuarderInfoCopyKeyContextmenuClicked(
  row: DispGuarderInfo,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.long_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.logic_engine.copy_succeeded'),
    type: 'success',
  })
}

function handleShowGuarderInfoInspectDialog(item: DispGuarderInfo): void {
  showGuarderInfoInspectMaintainDialog(item)
}

function handleShowGuarderInfoEditDialog(item: DispGuarderInfo): void {
  showGuarderInfoEditMaintainDialog(item)
}

async function handleGuarderInfoDelete(item: DispGuarderInfo): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.logic_engine.delete_guarder_confirmation'),
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
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.guarder_deleted'),
      type: 'success',
    })
    await handleGuarderInfoSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 守卫器维护对话框处理

type GuarderInfoMaintainDialogItem = {
  long_id: string
  index: number
  enabled: boolean
  anchor_section_long_id: string
  anchor_state_id: string
  anchor_state_label: string
  target_section_long_id: string
  target_state_id: string
  target_state_label: string
  type: string
  param: string
  remark: string
}

const emptyGuarderInfoMaintainDialogItem = (): GuarderInfoMaintainDialogItem => ({
  long_id: '',
  index: 0,
  enabled: true,
  anchor_section_long_id: '',
  anchor_state_id: '',
  anchor_state_label: '',
  target_section_long_id: '',
  target_state_id: '',
  target_state_label: '',
  type: '',
  param: '',
  remark: '',
})

const {
  visible: guarderInfoMaintainDialogVisible,
  item: guarderInfoMaintainDialogItem,
  mode: guarderInfoMaintainDialogMode,
  showCreateDialog: showGuarderInfoCreateMaintainDialog,
  showEditDialog: showGuarderInfoEditMaintainDialog,
  showInspectDialog: showGuarderInfoInspectMaintainDialog,
} = useGeneralMaintainDialog<DispGuarderInfo, GuarderInfoMaintainDialogItem>(
  guarderInfoMaintainDialogItemMap,
  emptyGuarderInfoMaintainDialogItem(),
)
const guarderInfoMaintainDialogLoading = ref<number>(0)
const guarderInfoStateValidator =
  (field: 'anchor_state_id' | 'target_state_id', message: string): FormItemRule['validator'] =>
  (_rule, _value, callback) => {
    if (guarderInfoMaintainDialogItem.value[field] === '') {
      callback(new Error(message))
      return
    }
    callback()
  }
const guarderInfoMaintainDialogTypeValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error(t('views.element_plus_engineering.logic_engine.type_required')))
        return Promise.reject()
      }
      return resolveResponse(existsGuarderSupport({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(
          new Error(t('views.element_plus_engineering.logic_engine.unsupported_guarder_type')),
        )
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const guarderInfoMaintainDialogRules = {
  index: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.order_required'),
      trigger: 'blur',
    },
  ],
  anchor_state_id: [
    {
      required: true,
      validator: guarderInfoStateValidator(
        'anchor_state_id',
        t('views.element_plus_engineering.logic_engine.condition_anchor_state_required'),
      ),
      trigger: 'change',
    },
  ],
  target_state_id: [
    {
      required: true,
      validator: guarderInfoStateValidator(
        'target_state_id',
        t('views.element_plus_engineering.logic_engine.condition_target_state_required'),
      ),
      trigger: 'change',
    },
  ],
  type: [
    { validator: guarderInfoMaintainDialogTypeValidator, trigger: 'blur' },
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.type_required'),
      trigger: 'blur',
    },
  ],
}
const guarderInfoMaintainDialogCreateRules = ref(guarderInfoMaintainDialogRules)
const guarderInfoMaintainDialogEditRules = ref(guarderInfoMaintainDialogRules)

function guarderInfoMaintainDialogItemMap(t: DispGuarderInfo): GuarderInfoMaintainDialogItem {
  return {
    long_id: t.key.long_id,
    index: t.index,
    enabled: t.enabled,
    anchor_section_long_id: t.anchor_state_key.section_long_id,
    anchor_state_id: t.anchor_state_key.state_id,
    anchor_state_label: formatStateLabel(t.anchor_state),
    target_section_long_id: t.target_state_key.section_long_id,
    target_state_id: t.target_state_key.state_id,
    target_state_label: formatStateLabel(t.target_state),
    type: t.type,
    param: t.param,
    remark: t.remark,
  }
}

function buildGuarderInfoPayload(item: GuarderInfoMaintainDialogItem): Omit<GuarderInfo, 'key'> {
  return {
    section_key: { long_id: props.sectionId },
    anchor_state_key: {
      section_long_id: item.anchor_section_long_id,
      state_id: item.anchor_state_id,
    },
    target_state_key: {
      section_long_id: item.target_section_long_id,
      state_id: item.target_state_id,
    },
    index: item.index,
    enabled: item.enabled,
    type: item.type,
    param: item.param,
    remark: item.remark,
  }
}

async function handleGuarderInfoCreate(item: GuarderInfoMaintainDialogItem): Promise<void> {
  guarderInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        ...buildGuarderInfoPayload(item),
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.guarder_created'),
      type: 'success',
    })
    await handleGuarderInfoSearch()
    guarderInfoMaintainDialogVisible.value = false
  } finally {
    guarderInfoMaintainDialogLoading.value -= 1
  }
}

async function handleGuarderInfoEdit(item: GuarderInfoMaintainDialogItem): Promise<void> {
  guarderInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        ...buildGuarderInfoPayload(item),
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.guarder_updated'),
      type: 'success',
    })
    await handleGuarderInfoSearch()
    guarderInfoMaintainDialogVisible.value = false
  } finally {
    guarderInfoMaintainDialogLoading.value -= 1
  }
}

// endregion

// region 状态选择对话框处理

type StateSelectRole = 'anchor' | 'target'

const stateSelectDialogVisible = ref<boolean>(false)
const stateSelectRole = ref<StateSelectRole>('anchor')

function openStateSelect(role: StateSelectRole): void {
  stateSelectRole.value = role
  stateSelectDialogVisible.value = true
}

function handleStateSelected(state: State): void {
  const label = formatStateLabel(state)
  if (stateSelectRole.value === 'anchor') {
    guarderInfoMaintainDialogItem.value.anchor_section_long_id = state.key.section_long_id
    guarderInfoMaintainDialogItem.value.anchor_state_id = state.key.state_id
    guarderInfoMaintainDialogItem.value.anchor_state_label = label
    return
  }
  guarderInfoMaintainDialogItem.value.target_section_long_id = state.key.section_long_id
  guarderInfoMaintainDialogItem.value.target_state_id = state.key.state_id
  guarderInfoMaintainDialogItem.value.target_state_label = label
}

// endregion

// region 守卫器支持选择对话框处理

const guarderSupportDialogVisible = ref<boolean>(false)

function handleGuarderSupportSelected(value: GuarderSupport): void {
  guarderInfoMaintainDialogItem.value.type = value.key.string_id
  guarderInfoMaintainDialogItem.value.param = value.example_param
}

// endregion
</script>

<style scoped>
.guarder-info-panel-container {
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

/*noinspection CssUnusedSymbol*/
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}

.text-editor {
  height: 300px;
}
</style>
