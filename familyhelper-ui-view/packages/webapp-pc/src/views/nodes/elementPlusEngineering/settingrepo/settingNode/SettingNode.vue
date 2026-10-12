<template>
  <div class="setting-node-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button class="insert-button" type="primary" @click="handleShowInitDialog">
            {{ t('views.element_plus_engineering.settingrepo.initialize_node') }}
          </el-button>
          <el-button class="insert-button" type="success" @click="handleSettingNodeSearch">
            {{ t('views.element_plus_engineering.settingrepo.refresh_data') }}
          </el-button>
          <el-divider direction="vertical" />
          <el-input
            class="id-search-bar"
            v-model="idSearchBarValue"
            clearable
            @keydown.enter="handleSettingNodeSearch"
            @clear="handleSettingNodeSearch"
          >
            <template v-slot:prepend>{{
              t('views.element_plus_engineering.settingrepo.node_id')
            }}</template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handleSettingNodeSearch" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          v-model:current-page="settingNodeTableCurrentPage"
          v-model:page-size="settingNodeTablePageSize"
          :item-count="settingNodeTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="settingNodeTableItems"
          :show-contextmenu="true"
          :contextmenu-width="100"
          @onPagingAttributeChanged="handleSettingNodeTablePagingAttributeChanged"
        >
          <template v-slot:default>
            <el-table-column
              prop="key.string_id"
              :label="t('views.element_plus_engineering.settingrepo.setting_node')"
              show-overflow-tooltip
            />
            <el-table-column
              prop="type"
              :label="t('views.element_plus_engineering.settingrepo.type')"
              width="110px"
              :formatter="settingNodeTableTypeFormatter"
            />
            <el-table-column
              prop="last_modified_date"
              :label="t('views.element_plus_engineering.settingrepo.latest_update_time')"
              width="180px"
              show-overflow-tooltip
              :formatter="settingNodeTableTimestampFormatter"
            />
            <el-table-column
              prop="remark"
              :label="t('views.element_plus_engineering.settingrepo.remark')"
              show-overflow-tooltip
            />
          </template>
          <template v-slot:operateColumn="{ row }">
            <el-button-group class="operate-column">
              <el-button
                class="table-button"
                type="success"
                :icon="SearchIcon"
                :disabled="!settingNodeTableRowInspectEnabled(row as SettingNode)"
                @click="handleSettingNodeTableInspectButtonClicked(row as SettingNode)"
              />
              <el-button
                class="table-button"
                type="primary"
                :icon="EditPen"
                :disabled="!settingNodeTableRowEditEnabled(row as SettingNode)"
                @click="handleSettingNodeTableEditButtonClicked(row as SettingNode)"
              />
              <el-button
                class="table-button"
                type="danger"
                :icon="DeleteIcon"
                @click="handleSettingNodeTableDeleteButtonClicked(row as SettingNode)"
              />
            </el-button-group>
          </template>
          <template v-slot:contextmenu="{ row, close }">
            <ul>
              <li
                @click="handleSettingNodeTableCopyKeyContextmenuClicked(row as SettingNode, close)"
              >
                {{ t('views.element_plus_engineering.settingrepo.copy_primary_key') }}
              </li>
              <el-divider />
              <li
                @click="handleSettingNodeTableInspectContextmenuClicked(row as SettingNode, close)"
              >
                {{ t('views.element_plus_engineering.settingrepo.inspect_ellipsis') }}
              </li>
              <li @click="handleSettingNodeTableEditContextmenuClicked(row as SettingNode, close)">
                {{ t('views.element_plus_engineering.settingrepo.edit_ellipsis') }}
              </li>
              <li
                @click="handleSettingNodeTableDeleteContextmenuClicked(row as SettingNode, close)"
              >
                {{ t('views.element_plus_engineering.settingrepo.delete_ellipsis') }}
              </li>
            </ul>
          </template>
        </table-panel>
      </template>
    </border-layout-panel>
    <setting-node-initialize-dialog
      v-model:visible="initDialogVisible"
      @on-setting-node-initialized="handleSettingNodeSearch"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Search as SearchIcon, EditPen, Delete as DeleteIcon } from '@element-plus/icons-vue'

import BorderLayoutPanel from '@/components/elementPlusEngineering/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import SettingNodeInitializeDialog from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subDialogs/SettingNodeInitializeDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import {
  type SettingNode,
  type SettingNodeType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import {
  idLikeReachable,
  reachable,
  inspect,
  operateRemove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SettingNode',
})

// region I18n 引入

const { t } = useI18n()

// endregion
// region Router 引入

const router = vim.ctx().router().vueRouter()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

const idSearchBarValue = ref<string>('')

function handleShowInitDialog(): void {
  initDialogVisible.value = true
}

// endregion

// region 配置节点搜索

function handleSettingNodeSearch(): void {
  if (idSearchBarValue.value !== '') {
    handleSettingNodeIdLikeReachableSearch()
  } else {
    handleSettingNodeAllReachableSearch()
  }
}

async function handleSettingNodeIdLikeReachableSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => idLikeReachable(idSearchBarValue.value, pagingInfo),
      settingNodeTablePagingInfo.value,
    )
    updateSettingNodeTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

async function handleSettingNodeAllReachableSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => reachable(pagingInfo),
      settingNodeTablePagingInfo.value,
    )
    updateSettingNodeTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleSettingNodeSearch()
})

// endregion

// region 配置节点表格处理

const SETTING_NODE_TYPE_SPACE: SettingNodeType[] = [0, 1, 2, 3, 4, 5, 6, 7]

const {
  currentPage: settingNodeTableCurrentPage,
  pageSize: settingNodeTablePageSize,
  itemCount: settingNodeTableItemCount,
  items: settingNodeTableItems,
  pagingInfo: settingNodeTablePagingInfo,
  updateByLookup: updateSettingNodeTableByLookup,
} = useIdentityBackendPagingTablePanel<SettingNode>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function settingNodeTableTypeFormatter(row: SettingNode, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: SettingNodeType | number = (row as any)[column.property] as SettingNodeType | number
  switch (value) {
    case 0:
      return t('views.element_plus_engineering.settingrepo.text_node_type')
    case 1:
      return t('views.element_plus_engineering.settingrepo.long_text_node_type')
    case 2:
      return t('views.element_plus_engineering.settingrepo.image_node_type')
    case 3:
      return t('views.element_plus_engineering.settingrepo.image_list_node_type')
    case 4:
      return t('views.element_plus_engineering.settingrepo.i18n_node_type')
    case 5:
      return t('views.element_plus_engineering.settingrepo.file_node_type')
    case 6:
      return t('views.element_plus_engineering.settingrepo.file_list_node_type')
    case 7:
      return t('views.element_plus_engineering.settingrepo.navigation_node_type')
    default:
      return t('views.element_plus_engineering.settingrepo.unknown_parenthesized')
  }
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function settingNodeTableTimestampFormatter(row: SettingNode, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return formatTimestamp((row as any)[column.property] as number)
}

function handleSettingNodeTablePagingAttributeChanged(): void {
  handleSettingNodeSearch()
}

function settingNodeTableRowInspectEnabled(row: SettingNode): boolean {
  return SETTING_NODE_TYPE_SPACE.some((type) => type === row.type)
}

function settingNodeTableRowEditEnabled(row: SettingNode): boolean {
  return SETTING_NODE_TYPE_SPACE.some((type) => type === row.type)
}

async function handleSettingNodeTableCopyKeyContextmenuClicked(
  row: SettingNode,
  close: () => void,
): Promise<void> {
  close()
  await navigator.clipboard.writeText(row.key.string_id)
  ElMessage({
    showClose: true,
    message: t('views.element_plus_engineering.settingrepo.copy_succeeded'),
    type: 'success',
  })
}

function handleSettingNodeTableInspectButtonClicked(row: SettingNode): void {
  handleForwardToEditor(row, 'inspect')
}

function handleSettingNodeTableInspectContextmenuClicked(
  row: SettingNode,
  close: () => void,
): void {
  close()
  handleForwardToEditor(row, 'inspect')
}

function handleSettingNodeTableEditButtonClicked(row: SettingNode): void {
  handleForwardToEditor(row, 'edit')
}

function handleSettingNodeTableEditContextmenuClicked(row: SettingNode, close: () => void): void {
  close()
  handleForwardToEditor(row, 'edit')
}

function handleForwardToEditor(row: SettingNode, action: 'inspect' | 'edit'): void {
  router.push({
    name: 'settingrepo.settingNodeEditor',
    query: {
      id: row.key.string_id,
      action,
    },
  })
}

function handleSettingNodeTableDeleteButtonClicked(row: SettingNode): void {
  handleSettingNodeDelete(row)
}

function handleSettingNodeTableDeleteContextmenuClicked(row: SettingNode, close: () => void): void {
  close()
  handleSettingNodeDelete(row)
}

async function handleSettingNodeDelete(row: SettingNode): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('views.element_plus_engineering.settingrepo.delete_setting_node_confirmation_prefix') +
        t(
          'views.element_plus_engineering.settingrepo.unknown_deletion_consequence_warning_prefix',
        ) +
        t('views.element_plus_engineering.settingrepo.do_not_operate_warning_suffix') +
        t('views.element_plus_engineering.settingrepo.dangerous_operation_crash_warning') +
        t('views.element_plus_engineering.settingrepo.continue_confirmation'),
      t('views.element_plus_engineering.settingrepo.prompt'),
      {
        confirmButtonText: t('views.element_plus_engineering.settingrepo.confirm'),
        cancelButtonText: t('views.element_plus_engineering.settingrepo.cancel'),
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  const settingNode: SettingNode = await resolveResponse(inspect(row.key))
  const invalidFlag: boolean = settingNode.category === null || !settingNode.args === null
  if (invalidFlag) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        ElMessageBox({
          title: t('views.element_plus_engineering.settingrepo.invalid_node'),
          message:
            t('views.element_plus_engineering.settingrepo.setting_node_invalid_delete_hint', {
              nodeId: row.key.string_id,
            }) + t('views.element_plus_engineering.settingrepo.contact_operations_for_deletion'),
          dangerouslyUseHTMLString: true,
          type: 'error',
        }).finally(() => {
          resolve()
        })
      }, 300)
    })
    return
  }
  loading.value += 1
  try {
    await resolveResponse(
      operateRemove({
        category: settingNode.category,
        args: settingNode.args,
      }),
    )
    ElMessage({
      showClose: true,
      message: t('views.element_plus_engineering.settingrepo.setting_node_deleted', {
        nodeId: row.key.string_id,
      }),
      type: 'success',
    })
    handleSettingNodeSearch()
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 初始化对话框

const initDialogVisible = ref<boolean>(false)

// endregion
</script>

<style scoped>
.setting-node-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .id-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.table .table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

/*noinspection CssUnusedSymbol*/
.table :deep(.contextmenu .el-divider--horizontal) {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
