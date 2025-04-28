<template>
  <el-dialog
    class="asset-catalog-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    destroy-on-close
    title="选择资产目录"
    top="8vh"
    width="80%"
    :close-on-click-modal="false"
    @open="handleOpen"
    @closed="handleClosed"
    @keydown="handleHotKeyDown"
  >
    <header-layout-panel class="body-wrapper">
      <template v-slot:default>
        <div class="body-container">
          <card-panel
            class="card-list-container"
            v-loading="assetCatalogCardLoading"
            title-field="name"
            card-width="calc(20% - 18px)"
            select-mode="SINGLE"
            :items="assetCatalogCardItems"
            :max-card="assetCatalogCardMaxCard"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :add-button-visible="false"
            :show-contextmenu="false"
            @onSelectionChanged="handleAssetCatalogCardSelectionChanged"
          >
            <template v-slot:default="{ item }">
              <div class="asset-catalog-card-container">
                <div class="asset-catalog-property">
                  <span class="iconfont asset-catalog-property-icon" style="color: black">
                    &#xfffa;
                  </span>
                  <span class="asset-catalog-property-text">
                    权限: {{ (item as AssetCatalogCardItem).formatted_permission_level }}
                  </span>
                </div>
                <div class="asset-catalog-property">
                  <span class="iconfont asset-catalog-property-icon" style="color: black">
                    &#xfffb;
                  </span>
                  <span class="asset-catalog-property-text">
                    所有者: {{ (item as AssetCatalogCardItem).owner_display_name }}
                  </span>
                </div>
                <div class="asset-catalog-property">
                  <span class="iconfont asset-catalog-property-icon" style="color: black">
                    &#xffe7;
                  </span>
                  <span class="asset-catalog-property-text">
                    项目总数: {{ (item as AssetCatalogCardItem).item_count }}
                  </span>
                </div>
                <div class="asset-catalog-property">
                  <span class="iconfont asset-catalog-property-icon" style="color: black">
                    &#xffef;
                  </span>
                  <span class="asset-catalog-property-text">
                    创建日期: {{ (item as AssetCatalogCardItem).formatted_created_date }}
                  </span>
                </div>
              </div>
            </template>
          </card-panel>
          <el-checkbox v-model="setToDefaultCheckboxValue">设为默认</el-checkbox>
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
          确定
        </el-button>
        <el-button @click="handleCancelButtonClicked"> 取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import CardPanel from '@/components/card/cardPanel/CardPanel.vue'

import { useGeneralCardPanel } from '@/components/card/cardPanel/composables.ts'

import { type DispAssetCatalog } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import { allPermittedDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/assetCatalog.ts'
import { type PoacPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/poac.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'AssetCatalogSelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  mode?: 'ASSET_BOM' | 'ASSETS_REPORT' | 'DEFAULT'
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', assetCatalog: DispAssetCatalog, setToDefault: boolean): void
}

const emit = defineEmits<Emits>()

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

// -----------------------------------------------------------显示处理-----------------------------------------------------------
function handleOpen(): void {
  assetCatalogSelection.value = []
  setToDefaultCheckboxValue.value = false
  handleAssetCatalogSearch()
}

function handleClosed(): void {
  assetCatalogSelection.value = []
}

// -----------------------------------------------------------资产目录查询-----------------------------------------------------------
function handleAssetCatalogSearch(): void {
  handleAssetCatalogAllPermittedSearch()
}

async function handleAssetCatalogAllPermittedSearch(): Promise<void> {
  assetCatalogCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allPermittedDisp(pagingInfo))
    updateAssetCatalogCardByLookup(res)
  } finally {
    assetCatalogCardLoading.value -= 1
  }
}

onMounted(() => {
  handleAssetCatalogSearch()
})

// -----------------------------------------------------------资产目录卡片-----------------------------------------------------------
type AssetCatalogCardItem = {
  name: string
  permission_level: PoacPermissionLevel | null
  formatted_permission_level: string
  owner_display_name: string
  item_count: number
  formatted_created_date: string
  asset_catalog: DispAssetCatalog
}

const { items: assetCatalogCardItems, updateByLookup: updateAssetCatalogCardByLookup } =
  useGeneralCardPanel<DispAssetCatalog, AssetCatalogCardItem>(assetCatalogCardItemMap)
const assetCatalogCardLoading = ref<number>(0)
const assetCatalogCardMaxCard = ref<number>(1000)
const assetCatalogSelection = ref<AssetCatalogCardItem[]>([])

function assetCatalogCardItemMap(t: DispAssetCatalog): AssetCatalogCardItem {
  function formatPermissionLevel(permissionLevel: PoacPermissionLevel | null): string {
    switch (permissionLevel) {
      case 0:
        return '所有者'
      case 1:
        return '访客'
      default:
        return '未知'
    }
  }

  return {
    name: t.name,
    permission_level: t.permission_level,
    formatted_permission_level: formatPermissionLevel(t.permission_level),
    owner_display_name: t.owner_account?.display_name ?? '未知',
    item_count: t.item_count,
    formatted_created_date: formatTimestamp(t.created_date),
    asset_catalog: t,
  }
}

function handleAssetCatalogCardSelectionChanged(selection: AssetCatalogCardItem[]): void {
  assetCatalogSelection.value = selection
}

// -----------------------------------------------------------确认逻辑-----------------------------------------------------------
const setToDefaultCheckboxValue = ref<boolean>(false)

const confirmButtonDisabled = computed<boolean>(() => {
  return assetCatalogSelection.value.length === 0
})

function handleConfirmButtonClicked(): void {
  if (assetCatalogSelection.value.length === 0) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const assetCatalog: AssetCatalogCardItem = assetCatalogSelection.value[0]
  emit('onConfirmed', assetCatalog.asset_catalog, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (assetCatalogSelection.value.length === 0) {
    return
  }
  const assetCatalog: AssetCatalogCardItem = assetCatalogSelection.value[0]
  emit('onConfirmed', assetCatalog.asset_catalog, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.asset-catalog-select-dialog-container :deep(.el-dialog) {
  margin-bottom: 0 !important;
}

.body-wrapper {
  height: 650px;
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

.asset-catalog-card-container {
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

.asset-catalog-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.asset-catalog-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.asset-catalog-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
