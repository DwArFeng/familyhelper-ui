<template>
  <div class="router-support-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <table-panel
        class="table"
        v-model:page-size="routerSupportTablePageSize"
        v-model:current-page="routerSupportTableCurrentPage"
        :item-count="routerSupportTableItemCount"
        :page-sizes="[15, 20, 30, 50]"
        :items="routerSupportTableItems"
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-column-width="53"
        @onPagingAttributeChanged="handleRouterSupportTablePagingAttributeChanged"
        @onItemInspect="handleShowRouterSupportMaintainInspectDialog"
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
          <el-button type="success" @click="handleRouterSupportSearch">{{
            t('views.element_plus_engineering.notify_management.refresh')
          }}</el-button>
          <div class="tooltip">
            {{
              t('views.element_plus_engineering.notify_management.router_support_read_only_hint')
            }}
          </div>
        </div>
      </template>
    </border-layout-panel>
    <maintain-dialog
      v-model:visible="routerSupportMaintainDialogVisible"
      mode="INSPECT"
      :item="routerSupportMaintainDialogItem"
      :close-on-click-modal="false"
    >
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.type')"
        prop="key_string_id"
      >
        <el-input v-model="routerSupportMaintainDialogItem.key_string_id" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.label')"
        prop="label"
      >
        <el-input v-model="routerSupportMaintainDialogItem.label" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.description')"
        prop="description"
      >
        <el-input v-model="routerSupportMaintainDialogItem.description" readonly />
      </el-form-item>
      <el-form-item
        :label="t('views.element_plus_engineering.notify_management.example_parameters')"
        prop="example_param"
      >
        <text-editor
          class="text-editor"
          v-model="routerSupportMaintainDialogItem.example_param"
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

import { type RouterSupport } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/routerSupport.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'RouterSupport',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region 加载标记

const loading = ref<number>(0)

// endregion

// region 搜索逻辑

function handleRouterSupportSearch(): void {
  handleRouterSupportAllSearch()
}

async function handleRouterSupportAllSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => all(pagingInfo),
      routerSupportTablePagingInfo.value,
    )
    updateRouterSupportTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleRouterSupportSearch()
})

// endregion

// region 路由器支持表格

const {
  currentPage: routerSupportTableCurrentPage,
  pageSize: routerSupportTablePageSize,
  itemCount: routerSupportTableItemCount,
  items: routerSupportTableItems,
  pagingInfo: routerSupportTablePagingInfo,
  updateByLookup: updateRouterSupportTableByLookup,
} = useIdentityBackendPagingTablePanel<RouterSupport>(15)

function handleRouterSupportTablePagingAttributeChanged(): void {
  handleRouterSupportSearch()
}

// endregion

// region 维护对话框

type RouterSupportMaintainDialogItem = {
  key_string_id: string
  label: string
  description: string
  example_param: string
}

const {
  visible: routerSupportMaintainDialogVisible,
  item: routerSupportMaintainDialogItem,
  showDialog: showRouterSupportMaintainDialog,
} = useInspectOnlyMaintainDialog<RouterSupport, RouterSupportMaintainDialogItem>(
  routerSupportMaintainDialogItemMap,
  {
    key_string_id: '',
    label: '',
    description: '',
    example_param: '',
  },
)

function routerSupportMaintainDialogItemMap(t: RouterSupport): RouterSupportMaintainDialogItem {
  return {
    key_string_id: t.key?.string_id ?? '',
    label: t.label ?? '',
    description: t.description ?? '',
    example_param: t.example_param ?? '',
  }
}

function handleShowRouterSupportMaintainInspectDialog(item: RouterSupport): void {
  showRouterSupportMaintainDialog(item)
}

// endregion
</script>

<style scoped>
.router-support-container {
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
