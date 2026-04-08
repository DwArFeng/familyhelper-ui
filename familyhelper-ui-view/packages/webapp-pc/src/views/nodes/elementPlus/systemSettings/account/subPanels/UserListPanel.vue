<template>
  <div class="user-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowRegisterDialog">新建用户</el-button>
          <el-button type="success" @click="handleSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          v-loading="userTableLoading"
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
          @onPagingAttributeChanged="handleUserTablePagingAttributeChanged"
          @onCurrentChanged="handleUserTableCurrentChanged"
          @onItemDelete="handleUserDelete"
        >
          <el-table-column prop="key.string_id" label="账户ID" show-overflow-tooltip />
          <el-table-column prop="name" label="名称" show-overflow-tooltip />
          <el-table-column
            prop="enabled"
            label="启用"
            width="55px"
            :formatter="enabledFormatter"
            show-overflow-tooltip
          />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </table-panel>
      </template>
    </header-layout-panel>
    <account-register-dialog
      v-model:visible="accountRegisterDialogVisible"
      @onRegistered="handleAccountRegistered"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { onMounted, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlus/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlus/table/tablePanel/composables.ts'

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

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enabledFormatter(row: Account, column: any): string {
  return ((row as Record<string, unknown>)[column.property] as boolean) ? '是' : '否'
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
    try {
      await ElMessageBox.confirm(
        '您似乎在删除您自己。<br>' +
          '<div style="color: #b22222"><b>如果继续，您将会被注销，并且会永远失去该账号</b></div>' +
          '<b>您有将会失去此账号的全部数据，且无法恢复</b><br>' +
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
  } else {
    try {
      await ElMessageBox.confirm(
        `您似乎在删除 ${nameToDelete}(${accountIdToDelete})。<br>` +
          '<b>该账号的所有者将会失去此账号的全部数据，且无法恢复</b><br>' +
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
  }
  userTableLoading.value += 1
  try {
    await resolveResponse(removeAccount({ string_id: accountIdToDelete }))
    ElMessage({
      showClose: true,
      message: `账户 ${nameToDelete}(${accountIdToDelete}) 删除成功`,
      type: 'success',
    })
    if (accountIdToDelete === lnpStore.me) {
      ElMessage({
        showClose: true,
        message: '由于您删除了您自己，账号将会注销，请重新登录',
        type: 'warning',
      })
      await lnpStore.willFireKick().execute()
      return
    }
    handleSearch()
  } catch {
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
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}
</style>
