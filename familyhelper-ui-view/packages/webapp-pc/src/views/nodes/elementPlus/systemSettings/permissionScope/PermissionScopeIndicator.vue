<template>
  <div class="permission-scope-indicator-container">
    <el-input
      class="indicator loading-spinner__s24"
      v-loading="loading"
      v-model="displayValue"
      readonly
    >
      <template v-slot:prepend>
        <span>当前权限作用域</span>
      </template>
      <template v-slot:append>
        <el-button-group class="button-group">
          <el-button class="button" :icon="SearchIcon" @click="handleShowDialog" />
          <el-button class="button" :icon="RefreshIcon" @click="loadUserPreference" />
        </el-button-group>
      </template>
    </el-input>
    <permission-scope-select-dialog
      v-model:visible="dialogVisible"
      @onConfirmed="handleConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import { Search as SearchIcon, Refresh as RefreshIcon } from '@element-plus/icons-vue'

import PermissionScopeSelectDialog from './subDialogs/PermissionScopeSelectDialog.vue'

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
  updateScope(scopeId)
}

onMounted(() => {
  loadUserPreference()
})

// endregion
</script>

<style scoped>
.indicator {
  width: 420px;
}

/*noinspection CssUnusedSymbol*/
.indicator :deep(.el-input__inner) {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.indicator :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.button-group .button:not(:first-child) {
  padding-left: 7px;
}

.button-group .button:not(:last-child) {
  padding-right: 7px;
}
</style>
