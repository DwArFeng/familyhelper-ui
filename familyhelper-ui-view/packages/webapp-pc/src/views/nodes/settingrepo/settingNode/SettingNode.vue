<template>
  <div class="setting-node-container">
    <border-layout-panel class="border-layout-panel" v-loading="loading" :header-visible="true">
      <template v-slot:header>
        <div class="header-container">
          <el-button class="insert-button" type="primary" @click="handleShowInitDialog">
            初始化节点
          </el-button>
          <el-button class="insert-button" type="success" @click="handleSettingNodeSearch">
            刷新数据
          </el-button>
          <el-divider direction="vertical" />
          <el-input
            class="id-search-bar"
            v-model="idSearchBarValue"
            clearable
            @keydown.enter="handleSettingNodeSearch"
            @clear="handleSettingNodeSearch"
          >
            <template v-slot:prepend>节点 ID</template>
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
            <el-table-column prop="key.string_id" label="配置节点" show-overflow-tooltip />
            <el-table-column
              prop="type"
              label="类型"
              width="110px"
              :formatter="settingNodeTableTypeFormatter"
            />
            <el-table-column
              prop="last_modified_date"
              label="最近更新日期"
              width="180px"
              show-overflow-tooltip
              :formatter="settingNodeTableTimestampFormatter"
            />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
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
                复制主键
              </li>
              <el-divider />
              <li
                @click="handleSettingNodeTableInspectContextmenuClicked(row as SettingNode, close)"
              >
                查看...
              </li>
              <li @click="handleSettingNodeTableEditContextmenuClicked(row as SettingNode, close)">
                编辑...
              </li>
              <li
                @click="handleSettingNodeTableDeleteContextmenuClicked(row as SettingNode, close)"
              >
                删除...
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

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'

import SettingNodeInitializeDialog from '@/views/nodes/settingrepo/settingNode/subDialogs/SettingNodeInitializeDialog.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

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

defineOptions({
  name: 'SettingNode',
})

// -----------------------------------------------------------Router 引入-----------------------------------------------------------
const router = vim.ctx().router().vueRouter()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const idSearchBarValue = ref<string>('')

function handleShowInitDialog(): void {
  initDialogVisible.value = true
}

// -----------------------------------------------------------配置节点搜索-----------------------------------------------------------
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

// -----------------------------------------------------------配置节点表格处理-----------------------------------------------------------
const SETTING_NODE_TYPE_SPACE: SettingNodeType[] = [0, 1, 2, 3]

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
      return '文本'
    case 1:
      return '长文本'
    case 2:
      return '图片'
    case 3:
      return '图片列表'
    default:
      return '（未知）'
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
    message: '复制成功',
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
      '此操作将永久删除此配置节点。<br>' +
        '<div style="color: #b22222"><b>如果您不知道删除该类型后会产生什么后果，' +
        '请不要进行操作！</b></div>' +
        '<b>错误的操作可能导致前端界面、后台出错，甚至崩溃！</b><br>' +
        '是否继续?',
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
  const settingNode: SettingNode = await resolveResponse(inspect(row.key))
  const invalidFlag: boolean = settingNode.category === null || !settingNode.args === null
  if (invalidFlag) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        ElMessageBox({
          title: '节点无效',
          message:
            `节点 ${row.key.string_id} 无效，无法在该页面中删除。<br>` +
            '请联系运维人员使用其它途径进行删除。',
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
      message: `节点 ${row.key.string_id} 删除成功`,
      type: 'success',
    })
    handleSettingNodeSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------初始化对话框-----------------------------------------------------------
const initDialogVisible = ref<boolean>(false)
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
