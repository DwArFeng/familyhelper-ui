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
        <role-panel @onCurrentChanged="handleRolePanelCurrentChanged" />
      </template>
      <template v-slot:default>
        <pexp-panel :role="roleTableCurrentRow" />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import RolePanel from './subPanels/RolePanel.vue'
import PexpPanel from './subPanels/PexpPanel.vue'

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

/*noinspection CssUnusedSymbol*/
.role-container :deep(.box-card-main),
.role-container :deep(.box-card-east) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.role-container :deep(.box-card-main .el-card__body),
.role-container :deep(.box-card-east .el-card__body) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
