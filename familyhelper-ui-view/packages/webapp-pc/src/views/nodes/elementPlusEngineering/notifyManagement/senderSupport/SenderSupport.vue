<template>
  <div class="sender-support-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        class="table"
        v-model:page-size="senderSupportTablePageSize"
        v-model:current-page="senderSupportTableCurrentPage"
        :item-count="senderSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="senderSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleSenderSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowSenderSupportMaintainInspectDialog"
      >
        <el-table-column
          prop="key.string_id"
          :label="t('views.element_plus_engineering.notify_management.type')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="label"
          :label="t('views.element_plus_engineering.notify_management.label')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          :label="t('views.element_plus_engineering.notify_management.description')"
          show-overflow-tooltip
        />
        <el-table-column
          class-name="single-line"
          prop="example_param"
          :label="t('views.element_plus_engineering.notify_management.example_parameters')"
        />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleSenderSupportSearch">{{
            t('views.element_plus_engineering.notify_management.refresh')
          }}</el-button>
          <div class="tooltip">
            {{
              t('views.element_plus_engineering.notify_management.sender_support_read_only_hint')
            }}
          </div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="senderSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="senderSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.type')"
        prop="key_string_id"
      >
        <el-input v-model="senderSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.label')"
        prop="label"
      >
        <el-input v-model="senderSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.description')"
        prop="description"
      >
        <el-input v-model="senderSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.example_parameters')"
        prop="example_param"
      >
        <text-editor
          class="text-editor"
          v-model="senderSupportMaintainDialogItem.example_param"
          readonly
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BorderLayoutPanel from '@/components/elementPlusEngineering/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import { type SenderSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/senderSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/senderSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SenderSupport',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handleSenderSupportSearch(): void {
  handleSenderSupportAllSearch()
}

async function handleSenderSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      senderSupportTablePagingInfo.value,
    )
    updateSenderSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSenderSupportSearch()
})

// endregion

// region 发送器支持表格

const {
  currentPage: senderSupportTableCurrentPage,
  pageSize: senderSupportTablePageSize,
  itemCount: senderSupportTableItemCount,
  items: senderSupportTableItems,
  pagingInfo: senderSupportTablePagingInfo,
  updateByLookup: updateSenderSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<SenderSupport>(15)

function handleSenderSupportTablePagingAttributeChanged(): void {
  handleSenderSupportSearch()
}

// endregion

// region 维护对话框

type SenderSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: senderSupportMaintainDialogVisible,
  item: senderSupportMaintainDialogItem,
  showDialog: showSenderSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<SenderSupport, SenderSupportMaintainDialogItem>(
  senderSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function senderSupportMaintainDialogItemMap(t: SenderSupport): SenderSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowSenderSupportMaintainInspectDialog(item: SenderSupport): void {
  showSenderSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.sender-support-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-container .tooltip {
  font-size: 14px;
  color: #909399;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.single-line .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor {
  height: 300px;
}
</style>
