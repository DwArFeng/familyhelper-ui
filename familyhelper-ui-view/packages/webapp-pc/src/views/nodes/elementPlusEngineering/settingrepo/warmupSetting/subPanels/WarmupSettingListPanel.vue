<template>
  <div class="warmup-setting-list-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="showCreateDialog">
            {{ t('views.element_plus_engineering.settingrepo.create') }}
          </el-button>
          <el-button type="success" @click="handleSearch">
            {{ t('views.element_plus_engineering.settingrepo.refresh') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesDisabled"
            @click="handleApplyChangesClicked"
          >
            {{ t('views.element_plus_engineering.settingrepo.apply_changes') }}
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
            <el-table-column
              prop="key.long_id"
              :label="t('views.element_plus_engineering.settingrepo.primary_key')"
              width="90"
              show-overflow-tooltip
            />
            <el-table-column
              prop="type"
              :label="t('views.element_plus_engineering.settingrepo.cache_type')"
              :formatter="typeFormatter"
              show-overflow-tooltip
            />
            <el-table-column
              prop="enabled"
              :label="t('views.element_plus_engineering.settingrepo.enabled')"
              width="70"
              :formatter="enabledFormatter"
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.settingrepo.remark')"
              show-overflow-tooltip
            />
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
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.cache_type')" prop="type">
        <el-select v-model="dialogItem.type" :disabled="dialogMode === 'INSPECT'">
          <el-option
            v-for="option in cacheTypeOptions"
            :key="option.type"
            :label="option.label"
            :value="option.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.enabled')" prop="enabled">
        <el-switch
          v-model="dialogItem.enabled"
          :disabled="dialogMode === 'INSPECT'"
          :active-text="t('views.element_plus_engineering.settingrepo.yes')"
          :inactive-text="t('views.element_plus_engineering.settingrepo.no')"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.settingrepo.target_category_id')"
        prop="targetStringAlpha"
      >
        <el-input v-model="dialogItem.targetStringAlpha" :readonly="dialogMode === 'INSPECT'" />
      </el-form-item>
      <el-form-item
        v-if="dialogItem.type === 1"
        :label="t('views.element_plus_engineering.settingrepo.item_string_id')"
        prop="targetStringBravo"
      >
        <el-input v-model="dialogItem.targetStringBravo" :readonly="dialogMode === 'INSPECT'" />
      </el-form-item>
      <template v-if="dialogItem.type === 20 || dialogItem.type === 21">
        <el-form-item
          :label="t('views.element_plus_engineering.settingrepo.language')"
          prop="targetStringCharlie"
        >
          <el-input v-model="dialogItem.targetStringCharlie" :readonly="dialogMode === 'INSPECT'" />
        </el-form-item>
        <el-form-item
          :label="t('views.element_plus_engineering.settingrepo.country')"
          prop="targetStringDelta"
        >
          <el-input v-model="dialogItem.targetStringDelta" :readonly="dialogMode === 'INSPECT'" />
        </el-form-item>
        <el-form-item
          :label="t('views.element_plus_engineering.settingrepo.variant')"
          prop="targetStringEcho"
        >
          <el-input v-model="dialogItem.targetStringEcho" :readonly="dialogMode === 'INSPECT'" />
        </el-form-item>
      </template>
      <el-form-item
        :label="t('views.element_plus_engineering.settingrepo.args_array')"
        prop="targetStringArrayAlpha"
      >
        <el-input
          v-model="dialogItem.targetStringArrayAlpha"
          type="textarea"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.remark')" prop="remark">
        <el-input v-model="dialogItem.remark" :readonly="dialogMode === 'INSPECT'" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type WarmupSetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import {
  all,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/warmupSetting.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

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

// endregion

// region 预热设置表格

const cacheTypeOptions: { type: number; label: string }[] = [
  { type: 0, label: t('views.element_plus_engineering.settingrepo.kv_inspect') },
  { type: 1, label: t('views.element_plus_engineering.settingrepo.kv_item_inspect') },
  { type: 10, label: t('views.element_plus_engineering.settingrepo.navigation_inspect') },
  { type: 20, label: t('views.element_plus_engineering.settingrepo.iahn_locale_map') },
  { type: 21, label: t('views.element_plus_engineering.settingrepo.iahn_message_map') },
  { type: 22, label: t('views.element_plus_engineering.settingrepo.iahn_locale_list') },
  { type: 23, label: t('views.element_plus_engineering.settingrepo.iahn_mek_list') },
  { type: 24, label: t('views.element_plus_engineering.settingrepo.iahn_message_table') },
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
  return (
    cacheTypeOptions.find((option) => option.type === value)?.label ??
    t('views.element_plus_engineering.settingrepo.unknown_parenthesized')
  )
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: WarmupSetting, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[column.property]
    ? t('views.element_plus_engineering.settingrepo.yes')
    : t('views.element_plus_engineering.settingrepo.no')
}

async function handleDelete(item: WarmupSetting): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.delete_warmup_setting_confirmation'),
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
      message: t('views.element_plus_engineering.settingrepo.warmup_setting_deleted_successfully'),
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
    callback(new Error(t('views.element_plus_engineering.settingrepo.args_array_required')))
    return
  }
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) {
      callback(
        new Error(t('views.element_plus_engineering.settingrepo.args_array_must_be_string_json')),
      )
      return
    }
    callback()
  } catch {
    callback(
      new Error(t('views.element_plus_engineering.settingrepo.args_array_must_be_string_json')),
    )
  }
}

const dialogRules = computed(() => {
  const rules: Record<string, FormItemRule[]> = {
    targetStringAlpha: [
      {
        required: true,
        message: t('views.element_plus_engineering.settingrepo.category_id_required'),
        trigger: 'blur',
      },
    ],
    targetStringArrayAlpha: [{ validator: arrayValidator, trigger: 'blur' }],
  }
  if (dialogItem.value.type === 1) {
    rules.targetStringBravo = [
      {
        required: true,
        message: t('views.element_plus_engineering.settingrepo.item_string_id_required'),
        trigger: 'blur',
      },
    ]
  }
  if (dialogItem.value.type === 20 || dialogItem.value.type === 21) {
    rules.targetStringCharlie = [
      {
        required: true,
        message: t('views.element_plus_engineering.settingrepo.language_required'),
        trigger: 'blur',
      },
    ]
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
    throw new Error(t('views.element_plus_engineering.settingrepo.args_array_must_be_string_json'))
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
      message: t('views.element_plus_engineering.settingrepo.warmup_setting_created_successfully'),
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
      message: t('views.element_plus_engineering.settingrepo.warmup_setting_updated_successfully'),
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
