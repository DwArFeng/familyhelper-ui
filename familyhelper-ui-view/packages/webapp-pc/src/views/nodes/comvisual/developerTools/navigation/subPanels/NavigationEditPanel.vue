<template>
  <div class="navigation-edit-panel" v-show="selectedKey !== null">
    <loading-overlay :loading="loading > 0" />
    <native-tabs v-model="tabsActiveName" class="tabs-panel" tab-position="left">
      <native-tab-pane name="overlook" label="概览">
        <navigation-overview-panel
          :navigation-node="navigationNode"
          :selected-key="selectedKey"
          @inspect="handleInspect"
          @loading-delta="handleLoadingDelta"
        />
      </native-tab-pane>
      <native-tab-pane name="structure" label="结构">
        <navigation-structure-panel
          :navigation-node="navigationNode"
          :selected-key="selectedKey"
          @inspect="handleInspect"
          @loading-delta="handleLoadingDelta"
        />
      </native-tab-pane>
    </native-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import LoadingOverlay from '@/components/comvisual/feedback/loadingOverlay/LoadingOverlay.vue'
import NativeTabPane from '@/components/comvisual/tabs/nativeTabs/NativeTabPane.vue'
import NativeTabs from '@/components/comvisual/tabs/nativeTabs/NativeTabs.vue'

import { notifyWarning } from '@/library/modules/comvisual/util/nativeUi.ts'

import {
  type NavigationNodeInspectResult,
  operateInspect,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/navigationNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { SETTINGREPO_CATEGORY } from '../customNavigation.ts'
import NavigationOverviewPanel from './NavigationOverviewPanel.vue'
import NavigationStructurePanel from './NavigationStructurePanel.vue'

defineOptions({
  name: 'NavigationEditPanel',
})

// region Props

type Props = {
  selectedKey: string | null
}

const props = defineProps<Props>()

// endregion

// region 加载与 Tab

const loading = ref(0)

type TabsActiveName = 'overlook' | 'structure'

const tabsActiveName = ref<TabsActiveName>('overlook')

function handleLoadingDelta(delta: number): void {
  loading.value += delta
}

// endregion

// region 导航数据与 Inspect

const navigationNode = ref<NavigationNodeInspectResult | null>(null)

async function handleInspect(): Promise<void> {
  const key = props.selectedKey
  if (key === null) {
    navigationNode.value = null
    return
  }
  loading.value += 1
  try {
    const res = await resolveResponse(
      operateInspect({
        category: SETTINGREPO_CATEGORY,
        args: ['custom', key],
      }),
    )
    if (!res) {
      notifyWarning('未查询到导航数据')
      navigationNode.value = null
      return
    }
    navigationNode.value = res
  } finally {
    loading.value -= 1
  }
}

watch(
  () => props.selectedKey,
  () => {
    handleInspect()
  },
  { immediate: true },
)

// endregion
</script>

<style scoped>
.navigation-edit-panel {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 0;
}

.tabs-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
