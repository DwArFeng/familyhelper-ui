<template>
  <el-dialog
    class="formatter-support-select-dialog-container"
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
      v-model:current-page="formatterSupportTableCurrentPage"
      v-model:page-size="formatterSupportTablePageSize"
      highlight-current-row
      :item-count="formatterSupportTableItemCount"
      :page-sizes="[15, 20, 30, 50]"
      :items="formatterSupportItems"
      :operate-column-visible="false"
      @onPagingAttributeChanged="handleFormatterSupportTablePagingAttributeChanged"
      @onCurrentChanged="handleFormatterSupportTableCurrentChanged"
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
          :disabled="loading > 0 || formatterSupportTableCurrentRow === null"
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

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import type { FormatterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/formatterSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/formatterSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'FormatterSupportSelectDialog',
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
  (e: 'onConfirmed', value: FormatterSupport): void
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

// -----------------------------------------------------------搜索-----------------------------------------------------------
function handleFormatterSupportSearch(): void {
  handleFormatterSupportAllSearch()
}

async function handleFormatterSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      formatterSupportTablePagingInfo.value,
    )
    updateFormatterSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------格式化器支持表格处理-----------------------------------------------------------
const {
  currentPage: formatterSupportTableCurrentPage,
  pageSize: formatterSupportTablePageSize,
  itemCount: formatterSupportTableItemCount,
  items: formatterSupportItems,
  pagingInfo: formatterSupportTablePagingInfo,
  updateByLookup: updateFormatterSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<FormatterSupport>(15)
const formatterSupportTableCurrentRow = ref<FormatterSupport | null>(null)

function handleFormatterSupportTablePagingAttributeChanged(): void {
  handleFormatterSupportSearch()
}

function handleFormatterSupportTableCurrentChanged(current: FormatterSupport | null): void {
  formatterSupportTableCurrentRow.value = current
}

// -----------------------------------------------------------对话框处理-----------------------------------------------------------
function handleConfirmButtonClicked(): void {
  const formatSupport: FormatterSupport | null = formatterSupportTableCurrentRow.value
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
  const formatSupport: FormatterSupport | null = formatterSupportTableCurrentRow.value
  if (!formatSupport) {
    return
  }
  emit('onConfirmed', formatSupport)
  watchedVisible.value = false
}
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
