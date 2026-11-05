<template>
  <div class="warmup-driver-info-panel-container">
    <placeholder-panel v-if="warmupSettingId === ''" text="请选择预热设置" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" @click="showCreateDialog">新建驱动器</el-button>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
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
                label="使能"
                width="70"
                :formatter="enabledFormatter"
              />
              <el-table-column prop="type" label="类型" min-width="80" show-overflow-tooltip />
              <el-table-column class-name="single-line" prop="param" label="参数" min-width="80" />
              <el-table-column prop="remark" label="备注" min-width="80" show-overflow-tooltip />
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
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="dialogItem.enabled"
          :disabled="dialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
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
      <el-form-item label="参数" prop="param">
        <text-editor
          class="text-editor"
          v-model="dialogItem.param"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
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
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlus/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

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

import WarmupDriverSupportSelectDialog from '@/views/nodes/elementPlus/settingrepo/warmupDriverSupport/WarmupDriverSupportSelectDialog.vue'

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
  return (row as any)[column.property] ? '是' : '否'
}

async function handleDelete(item: DispWarmupDriverInfo): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此驱动器。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
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
      message: '驱动器删除成功',
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
        callback(new Error('类型不能为空'))
        return Promise.reject()
      }
      return resolveResponse(existsDriverSupport({ string_id: res as string }))
    })
    .then((res) => {
      if (!res) {
        callback(new Error('驱动器类型不支持'))
        return Promise.reject()
      }
      callback()
    })
    .catch(() => {})
}

const dialogRules = ref({
  type: [
    { validator: typeValidator, trigger: 'blur' },
    { required: true, message: '类型不能为空', trigger: 'blur' },
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
      message: '驱动器创建成功',
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
      message: '驱动器更新成功',
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
  background: #ffffff;
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
