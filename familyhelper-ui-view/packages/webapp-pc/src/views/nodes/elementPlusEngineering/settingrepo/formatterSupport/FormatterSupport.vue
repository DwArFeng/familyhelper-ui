<template>
  <div class="formatter-support-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        class="table"
        v-model:page-size="formatterSupportTablePageSize"
        v-model:current-page="formatterSupportTableCurrentPage"
        :item-count="formatterSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="formatterSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleFormatterSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowFormatterSupportMaintainInspectDialog"
      >
        <el-table-column
          prop="key.string_id"
          :label="t('views.element_plus_engineering.settingrepo.type')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="label"
          :label="t('views.element_plus_engineering.settingrepo.label')"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          :label="t('views.element_plus_engineering.settingrepo.description')"
          show-overflow-tooltip
        />
        <el-table-column
          class-name="single-line"
          prop="example_param"
          :label="t('views.element_plus_engineering.settingrepo.example_parameters')"
        />
      </table-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleFormatterSupportSearch">{{
            t('views.element_plus_engineering.settingrepo.refresh')
          }}</el-button>
          <div class="tooltip">
            {{ t('views.element_plus_engineering.settingrepo.formatter_support_read_only_hint') }}
          </div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="formatterSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="formatterSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.settingrepo.type')"
        prop="key_string_id"
      >
        <el-input v-model="formatterSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item :label="t('views.element_plus_engineering.settingrepo.label')" prop="label">
        <el-input v-model="formatterSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.settingrepo.description')"
        prop="description"
      >
        <el-input v-model="formatterSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.settingrepo.example_parameters')"
        prop="example_param"
      >
        <text-editor
          class="text-editor"
          v-model="formatterSupportMaintainDialogItem.example_param"
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

import { type FormatterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/formatterSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/formatterSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'FormatterSupport',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

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

onMounted(() => {
  handleFormatterSupportSearch()
})

// endregion

// region 格式化器支持表格

const {
  currentPage: formatterSupportTableCurrentPage,
  pageSize: formatterSupportTablePageSize,
  itemCount: formatterSupportTableItemCount,
  items: formatterSupportTableItems,
  pagingInfo: formatterSupportTablePagingInfo,
  updateByLookup: updateFormatterSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<FormatterSupport>(15)

function handleFormatterSupportTablePagingAttributeChanged(): void {
  handleFormatterSupportSearch()
}

// endregion

// region 维护对话框

type FormatterSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: formatterSupportMaintainDialogVisible,
  item: formatterSupportMaintainDialogItem,
  showDialog: showFormatterSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<FormatterSupport, FormatterSupportMaintainDialogItem>(
  formatterSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function formatterSupportMaintainDialogItemMap(
  t: FormatterSupport,
): FormatterSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowFormatterSupportMaintainInspectDialog(item: FormatterSupport): void {
  showFormatterSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.formatter-support-container {
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
