<template>
  <div class="topic-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowTopicCreateDialog"> 新建主题</el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleTopicSearch">刷新数据</el-button>
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
        <table-panel
          class="table"
          v-model:current-page="topicTableCurrentPage"
          v-model:page-size="topicTablePageSize"
          highlight-current-row
          :item-count="topicTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="topicTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleTopicTablePagingAttributeChanged"
          @onCurrentChanged="handleTopicTableCurrentChanged"
          @onItemInspect="handleShowTopicInspectDialog"
          @onItemEdit="handleShowTopicEditDialog"
          @onItemDelete="handleTopicDeleteButtonClicked"
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
  <maintain-dialog
    v-model:visible="topicMaintainDialogVisible"
    top="10vh"
    :loading="topicMaintainDialogLoading"
    :mode="topicMaintainDialogMode"
    :item="topicMaintainDialogItem"
    :create-rules="topicMaintainDialogCreateRules"
    :edit-rules="topicMaintainDialogEditRules"
    :close-on-click-modal="false"
    @onItemCreate="handleTopicCreate"
    @onItemEdit="handleTopicEdit"
  >
    <el-form-item label="ID" prop="key_string_id">
      <el-input
        v-model="topicMaintainDialogItem.key_string_id"
        oninput="this.value = this.value.toLowerCase()"
        :disabled="topicMaintainDialogMode !== 'CREATE'"
      />
    </el-form-item>
    <el-form-item label="名称" prop="label">
      <el-input
        v-model="topicMaintainDialogItem.label"
        :readonly="topicMaintainDialogMode === 'INSPECT'"
      />
    </el-form-item>
    <el-form-item label="使能" prop="enabled">
      <el-switch
        class="focusable-switch"
        tabindex="0"
        v-model="topicMaintainDialogItem.enabled"
        active-text="是"
        inactive-text="否"
        :disabled="topicMaintainDialogMode === 'INSPECT'"
      />
    </el-form-item>
    <el-form-item label="优先级" prop="priority">
      <el-input
        v-model="topicMaintainDialogItem.priority"
        v-if="topicMaintainDialogMode === 'INSPECT'"
        readonly
      />
      <el-input-number v-model="topicMaintainDialogItem.priority" v-else :min="0" :max="10" />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="topicMaintainDialogItem.remark"
        :readonly="topicMaintainDialogMode === 'INSPECT'"
      />
    </el-form-item>
  </maintain-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import {
  all,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { resetRoute } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/reset.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

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

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const applyChangesButtonDisabled = ref<boolean>(false)

function handleShowTopicCreateDialog(): void {
  showTopicCreateMaintainDialog()
}

async function handleApplyChanges(): Promise<void> {
  applyChangesButtonDisabled.value = true
  try {
    await resolveResponse(resetRoute())
    ElMessage({
      showClose: true,
      message: '变更应用成功！后台状态刷新中，请不要频繁点击',
      type: 'success',
    })
  } finally {
    setTimeout(() => {
      applyChangesButtonDisabled.value = false
    }, 3000)
  }
}

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
  items: topicTableItems,
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

function handleShowTopicInspectDialog(row: Topic): void {
  showTopicInspectMaintainDialog(row)
}

function handleShowTopicEditDialog(row: Topic): void {
  showTopicEditMaintainDialog(row)
}

function handleTopicDeleteButtonClicked(row: Topic): void {
  handleTopicDelete(row)
}

async function handleTopicDelete(row: Topic): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此主题。<br>' + '该操作不可恢复！<br>' + '是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
    await resolveResponse(remove(row.key))
    ElMessage({
      showClose: true,
      message: `主题 ${row.label} 删除成功`,
      type: 'success',
    })
    handleTopicSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------主题维护对话框-----------------------------------------------------------
type TopicMaintainDialogItem = {
  key_string_id: string
  label: string
  remark: string
  enabled: boolean
  priority: number
}

const {
  visible: topicMaintainDialogVisible,
  item: topicMaintainDialogItem,
  mode: topicMaintainDialogMode,
  showCreateDialog: showTopicCreateMaintainDialog,
  showEditDialog: showTopicEditMaintainDialog,
  showInspectDialog: showTopicInspectMaintainDialog,
} = useGeneralMaintainDialog<Topic, TopicMaintainDialogItem>(topicMaintainDialogItemMap, {
  key_string_id: '',
  label: '',
  remark: '',
  enabled: false,
  priority: 0,
})
const topicMaintainDialogLoading = ref<number>(0)
const topicMaintainDialogKeyValidator: FormItemRule['validator'] = (_rule, value, callback) => {
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('主题不能为空'))
        return Promise.reject()
      }
      return resolveResponse(exists({ string_id: value }))
    })
    .then((res) => {
      if (res) {
        callback(new Error('主题已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const topicMaintainDialogCreateRules = ref({
  key_string_id: [{ required: true, validator: topicMaintainDialogKeyValidator, trigger: 'blur' }],
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
})
const topicMaintainDialogEditRules = ref({
  label: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

function topicMaintainDialogItemMap(t: Topic): TopicMaintainDialogItem {
  return {
    key_string_id: t.key.string_id,
    label: t.label,
    remark: t.remark,
    enabled: t.enabled,
    priority: t.priority,
  }
}

async function handleTopicCreate(item: TopicMaintainDialogItem): Promise<void> {
  topicMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      insert({
        key: { string_id: item.key_string_id },
        label: item.label,
        remark: item.remark,
        enabled: item.enabled,
        priority: item.priority,
      }),
    )
    ElMessage({
      showClose: true,
      message: `主题 ${item.label} 创建成功`,
      type: 'success',
    })
    handleTopicSearch()
    topicMaintainDialogVisible.value = false
  } finally {
    topicMaintainDialogLoading.value -= 1
  }
}

async function handleTopicEdit(item: TopicMaintainDialogItem): Promise<void> {
  topicMaintainDialogLoading.value += 1
  try {
    await resolveResponse(
      update({
        key: { string_id: item.key_string_id },
        label: item.label,
        remark: item.remark,
        enabled: item.enabled,
        priority: item.priority,
      }),
    )
    ElMessage({
      showClose: true,
      message: `主题 ${item.label} 更新成功`,
      type: 'success',
    })
    handleTopicSearch()
    topicMaintainDialogVisible.value = false
  } finally {
    topicMaintainDialogLoading.value -= 1
  }
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

.focusable-switch:focus {
  outline: none;
}
</style>
