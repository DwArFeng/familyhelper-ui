<template>
  <div class="guarder-support-container">
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
        v-model:page-size="guarderSupportTablePageSize"
        v-model:current-page="guarderSupportTableCurrentPage"
        :item-count="guarderSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="guarderSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleGuarderSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowGuarderSupportMaintainInspectDialog"
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
          <el-button type="success" @click="handleGuarderSupportSearch">{{
            t('views.element_plus_engineering.logic_engine.refresh')
          }}</el-button>
          <div class="tooltip">
            {{ t('views.element_plus_engineering.logic_engine.guarder_support_read_only_notice') }}
          </div>
        </div>
      </template>
    </root-border-layout-panel>
    <maintain-dialog
      v-model:visible="guarderSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="guarderSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.type')"
        prop="key_string_id"
      >
        <el-input v-model="guarderSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.logic_engine.label')" prop="label">
        <el-input v-model="guarderSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.description')"
        prop="description"
      >
        <el-input v-model="guarderSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.logic_engine.example_parameters')"
        prop="example_param"
      >
        <text-editor
          class="text-editor"
          v-model="guarderSupportMaintainDialogItem.example_param"
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
  type GuarderSupport,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/logicengine/guarderSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'GuarderSupport',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handleGuarderSupportSearch(): void {
  handleGuarderSupportAllSearch()
}

async function handleGuarderSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      guarderSupportTablePagingInfo.value,
    )
    updateGuarderSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleGuarderSupportSearch()
})

// endregion

// region 守卫器支持表格

const {
  currentPage: guarderSupportTableCurrentPage,
  pageSize: guarderSupportTablePageSize,
  itemCount: guarderSupportTableItemCount,
  items: guarderSupportTableItems,
  pagingInfo: guarderSupportTablePagingInfo,
  updateByLookup: updateGuarderSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<GuarderSupport>(15)

function handleGuarderSupportTablePagingAttributeChanged(): void {
  handleGuarderSupportSearch()
}

// endregion

// region 维护对话框

type GuarderSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: guarderSupportMaintainDialogVisible,
  item: guarderSupportMaintainDialogItem,
  showDialog: showGuarderSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<GuarderSupport, GuarderSupportMaintainDialogItem>(
  guarderSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function guarderSupportMaintainDialogItemMap(t: GuarderSupport): GuarderSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowGuarderSupportMaintainInspectDialog(item: GuarderSupport): void {
  showGuarderSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.guarder-support-container {
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
