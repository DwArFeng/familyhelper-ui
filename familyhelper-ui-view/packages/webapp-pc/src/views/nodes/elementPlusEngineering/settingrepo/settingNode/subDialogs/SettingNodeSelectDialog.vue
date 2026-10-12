<template>
  <el-dialog
    class="setting-node-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    :title="t('views.element_plus_engineering.settingrepo.select_reference_setting_node')"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button class="insert-button" type="success" @click="handleSettingNodeSearch">
              {{ t('views.element_plus_engineering.settingrepo.refresh_data') }}
            </el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleSettingNodeSearch"
              @clear="handleSettingNodeSearch"
            >
              <template v-slot:prepend>
                {{ t('views.element_plus_engineering.settingrepo.node_id') }}</template
              >
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleSettingNodeSearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="settingNodeTableCurrentPage"
            v-model:page-size="settingNodeTablePageSize"
            highlight-current-row
            :item-count="settingNodeTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="settingNodeTableItems"
            :operate-column-visible="false"
            @onPagingAttributeChanged="handleSettingNodeTablePagingAttributeChanged"
            @onCurrentChanged="handleSettingNodeTableCurrentChanged"
          >
            <el-table-column
              prop="key.string_id"
              :label="t('views.element_plus_engineering.settingrepo.setting_node')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="type"
              :label="t('views.element_plus_engineering.settingrepo.type')"
              width="110px"
              :formatter="settingNodeTableTypeFormatter"
            />
            <el-table-column
              prop="last_modified_date"
              :label="t('views.element_plus_engineering.settingrepo.latest_update_time')"
              width="180px"
              show-overflow-tooltip
              :formatter="settingNodeTableTimestampFormatter"
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.settingrepo.remark')"
              show-overflow-tooltip
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </template>
    <template v-slot:footer>
      <el-button
        type="primary"
        :disabled="loading > 0 || settingNodeTableCurrentRow === null"
        @click="handleConfirmButtonClicked"
      >
        {{ t('views.element_plus_engineering.settingrepo.confirmation') }}
      </el-button>
      <el-button :disabled="loading > 0" @click="handleCancelButtonClicked">
        {{ t('views.element_plus_engineering.settingrepo.cancel') }}</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  type SettingNode,
  type SettingNodeType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import {
  idLikeReachable,
  reachable,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SettingNodeSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: SettingNode): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 可见性处理

const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// endregion

// region 头部面板

const idSearchBarValue = ref<string>('')

// endregion

// region 配置节点搜索

function handleSettingNodeSearch(): void {
  if (idSearchBarValue.value !== '') {
    handleSettingNodeIdLikeReachableSearch()
  } else {
    handleSettingNodeAllReachableSearch()
  }
}

async function handleSettingNodeIdLikeReachableSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => idLikeReachable(idSearchBarValue.value, pagingInfo),
      settingNodeTablePagingInfo.value,
    )
    updateSettingNodeTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleSettingNodeAllReachableSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => reachable(pagingInfo),
      settingNodeTablePagingInfo.value,
    )
    updateSettingNodeTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSettingNodeSearch()
})

// endregion

// region 配置节点表格处理

const {
  currentPage: settingNodeTableCurrentPage,
  pageSize: settingNodeTablePageSize,
  itemCount: settingNodeTableItemCount,
  items: settingNodeTableItems,
  pagingInfo: settingNodeTablePagingInfo,
  updateByLookup: updateSettingNodeTableByLookup,
} = useIdentityBackendPagingTablePanel<SettingNode>(15)
const settingNodeTableCurrentRow = ref<SettingNode | null>(null)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function settingNodeTableTypeFormatter(row: SettingNode, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: SettingNodeType | number = (row as any)[column.property] as SettingNodeType | number
  switch (value) {
    case 0:
      return t('views.element_plus_engineering.settingrepo.text_node_type')
    case 1:
      return t('views.element_plus_engineering.settingrepo.long_text_node_type')
    case 2:
      return t('views.element_plus_engineering.settingrepo.image_node_type')
    case 3:
      return t('views.element_plus_engineering.settingrepo.image_list_node_type')
    case 4:
      return t('views.element_plus_engineering.settingrepo.i18n_node_type')
    case 5:
      return t('views.element_plus_engineering.settingrepo.file_node_type')
    case 6:
      return t('views.element_plus_engineering.settingrepo.file_list_node_type')
    case 7:
      return t('views.element_plus_engineering.settingrepo.navigation_node_type')
    default:
      return t('views.element_plus_engineering.settingrepo.unknown_parenthesized')
  }
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function settingNodeTableTimestampFormatter(row: SettingNode, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function handleSettingNodeTablePagingAttributeChanged(): void {
  handleSettingNodeSearch()
}

function handleSettingNodeTableCurrentChanged(current: SettingNode | null): void {
  settingNodeTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const formatSupport: SettingNode | null = settingNodeTableCurrentRow.value
  if (!formatSupport) {
    throw new Error(
      t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
    )
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  const formatSupport: SettingNode | null = settingNodeTableCurrentRow.value
  if (!formatSupport) {
    return
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
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

.header-container .id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.table {
  height: 450px;
}
</style>
