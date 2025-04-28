<template>
  <div class="permit-maintain-dialog-container">
    <el-dialog
      v-model="watchedVisible"
      id="dialog"
      append-to-body
      destroy-on-close
      title="权限管理"
      top="6vh"
      :close-on-click-modal="false"
    >
      <header-layout-panel class="dialog-container" v-loading="loading">
        <template v-slot:header>
          <div class="header-container">
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
                <el-button type="primary" :disabled="form.userId === ''" @click="handlePoacUpsert">
                  添加/更改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table-container"
            v-model:current-page="poacTableCurrentPage"
            v-model:page-size="poacTablePageSize"
            :item-count="poacTableItemCount"
            :page-sizes="[15, 20, 30, 50]"
            :items="poacTableItems"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="53"
            @onPagingAttributeChanged="handlePoacTablePagingAttributeChanged"
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
                @click="handlePoacDelete(row as DispPoac)"
              />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
      <template v-slot:footer>
        <div class="footer-container">
          <el-button @click="watchedVisible = false"> 关闭窗口</el-button>
        </div>
      </template>
    </el-dialog>
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
  type DispPoac,
  type PoacPermissionLevel,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/poac.ts'
import { childForAssetCatalogDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/poac.ts'
import { type DispAccount } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import {
  removePermission,
  upsertPermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import { lookupWithAdjustPage } from '@/util/lookup.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermitMaintainDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  assetCatalogId: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  assetCatalogId: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Store 引入-----------------------------------------------------------
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const form = ref<{
  userId: string
  permissionLevel: PoacPermissionLevel
}>({
  userId: '',
  permissionLevel: 1,
})
const formPermissionLevelIndicator = ref<
  { key: PoacPermissionLevel; label: string; selectable: boolean }[]
>([
  { key: 0, label: '所有者', selectable: false },
  { key: 1, label: '访客', selectable: true },
])

async function handlePoacUpsert(): Promise<void> {
  loading.value += 1
  try {
    if (!props.assetCatalogId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      upsertPermission({
        asset_catalog_key: { long_id: props.assetCatalogId },
        user_key: { string_id: form.value.userId },
        permission_level: form.value.permissionLevel,
      }),
    )
    handlePoacSearch()
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------资产目录权限查询-----------------------------------------------------------
watch(
  () => props.assetCatalogId,
  (value) => {
    if (!value) {
      return
    }
    handlePoacSearch()
  },
)

function handlePoacSearch(): void {
  if (!props.assetCatalogId) {
    return
  }
  handlePoacChildForAssetCatalogSearch()
}

async function handlePoacChildForAssetCatalogSearch(): Promise<void> {
  loading.value += 1
  try {
    if (!props.assetCatalogId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    const res = await lookupWithAdjustPage(
      (pagingInfo) => childForAssetCatalogDisp({ long_id: props.assetCatalogId }, pagingInfo),
      poacTablePagingInfo.value,
    )
    updatePoacTableByLookup(res)
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handlePoacSearch()
})

// -----------------------------------------------------------资产目录权限表格处理-----------------------------------------------------------
const {
  currentPage: poacTableCurrentPage,
  pageSize: poacTablePageSize,
  itemCount: poacTableItemCount,
  items: poacTableItems,
  pagingInfo: poacTablePagingInfo,
  updateByLookup: updatePoacTableByLookup,
} = useIdentityBackendPagingTablePanel<DispPoac>(15)

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function accountFormatter(row: DispPoac, column: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const account: DispAccount = (row as any)[column.property] as DispAccount
  return `${account.display_name}(${account.key.string_id})`
}

// 此处 any 是 element-plus API 规定的，故忽略警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function permissionLevelFormatter(row: DispPoac, column: any): string {
  for (let i = 0; i < formPermissionLevelIndicator.value.length; i += 1) {
    const indicator = formPermissionLevelIndicator.value[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (indicator.key === (row as any)[column.property]) {
      return indicator.label
    }
  }
  return '（未知）'
}

function handlePoacTablePagingAttributeChanged(): void {
  handlePoacSearch()
}

async function handlePoacDelete(row: DispPoac): Promise<void> {
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
    if (!props.assetCatalogId) {
      throw new Error('不应该执行到此处，请联系开发人员')
    }
    await resolveResponse(
      removePermission({
        asset_catalog_key: { long_id: props.assetCatalogId },
        user_key: { string_id: row.key.string_id },
      }),
    )
    ElMessage({
      showClose: true,
      message: '权限删除成功',
      type: 'success',
      center: true,
    })
    handlePoacSearch()
  } finally {
    loading.value -= 1
  }
}
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 68vh;
}

.header-container {
  width: 100%;
}

.header-form {
  display: flex;
}

/*noinspection CssUnusedSymbol*/
.header-form :deep(.el-form-item__content) {
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.header-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.header-form-item {
  display: flex;
}

.header-form-item:first-child {
  width: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.header-form-item:nth-child(2) :deep(.el-form-item__content) {
  width: 100px;
}

.header-form-item:last-child {
  margin-right: 0;
}

.table-container {
  width: 100%;
}

.table-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}
</style>
