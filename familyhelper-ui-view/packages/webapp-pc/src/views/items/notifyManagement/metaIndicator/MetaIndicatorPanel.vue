<template>
  <div class="meta-indicator-panel-container" v-loading="loading">
    <div class="placeholder" v-if="!topic">请选择通知设置</div>
    <header-layout-panel v-else>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowMetaIndicatorCreateDialog"
            >新建指示器
          </el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleMetaIndicatorSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="metaIndicatorTableCurrentPage"
          v-model:page-size="metaIndicatorTablePageSize"
          highlight-current-row
          :item-count="metaIndicatorTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="metaIndicatorItems"
          @onPagingAttributeChanged="handleMetaIndicatorTablePagingAttributeChanged"
          @onItemInspect="handleShowMetaIndicatorInspectDialog"
          @onItemEdit="handleShowMetaIndicatorEditDialog"
          @onItemDelete="handleMetaIndicatorDeleteButtonClicked"
        >
          <el-table-column prop="key.meta_id" label="元数据ID" show-overflow-tooltip />
          <el-table-column prop="label" label="名称" show-overflow-tooltip />
          <el-table-column prop="default_value" label="默认值" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="metaIndicatorMaintainDialogVisible"
      top="10vh"
      label-width="85px"
      :loading="metaIndicatorMaintainDialogLoading"
      :mode="metaIndicatorMaintainDialogMode"
      :item="metaIndicatorMaintainDialogItem"
      :create-rules="metaIndicatorMaintainDialogCreateRules"
      :edit-rules="metaIndicatorMaintainDialogEditRules"
      :close-on-click-modal="false"
      @onItemCreate="handleMetaIndicatorCreate"
      @onItemEdit="handleMetaIndicatorEdit"
    >
      <el-form-item label="元数据 ID" prop="key_meta_id">
        <el-input
          v-model="metaIndicatorMaintainDialogItem.key_meta_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="metaIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="label">
        <el-input
          v-model="metaIndicatorMaintainDialogItem.label"
          :readonly="metaIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="默认值" prop="default_value">
        <el-input
          v-model="metaIndicatorMaintainDialogItem.default_value"
          :readonly="metaIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="metaIndicatorMaintainDialogItem.remark"
          :readonly="metaIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import type { FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'

import type { Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import type { MetaIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import {
  childForTopic,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'MetaIndicatorPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  topic: Topic | null
}

const props = defineProps<Props>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------搜索逻辑-----------------------------------------------------------
watch(
  () => props.topic,
  () => {
    handleMetaIndicatorSearch()
  },
)

function handleMetaIndicatorSearch(): void {
  if (!props.topic) {
    return
  }
  handleMetaIndicatorChildForTopicSearch()
}

async function handleMetaIndicatorChildForTopicSearch(): Promise<void> {
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForTopic(topic.key, pagingInfo),
      metaIndicatorTablePagingInfo.value,
    )
    updateMetaIndicatorTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowMetaIndicatorCreateDialog(): void {
  showMetaIndicatorCreateMaintainDialog()
}

// -----------------------------------------------------------元数据指示器表格-----------------------------------------------------------
const {
  currentPage: metaIndicatorTableCurrentPage,
  pageSize: metaIndicatorTablePageSize,
  itemCount: metaIndicatorTableItemCount,
  items: metaIndicatorItems,
  pagingInfo: metaIndicatorTablePagingInfo,
  updateByLookup: updateMetaIndicatorTableByLookup,
} = useIdentityBackendPagingTablePanel<MetaIndicator>(15)

function handleMetaIndicatorTablePagingAttributeChanged(): void {
  handleMetaIndicatorSearch()
}

function handleShowMetaIndicatorInspectDialog(row: MetaIndicator): void {
  showMetaIndicatorInspectMaintainDialog(row)
}

function handleShowMetaIndicatorEditDialog(row: MetaIndicator): void {
  showMetaIndicatorEditMaintainDialog(row)
}

function handleMetaIndicatorDeleteButtonClicked(row: MetaIndicator): void {
  handleMetaIndicatorDelete(row)
}

async function handleMetaIndicatorDelete(row: MetaIndicator): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除此指示器。<br>' + '该操作不可恢复！<br>' + '是否继续?',
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
      message: `指示器 ${row.label} 删除成功`,
      type: 'success',
      center: true,
    })
    handleMetaIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------元数据指示器维护对话框-----------------------------------------------------------
type MetaIndicatorMaintainDialogItem = {
  key_topic_id: string
  key_meta_id: string
  label: string
  remark: string
  default_value: string
}

const {
  visible: metaIndicatorMaintainDialogVisible,
  item: metaIndicatorMaintainDialogItem,
  mode: metaIndicatorMaintainDialogMode,
  showCreateDialog: showMetaIndicatorCreateMaintainDialog,
  showEditDialog: showMetaIndicatorEditMaintainDialog,
  showInspectDialog: showMetaIndicatorInspectMaintainDialog,
} = useGeneralMaintainDialog<MetaIndicator, MetaIndicatorMaintainDialogItem>(
  metaIndicatorMaintainDialogItemMap,
  {
    key_topic_id: '',
    key_meta_id: '',
    label: '',
    remark: '',
    default_value: '',
  },
)
const metaIndicatorMaintainDialogLoading = ref<number>(0)
const metaIndicatorMaintainDialogKeyMetaIdValidator: FormItemRule['validator'] = (
  _rule,
  value,
  callback,
) => {
  const topic: Topic | null = props.topic
  if (!topic) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(new Error('指示器不能为空'))
        return Promise.reject()
      }
      return resolveResponse(
        exists({
          topic_id: topic.key.string_id,
          meta_id: value,
        }),
      )
    })
    .then((res) => {
      if (res) {
        callback(new Error('指示器已经存在'))
        return Promise.reject()
      }
      return Promise.resolve()
    })
    .then(() => {
      callback()
    })
    .catch(() => {})
}
const metaIndicatorMaintainDialogCreateRules = ref({
  key_meta_id: [
    {
      required: true,
      validator: metaIndicatorMaintainDialogKeyMetaIdValidator,
      trigger: 'blur',
    },
  ],
  label: [{ required: true, message: '标签不能为空', trigger: 'blur' }],
})
const metaIndicatorMaintainDialogEditRules = ref({
  label: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
})

function metaIndicatorMaintainDialogItemMap(t: MetaIndicator): MetaIndicatorMaintainDialogItem {
  return {
    key_topic_id: t.key.topic_id,
    key_meta_id: t.key.meta_id,
    label: t.label,
    remark: t.remark,
    default_value: t.default_value,
  }
}

async function handleMetaIndicatorCreate(item: MetaIndicatorMaintainDialogItem): Promise<void> {
  metaIndicatorMaintainDialogLoading.value += 1
  try {
    const topic: Topic | null = props.topic
    if (!topic) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    await resolveResponse(
      insert({
        key: {
          topic_id: topic.key.string_id,
          meta_id: item.key_meta_id,
        },
        label: item.label,
        remark: item.remark,
        default_value: item.default_value,
      }),
    )
    ElMessage({
      showClose: true,
      message: `指示器 ${item.label} 创建成功`,
      type: 'success',
      center: true,
    })
    handleMetaIndicatorSearch()
    metaIndicatorMaintainDialogVisible.value = false
  } finally {
    metaIndicatorMaintainDialogLoading.value -= 1
  }
}

async function handleMetaIndicatorEdit(item: MetaIndicatorMaintainDialogItem): Promise<void> {
  metaIndicatorMaintainDialogLoading.value += 1
  try {
    const topic: Topic | null = props.topic
    if (!topic) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    await resolveResponse(
      update({
        key: {
          topic_id: topic.key.string_id,
          meta_id: item.key_meta_id,
        },
        label: item.label,
        remark: item.remark,
        default_value: item.default_value,
      }),
    )
    ElMessage({
      showClose: true,
      message: `指示器 ${item.label} 更新成功`,
      type: 'success',
      center: true,
    })
    handleMetaIndicatorSearch()
    metaIndicatorMaintainDialogVisible.value = false
  } finally {
    metaIndicatorMaintainDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.meta-indicator-panel-container {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
