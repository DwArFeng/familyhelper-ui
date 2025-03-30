<template>
  <div class="topic-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleTopicSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="topicTableCurrentPage"
          v-model:page-size="topicTablePageSize"
          highlight-current-row
          :item-count="topicTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="topicItems"
          :operate-column-visible="false"
          @onPagingAttributeChanged="handleTopicTablePagingAttributeChanged"
          @onCurrentChanged="handleTopicTableCurrentChanged"
        >
          <el-table-column prop="key.string_id" label="ID" show-overflow-tooltip />
          <el-table-column prop="label" label="名称" show-overflow-tooltip />
          <el-table-column
            prop="enabled"
            label="使能"
            width="55px"
            :formatter="topicTableBooleanFormatter"
          />
          <el-table-column prop="priority" label="优先级" width="75px" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import type { Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

defineOptions({
  name: 'TopicPanel',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentTopicChanged', value: Topic | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------主题查询-----------------------------------------------------------
function handleTopicSearch(): void {
  handleTopicAllSearch()
}

async function handleTopicAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      topicTablePagingInfo.value,
    )
    updateTopicTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleTopicSearch()
})

// -----------------------------------------------------------主题表格-----------------------------------------------------------
const {
  currentPage: topicTableCurrentPage,
  pageSize: topicTablePageSize,
  itemCount: topicTableItemCount,
  items: topicItems,
  pagingInfo: topicTablePagingInfo,
  updateByLookup: updateTopicTableByLookup,
} = useIdentityBackendPagingTablePanel<Topic>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function topicTableBooleanFormatter(row: Topic, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: boolean = (row as any)[column.property] as boolean
  return value ? '是' : '否'
}

function handleTopicTablePagingAttributeChanged(): void {
  handleTopicSearch()
}

function handleTopicTableCurrentChanged(current: Topic | null): void {
  emit('onCurrentTopicChanged', current)
}
</script>

<style scoped>
.topic-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}
</style>
