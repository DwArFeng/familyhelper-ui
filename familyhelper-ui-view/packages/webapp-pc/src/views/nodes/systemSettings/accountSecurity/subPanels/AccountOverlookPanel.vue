<template>
  <div class="account-overlook-panel-container">
    <div class="placeholder" v-if="accountId === ''">请选择账号</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <div style="flex-grow: 1" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <overlay-scrollbars-component class="scroll-bar">
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
              :model="accountFormItem"
            >
              <el-form-item label="头像" style="width: 100%">
                <avatar-panel
                  shape="square"
                  render-mode="BY_ID"
                  :size="180"
                  :object-user-id="accountId"
                  :placeholder-font-size="28"
                />
              </el-form-item>
              <el-form-item label="ID" style="width: 33%">
                {{ accountFormItem.string_id }}
              </el-form-item>
              <el-form-item label="名称" style="width: 33%">
                {{ accountFormItem.name }}
              </el-form-item>
              <el-form-item label="启用" style="width: 34%">
                {{ formatBoolean(accountFormItem.enabled) }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                {{ accountFormItem.remark }}
              </el-form-item>
              <el-form-item label="显示名称" style="width: 100%">
                {{ accountFormItem.display_name }}
              </el-form-item>
            </el-form>
          </overlay-scrollbars-component>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import AvatarPanel from '@/components/avatar/avatarPanel/AvatarPanel.vue'

import { inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'AccountOverlookPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  accountId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// -----------------------------------------------------------账户搜索-----------------------------------------------------------
async function handleSearch(): Promise<void> {
  if (props.accountId === '') {
    return
  }
  loading.value += 1
  try {
    const res = await resolveResponse(inspectDisp({ string_id: props.accountId }))
    accountFormItem.value.string_id = res.key.string_id
    accountFormItem.value.name = res.name
    accountFormItem.value.enabled = res.enabled
    accountFormItem.value.remark = res.remark
    accountFormItem.value.display_name = res.display_name
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.accountId,
  () => {
    handleSearch()
  },
)

onMounted(() => {
  handleSearch()
})

// -----------------------------------------------------------账户表单-----------------------------------------------------------
type AccountFormItem = {
  string_id: string
  name: string
  enabled: boolean
  remark: string
  display_name: string
}

const accountFormItem = ref<AccountFormItem>({
  string_id: '',
  name: '',
  enabled: false,
  remark: '',
  display_name: '',
})

function formatBoolean(value: boolean): string {
  return value ? '是' : '否'
}
</script>

<style scoped>
.account-overlook-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
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

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-form :deep(textarea) {
  padding: 0;
  border: none;
  font: unset;
  font-size: 14px;
  color: #303133;
}
</style>
