<template>
  <el-dialog
    class="pb-set-select-dialog-container"
    v-model="watchedVisible"
    tabindex="0"
    destroy-on-close
    title="选择个人最佳集合"
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
            v-loading="pbSetCardLoading"
            title-field="name"
            card-width="calc(20% - 18px)"
            select-mode="SINGLE"
            :items="pbSetCardItems"
            :max-card="pbSetCardMaxCard"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :add-button-visible="false"
            :show-contextmenu="false"
            @onSelectionChanged="handlePbSetCardSelectionChanged"
          >
            <template v-slot:default="{ item }">
              <div class="pb-set-card-container">
                <div class="pb-set-property">
                  <span class="iconfont pb-set-property-icon" style="color: black"> &#xfffa; </span>
                  <span class="pb-set-property-text">
                    权限: {{ (item as PbSetCardItem).formatted_permission_level }}
                  </span>
                </div>
                <div class="pb-set-property">
                  <span class="iconfont pb-set-property-icon" style="color: black"> &#xfffb; </span>
                  <span class="pb-set-property-text">
                    所有者: {{ (item as PbSetCardItem).owner_display_name }}
                  </span>
                </div>
                <div class="pb-set-property">
                  <span class="iconfont pb-set-property-icon" style="color: black"> &#xffe7; </span>
                  <span class="pb-set-property-text">
                    项目总数: {{ (item as PbSetCardItem).item_count }}
                  </span>
                </div>
                <div class="pb-set-property">
                  <span class="iconfont pb-set-property-icon" style="color: black"> &#xffef; </span>
                  <span class="pb-set-property-text">
                    创建日期: {{ (item as PbSetCardItem).formatted_created_date }}
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

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import CardPanel from '@/components/elementPlus/card/cardPanel/CardPanel.vue'

import { useGeneralCardPanel } from '@/components/elementPlus/card/cardPanel/composables.ts'

import { type DispPbSet } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbSet.ts'
import { allPermittedDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbSet.ts'
import { type PopbPermissionLevel } from '@dwarfeng/familyhelper-ui-component-api/src/api/life/popb.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'

defineOptions({
  name: 'PbSetSelectDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  mode?: 'PB_MANAGEMENT' | 'DEFAULT'
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onConfirmed', pbSet: DispPbSet, setToDefault: boolean): void
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
  pbSetSelection.value = []
  setToDefaultCheckboxValue.value = false
  handlePbSetSearch()
}

function handleClosed(): void {
  pbSetSelection.value = []
}

// -----------------------------------------------------------个人最佳集合查询-----------------------------------------------------------
function handlePbSetSearch(): void {
  handlePbSetAllPermittedSearch()
}

async function handlePbSetAllPermittedSearch(): Promise<void> {
  pbSetCardLoading.value += 1
  try {
    const res = await lookupAllToList((pagingInfo) => allPermittedDisp(pagingInfo))
    updatePbSetCardByLookup(res)
  } finally {
    pbSetCardLoading.value -= 1
  }
}

onMounted(() => {
  handlePbSetSearch()
})

// -----------------------------------------------------------个人最佳集合卡片-----------------------------------------------------------
type PbSetCardItem = {
  name: string
  permission_level: PopbPermissionLevel | null
  formatted_permission_level: string
  owner_display_name: string
  item_count: number
  formatted_created_date: string
  pb_set: DispPbSet
}

const { items: pbSetCardItems, updateByLookup: updatePbSetCardByLookup } = useGeneralCardPanel<
  DispPbSet,
  PbSetCardItem
>(pbSetCardItemMap)
const pbSetCardLoading = ref<number>(0)
const pbSetCardMaxCard = ref<number>(1000)
const pbSetSelection = ref<PbSetCardItem[]>([])

function pbSetCardItemMap(t: DispPbSet): PbSetCardItem {
  function formatPermissionLevel(permissionLevel: PopbPermissionLevel | null): string {
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
    pb_set: t,
  }
}

function handlePbSetCardSelectionChanged(selection: PbSetCardItem[]): void {
  pbSetSelection.value = selection
}

// -----------------------------------------------------------确认逻辑-----------------------------------------------------------
const setToDefaultCheckboxValue = ref<boolean>(false)

const confirmButtonDisabled = computed<boolean>(() => {
  return pbSetSelection.value.length === 0
})

function handleConfirmButtonClicked(): void {
  if (pbSetSelection.value.length === 0) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  const pbSet: PbSetCardItem = pbSetSelection.value[0]
  emit('onConfirmed', pbSet.pb_set, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}

function handleCancelButtonClicked(): void {
  watchedVisible.value = false
}

function handleHotKeyDown(): void {
  if (pbSetSelection.value.length === 0) {
    return
  }
  const pbSet: PbSetCardItem = pbSetSelection.value[0]
  emit('onConfirmed', pbSet.pb_set, setToDefaultCheckboxValue.value)
  watchedVisible.value = false
}
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.pb-set-select-dialog-container :deep(.el-dialog) {
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

.pb-set-card-container {
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

.pb-set-property {
  width: 100%;
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 2px;
}

.pb-set-property-icon {
  font-size: 18px;
  margin-right: 4px;
}

.pb-set-property-text {
  font-size: 14px;
  margin-right: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
