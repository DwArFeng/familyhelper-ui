<template>
  <div class="navigation-container">
    <border-layout-panel class="border-layout-panel" :east-visible="true" east-width="60%">
      <template v-slot:default>
        <custom-navigation-panel @on-current-changed="handleListCurrentChanged" />
      </template>
      <template v-slot:east>
        <placeholder-panel v-if="selectedListKey === null" text="请选择左侧列表中的导航项" />
        <navigation-edit-panel v-else :selected-key="selectedListKey" />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'

import CustomNavigationPanel from './subPanels/CustomNavigationPanel.vue'
import NavigationEditPanel from './subPanels/NavigationEditPanel.vue'

import { type CustomNavigation } from './customNavigation.ts'

defineOptions({
  name: 'NavigationComponent',
})

// region 列表选中状态

const selectedListKey = ref<string | null>(null)

function handleListCurrentChanged(row: CustomNavigation | null): void {
  selectedListKey.value = row === null ? null : row.key
}

// endregion
</script>

<style scoped>
.navigation-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.border-layout-panel {
  height: 100%;
}
</style>
