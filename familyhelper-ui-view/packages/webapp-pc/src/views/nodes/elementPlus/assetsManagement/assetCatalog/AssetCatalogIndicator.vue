<template>
  <div class="asset-catalog-indicator-container">
    <el-input
      class="indicator loading-spinner__s24"
      v-loading="loading"
      v-model="displayValue"
      readonly
    >
      <template v-slot:prepend>
        <span>当前资产目录</span>
      </template>
      <template v-slot:append>
        <el-button-group class="button-group">
          <el-button class="button" :icon="SearchIcon" @click="handleShowDialog" />
          <el-button class="button" :icon="RefreshIcon" @click="loadUserPreference" />
        </el-button-group>
      </template>
    </el-input>
    <asset-catalog-select-dialog
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

import AssetCatalogSelectDialog from './subDialogs/AssetCatalogSelectDialog.vue'
import { type DispAssetCatalog } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import {
  exists,
  inspectDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'AssetCatalogIndicator',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  mode?: 'ASSET_BOM' | 'ASSETS_REPORT' | 'DEFAULT'
}

withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onChanged', value: DispAssetCatalog | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------数据逻辑-----------------------------------------------------------
const assetCatalog = ref<DispAssetCatalog | null>(null)

const displayValue = computed(() => {
  if (assetCatalog.value === null) {
    return '（未选择资产目录）'
  }
  return assetCatalog.value.name
})

async function updateAssetCatalog(assetCatalogId: string): Promise<void> {
  loading.value += 1
  try {
    if (assetCatalogId === '') {
      assetCatalog.value = null
      emit('onChanged', null)
      return
    }
    const _exists: boolean = await resolveResponse(exists({ long_id: assetCatalogId }))
    if (!_exists) {
      assetCatalog.value = null
      emit('onChanged', null)
      return
    }
    const _assetCatalog: DispAssetCatalog = await resolveResponse(
      inspectDisp({ long_id: assetCatalogId }),
    )
    assetCatalog.value = _assetCatalog
    emit('onChanged', _assetCatalog)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------选择对话框-----------------------------------------------------------
const dialogVisible = ref<boolean>(false)

function handleShowDialog(): void {
  dialogVisible.value = true
}

function handleConfirmed(neoValue: DispAssetCatalog, setDefault: boolean): void {
  const oldValue: DispAssetCatalog | null = assetCatalog.value
  assetCatalog.value = neoValue
  if (oldValue !== neoValue) {
    emit('onChanged', neoValue)
  }
  if (setDefault) {
    saveUserPreference()
  }
}

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
type UserPreference = {
  assetCatalogId: string
}

const SETTINGREPO_CATEGORY_ID = 'assets_management.default_asset_catalog'

const DEFAULT_USER_PREFERENCE: UserPreference = {
  assetCatalogId: '',
}

const { loadUserPreference, saveUserPreference } = useUserPreference<UserPreference>(
  () => SETTINGREPO_CATEGORY_ID,
  DEFAULT_USER_PREFERENCE,
  userPreferenceGetter,
  userPreferenceSetter,
)

function userPreferenceGetter(): UserPreference {
  return {
    assetCatalogId: assetCatalog.value === null ? '' : assetCatalog.value.key.long_id,
  }
}

function userPreferenceSetter(userPreference: UserPreference): void {
  const assetCatalogId: string = userPreference.assetCatalogId
  updateAssetCatalog(assetCatalogId)
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
