<template>
  <modal-dialog
    v-model:visible="watchedVisible"
    title="选择权限作用域"
    align-center
    width="55vw"
    :close-on-click-modal="false"
    @hot-confirm="handleHotKeyDown"
  >
    <div class="dialog-body-inner">
      <header-layout-panel class="body-wrapper" :apply-container-height="true">
        <template v-slot:header>
          <div class="header-container">
            <native-button kind="success" @click="handlePermissionScopeSearch"
              >刷新数据</native-button
            >
            <span class="header-sep" aria-hidden="true" />
            <div class="name-search-bar">
              <span class="name-search-prepend">作用域名称</span>
              <input
                v-model="nameSearchBarValue"
                type="text"
                class="name-search-input"
                @keydown.enter="handlePermissionScopeSearch"
              />
              <native-button attach-end @click="handlePermissionScopeSearch">搜索</native-button>
            </div>
          </div>
        </template>
        <template v-slot:default>
          <div class="body-container">
            <div class="card-list-wrap">
              <loading-overlay :loading="permissionScopeCardLoading > 0" />
              <card-panel
                class="card-list-container"
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
                @on-selection-changed="handlePermissionScopeCardSelectionChanged"
              >
                <template v-slot:default="{ item }">
                  <corner-light-panel
                    class="permission-scope-card-container-wrapper"
                    light-bevel-edge="40px"
                    light-color="#E6A23C"
                  >
                    <div class="permission-scope-card-container">
                      <div class="permission-scope-property">
                        <span class="permission-scope-property-text">
                          标识: {{ (item as PermissionScopeCardItem).key_string_id }}
                        </span>
                      </div>
                      <div class="permission-scope-property">
                        <span class="permission-scope-property-text">
                          备注: {{ (item as PermissionScopeCardItem).remark || '（无）' }}
                        </span>
                      </div>
                    </div>
                  </corner-light-panel>
                </template>
              </card-panel>
            </div>
            <label class="default-check">
              <input v-model="setToDefaultCheckboxValue" type="checkbox" />
              设为默认
            </label>
          </div>
        </template>
      </header-layout-panel>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <native-button
          kind="primary"
          :disabled="confirmButtonDisabled"
          @click="handleConfirmButtonClicked"
        >
          确定
        </native-button>
        <native-button @click="handleCancelButtonClicked">取消</native-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import CardPanel from '@/components/comvisual/card/cardPanel/CardPanel.vue'
import CornerLightPanel from '@/components/comvisual/layout/cornerLightPanel/CornerLightPanel.vue'
import HeaderLayoutPanel from '@/components/comvisual/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import ModalDialog from '@/components/comvisual/dialog/modalDialog/ModalDialog.vue'

import { useGeneralCardPanel } from '@/components/comvisual/card/cardPanel/composables.ts'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { all, nameLike } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { lookupAllToList } from '@/util/lookup.ts'

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
    if (value) {
      handleOpen()
    } else {
      handleClosed()
    }
  },
)

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
  void handlePermissionScopeSearchInternal()
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
  watchedVisible.value = props.visible
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
    throw new Error('不应该执行到此处，请联系开发人员')
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
.dialog-body-inner {
  width: max(50vw, 100%);
  max-width: 92vw;
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
  flex-wrap: wrap;
  gap: 8px;
}

.header-sep {
  width: 1px;
  height: 20px;
  background: #dcdfe6;
}

.name-search-bar {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 400px;
  max-width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.name-search-prepend {
  flex-shrink: 0;
  padding: 0 10px;
  display: flex;
  align-items: center;
  font-size: 14px;
  background: #f5f7fa;
  border-right: 1px solid #dcdfe6;
}

.name-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  padding: 0 8px;
  font-size: 14px;
}

.name-search-input:focus {
  outline: none;
}

.body-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-list-wrap {
  position: relative;
  width: 100%;
  height: 0;
  flex-grow: 1;
  min-height: 0;
}

.card-list-container {
  width: 100%;
  height: 100%;
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

.permission-scope-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.default-check {
  flex-shrink: 0;
  margin-top: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
