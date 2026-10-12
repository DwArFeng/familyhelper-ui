<template>
  <div class="performer-info-panel-container">
    <placeholder-panel
      v-if="sectionId === ''"
      :text="t('views.element_plus_engineering.logic_engine.please_select_section')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showPerformerInfoCreateMaintainDialog">
              {{ t('views.element_plus_engineering.logic_engine.create_performer') }}
            </el-button>
            <el-button type="success" @click="handlePerformerInfoSearch">{{
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
            v-model:current-page="performerInfoTableCurrentPage"
            v-model:page-size="performerInfoTablePageSize"
            :item-count="performerInfoTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="performerInfoTableItems"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handlePerformerInfoPagingAttributeChanged"
            @onItemInspect="handleShowPerformerInfoInspectDialog"
            @onItemEdit="handleShowPerformerInfoEditDialog"
            @onItemDelete="handlePerformerInfoDelete"
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
                :label="t('views.element_plus_engineering.logic_engine.action_anchor_state')"
                min-width="140"
                show-overflow-tooltip
              >
                <template v-slot="{ row }">
                  {{ formatStateLabel((row as DispPerformerInfo).anchor_state) }}
                </template>
              </el-table-column>
              <el-table-column
                :label="t('views.element_plus_engineering.logic_engine.action_target_state')"
                min-width="140"
                show-overflow-tooltip
              >
                <template v-slot="{ row }">
                  {{ formatStateLabel((row as DispPerformerInfo).target_state) }}
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
                  @click="
                    handlePerformerInfoCopyKeyContextmenuClicked(row as DispPerformerInfo, close)
                  "
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
      v-model:visible="performerInfoMaintainDialogVisible"
      :loading="performerInfoMaintainDialogLoading"
      :mode="performerInfoMaintainDialogMode"
      :item="performerInfoMaintainDialogItem"
      :create-rules="performerInfoMaintainDialogCreateRules"
      :edit-rules="performerInfoMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handlePerformerInfoCreate"
      @onItemEdit="handlePerformerInfoEdit"
    >
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.order')" prop="index">
        <el-input-number
          v-model="performerInfoMaintainDialogItem.index"
          :disabled="performerInfoMaintainDialogMode === 'INSPECT'"
          :min="0"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.enabled')"
        prop="enabled"
      >
        <el-switch
          v-model="performerInfoMaintainDialogItem.enabled"
          :disabled="performerInfoMaintainDialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.logic_engine.yes')"
          :inactive-text="t('views.element_plus_engineering.logic_engine.no')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.action_anchor_state')"
        prop="anchor_state_id"
      >
        <el-input v-model="performerInfoMaintainDialogItem.anchor_state_label" readonly>
          <template v-slot:append>
            <el-button
              v-if="performerInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="openStateSelect('anchor')"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.action_target_state')"
        prop="target_state_id"
      >
        <el-input v-model="performerInfoMaintainDialogItem.target_state_label" readonly>
          <template v-slot:append>
            <el-button
              v-if="performerInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="openStateSelect('target')"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.type')" prop="type">
        <el-input
          v-model="performerInfoMaintainDialogItem.type"
          :readonly="performerInfoMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>
            <el-button
              v-if="performerInfoMaintainDialogMode !== 'INSPECT'"
              :icon="SearchIcon"
              @click="performerSupportDialogVisible = true"
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
          v-model="performerInfoMaintainDialogItem.param"
          :readonly="performerInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.remark')" prop="remark">
        <el-input
          v-model="performerInfoMaintainDialogItem.remark"
          :readonly="performerInfoMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
    <state-select-dialog
      v-model:visible="stateSelectDialogVisible"
      :section-id="sectionId"
      @onConfirmed="handleStateSelected"
    />
    <performer-support-select-dialog
      v-model:visible="performerSupportDialogVisible"
      @onConfirmed="handlePerformerSupportSelected"
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
  type DispPerformerInfo,
  insert,
  type PerformerInfo,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/performerInfo.ts'
import {
  exists as existsPerformerSupport,
  type PerformerSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/performerSupport.ts'
import { type State } from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/state.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import StateSelectDialog from './StateSelectDialog.vue'
import PerformerSupportSelectDialog from '../../performerSupport/PerformerSupportSelectDialog.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PerformerInfoPanel',
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

// region 执行器搜索

async function handlePerformerInfoSearch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForSectionDisp({ long_id: props.sectionId }, pagingInfo),
      performerInfoTablePagingInfo.value,
    )
    updatePerformerInfoTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.sectionId,
  () => {
    performerInfoTableCurrentPage.value = 0
    handlePerformerInfoSearch()
  },
)

onMounted(() => {
  handlePerformerInfoSearch()
})

// endregion

// region 执行器表格处理

const {
  currentPage: performerInfoTableCurrentPage,
  pageSize: performerInfoTablePageSize,
  itemCount: performerInfoTableItemCount,
  items: performerInfoTableItems,
  pagingInfo: performerInfoTablePagingInfo,
  updateByLookup: updatePerformerInfoTableByLookup,
} = useIdentityBackendPagingTablePanel<DispPerformerInfo>(15)

function formatStateLabel(state: State | null | undefined): string {
  if (!state) {
    return t('views.element_plus_engineering.logic_engine.none_available_parenthesized')
  }
  return `${state.name}（${state.key.state_id}）`
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: DispPerformerInfo, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean)
    ? t('views.element_plus_engineering.logic_engine.yes')
    : t('views.element_plus_engineering.logic_engine.no')
}

function handlePerformerInfoPagingAttributeChanged(): void {
  handlePerformerInfoSearch()
}

async function handlePerformerInfoCopyKeyContextmenuClicked(
  row: DispPerformerInfo,
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

function handleShowPerformerInfoInspectDialog(item: DispPerformerInfo): void {
  showPerformerInfoInspectMaintainDialog(item)
}

function handleShowPerformerInfoEditDialog(item: DispPerformerInfo): void {
  showPerformerInfoEditMaintainDialog(item)
}

async function handlePerformerInfoDelete(item: DispPerformerInfo): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.logic_engine.delete_performer_confirmation'),
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
      message: t('views.element_plus_engineering.logic_engine.performer_deleted'),
      type: 'success',
    })
    await handlePerformerInfoSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 执行器维护对话框处理

type PerformerInfoMaintainDialogItem = {
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

const emptyPerformerInfoMaintainDialogItem = (): PerformerInfoMaintainDialogItem => ({
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
  visible: performerInfoMaintainDialogVisible,
  item: performerInfoMaintainDialogItem,
  mode: performerInfoMaintainDialogMode,
  showCreateDialog: showPerformerInfoCreateMaintainDialog,
  showEditDialog: showPerformerInfoEditMaintainDialog,
  showInspectDialog: showPerformerInfoInspectMaintainDialog,
} = useGeneralMaintainDialog<DispPerformerInfo, PerformerInfoMaintainDialogItem>(
  performerInfoMaintainDialogItemMap,
  emptyPerformerInfoMaintainDialogItem(),
)
const performerInfoMaintainDialogLoading = ref<number>(0)
const performerInfoStateValidator =
  (field: 'anchor_state_id' | 'target_state_id', message: string): FormItemRule['validator'] =>
  (_rule, _value, callback) => {
    if (performerInfoMaintainDialogItem.value[field] === '') {
      callback(new Error(message))
      return
    }
    callback()
  }
const performerInfoMaintainDialogTypeValidator: FormItemRule['validator'] = (
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
      return resolveResponse(existsPerformerSupport({ string_id: value }))
    })
    .then((res) => {
      if (!res) {
        callback(
          new Error(t('views.element_plus_engineering.logic_engine.unsupported_performer_type')),
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
const performerInfoMaintainDialogRules = {
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
      validator: performerInfoStateValidator(
        'anchor_state_id',
        t('views.element_plus_engineering.logic_engine.action_anchor_state_required'),
      ),
      trigger: 'change',
    },
  ],
  target_state_id: [
    {
      required: true,
      validator: performerInfoStateValidator(
        'target_state_id',
        t('views.element_plus_engineering.logic_engine.action_target_state_required'),
      ),
      trigger: 'change',
    },
  ],
  type: [
    { validator: performerInfoMaintainDialogTypeValidator, trigger: 'blur' },
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.type_required'),
      trigger: 'blur',
    },
  ],
}
const performerInfoMaintainDialogCreateRules = ref(performerInfoMaintainDialogRules)
const performerInfoMaintainDialogEditRules = ref(performerInfoMaintainDialogRules)

function performerInfoMaintainDialogItemMap(t: DispPerformerInfo): PerformerInfoMaintainDialogItem {
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

function buildPerformerInfoPayload(
  item: PerformerInfoMaintainDialogItem,
): Omit<PerformerInfo, 'key'> {
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

async function handlePerformerInfoCreate(item: PerformerInfoMaintainDialogItem): Promise<void> {
  performerInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        ...buildPerformerInfoPayload(item),
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.performer_created'),
      type: 'success',
    })
    await handlePerformerInfoSearch()
    performerInfoMaintainDialogVisible.value = false
  } finally {
    performerInfoMaintainDialogLoading.value -= 1
  }
}

async function handlePerformerInfoEdit(item: PerformerInfoMaintainDialogItem): Promise<void> {
  performerInfoMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        ...buildPerformerInfoPayload(item),
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.performer_updated'),
      type: 'success',
    })
    await handlePerformerInfoSearch()
    performerInfoMaintainDialogVisible.value = false
  } finally {
    performerInfoMaintainDialogLoading.value -= 1
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
    performerInfoMaintainDialogItem.value.anchor_section_long_id = state.key.section_long_id
    performerInfoMaintainDialogItem.value.anchor_state_id = state.key.state_id
    performerInfoMaintainDialogItem.value.anchor_state_label = label
    return
  }
  performerInfoMaintainDialogItem.value.target_section_long_id = state.key.section_long_id
  performerInfoMaintainDialogItem.value.target_state_id = state.key.state_id
  performerInfoMaintainDialogItem.value.target_state_label = label
}

// endregion

// region 执行器支持选择对话框处理

const performerSupportDialogVisible = ref<boolean>(false)

function handlePerformerSupportSelected(value: PerformerSupport): void {
  performerInfoMaintainDialogItem.value.type = value.key.string_id
  performerInfoMaintainDialogItem.value.param = value.example_param
}

// endregion
</script>

<style scoped>
.performer-info-panel-container {
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
