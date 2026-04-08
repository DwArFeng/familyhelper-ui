<template>
  <div class="user-list-panel-container">
    <loading-overlay :loading="userTableLoading > 0" />
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <native-button kind="primary" @click="handleShowRegisterDialog">新建用户</native-button>
          <native-button kind="success" @click="handleSearch">刷新数据</native-button>
        </div>
      </template>
      <template v-slot:default>
        <paging-table-panel
          v-model:current-page="userTableCurrentPage"
          v-model:page-size="userTablePageSize"
          :item-count="userTableItemCount"
          :page-sizes="[15, 20, 30, 50]"
          :items="userTableItems"
          :highlight-current-row="true"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="true"
          :operate-column-width="53"
          :row-key="accountRowKey"
          @on-paging-attribute-changed="handleUserTablePagingAttributeChanged"
          @on-current-changed="handleUserTableCurrentChanged"
          @on-item-delete="handleUserDelete"
        >
          <paging-table-column label="账户ID" prop="key.string_id" :min-width="140" />
          <paging-table-column label="名称" prop="name" :min-width="120" />
          <paging-table-column label="启用" :min-width="72">
            <template v-slot:default="{ row }">
              {{ row.enabled ? '是' : '否' }}
            </template>
          </paging-table-column>
          <paging-table-column label="备注" prop="remark" :min-width="120" />
        </paging-table-panel>
      </template>
    </header-layout-panel>
    <account-register-dialog
      v-model:visible="accountRegisterDialogVisible"
      @on-registered="handleAccountRegistered"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref } from 'vue'

import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import PagingTableColumn from '@/components/comvisual/table/pagingTablePanel/PagingTableColumn.vue'
import PagingTablePanel from '@/components/comvisual/table/pagingTablePanel/PagingTablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/comvisual/table/pagingTablePanel/composables.ts'

import { notifySuccess, notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import { type Account } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import {
  all as allAccount,
  remove as removeAccount,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import AccountRegisterDialog from '../subDialogs/AccountRegisterDialog.vue'

defineOptions({
  name: 'UserListPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: Account | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region Store 引入

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// endregion

// region 用户搜索

function handleSearch(): void {
  handleAllSearch()
}

async function handleAllSearch(): Promise<void> {
  userTableLoading.value += 1
  try {
    const res = await lookupWithAdjustPage(
      (pagingInfo) => allAccount(pagingInfo),
      userTablePagingInfo.value,
    )
    updateUserTableByLookup(res)
  } finally {
    userTableLoading.value -= 1
  }
}

onMounted(() => {
  handleSearch()
})

// endregion

// region 用户表格

const {
  currentPage: userTableCurrentPage,
  pageSize: userTablePageSize,
  itemCount: userTableItemCount,
  items: userTableItems,
  pagingInfo: userTablePagingInfo,
  updateByLookup: updateUserTableByLookup,
} = useIdentityBackendPagingTablePanel<Account>(15)
const userTableLoading = ref<number>(0)

function accountRowKey(row: Account): string {
  return row.key.string_id
}

function handleUserTablePagingAttributeChanged(): void {
  handleSearch()
}

function handleUserTableCurrentChanged(current: Account | null): void {
  emit('onCurrentChanged', current)
}

// endregion

// region 用户列表查询

const accountRegisterDialogVisible = ref<boolean>(false)

function handleShowRegisterDialog(): void {
  accountRegisterDialogVisible.value = true
}

function handleAccountRegistered(): void {
  handleSearch()
}

async function handleUserDelete(account: Account): Promise<void> {
  const accountIdToDelete: string = account.key.string_id
  const nameToDelete: string = account.name
  if (accountIdToDelete === lnpStore.me) {
    const ok = window.confirm(
      '您似乎在删除您自己。如果继续，您将会被注销，并且会永远失去该账号；您将失去此账号的全部数据，且无法恢复。是否继续？',
    )
    if (!ok) {
      return
    }
  } else {
    const ok = window.confirm(
      `您似乎在删除 ${nameToDelete}(${accountIdToDelete})。该账号的所有者将会失去此账号的全部数据，且无法恢复。是否继续？`,
    )
    if (!ok) {
      return
    }
  }
  userTableLoading.value += 1
  try {
    await resolveResponse(removeAccount({ string_id: accountIdToDelete }))
    notifySuccess(`账户 ${nameToDelete}(${accountIdToDelete}) 删除成功`)
    if (accountIdToDelete === lnpStore.me) {
      notifyWarning('由于您删除了您自己，账号将会注销，请重新登录')
      await lnpStore.willFireKick().execute()
      return
    }
    handleSearch()
  } catch {
    /* 忽略 */
  } finally {
    userTableLoading.value -= 1
  }
}

// endregion

// region Expose

defineExpose({
  refresh: handleSearch,
})

// endregion
</script>

<style scoped>
.user-list-panel-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
