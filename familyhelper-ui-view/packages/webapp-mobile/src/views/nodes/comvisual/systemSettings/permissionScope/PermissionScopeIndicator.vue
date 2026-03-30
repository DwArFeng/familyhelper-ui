<template>
  <div class="permission-scope-indicator-container">
    <div class="indicator loading-wrap">
      <loading-overlay :loading="loading > 0" />
      <div class="indicator-inner">
        <span class="indicator-prepend">当前权限作用域</span>
        <input class="indicator-input" type="text" readonly :value="displayValue" />
        <div class="indicator-append">
          <native-button size="small" bare class="indicator-append-btn" @click="handleShowDialog">
            选择
          </native-button>
          <native-button size="small" bare class="indicator-append-btn" @click="loadUserPreference">
            刷新
          </native-button>
        </div>
      </div>
    </div>
    <permission-scope-select-dialog
      v-model:visible="dialogVisible"
      @on-confirmed="handleConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'

import PermissionScopeSelectDialog from './subDialogs/PermissionScopeSelectDialog.vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import { type Scope } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { exists, get } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/scope.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PermissionScopeIndicator',
})

// region Emits 定义

type Emits = {
  (e: 'onChanged', value: Scope | null): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 数据逻辑

const scope = ref<Scope | null>(null)

const displayValue = computed(() => {
  if (scope.value === null) {
    return '（未选择权限作用域）'
  }
  return scope.value.name
})

async function updateScope(scopeId: string): Promise<void> {
  loading.value += 1
  try {
    if (scopeId === '') {
      scope.value = null
      emit('onChanged', null)
      return
    }
    const _exists: boolean = await resolveResponse(exists({ string_id: scopeId }))
    if (!_exists) {
      scope.value = null
      emit('onChanged', null)
      return
    }
    const _scope: Scope = await resolveResponse(get({ string_id: scopeId }))
    scope.value = _scope
    emit('onChanged', _scope)
  } finally {
    loading.value -= 1
  }
}

// endregion

// region 选择对话框

const dialogVisible = ref<boolean>(false)

function handleShowDialog(): void {
  dialogVisible.value = true
}

function handleConfirmed(neoValue: Scope, setDefault: boolean): void {
  const oldValue: Scope | null = scope.value
  scope.value = neoValue
  if (oldValue !== neoValue) {
    emit('onChanged', neoValue)
  }
  if (setDefault) {
    saveUserPreference()
  }
}

// endregion

// region 用户偏好

type UserPreference = {
  scopeId: string
}

const SETTINGREPO_CATEGORY_ID = 'system_settings.default_permission_scope'

const DEFAULT_USER_PREFERENCE: UserPreference = {
  scopeId: '',
}

const { loadUserPreference, saveUserPreference } = useUserPreference<UserPreference>(
  () => SETTINGREPO_CATEGORY_ID,
  DEFAULT_USER_PREFERENCE,
  userPreferenceGetter,
  userPreferenceSetter,
)

function userPreferenceGetter(): UserPreference {
  return {
    scopeId: scope.value === null ? '' : scope.value.key.string_id,
  }
}

function userPreferenceSetter(userPreference: UserPreference): void {
  const scopeId: string = userPreference.scopeId
  void updateScope(scopeId)
}

onMounted(() => {
  loadUserPreference()
})

// endregion
</script>

<style scoped>
.permission-scope-indicator-container {
  display: inline-flex;
  flex-direction: column;
}

.loading-wrap {
  position: relative;
}

.indicator {
  width: 420px;
}

.indicator-inner {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 32px;
  min-height: 32px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.indicator-prepend {
  flex-shrink: 0;
  padding: 0 8px;
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
  background: #f5f7fa;
  border-right: 1px solid #dcdfe6;
}

.indicator-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  padding: 0 6px;
  font-size: 13px;
  line-height: 30px;
  text-align: center;
  background: #fff;
  box-sizing: border-box;
}

.indicator-input:focus {
  outline: none;
}

.indicator-append {
  display: flex;
  flex-direction: row;
  border-left: 1px solid #dcdfe6;
}

.indicator-append-btn {
  height: 100% !important;
  min-height: 0 !important;
  padding: 0 8px !important;
  font-size: 13px !important;
  line-height: 1 !important;
  border: none !important;
  border-radius: 0 !important;
  background: #f5f7fa !important;
  white-space: nowrap;
}

.indicator-append-btn:hover:not(:disabled) {
  background: #ecf5ff !important;
  color: #409eff !important;
}

.indicator-append-btn + .indicator-append-btn {
  border-left: 1px solid #dcdfe6 !important;
}
</style>
