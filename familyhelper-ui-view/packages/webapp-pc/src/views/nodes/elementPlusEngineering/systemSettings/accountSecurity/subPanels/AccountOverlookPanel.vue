<template>
  <div class="account-overlook-panel-container">
    <placeholder-panel
      v-if="accountId === ''"
      :text="t('views.element_plus_engineering.system_settings.please_select_account')"
    />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleSearch">{{
              t('views.element_plus_engineering.system_settings.refresh_data')
            }}</el-button>
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
              <el-form-item
                :label="t('views.element_plus_engineering.system_settings.avatar')"
                style="width: 100%"
              >
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
              <el-form-item
                :label="t('views.element_plus_engineering.system_settings.name')"
                style="width: 33%"
              >
                {{ accountFormItem.name }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.system_settings.enabled')"
                style="width: 34%"
              >
                {{ formatBoolean(accountFormItem.enabled) }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.system_settings.remark')"
                style="width: 100%"
              >
                {{ accountFormItem.remark }}
              </el-form-item>
              <el-form-item
                :label="t('views.element_plus_engineering.system_settings.display_name')"
                style="width: 100%"
              >
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

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import AvatarPanel from '@/components/elementPlusEngineering/avatar/avatarPanel/AvatarPanel.vue'

import { inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'AccountOverlookPanel',
})

// region Props 定义

type Props = {
  accountId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion

// region 账户搜索

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

// endregion

// region 账户表单

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
  return value
    ? t('views.element_plus_engineering.system_settings.yes')
    : t('views.element_plus_engineering.system_settings.no')
}

// endregion
</script>

<style scoped>
.account-overlook-panel-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
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
.property-form :deep(.el-form-item__label) {
  width: 240px;
  color: #99a9bf;
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
