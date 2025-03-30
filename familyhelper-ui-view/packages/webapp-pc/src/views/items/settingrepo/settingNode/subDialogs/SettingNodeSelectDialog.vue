<template>
  <el-dialog
    class="setting-node-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    title="选择用于参考的配置节点"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button class="insert-button" type="success" @click="handleSettingNodeSearch">
              刷新数据
            </el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleSettingNodeSearch"
              @clear="handleSettingNodeSearch"
            >
              <template v-slot:prepend> 节点 ID</template>
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
            :items="settingNodeItems"
            :operate-column-visible="false"
            @onPagingAttributeChanged="handleSettingNodeTablePagingAttributeChanged"
            @onCurrentChanged="handleSettingNodeTableCurrentChanged"
          >
            <el-table-column prop="key.string_id" label="配置节点" show-overflow-tooltip />
            <el-table-column
              prop="type"
              label="类型"
              width="110px"
              :formatter="settingNodeTableTypeFormatter"
            />
            <el-table-column
              prop="last_modified_date"
              label="最近更新日期"
              width="180px"
              show-overflow-tooltip
              :formatter="settingNodeTableTimestampFormatter"
            />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
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
        确认
      </el-button>
      <el-button :disabled="loading > 0" @click="handleCancelButtonClicked"> 取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import type {
  SettingNode,
  SettingNodeType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import {
  idLikeReachable,
  reachable,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'SettingNodeSelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: SettingNode): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
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

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const idSearchBarValue = ref<string>('')

// -----------------------------------------------------------配置节点搜索-----------------------------------------------------------
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

// -----------------------------------------------------------配置节点表格处理-----------------------------------------------------------
const {
  currentPage: settingNodeTableCurrentPage,
  pageSize: settingNodeTablePageSize,
  itemCount: settingNodeTableItemCount,
  items: settingNodeItems,
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
      return '文本'
    case 1:
      return '长文本'
    case 2:
      return '图片'
    case 3:
      return '图片列表'
    default:
      return '（未知）'
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

// -----------------------------------------------------------对话框处理-----------------------------------------------------------
function handleConfirmButtonClicked(): void {
  const formatSupport: SettingNode | null = settingNodeTableCurrentRow.value
  if (!formatSupport) {
    throw new Error('不应该执行到此处，请联系开发人员')
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
