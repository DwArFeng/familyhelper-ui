<template>
  <div class="user-list-panel-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowRegisterDialog">{{
            t('views.element_plus_engineering.system_settings.create_user')
          }}</el-button>
          <el-button type="success" @click="handleSearch">{{
            t('views.element_plus_engineering.system_settings.refresh_data')
          }}</el-button>
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
          <el-table-column
            prop="key.string_id"
            :label="t('views.element_plus_engineering.system_settings.account_id')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="name"
            :label="t('views.element_plus_engineering.system_settings.name')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="enabled"
            :label="t('views.element_plus_engineering.system_settings.enabled')"
            width="55px"
            :formatter="enabledFormatter"
            show-overflow-tooltip
          />
          <el-table-column
            prop="remark"
            :label="t('views.element_plus_engineering.system_settings.remark')"
            show-overflow-tooltip
          />
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

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TablePanel from '@/components/elementPlusEngineering/table/tablePanel/TablePanel.vue'

import { useIdentityBackendPagingTablePanel } from '@/components/elementPlusEngineering/table/tablePanel/composables.ts'

import { type Account } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import {
  all as allAccount,
  remove as removeAccount,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

import AccountRegisterDialog from '../subDialogs/AccountRegisterDialog.vue'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'UserListPanel',
})

// region Emits 定义

type Emits = {
  (e: 'onCurrentChanged', current: Account | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

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
  return ((row as Record<string, unknown>)[column.property] as boolean)
    ? t('views.element_plus_engineering.system_settings.yes')
    : t('views.element_plus_engineering.system_settings.no')
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
        t('views.element_plus_engineering.system_settings.deleting_self_warning') +
          t('views.element_plus_engineering.system_settings.logout_and_lose_account_warning') +
          t(
            'views.element_plus_engineering.system_settings.current_user_account_data_loss_warning',
          ) +
          t('views.element_plus_engineering.system_settings.continue_confirmation'),
        t('views.element_plus_engineering.system_settings.prompt'),
        {
          confirmButtonText: t('views.element_plus_engineering.system_settings.confirm'),
          cancelButtonText: t('views.element_plus_engineering.system_settings.cancel'),
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
        t('views.element_plus_engineering.system_settings.deleting_account_warning', {
          displayName: nameToDelete,
          accountId: accountIdToDelete,
        }) +
          t('views.element_plus_engineering.system_settings.account_owner_data_loss_warning') +
          t('views.element_plus_engineering.system_settings.continue_confirmation'),
        t('views.element_plus_engineering.system_settings.prompt'),
        {
          confirmButtonText: t('views.element_plus_engineering.system_settings.confirm'),
          cancelButtonText: t('views.element_plus_engineering.system_settings.cancel'),
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
      message: t('views.element_plus_engineering.system_settings.account_deleted', {
        displayName: nameToDelete,
        accountId: accountIdToDelete,
      }),
      type: 'success',
    })
    if (accountIdToDelete === lnpStore.me) {
      ElMessage({
        showClose: true,
        message: t('views.element_plus_engineering.system_settings.logout_after_deleting_self'),
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
