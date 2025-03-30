<template>
  <div class="notify-setting-topic-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-input
            class="item"
            v-model="notifySettingSearchBarValue"
            placeholder="通知设置名称过滤"
            @keyup.enter="handleNotifySettingSearch"
          >
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleNotifySettingSearch" />
            </template>
          </el-input>
          <el-input
            class="item"
            v-model="topicSearchBarValue"
            placeholder="主题名称过滤"
            @keyup.enter="handleTopicSearch"
          >
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleTopicSearch" />
            </template>
          </el-input>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleSearch">刷新数据</el-button>
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            :disabled="applyChangesButtonDisabled"
            @click="handleApplyChanges"
          >
            应用变更
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="body-item-wrapper">
          <title-layout-panel class="item" title="通知设置">
            <table-panel
              class="table"
              v-loading="notifySettingTableLoading"
              v-model:current-page="notifySettingTableCurrentPage"
              v-model:page-size="notifySettingTablePageSize"
              highlight-current-row
              :item-count="notifySettingTableItemCount"
              :page-sizes="[15, 20, 30, 50]"
              :items="notifySettingItems"
              :operate-column-visible="false"
              @onPagingAttributeChanged="handleNotifySettingTablePagingAttributeChanged"
              @onCurrentChanged="handleNotifySettingTableCurrentChanged"
            >
              <el-table-column prop="label" label="名称" show-overflow-tooltip />
              <el-table-column
                prop="enabled"
                label="使能"
                width="55px"
                :formatter="notifySettingTableBooleanFormatter"
              />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </table-panel>
          </title-layout-panel>
          <title-layout-panel class="item" title="主题">
            <table-panel
              class="table"
              v-loading="topicTableLoading"
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
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/layout/titleLayoutPanel/TitleLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import type { NotifySetting } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import {
  all as allNotifySetting,
  labelLike as labelLikeNotifySetting,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/notifySetting.ts'
import type { Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import {
  all as allTopic,
  labelLike as labelLikeTopic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { resetSend } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/reset.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'NotifySettingTopicPanel',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onCurrentNotifySettingChanged', value: NotifySetting | null): void
  (e: 'onCurrentTopicChanged', value: Topic | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const notifySettingSearchBarValue = ref<string>('')
const topicSearchBarValue = ref<string>('')
const applyChangesButtonDisabled = ref<boolean>(false)

function handleSearch(): void {
  handleNotifySettingSearch()
  handleTopicSearch()
}

function handleNotifySettingSearch(): void {
  if (!notifySettingSearchBarValue.value) {
    handleNotifySettingAllSearch()
  } else {
    handleNotifySettingLabelLikeSearch()
  }
}

async function handleNotifySettingAllSearch(): Promise<void> {
  notifySettingTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allNotifySetting(pagingInfo),
      notifySettingTablePagingInfo.value,
    )
    updateNotifySettingTableByLookup(res)
  } finally {
    notifySettingTableLoading.value -= 1
  }
}

async function handleNotifySettingLabelLikeSearch(): Promise<void> {
  notifySettingTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => labelLikeNotifySetting(notifySettingSearchBarValue.value, pagingInfo),
      notifySettingTablePagingInfo.value,
    )
    updateNotifySettingTableByLookup(res)
  } finally {
    notifySettingTableLoading.value -= 1
  }
}

function handleTopicSearch(): void {
  if (!topicSearchBarValue.value) {
    handleTopicAllSearch()
  } else {
    handleTopicLabelLikeSearch()
  }
}

async function handleTopicAllSearch(): Promise<void> {
  topicTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allTopic(pagingInfo),
      topicTablePagingInfo.value,
    )
    updateTopicTableByLookup(res)
  } finally {
    topicTableLoading.value -= 1
  }
}

async function handleTopicLabelLikeSearch(): Promise<void> {
  topicTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => labelLikeTopic(topicSearchBarValue.value, pagingInfo),
      topicTablePagingInfo.value,
    )
    updateTopicTableByLookup(res)
  } finally {
    topicTableLoading.value -= 1
  }
}

async function handleApplyChanges(): Promise<void> {
  applyChangesButtonDisabled.value = true
  try {
    await resolveResponse(resetSend())
    ElMessage({
      showClose: true,
      message: '变更应用成功！后台状态刷新中，请不要频繁点击',
      type: 'success',
      center: true,
    })
  } finally {
    setTimeout(() => {
      applyChangesButtonDisabled.value = false
    }, 3000)
  }
}

onMounted(() => {
  handleSearch()
})

// -----------------------------------------------------------通知设置表格-----------------------------------------------------------
const {
  currentPage: notifySettingTableCurrentPage,
  pageSize: notifySettingTablePageSize,
  itemCount: notifySettingTableItemCount,
  items: notifySettingItems,
  pagingInfo: notifySettingTablePagingInfo,
  updateByLookup: updateNotifySettingTableByLookup,
} = useIdentityBackendPagingTablePanel<NotifySetting>(15)
const notifySettingTableLoading = ref<number>(0)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notifySettingTableBooleanFormatter(row: NotifySetting, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: boolean = (row as any)[column.property] as boolean
  return value ? '是' : '否'
}

function handleNotifySettingTablePagingAttributeChanged(): void {
  handleNotifySettingSearch()
}

function handleNotifySettingTableCurrentChanged(current: NotifySetting | null): void {
  emit('onCurrentNotifySettingChanged', current)
}

// -----------------------------------------------------------主题表格-----------------------------------------------------------
const {
  currentPage: topicTableCurrentPage,
  pageSize: topicTablePageSize,
  itemCount: topicTableItemCount,
  items: topicItems,
  pagingInfo: topicTablePagingInfo,
  updateByLookup: updateTopicTableByLookup,
} = useIdentityBackendPagingTablePanel<Topic>(15)
const topicTableLoading = ref<number>(0)

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
.notify-setting-topic-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 5px;
  column-gap: 5px;
}

.header-container .item {
  width: 0;
  min-width: 200px;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.body-item-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}

.body-item-wrapper .item {
  flex-grow: 1;
}
</style>
