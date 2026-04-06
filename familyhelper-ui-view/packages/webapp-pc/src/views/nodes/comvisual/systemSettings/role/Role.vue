<template>
  <div class="role-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="35%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <role-panel @on-current-changed="handleRolePanelCurrentChanged" />
      </template>
      <template v-slot:default>
        <pexp-panel :role="roleTableCurrentRow" />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import RootBorderLayoutPanel from '@/components/comvisual/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import PexpPanel from './subPanels/PexpPanel.vue'
import RolePanel from './subPanels/RolePanel.vue'

import { type Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/rbac/role.ts'

defineOptions({
  name: 'RoleComponent',
})

// region 角色当前选中

const roleTableCurrentRow = ref<Role | null>(null)

function handleRolePanelCurrentChanged(current: Role | null): void {
  roleTableCurrentRow.value = current
}

// endregion
</script>

<style scoped>
.role-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
