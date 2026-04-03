<template>
  <div class="navigation-list-panel-container">
    <loading-overlay :loading="listLoading > 0" />
    <header-layout-panel class="panel">
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowCreateDialog">创建</native-button>
          <native-button kind="success" @click="handleLoadList">刷新</native-button>
        </div>
      </template>
      <template v-slot:default>
        <paging-table-panel
          v-model:current-page="tableCurrentPage"
          v-model:page-size="tablePageSize"
          :item-count="tableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="tableItems"
          :highlight-current-row="true"
          :inspect-button-visible="false"
          :edit-button-visible="true"
          :delete-button-visible="true"
          :operate-column-width="106"
          :row-key="listRowKey"
          @on-paging-attribute-changed="handleTablePagingAttributeChanged"
          @on-current-changed="handleTableCurrentChanged"
          @on-item-edit="handleTableItemEdit"
          @on-item-delete="handleRowDelete"
        >
          <paging-table-column label="键" prop="key" :min-width="160" />
          <paging-table-column label="名称" prop="name" :min-width="120" />
          <paging-table-column label="备注" prop="remark" :min-width="140" />
        </paging-table-panel>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="listCreateMaintainVisible"
      label-width="80px"
      create-title="创建导航项"
      :loading="listMaintainLoading > 0"
      :mode="listCreateMaintainMode"
      :item="listCreateMaintainItem"
      :close-on-click-modal="false"
      @on-item-create="handleListMaintainCreate"
    >
      <native-form-item label="键" prop="key">
        <input
          v-model="listCreateMaintainItem.key"
          class="dialog-input"
          type="text"
          placeholder="必填，唯一"
        />
      </native-form-item>
      <native-form-item label="名称" prop="name">
        <input
          v-model="listCreateMaintainItem.name"
          class="dialog-input"
          type="text"
          placeholder="必填"
        />
      </native-form-item>
      <native-form-item label="备注" prop="remark">
        <input v-model="listCreateMaintainItem.remark" class="dialog-input" type="text" />
      </native-form-item>
    </maintain-dialog>
    <maintain-dialog
      v-model:visible="listEditMaintainVisible"
      label-width="80px"
      edit-title="编辑导航项"
      :loading="listMaintainLoading > 0"
      :mode="listEditMaintainMode"
      :item="listEditMaintainItem"
      :close-on-click-modal="false"
      @on-item-edit="handleListMaintainEdit"
    >
      <native-form-item label="键" prop="key">
        <input
          v-model="listEditMaintainItem.key"
          class="dialog-input"
          type="text"
          placeholder="必填，唯一"
          readonly
        />
      </native-form-item>
      <native-form-item label="名称" prop="name">
        <input
          v-model="listEditMaintainItem.name"
          class="dialog-input"
          type="text"
          placeholder="必填"
        />
      </native-form-item>
      <native-form-item label="备注" prop="remark">
        <input v-model="listEditMaintainItem.remark" class="dialog-input" type="text" />
      </native-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeFormItem from '@/components/comvisual/form/nativeForm/NativeFormItem.vue'
import MaintainDialog from '@/components/comvisual/dialog/maintainDialog/MaintainDialog.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import {
  useCreateOnlyMaintainDialog,
  useEditOnlyMaintainDialog,
} from '@/components/comvisual/dialog/maintainDialog/composables.ts'
import { useIdentityFrontendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  operateInspect as textOperateInspect,
  operatePut as textOperatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import {
  operateInspect as settingNodeOperateInspect,
  operateRemove as settingNodeOperateRemove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { resolveResponse } from '@/util/response.ts'

import {
  SETTINGREPO_ARGS_LIST,
  SETTINGREPO_CATEGORY,
  type CustomNavigation,
  parseCustomNavigations,
  stringifyNavigationListRows,
} from '../customNavigation.ts'

defineOptions({
  name: 'CustomNavigationPanel',
})

// region 事件类型

type Emits = {
  (e: 'on-current-changed', row: CustomNavigation | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region 列表维护项类型与对话框

type ListMaintainItem = {
  key: string
  name: string
  remark: string
}

const INITIAL_LIST_MAINTAIN: ListMaintainItem = {
  key: '',
  name: '',
  remark: '',
}

function listMaintainMap(row: CustomNavigation): ListMaintainItem {
  return {
    key: row.key,
    name: row.name,
    remark: row.remark,
  }
}

const {
  visible: listCreateMaintainVisible,
  item: listCreateMaintainItem,
  mode: listCreateMaintainMode,
  showDialog: showListCreateMaintainDialog,
} = useCreateOnlyMaintainDialog<ListMaintainItem>({ ...INITIAL_LIST_MAINTAIN })

const {
  visible: listEditMaintainVisible,
  item: listEditMaintainItem,
  mode: listEditMaintainMode,
  showDialog: showListEditMaintainDialog,
} = useEditOnlyMaintainDialog<CustomNavigation, ListMaintainItem>(listMaintainMap, {
  ...INITIAL_LIST_MAINTAIN,
})

const listMaintainLoading = ref(0)

// endregion

// region 加载与数据

const listLoading = ref(0)

const allRows = ref<CustomNavigation[]>([])

// endregion

// region 分页表格

const {
  currentPage: tableCurrentPage,
  pageSize: tablePageSize,
  itemCount: tableItemCount,
  items: tableItems,
  updateByLookup: updateTableByLookup,
  refreshPaging: tableRefreshPaging,
} = useIdentityFrontendPagingTablePanel<CustomNavigation>(15)

function listRowKey(row: CustomNavigation): string {
  return row.key
}

function handleTablePagingAttributeChanged(): void {
  tableRefreshPaging()
}

function handleTableCurrentChanged(current: CustomNavigation | null): void {
  emit('on-current-changed', current)
}

// endregion

// region 列表加载与持久化

async function handleLoadList(): Promise<void> {
  listLoading.value += 1
  try {
    const res = await resolveResponse(
      textOperateInspect({
        category: SETTINGREPO_CATEGORY,
        args: [...SETTINGREPO_ARGS_LIST],
      }),
    )
    const text = res?.value ?? ''
    const rows = parseCustomNavigations(text)
    allRows.value = rows
    updateTableByLookup(rows)
  } finally {
    listLoading.value -= 1
  }
}

async function persistAllRows(rows: CustomNavigation[]): Promise<void> {
  await resolveResponse(
    textOperatePut({
      category: SETTINGREPO_CATEGORY,
      args: [...SETTINGREPO_ARGS_LIST],
      value: stringifyNavigationListRows(rows),
    }),
  )
}

// endregion

// region 维护与删除操作

function handleShowCreateDialog(): void {
  listCreateMaintainItem.value = { ...INITIAL_LIST_MAINTAIN }
  showListCreateMaintainDialog()
}

function handleTableItemEdit(row: CustomNavigation): void {
  showListEditMaintainDialog(row)
}

async function handleListMaintainCreate(item: ListMaintainItem): Promise<void> {
  const key = item.key.trim()
  const name = item.name.trim()
  if (key === '' || name === '') {
    notifyWarning('键和名称不能为空')
    return
  }
  if (allRows.value.some((r) => r.key === key)) {
    notifyWarning('键已存在')
    return
  }
  listMaintainLoading.value += 1
  try {
    const next = [...allRows.value, { key, name, remark: item.remark.trim() }]
    await persistAllRows(next)
    allRows.value = next
    updateTableByLookup(next)
    listCreateMaintainVisible.value = false
    notifySuccess(`导航项 ${key} 创建成功`)
  } finally {
    listMaintainLoading.value -= 1
  }
}

async function handleListMaintainEdit(item: ListMaintainItem): Promise<void> {
  const name = item.name.trim()
  if (name === '') {
    notifyWarning('名称不能为空')
    return
  }
  listMaintainLoading.value += 1
  try {
    const next = allRows.value.map((r) =>
      r.key === item.key ? { key: r.key, name, remark: item.remark.trim() } : r,
    )
    await persistAllRows(next)
    allRows.value = next
    updateTableByLookup(next)
    listEditMaintainVisible.value = false
    notifySuccess(`导航项 ${item.key} 更新成功`)
  } finally {
    listMaintainLoading.value -= 1
  }
}

async function handleRowDelete(row: CustomNavigation): Promise<void> {
  if (
    !window.confirm(
      '此操作将从列表中永久移除该导航项，并立即写回服务端。\n' +
        '若仓库中仍存在该键对应的 setting 导航节点，将一并删除。\n' +
        '如果您不知道移除后会产生什么后果，请不要进行操作！\n' +
        '错误的操作可能导致前端导航配置异常。\n' +
        '是否继续?',
    )
  ) {
    return
  }
  listLoading.value += 1
  try {
    const settingPresent = await resolveResponse(
      settingNodeOperateInspect({
        category: SETTINGREPO_CATEGORY,
        args: ['custom', row.key],
      }),
    )
    if (settingPresent !== null) {
      await resolveResponse(
        settingNodeOperateRemove({
          category: SETTINGREPO_CATEGORY,
          args: ['custom', row.key],
        }),
      )
    }
    const next = allRows.value.filter((r) => r.key !== row.key)
    await persistAllRows(next)
    allRows.value = next
    updateTableByLookup(next)
    emit('on-current-changed', null)
    notifySuccess(`导航项 ${row.key} 删除成功`)
  } finally {
    listLoading.value -= 1
  }
}

// endregion

// region 生命周期与 expose

onMounted(() => {
  handleLoadList()
})

defineExpose({
  refresh: handleLoadList,
})

// endregion
</script>

<style scoped>
.navigation-list-panel-container {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 0;
}

.panel {
  height: 100%;
}

.header-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.dialog-input {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
