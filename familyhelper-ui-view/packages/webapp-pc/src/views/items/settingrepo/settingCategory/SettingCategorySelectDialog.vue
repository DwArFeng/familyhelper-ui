<template>
  <el-dialog
    class="setting-category-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    title="选择配置分类"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <template v-slot:default>
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleSettingCategorySearch">刷新数据</el-button>
            <el-divider direction="vertical" />
            <el-input
              class="id-search-bar"
              v-model="idSearchBarValue"
              clearable
              @keydown.enter="handleSettingCategorySearch"
              @clear="handleSettingCategorySearch"
            >
              <template v-slot:prepend>
                <span>类型 ID</span>
              </template>
              <template v-slot:append>
                <el-button :icon="SearchIcon" @click="handleSettingCategorySearch" />
              </template>
            </el-input>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            v-model:current-page="settingCategoryTableCurrentPage"
            v-model:page-size="settingCategoryTablePageSize"
            highlight-current-row
            :item-count="settingCategoryTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="settingCategoryTableItems"
            :operate-column-visible="false"
            @onPagingAttributeChanged="handleSettingCategoryTablePagingAttributeChanged"
            @onCurrentChanged="handleSettingCategoryTableCurrentChanged"
          >
            <template v-slot:default>
              <el-table-column prop="key.string_id" label="配置类型" show-overflow-tooltip />
              <el-table-column prop="formatter_type" label="格式化器类型" show-overflow-tooltip />
              <el-table-column
                prop="formatter_param"
                label="格式化器参数"
                class-name="single-line"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </template>
    <template v-slot:footer>
      <el-button
        type="primary"
        :disabled="loading > 0 || settingCategoryTableCurrentRow === null"
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

import type { SettingCategory } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory.ts'
import {
  all,
  idLike,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'SettingCategorySelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', value: SettingCategory): void
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

// -----------------------------------------------------------配置类型搜索-----------------------------------------------------------
function handleSettingCategorySearch(): void {
  if (idSearchBarValue.value !== '') {
    handleSettingCategoryIdLikeSearch()
  } else {
    handleSettingCategoryAllSearch()
  }
}

async function handleSettingCategoryIdLikeSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => idLike(idSearchBarValue.value, pagingInfo),
      settingCategoryTablePagingInfo.value,
    )
    updateSettingCategoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleSettingCategoryAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      settingCategoryTablePagingInfo.value,
    )
    updateSettingCategoryTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSettingCategorySearch()
})

// -----------------------------------------------------------配置类型表格处理-----------------------------------------------------------
const {
  currentPage: settingCategoryTableCurrentPage,
  pageSize: settingCategoryTablePageSize,
  itemCount: settingCategoryTableItemCount,
  items: settingCategoryTableItems,
  pagingInfo: settingCategoryTablePagingInfo,
  updateByLookup: updateSettingCategoryTableByLookup,
} = useIdentityBackendPagingTablePanel<SettingCategory>(15)
const settingCategoryTableCurrentRow = ref<SettingCategory | null>(null)

function handleSettingCategoryTablePagingAttributeChanged(): void {
  handleSettingCategorySearch()
}

function handleSettingCategoryTableCurrentChanged(current: SettingCategory | null): void {
  settingCategoryTableCurrentRow.value = current
}

// -----------------------------------------------------------对话框处理-----------------------------------------------------------
function handleConfirmButtonClicked(): void {
  const formatSupport: SettingCategory | null = settingCategoryTableCurrentRow.value
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
  const formatSupport: SettingCategory | null = settingCategoryTableCurrentRow.value
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

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
