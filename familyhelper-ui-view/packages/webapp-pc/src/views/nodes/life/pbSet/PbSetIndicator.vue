<template>
  <div class="pb-set-indicator-container">
    <el-input
      class="indicator loading-spinner__s24"
      v-loading="loading"
      v-model="displayValue"
      readonly
    >
      <template v-slot:prepend>
        <span>当前个人最佳集合</span>
      </template>
      <template v-slot:append>
        <el-button-group class="button-group">
          <el-button class="button" :icon="SearchIcon" @click="handleShowDialog" />
          <el-button class="button" :icon="RefreshIcon" @click="loadUserPreference" />
        </el-button-group>
      </template>
    </el-input>
    <pb-set-select-dialog
      v-model:visible="dialogVisible"
      :mode="mode"
      @onConfirmed="handleConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import { Search as SearchIcon, Refresh as RefreshIcon } from '@element-plus/icons-vue'

import PbSetSelectDialog from './subDialogs/PbSetSelectDialog.vue'
import { type DispPbSet } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbSet.ts'
import { exists, inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbSet.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'PbSetIndicator',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  mode?: 'PB_MANAGEMENT' | 'DEFAULT'
}

withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onChanged', value: DispPbSet | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------数据逻辑-----------------------------------------------------------
const pbSet = ref<DispPbSet | null>(null)

const displayValue = computed(() => {
  if (pbSet.value === null) {
    return '（未选择个人最佳集合）'
  }
  return pbSet.value.name
})

async function updatePbSet(pbSetId: string): Promise<void> {
  loading.value += 1
  try {
    if (pbSetId === '') {
      pbSet.value = null
      emit('onChanged', null)
      return
    }
    const _exists: boolean = await resolveResponse(exists({ long_id: pbSetId }))
    if (!_exists) {
      pbSet.value = null
      emit('onChanged', null)
      return
    }
    const _pbSet: DispPbSet = await resolveResponse(inspectDisp({ long_id: pbSetId }))
    pbSet.value = _pbSet
    emit('onChanged', _pbSet)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------选择对话框-----------------------------------------------------------
const dialogVisible = ref<boolean>(false)

function handleShowDialog(): void {
  dialogVisible.value = true
}

function handleConfirmed(neoValue: DispPbSet, setDefault: boolean): void {
  const oldValue: DispPbSet | null = pbSet.value
  pbSet.value = neoValue
  if (oldValue !== neoValue) {
    emit('onChanged', neoValue)
  }
  if (setDefault) {
    saveUserPreference()
  }
}

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
type UserPreference = {
  pbSetId: string
}

const SETTINGREPO_CATEGORY_ID = 'life.default_pb_set'

const DEFAULT_USER_PREFERENCE: UserPreference = {
  pbSetId: '',
}

const { loadUserPreference, saveUserPreference } = useUserPreference<UserPreference>(
  () => SETTINGREPO_CATEGORY_ID,
  DEFAULT_USER_PREFERENCE,
  userPreferenceGetter,
  userPreferenceSetter,
)

function userPreferenceGetter(): UserPreference {
  return {
    pbSetId: pbSet.value === null ? '' : pbSet.value.key.long_id,
  }
}

function userPreferenceSetter(userPreference: UserPreference): void {
  const pbSetId: string = userPreference.pbSetId
  updatePbSet(pbSetId)
}

onMounted(() => {
  loadUserPreference()
})
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
