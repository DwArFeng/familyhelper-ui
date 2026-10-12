<template>
  <div class="meta-indicator-panel-container" v-loading="loading">
    <placeholder-panel
      v-if="!topic"
      :text="t('views.element_plus_engineering.notify_management.please_select_notify_setting')"
    />
    <header-layout-panel v-else>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowMetaIndicatorCreateDialog"
            >{{ t('views.element_plus_engineering.notify_management.create_indicator') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-button type="success" @click="handleMetaIndicatorSearch">{{
            t('views.element_plus_engineering.notify_management.refresh_data')
          }}</el-button>
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
          :items="metaIndicatorTableItems"
          @onPagingAttributeChanged="handleMetaIndicatorTablePagingAttributeChanged"
          @onItemInspect="handleShowMetaIndicatorInspectDialog"
          @onItemEdit="handleShowMetaIndicatorEditDialog"
          @onItemDelete="handleMetaIndicatorDeleteButtonClicked"
        >
          <el-table-column
            prop="key.meta_id"
            :label="t('views.element_plus_engineering.notify_management.meta_id')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="label"
            :label="t('views.element_plus_engineering.notify_management.name')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="default_value"
            :label="t('views.element_plus_engineering.notify_management.default_value')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="remark"
            :label="t('views.element_plus_engineering.notify_management.remark')"
            show-overflow-tooltip
          />
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
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.meta_id')"
        prop="key_meta_id"
      >
        <el-input
          v-model="metaIndicatorMaintainDialogItem.key_meta_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="metaIndicatorMaintainDialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.name')"
        prop="label"
      >
        <el-input
          v-model="metaIndicatorMaintainDialogItem.label"
          :readonly="metaIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.default_value')"
        prop="default_value"
      >
        <el-input
          v-model="metaIndicatorMaintainDialogItem.default_value"
          :readonly="metaIndicatorMaintainDialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.remark')"
        prop="remark"
      >
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

import { type FormItemRule } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useGeneralMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'
import { type MetaIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import {
  childForTopic,
  exists,
  insert,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'MetaIndicatorPanel',
})

// region Props 定义

type Props = {
  topic: Topic | null
}

const props = defineProps<Props>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

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
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
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

// endregion

// region 头部面板

function handleShowMetaIndicatorCreateDialog(): void {
  showMetaIndicatorCreateMaintainDialog()
}

// endregion

// region 元数据指示器表格

const {
  currentPage: metaIndicatorTableCurrentPage,
  pageSize: metaIndicatorTablePageSize,
  itemCount: metaIndicatorTableItemCount,
  items: metaIndicatorTableItems,
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
      t('views.element_plus_engineering.notify_management.delete_indicator_confirmation_prefix') +
        t('views.element_plus_engineering.notify_management.operation_irreversible_warning') +
        t('views.element_plus_engineering.notify_management.continue_confirmation'),
      t('views.element_plus_engineering.notify_management.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.notify_management.confirm'),
        cancelButtonText: t('views.element_plus_engineering.notify_management.cancel'),
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
      message: t('views.element_plus_engineering.notify_management.indicator_deleted', {
        indicatorLabel: row.label,
      }),
      type: 'success',
    })
    handleMetaIndicatorSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 元数据指示器维护对话框

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
    throw new Error(
      t('views.element_plus_engineering.notify_management.unexpected_execution_contact_developer'),
    )
  }
  Promise.resolve(value)
    .then((res) => {
      if (res === '') {
        callback(
          new Error(t('views.element_plus_engineering.notify_management.indicator_required')),
        )
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
        callback(
          new Error(t('views.element_plus_engineering.notify_management.indicator_already_exists')),
        )
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
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.notify_management.label_required'),
      trigger: 'blur',
    },
  ],
})
const metaIndicatorMaintainDialogEditRules = ref({
  label: [
    {
      required: true,
      message: t('views.element_plus_engineering.notify_management.name_required'),
      trigger: 'blur',
    },
  ],
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
      throw new Error(
        t(
          'views.element_plus_engineering.notify_management.unexpected_execution_contact_developer',
        ),
      )
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
      message: t('views.element_plus_engineering.notify_management.indicator_created', {
        indicatorLabel: item.label,
      }),
      type: 'success',
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
      throw new Error(
        t(
          'views.element_plus_engineering.notify_management.unexpected_execution_contact_developer',
        ),
      )
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
      message: t('views.element_plus_engineering.notify_management.indicator_updated', {
        indicatorLabel: item.label,
      }),
      type: 'success',
    })
    handleMetaIndicatorSearch()
    metaIndicatorMaintainDialogVisible.value = false
  } finally {
    metaIndicatorMaintainDialogLoading.value -= 1
  }
}

// endregion
</script>

<style scoped>
.meta-indicator-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
