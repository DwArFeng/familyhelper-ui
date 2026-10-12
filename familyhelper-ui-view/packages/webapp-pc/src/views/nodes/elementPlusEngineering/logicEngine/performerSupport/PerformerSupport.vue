<template>
  <div class="performer-support-container">
    <root-border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <table-panel
        class="table"
        v-model:page-size="performerSupportTablePageSize"
        v-model:current-page="performerSupportTableCurrentPage"
        :item-count="performerSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="performerSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handlePerformerSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowPerformerSupportMaintainInspectDialog"
      >
        <el-table-column
          prop="key.string_id"
          :label="t('views.element_plus_engineering.logic_engine.type')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="label"
          :label="t('views.element_plus_engineering.logic_engine.label')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          :label="t('views.element_plus_engineering.logic_engine.description')"
          show-overflow-tooltip
        />
        <el-table-column
          class-name="single-line"
          prop="example_param"
          :label="t('views.element_plus_engineering.logic_engine.example_parameters')"
          min-width="110"
        />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handlePerformerSupportSearch">{{
            t('views.element_plus_engineering.logic_engine.refresh')
          }}</el-button>
          <div class="tooltip">
            {{
              t('views.element_plus_engineering.logic_engine.performer_support_read_only_notice')
            }}
          </div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="performerSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="performerSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.type')"
        prop="key_string_id"
      >
        <el-input v-model="performerSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.label')" prop="label">
        <el-input v-model="performerSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.description')"
        prop="description"
      >
        <el-input v-model="performerSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.example_parameters')"
        prop="example_param"
      >
        <text-editor
          class="text-editor"
          v-model="performerSupportMaintainDialogItem.example_param"
          readonly
        />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'
import MaintainDialog from '@/components/elementPlusEngineering/dialog/maintainDialog/MaintainDialog.vue'
import TextEditor from '@/components/elementPlusEngineering/text/textEditor/TextEditor.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'
import { useInspectOnlyMaintainDialog } from '@/components/elementPlusEngineering/dialog/maintainDialog/composables.ts'

import {
  all,
  type PerformerSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/performerSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PerformerSupport',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handlePerformerSupportSearch(): void {
  handlePerformerSupportAllSearch()
}

async function handlePerformerSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      performerSupportTablePagingInfo.value,
    )
    updatePerformerSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handlePerformerSupportSearch()
})

// endregion

// region 执行器支持表格

const {
  currentPage: performerSupportTableCurrentPage,
  pageSize: performerSupportTablePageSize,
  itemCount: performerSupportTableItemCount,
  items: performerSupportTableItems,
  pagingInfo: performerSupportTablePagingInfo,
  updateByLookup: updatePerformerSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<PerformerSupport>(15)

function handlePerformerSupportTablePagingAttributeChanged(): void {
  handlePerformerSupportSearch()
}

// endregion

// region 维护对话框

type PerformerSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: performerSupportMaintainDialogVisible,
  item: performerSupportMaintainDialogItem,
  showDialog: showPerformerSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<PerformerSupport, PerformerSupportMaintainDialogItem>(
  performerSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function performerSupportMaintainDialogItemMap(
  t: PerformerSupport,
): PerformerSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowPerformerSupportMaintainInspectDialog(item: PerformerSupport): void {
  showPerformerSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.performer-support-container {
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
.table :deep(th.el-table__cell > .cell) {
  white-space: nowrap;
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
