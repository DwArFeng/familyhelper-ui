<template>
  <div class="dispatcher-support-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        class="table"
        v-model:page-size="dispatcherSupportTablePageSize"
        v-model:current-page="dispatcherSupportTableCurrentPage"
        :item-count="dispatcherSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="dispatcherSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleDispatcherSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowDispatcherSupportMaintainInspectDialog"
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
          <el-button type="success" @click="handleDispatcherSupportSearch">{{
            t('views.element_plus_engineering.notify_management.refresh')
          }}</el-button>
          <div class="tooltip">
            {{
              t(
                'views.element_plus_engineering.notify_management.dispatcher_support_read_only_hint',
              )
            }}
          </div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="dispatcherSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="dispatcherSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.type')"
        prop="key_string_id"
      >
        <el-input v-model="dispatcherSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.label')"
        prop="label"
      >
        <el-input v-model="dispatcherSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.description')"
        prop="description"
      >
        <el-input v-model="dispatcherSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.example_parameters')"
        prop="example_param"
      >
        <text-editor
          class="text-editor"
          v-model="dispatcherSupportMaintainDialogItem.example_param"
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

import { type DispatcherSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/dispatcherSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'DispatcherSupport',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handleDispatcherSupportSearch(): void {
  handleDispatcherSupportAllSearch()
}

async function handleDispatcherSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      dispatcherSupportTablePagingInfo.value,
    )
    updateDispatcherSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleDispatcherSupportSearch()
})

// endregion

// region 调度器支持表格

const {
  currentPage: dispatcherSupportTableCurrentPage,
  pageSize: dispatcherSupportTablePageSize,
  itemCount: dispatcherSupportTableItemCount,
  items: dispatcherSupportTableItems,
  pagingInfo: dispatcherSupportTablePagingInfo,
  updateByLookup: updateDispatcherSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<DispatcherSupport>(15)

function handleDispatcherSupportTablePagingAttributeChanged(): void {
  handleDispatcherSupportSearch()
}

// endregion

// region 维护对话框

type DispatcherSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: dispatcherSupportMaintainDialogVisible,
  item: dispatcherSupportMaintainDialogItem,
  showDialog: showDispatcherSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<DispatcherSupport, DispatcherSupportMaintainDialogItem>(
  dispatcherSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function dispatcherSupportMaintainDialogItemMap(
  t: DispatcherSupport,
): DispatcherSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowDispatcherSupportMaintainInspectDialog(item: DispatcherSupport): void {
  showDispatcherSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.dispatcher-support-container {
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
