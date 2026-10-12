<template>
  <el-dialog
    class="permission-scope-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    destroy-on-close
    :title="t('views.element_plus_engineering.system_settings.select_permission_scope')"
    top="8vh"
    width="80%"
    :close-on-click-modal="false"
    @open="handleOpen"
    @closed="handleClosed"
    @keydown="handleHotKeyDown"
  >
    <header-layout-panel class="body-wrapper">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handlePermissionScopeSearch">{{
            t('views.element_plus_engineering.system_settings.refresh_data')
          }}</el-button>
          <el-divider direction="vertical" />
          <el-input
            class="name-search-bar"
            v-model="nameSearchBarValue"
            clearable
            @keydown.enter="handlePermissionScopeSearch"
            @clear="handlePermissionScopeSearch"
          >
            <template v-slot:prepend>
              <span>{{ t('views.element_plus_engineering.system_settings.name') }}</span>
            </template>
            <template v-slot:append>
              <el-button :icon="SearchIcon" @click="handlePermissionScopeSearch" />
            </template>
          </el-input>
        </div>
      </template>
      <template v-slot:default>
        <div class="body-container">
          <card-panel
            class="card-list-container"
            v-loading="permissionScopeCardLoading"
            title-field="name"
            card-width="calc(20% - 18px)"
            select-mode="SINGLE"
            :items="permissionScopeCardItems"
            :max-card="permissionScopeCardMaxCard"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :add-button-visible="false"
            :show-contextmenu="false"
            @onSelectionChanged="handlePermissionScopeCardSelectionChanged"
          >
            <template v-slot:default="{ item }">
              <corner-light-panel
                class="permission-scope-card-container-wrapper"
                light-bevel-edge="40px"
                light-color="#E6A23C"
              >
                <div class="permission-scope-card-container">
                  <div class="permission-scope-property">
                    <span class="iconfont permission-scope-property-icon" style="color: black">
                      &#xfffa;
                    </span>
                    <span class="permission-scope-property-text">
                      {{ t('views.element_plus_engineering.system_settings.identifier') }}:
                      {{ (item as PermissionScopeCardItem).key_string_id }}
                    </span>
                  </div>
                  <div class="permission-scope-property">
                    <span class="iconfont permission-scope-property-icon" style="color: black">
                      &#xfffb;
                    </span>
                    <span class="permission-scope-property-text">
                      {{ t('views.element_plus_engineering.system_settings.remark') }}:
                      {{
                        (item as PermissionScopeCardItem).remark ||
                        t('views.element_plus_engineering.system_settings.none_parenthesized')
                      }}
                    </span>
                  </div>
                </div>
              </corner-light-panel>
            </template>
          </card-panel>
          <el-checkbox v-model="setToDefaultCheckboxValue">{{
            t('views.element_plus_engineering.system_settings.set_as_default')
          }}</el-checkbox>
        </div>
      </template>
    </header-layout-panel>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button
          type="primary"
          :disabled="confirmButtonDisabled"
          @click="handleConfirmButtonClicked"
        >
          {{ t('views.element_plus_engineering.system_settings.confirm') }}
        </el-button>
        <el-button @click="handleCancelButtonClicked">
          {{ t('views.element_plus_engineering.system_settings.cancel') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { Search as SearchIcon } from '@element-plus/icons-vue'

import HeaderLayoutPanel from '@/components/elementPlusEngineering/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import CardPanel from '@/components/elementPlusEngineering/card/cardPanel/CardPanel.vue'
import CornerLightPanel from '@/components/comvisual/layout/cornerLightPanel/CornerLightPanel.vue'

import { useGeneralCardPanel } from '@/components/elementPlusEngineering/card/cardPanel/composables.ts'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { all, nameLike } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'PermissionScopeSelectDialog',
})

// region Props 定义

type Props = {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', scope: Scope, setToDefault: boolean): void
}

const emit = defineEmits<Emits>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region 可见性处理

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

// endregion

// region 显示处理

function handleOpen(): void {
  permissionScopeSelection.value = []
  setToDefaultCheckboxValue.value = false
  handlePermissionScopeSearch()
}

function handleClosed(): void {
  permissionScopeSelection.value = []
}

// endregion

// region 头部面板

const nameSearchBarValue = ref<string>('')

// endregion

// region 权限作用域查询

function handlePermissionScopeSearch(): void {
  handlePermissionScopeSearchInternal()
}

async function handlePermissionScopeSearchInternal(): Promise<void> {
  permissionScopeCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => {
      if (nameSearchBarValue.value) {
        return nameLike(nameSearchBarValue.value, pagingInfo)
      }
      return all(pagingInfo)
    })
    updatePermissionScopeCardByLookup(res)
  } finally {
    permissionScopeCardLoading.value -= 1
  }
}

onMounted(() => {
  handlePermissionScopeSearch()
})

// endregion

// region 权限作用域卡片

type PermissionScopeCardItem = {
  name: string
  key_string_id: string
  remark: string
  scope: Scope
}

const { items: permissionScopeCardItems, updateByLookup: updatePermissionScopeCardByLookup } =
  useGeneralCardPanel<Scope, PermissionScopeCardItem>(permissionScopeCardItemMap)
const permissionScopeCardLoading = ref<number>(0)
const permissionScopeCardMaxCard = ref<number>(1000)
const permissionScopeSelection = ref<PermissionScopeCardItem[]>([])

function permissionScopeCardItemMap(t: Scope): PermissionScopeCardItem {
  return {
    name: t.name,
    key_string_id: t.key.string_id,
    remark: t.remark,
    scope: t,
  }
}

function handlePermissionScopeCardSelectionChanged(selection: PermissionScopeCardItem[]): void {
  permissionScopeSelection.value = selection
}

// endregion

// region 确认逻辑

const setToDefaultCheckboxValue = ref<boolean>(false)

const confirmButtonDisabled = computed<boolean>(() => {
  return permissionScopeSelection.value.length === 0
})

function handleConfirmButtonClicked(): void {
  if (permissionScopeSelection.value.length === 0) {
    throw new Error(
      t('views.element_plus_engineering.system_settings.unexpected_execution_contact_developer'),
    )
  }
  const scopeItem: PermissionScopeCardItem = permissionScopeSelection.value[0]
  emit('onConfirmed', scopeItem.scope, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (permissionScopeSelection.value.length === 0) {
    return
  }
  const scopeItem: PermissionScopeCardItem = permissionScopeSelection.value[0]
  emit('onConfirmed', scopeItem.scope, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}

// endregion
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.permission-scope-select-dialog-container :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.body-wrapper {
  height: 650px;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .name-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.header-container .name-search-bar :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.body-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-list-container {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.permission-scope-card-container-wrapper {
  width: 100%;
  height: 100%;
}

.permission-scope-card-container {
  width: 100%;
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.permission-scope-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.permission-scope-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.permission-scope-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
