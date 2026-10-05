<template>
  <div class="state-panel-container">
    <placeholder-panel v-if="sectionId === ''" text="请选择部件" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showStateCreateMaintainDialog">新建状态</el-button>
            <el-button type="success" @click="handleStateSearch">刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-button
              type="primary"
              :disabled="applyChangesDisabled"
              @click="handleApplyChangesClicked"
            >
              应用变更
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
                label="状态 ID"
                min-width="100"
                show-overflow-tooltip
              />
              <el-table-column prop="name" label="名称" min-width="80" show-overflow-tooltip />
              <el-table-column label="类型" width="90px" :formatter="stateTypeFormatter" />
              <el-table-column label="首次延迟" min-width="100" show-overflow-tooltip>
                <template v-slot="{ row }">
                  <span :title="formatMillisRawTitle((row as State).first_spin_delay)">
                    {{ formatMillis((row as State).first_spin_delay) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="轮询间隔" min-width="100" show-overflow-tooltip>
                <template v-slot="{ row }">
                  <span :title="formatMillisRawTitle((row as State).spin_interval)">
                    {{ formatMillis((row as State).spin_interval) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="80" show-overflow-tooltip />
            </template>
            <template
              v-slot:contextmenu="{ row, close, fireItemInspect, fireItemEdit, fireItemDelete }"
            >
              <ul>
                <li @click="handleStateCopyKeyContextmenuClicked(row as State, close)">复制主键</li>
                <el-divider />
                <li @click="fireItemInspect">查看...</li>
                <li @click="fireItemEdit">编辑...</li>
                <li @click="fireItemDelete">删除...</li>
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
      <el-form-item label="状态 ID" prop="state_id">
        <el-input
          v-model="stateMaintainDialogItem.state_id"
          :readonly="stateMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="stateMaintainDialogItem.name"
          :readonly="stateMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="stateMaintainDialogItem.type"
          :disabled="stateMaintainDialogMode === 'INSPECT'"
        >
          <el-option label="初始" :value="0" />
          <el-option label="普通" :value="1" />
          <el-option label="结束" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="首次延迟" prop="first_spin_delay">
        <el-input
          v-model="stateMaintainDialogItem.first_spin_delay"
          :readonly="stateMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>毫秒</template>
        </el-input>
      </el-form-item>
      <el-form-item label="轮询间隔" prop="spin_interval">
        <el-input
          v-model="stateMaintainDialogItem.spin_interval"
          :readonly="stateMaintainDialogMode === 'INSPECT'"
        >
          <template v-slot:append>毫秒</template>
        </el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
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
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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
      return '初始'
    case 1:
      return '普通'
    case 2:
      return '结束'
    default:
      return `未知（${type}）`
  }
}

function stateTypeFormatter(row: State): string {
  return formatStateType(row.type)
}

function formatMillis(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '（暂无）'
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return String(value)
  }
  return formatDuration(numeric)
}

function formatMillisRawTitle(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '（暂无）'
  }
  return `原始值 ${value} ms`
}

function handleStatePagingAttributeChanged(): void {
  handleStateSearch()
}

async function handleStateCopyKeyContextmenuClicked(row: State, close: () => void): Promise<void> {
  close()
  await navigator.clipboard.writeText(`${row.key.section_long_id}&${row.key.state_id}`)
  ElMessage({
    showClose: true,
    message: '复制成功',
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
    await ElMessageBox.confirm('此操作将永久删除此状态。是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove(item.key))
    ElMessage({
      showClose: true,
      message: `状态 ${item.key.state_id} 删除成功`,
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
        callback(new Error('状态 ID 不能为空'))
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
        callback(new Error('状态 ID 已经存在'))
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
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  first_spin_delay: [{ required: true, message: '首次延迟不能为空', trigger: 'blur' }],
  spin_interval: [{ required: true, message: '轮询间隔不能为空', trigger: 'blur' }],
})
const stateMaintainDialogEditRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  first_spin_delay: [{ required: true, message: '首次延迟不能为空', trigger: 'blur' }],
  spin_interval: [{ required: true, message: '轮询间隔不能为空', trigger: 'blur' }],
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
      message: `状态 ${item.state_id} 创建成功`,
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
      message: `状态 ${item.state_id} 更新成功`,
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
