<template>
  <el-dialog
    class="account-protector-support-select-dialog-container"
    v-model="watchedVisible"
    append-to-body
    tabindex="0"
    id="dialog"
    title="模板选择"
    destroy-on-close
    :close-on-click-modal="false"
    @keydown.ctrl.enter="handleHotKeyDown"
  >
    <table-panel
      class="table"
      v-loading="loading"
      v-model:current-page="accountProtectorSupportTableCurrentPage"
      v-model:page-size="accountProtectorSupportTablePageSize"
      highlight-current-row
      :item-count="accountProtectorSupportTableItemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="accountProtectorSupportTableItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleAccountProtectorSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleAccountProtectorSupportTableCurrentChanged"
    >
      <el-table-column prop="label" label="名称" show-overflow-tooltip />
      <el-table-column prop="key.string_id" label="ID" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="example_param" label="参数示例" show-overflow-tooltip />
    </table-panel>
    <template v-slot:footer>
      <div>
        <el-button
          type="primary"
          :disabled="loading > 0 || accountProtectorSupportTableCurrentRow === null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </el-button>
        <el-button :disabled="loading > 0" @click="handleCancelButtonClicked"> 取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

import { type ProtectorSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/acckeeper/protectorSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'AccountProtectorSupportSelectDialog',
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
  (e: 'onConfirmed', value: ProtectorSupport): void
}

const emit = defineEmits<Emits>()

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
  handleAccountProtectorSupportSearch()
})

// endregion

// region 搜索

function handleAccountProtectorSupportSearch(): void {
  handleAccountProtectorSupportAllSearch()
}

async function handleAccountProtectorSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      accountProtectorSupportTablePagingInfo.value,
    )
    updateAccountProtectorSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 账户保护器支持表格处理

const {
  currentPage: accountProtectorSupportTableCurrentPage,
  pageSize: accountProtectorSupportTablePageSize,
  itemCount: accountProtectorSupportTableItemCount,
  items: accountProtectorSupportTableItems,
  pagingInfo: accountProtectorSupportTablePagingInfo,
  updateByLookup: updateAccountProtectorSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<ProtectorSupport>(15)
const accountProtectorSupportTableCurrentRow = ref<ProtectorSupport | null>(null)

function handleAccountProtectorSupportTablePagingAttributeChanged(): void {
  handleAccountProtectorSupportSearch()
}

function handleAccountProtectorSupportTableCurrentChanged(current: ProtectorSupport | null): void {
  accountProtectorSupportTableCurrentRow.value = current
}

// endregion

// region 对话框处理

function handleConfirmButtonClicked(): void {
  const formatSupport: ProtectorSupport | null = accountProtectorSupportTableCurrentRow.value
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
  const formatSupport: ProtectorSupport | null = accountProtectorSupportTableCurrentRow.value
  if (!formatSupport) {
    return
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
