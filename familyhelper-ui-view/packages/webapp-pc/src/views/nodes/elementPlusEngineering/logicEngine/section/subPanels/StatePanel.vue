<template>
  <div class="state-panel-container">
    <placeholder-panel
      v-if="sectionId === ''"
      :text="t('views.element_plus_engineering.logic_engine.please_select_section')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showStateCreateMaintainDialog">{{
              t('views.element_plus_engineering.logic_engine.create_state')
            }}</el-button>
            <el-button type="success" @click="handleStateSearch">{{
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
            v-model:current-page="stateTableCurrentPage"
            v-model:page-size="stateTablePageSize"
            :item-count="stateTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="stateTableItems"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handleStatePagingAttributeChanged"
            @onItemInspect="handleShowStateInspectDialog"
            @onItemEdit="handleShowStateEditDialog"
            @onItemDelete="handleStateDelete"
          >
            <template v-slot:default>
              <el-table-column
                prop="key.state_id"
                :label="t('views.element_plus_engineering.logic_engine.state_id')"
                min-width="100"
                show-overflow-tooltip
              />
              <el-table-column
                prop="name"
                :label="t('views.element_plus_engineering.logic_engine.name')"
                min-width="80"
                show-overflow-tooltip
              />
              <el-table-column
                :label="t('views.element_plus_engineering.logic_engine.type')"
                width="90px"
                :formatter="stateTypeFormatter"
              />
              <el-table-column
                :label="t('views.element_plus_engineering.logic_engine.initial_delay')"
                min-width="100"
                show-overflow-tooltip
              >
                <template v-slot="{ row }">
                  <span :title="formatMillisRawTitle((row as State).first_spin_delay)">
                    {{ formatMillis((row as State).first_spin_delay) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                :label="t('views.element_plus_engineering.logic_engine.polling_interval')"
                min-width="100"
                show-overflow-tooltip
              >
                <template v-slot="{ row }">
                  <span :title="formatMillisRawTitle((row as State).spin_interval)">
                    {{ formatMillis((row as State).spin_interval) }}
                  </span>
                </template>
              </el-table-column>
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
                <li @click="handleStateCopyKeyContextmenuClicked(row as State, close)">
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
      v-model:visible="stateMaintainDialogVisible"
      :loading="stateMaintainDialogLoading"
      :mode="stateMaintainDialogMode"
      :item="stateMaintainDialogItem"
      :create-rules="stateMaintainDialogCreateRules"
      :edit-rules="stateMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleStateCreate"
      @onItemEdit="handleStateEdit"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.state_id')"
        prop="state_id"
      >
        <el-input
          v-model="stateMaintainDialogItem.state_id"
          :readonly="stateMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.name')" prop="name">
        <el-input
          v-model="stateMaintainDialogItem.name"
          :readonly="stateMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.type')" prop="type">
        <el-select
          v-model="stateMaintainDialogItem.type"
          :disabled="stateMaintainDialogMode === 'INSPECT'"
        >
          <el-option :label="t('views.element_plus_engineering.logic_engine.initial')" :value="0" />
          <el-option :label="t('views.element_plus_engineering.logic_engine.normal')" :value="1" />
          <el-option :label="t('views.element_plus_engineering.logic_engine.end')" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.initial_delay')"
        prop="first_spin_delay"
      >
        <el-input
          v-model="stateMaintainDialogItem.first_spin_delay"
          :readonly="stateMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>{{
            t('views.element_plus_engineering.logic_engine.milliseconds')
          }}</template>
        </el-input>
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.polling_interval')"
        prop="spin_interval"
      >
        <el-input
          v-model="stateMaintainDialogItem.spin_interval"
          :readonly="stateMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>{{
            t('views.element_plus_engineering.logic_engine.milliseconds')
          }}</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.remark')" prop="remark">
        <el-input
          v-model="stateMaintainDialogItem.remark"
          :readonly="stateMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  childForSection,
  exists,
  insert,
  remove,
  type State,
  type StateType,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/state.ts'
import { formatDuration } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'StatePanel',
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

// region 状态搜索

async function handleStateSearch(): Promise<void> {
  if (props.sectionId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForSection({ long_id: props.sectionId }, pagingInfo),
      stateTablePagingInfo.value,
    )
    updateStateTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.sectionId,
  () => {
    stateTableCurrentPage.value = 0
    handleStateSearch()
  },
)

onMounted(() => {
  handleStateSearch()
})

// endregion

// region 状态表格处理

const {
  currentPage: stateTableCurrentPage,
  pageSize: stateTablePageSize,
  itemCount: stateTableItemCount,
  items: stateTableItems,
  pagingInfo: stateTablePagingInfo,
  updateByLookup: updateStateTableByLookup,
} = useIdentityBackendPagingTablePanel<State>(15)

function formatStateType(type: number): string {
  switch (type) {
    case 0:
      return t('views.element_plus_engineering.logic_engine.initial')
    case 1:
      return t('views.element_plus_engineering.logic_engine.normal')
    case 2:
      return t('views.element_plus_engineering.logic_engine.end')
    default:
      return t('views.element_plus_engineering.logic_engine.unknown_type', {
        type,
      })
  }
}

function stateTypeFormatter(row: State): string {
  return formatStateType(row.type)
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
  return t('views.element_plus_engineering.logic_engine.original_value_milliseconds', {
    value,
  })
}

function handleStatePagingAttributeChanged(): void {
  handleStateSearch()
}

async function handleStateCopyKeyContextmenuClicked(row: State, close: () => void): Promise<void> {
  close()
  await navigator.clipboard.writeText(`${row.key.section_long_id}&${row.key.state_id}`)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.logic_engine.copy_succeeded'),
    type: 'success',
  })
}

function handleShowStateInspectDialog(item: State): void {
  showStateInspectMaintainDialog(item)
}

function handleShowStateEditDialog(item: State): void {
  showStateEditMaintainDialog(item)
}

async function handleStateDelete(item: State): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.logic_engine.delete_state_confirmation'),
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
      message: t('views.element_plus_engineering.logic_engine.state_deleted', {
        stateId: item.key.state_id,
      }),
      type: 'success',
    })
    await handleStateSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 状态维护对话框处理

type StateMaintainDialogItem = {
  state_id: string
  name: string
  type: StateType
  first_spin_delay: string
  spin_interval: string
  remark: string
}

const {
  visible: stateMaintainDialogVisible,
  item: stateMaintainDialogItem,
  mode: stateMaintainDialogMode,
  showCreateDialog: showStateCreateMaintainDialog,
  showEditDialog: showStateEditMaintainDialog,
  showInspectDialog: showStateInspectMaintainDialog,
} = useGeneralMaintainDialog<State, StateMaintainDialogItem>(stateMaintainDialogItemMap, {
  state_id: '',
  name: '',
  type: 1,
  first_spin_delay: '0',
  spin_interval: '0',
  remark: '',
})
const stateMaintainDialogLoading = ref<number>(0)
const stateIdValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error(t('views.element_plus_engineering.logic_engine.state_id_required')))
        return Promise.reject()
      }
      return resolveResponse(
        exists({
          section_long_id: props.sectionId,
          state_id: res,
        }),
      )
    })
    .then((res) => {
      if (res) {
        callback(
          new Error(t('views.element_plus_engineering.logic_engine.state_id_already_exists')),
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
const stateMaintainDialogCreateRules = ref({
  state_id: [{ required: true, validator: stateIdValidator, trigger: 'blur' }],
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.name_required'),
      trigger: 'blur',
    },
  ],
  first_spin_delay: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.initial_delay_required'),
      trigger: 'blur',
    },
  ],
  spin_interval: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.polling_interval_required'),
      trigger: 'blur',
    },
  ],
})
const stateMaintainDialogEditRules = ref({
  name: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.name_required'),
      trigger: 'blur',
    },
  ],
  first_spin_delay: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.initial_delay_required'),
      trigger: 'blur',
    },
  ],
  spin_interval: [
    {
      required: true,
      message: t('views.element_plus_engineering.logic_engine.polling_interval_required'),
      trigger: 'blur',
    },
  ],
})

function stateMaintainDialogItemMap(t: State): StateMaintainDialogItem {
  return {
    state_id: t.key.state_id,
    name: t.name,
    type: t.type,
    first_spin_delay: t.first_spin_delay,
    spin_interval: t.spin_interval,
    remark: t.remark,
  }
}

async function handleStateCreate(item: StateMaintainDialogItem): Promise<void> {
  stateMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: {
          section_long_id: props.sectionId,
          state_id: item.state_id,
        },
        name: item.name,
        type: item.type,
        first_spin_delay: item.first_spin_delay,
        spin_interval: item.spin_interval,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.state_created', {
        stateId: item.state_id,
      }),
      type: 'success',
    })
    await handleStateSearch()
    stateMaintainDialogVisible.value = false
  } finally {
    stateMaintainDialogLoading.value -= 1
  }
}

async function handleStateEdit(item: StateMaintainDialogItem): Promise<void> {
  stateMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: {
          section_long_id: props.sectionId,
          state_id: item.state_id,
        },
        name: item.name,
        type: item.type,
        first_spin_delay: item.first_spin_delay,
        spin_interval: item.spin_interval,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.logic_engine.state_updated', {
        stateId: item.state_id,
      }),
      type: 'success',
    })
    await handleStateSearch()
    stateMaintainDialogVisible.value = false
  } finally {
    stateMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.state-panel-container {
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
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
