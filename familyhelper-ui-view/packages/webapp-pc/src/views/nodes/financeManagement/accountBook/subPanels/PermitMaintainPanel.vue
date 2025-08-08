<template>
  <div class="permit-maintain-panel-container">
    <header-layout-panel class="header-layout-panel" v-loading="loading">
      <template v-slot:header>
        <el-form class="header-form" :inline="true" :model="form">
          <el-form-item class="header-form-item" label="用户">
            <account-selector
              v-model="form.userId"
              :filter="(d) => d.key.string_id !== lnpStore.me"
            />
          </el-form-item>
          <el-form-item class="header-form-item" label="权限等级">
            <el-select v-model="form.permissionLevel" placeholder="权限等级">
              <el-option
                v-for="indicator in formPermissionLevelIndicator"
                :key="indicator.key"
                :label="indicator.label"
                :value="indicator.key"
                :disabled="!indicator.selectable"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="header-form-item">
            <el-button type="primary" :disabled="form.userId === ''" @click="handlePoabUpsert">
              添加/更改
            </el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-container"
          v-model:current-page="poabTableCurrentPage"
          v-model:page-size="poabTablePageSize"
          :item-count="poabTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="poabTableItems"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="53"
          @onPagingAttributeChanged="handlePoabTablePagingAttributeChanged"
        >
          <template v-slot:default>
            <el-table-column
              prop="account"
              label="用户"
              show-overflow-tooltip
              :formatter="accountFormatter"
            />
            <el-table-column
              prop="permission_level"
              label="权限等级"
              show-overflow-tooltip
              width="85px"
              :formatter="permissionLevelFormatter"
            />
          </template>
          <template v-slot:operateColumn="{ row }">
            <el-button
              class="table-button"
              type="danger"
              :icon="DeleteIcon"
              :disabled="row.account.key.string_id === lnpStore.me"
              @click="handlePoabDelete(row as DispPoab)"
            />
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref, watch } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { Delete as DeleteIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/table/tablePanel/TablePanel.vue'

import AccountSelector from '@/views/nodes/systemSettings/account/AccountSelector.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/table/tablePanel/composables.ts'

import {
  type DispPoab,
  type PoabPermissionLevel,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/poab.ts'
import { childForAccountBookDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/poab.ts'
import { type DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import {
  removePermission,
  upsertPermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/accountBook.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermitMaintainPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountBookId?: string
}

const props = withDefaults(defineProps<Props>(), {
  accountBookId: '',
})

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const form = ref<{
  userId: string
  permissionLevel: PoabPermissionLevel
}>({
  userId: '',
  permissionLevel: 1,
})
const formPermissionLevelIndicator = ref<
  { key: PoabPermissionLevel; label: string; selectable: boolean }[]
>([
  { key: 0, label: '所有者', selectable: false },
  { key: 1, label: '访客', selectable: true },
])

async function handlePoabUpsert(): Promise<void> {
  loading.value += 1
  try {
    if (!props.accountBookId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      upsertPermission({
        account_book_key: { long_id: props.accountBookId },
        user_key: { string_id: form.value.userId },
        permission_level: form.value.permissionLevel,
      }),
    )
    handlePoabSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------账本权限查询-----------------------------------------------------------
watch(
  () => props.accountBookId,
  (value) => {
    if (!value) {
      return
    }
    handlePoabSearch()
  },
)

function handlePoabSearch(): void {
  if (!props.accountBookId) {
    return
  }
  handlePoabChildForAccountBookSearch()
}

async function handlePoabChildForAccountBookSearch(): Promise<void> {
  loading.value += 1
  try {
    if (!props.accountBookId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForAccountBookDisp({ long_id: props.accountBookId }, pagingInfo),
      poabTablePagingInfo.value,
    )
    updatePoabTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handlePoabSearch()
})

// -----------------------------------------------------------账本权限表格处理-----------------------------------------------------------
const {
  currentPage: poabTableCurrentPage,
  pageSize: poabTablePageSize,
  itemCount: poabTableItemCount,
  items: poabTableItems,
  pagingInfo: poabTablePagingInfo,
  updateByLookup: updatePoabTableByLookup,
} = useIdentityBackendPagingTablePanel<DispPoab>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function accountFormatter(row: DispPoab, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const account: DispAccount = (row as any)[column.property] as DispAccount
  return `${account.display_name}(${account.key.string_id})`
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function permissionLevelFormatter(row: DispPoab, column: any): string {
  for (let i = 0; i < formPermissionLevelIndicator.value.length; i += 1) {
    const indicator = formPermissionLevelIndicator.value[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (indicator.key === (row as any)[column.property]) {
      return indicator.label
    }
  }
  return '（未知）'
}

function handlePoabTablePagingAttributeChanged(): void {
  handlePoabSearch()
}

async function handlePoabDelete(row: DispPoab): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `此操作将删除 ${row.account.display_name}(${row.account.key.string_id}) 对该账本的权限。<br>是否继续?`,
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
  loading.value += 1
  try {
    if (!props.accountBookId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      removePermission({
        account_book_key: { long_id: props.accountBookId },
        user_key: { string_id: row.key.string_id },
      }),
    )
    ElMessage({
      showClose: true,
      message: '权限删除成功',
      type: 'success',
    })
    handlePoabSearch()
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.permit-maintain-panel-container {
  height: 100%;
  width: 100%;
}

.header-form {
  display: flex;
}

.header-form-item {
  display: flex;
}

/*noinspection CssUnusedSymbol*/
.header-form :deep(.el-form-item__content) {
  flex-grow: 1;
}

.header-form-item:first-child {
  width: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.header-form-item:nth-child(2) :deep(.el-form-item__content) {
  width: 100px;
}

.header-form-item {
  margin-bottom: 0;
}

.header-form-item:last-child {
  margin-right: 0;
}

.table-container {
  width: 100%;
  height: 100%;
}

.table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
