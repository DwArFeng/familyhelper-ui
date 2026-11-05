<template>
  <div class="warmup-setting-list-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="showCreateDialog">新建</el-button>
          <el-button type="success" @click="handleSearch">刷新</el-button>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesDisabled"
            @click="handleApplyChangesClicked"
          >
            应用变更
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          highlight-current-row
          v-model:current-page="tableCurrentPage"
          v-model:page-size="tablePageSize"
          :item-count="tableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="tableItems"
          :operate-column-width="134"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
          @onCurrentChanged="handleCurrentChanged"
          @onItemInspect="showInspectDialog"
          @onItemEdit="showEditDialog"
          @onItemDelete="handleDelete"
        >
          <template v-slot:default>
            <el-table-column prop="key.long_id" label="主键" width="90" show-overflow-tooltip />
            <el-table-column
              prop="type"
              label="缓存类型"
              :formatter="typeFormatter"
              show-overflow-tooltip
            />
            <el-table-column prop="enabled" label="使能" width="70" :formatter="enabledFormatter" />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="dialogVisible"
      label-width="110px"
      :loading="dialogLoading"
      :mode="dialogMode"
      :item="dialogItem"
      :create-rules="dialogRules"
      :edit-rules="dialogRules"
      :close-on-click-modal="false"
      @onItemCreate="handleCreate"
      @onItemEdit="handleUpdate"
    >
      <el-form-item label="缓存类型" prop="type">
        <el-select v-model="dialogItem.type" :disabled="dialogMode === 'INSPECT'">
          <el-option
            v-for="option in cacheTypeOptions"
            :key="option.type"
            :label="option.label"
            :value="option.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="使能" prop="enabled">
        <el-switch
          v-model="dialogItem.enabled"
          :disabled="dialogMode === 'INSPECT'"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="分类主键" prop="targetStringAlpha">
        <el-input v-model="dialogItem.targetStringAlpha" :readonly="dialogMode === 'INSPECT'" />
      </el-form-item>
      <el-form-item v-if="dialogItem.type === 1" label="条目主键" prop="targetStringBravo">
        <el-input v-model="dialogItem.targetStringBravo" :readonly="dialogMode === 'INSPECT'" />
      </el-form-item>
      <template v-if="dialogItem.type === 20 || dialogItem.type === 21">
        <el-form-item label="语言" prop="targetStringCharlie">
          <el-input v-model="dialogItem.targetStringCharlie" :readonly="dialogMode === 'INSPECT'" />
        </el-form-item>
        <el-form-item label="国家" prop="targetStringDelta">
          <el-input v-model="dialogItem.targetStringDelta" :readonly="dialogMode === 'INSPECT'" />
        </el-form-item>
        <el-form-item label="变体" prop="targetStringEcho">
          <el-input v-model="dialogItem.targetStringEcho" :readonly="dialogMode === 'INSPECT'" />
        </el-form-item>
      </template>
      <el-form-item label="参数数组" prop="targetStringArrayAlpha">
        <el-input
          v-model="dialogItem.targetStringArrayAlpha"
          type="textarea"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dialogItem.remark" :readonly="dialogMode === 'INSPECT'" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type WarmupSetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import {
  all,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'WarmupSettingListPanel',
})

// region Props 定义

type Props = {
  applyChangesDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  applyChangesDisabled: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', id: string): void
  (e: 'onMutated'): void
  (e: 'onApplyChanges'): void
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

// endregion

// region 预热设置表格

const cacheTypeOptions: { type: number; label: string }[] = [
  { type: 0, label: '键值查看' },
  { type: 1, label: '键值条目查看' },
  { type: 10, label: '导航查看' },
  { type: 20, label: '国际化地区映射' },
  { type: 21, label: '国际化消息映射' },
  { type: 22, label: '国际化地区列表' },
  { type: 23, label: '国际化文本键列表' },
  { type: 24, label: '国际化消息表' },
]

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  pagingInfo: tablePagingInfo,
  updateByLookup: updateTableByLookup,
} = useIdentityBackendPagingTablePanel<WarmupSetting>(15)

const currentId = ref<string>('')

function handleSearch(): void {
  handleAllSearch()
}

async function handleAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage((pagingInfo) => all(pagingInfo), tablePagingInfo.value)
    updateTableByLookup(res)
    if (
      currentId.value !== '' &&
      !tableItems.value.some((item) => item.key.long_id === currentId.value)
    ) {
      currentId.value = ''
      emit('onCurrentChanged', '')
    }
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

function handleCurrentChanged(row: WarmupSetting | null): void {
  const id = row?.key.long_id ?? ''
  currentId.value = id
  emit('onCurrentChanged', id)
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typeFormatter(row: WarmupSetting, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (row as any)[column.property] as number
  return cacheTypeOptions.find((option) => option.type === value)?.label ?? '（未知）'
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: WarmupSetting, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[column.property] ? '是' : '否'
}

async function handleDelete(item: WarmupSetting): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除该预热设置。<br>是否继续?', '提示', {
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
      message: '预热设置删除成功',
      type: 'success',
    })
    if (currentId.value === item.key.long_id) {
      currentId.value = ''
      emit('onCurrentChanged', '')
    }
  } finally {
    loading.value -= 1
  }
  handleSearch()
}

// endregion

// region 维护对话框

type DialogItem = {
  long_id: string
  type: number
  enabled: boolean
  targetStringAlpha: string
  targetStringBravo: string
  targetStringCharlie: string
  targetStringDelta: string
  targetStringEcho: string
  targetStringArrayAlpha: string
  remark: string
}

const {
  visible: dialogVisible,
  item: dialogItem,
  mode: dialogMode,
  showCreateDialog,
  showEditDialog,
  showInspectDialog,
} = useGeneralMaintainDialog<WarmupSetting, DialogItem>(dialogItemMap, {
  long_id: '',
  type: 0,
  enabled: true,
  targetStringAlpha: '',
  targetStringBravo: '',
  targetStringCharlie: '',
  targetStringDelta: '',
  targetStringEcho: '',
  targetStringArrayAlpha: '[]',
  remark: '',
})
const dialogLoading = ref<number>(0)

const arrayValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  if (typeof value !== 'string' || value.trim() === '') {
    callback(new Error('参数数组不能为空'))
    return
  }
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) {
      callback(new Error('参数数组必须是字符串数组的 JSON'))
      return
    }
    callback()
  } catch {
    callback(new Error('参数数组必须是字符串数组的 JSON'))
  }
}

const dialogRules = computed(() => {
  const rules: Record<string, FormItemRule[]> = {
    targetStringAlpha: [{ required: true, message: '分类主键不能为空', trigger: 'blur' }],
    targetStringArrayAlpha: [{ validator: arrayValidator, trigger: 'blur' }],
  }
  if (dialogItem.value.type === 1) {
    rules.targetStringBravo = [{ required: true, message: '条目主键不能为空', trigger: 'blur' }]
  }
  if (dialogItem.value.type === 20 || dialogItem.value.type === 21) {
    rules.targetStringCharlie = [{ required: true, message: '语言不能为空', trigger: 'blur' }]
  }
  return rules
})

function dialogItemMap(source: WarmupSetting): DialogItem {
  return {
    long_id: source.key.long_id,
    type: source.type,
    enabled: source.enabled,
    targetStringAlpha: source.targetStringAlpha ?? '',
    targetStringBravo: source.targetStringBravo ?? '',
    targetStringCharlie: source.targetStringCharlie ?? '',
    targetStringDelta: source.targetStringDelta ?? '',
    targetStringEcho: source.targetStringEcho ?? '',
    targetStringArrayAlpha: JSON.stringify(source.targetStringArrayAlpha ?? []),
    remark: source.remark ?? '',
  }
}

function parseArgs(text: string): string[] {
  const parsed: unknown = JSON.parse(text)
  if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) {
    throw new Error('参数数组必须是字符串数组的 JSON')
  }
  return parsed as string[]
}

function toPayload(item: DialogItem) {
  const type = item.type
  return {
    type,
    enabled: item.enabled,
    targetStringAlpha: item.targetStringAlpha,
    targetStringBravo: type === 1 ? item.targetStringBravo : '',
    targetStringCharlie: type === 20 || type === 21 ? item.targetStringCharlie : '',
    targetStringDelta: type === 20 || type === 21 ? item.targetStringDelta : '',
    targetStringEcho: type === 20 || type === 21 ? item.targetStringEcho : '',
    targetStringArrayAlpha: parseArgs(item.targetStringArrayAlpha),
    remark: item.remark,
  }
}

async function handleCreate(item: DialogItem): Promise<void> {
  dialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: null,
        ...toPayload(item),
      }),
    )
    ElMessage({
      showClose: true,
      message: '预热设置创建成功',
      type: 'success',
    })
    dialogVisible.value = false
    emit('onMutated')
  } finally {
    dialogLoading.value -= 1
  }
  handleSearch()
}

async function handleUpdate(item: DialogItem): Promise<void> {
  dialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { long_id: item.long_id },
        ...toPayload(item),
      }),
    )
    ElMessage({
      showClose: true,
      message: '预热设置更新成功',
      type: 'success',
    })
    dialogVisible.value = false
    emit('onMutated')
  } finally {
    dialogLoading.value -= 1
  }
  handleSearch()
}

// endregion
</script>

<style scoped>
.warmup-setting-list-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.table {
  height: 100%;
}
</style>
