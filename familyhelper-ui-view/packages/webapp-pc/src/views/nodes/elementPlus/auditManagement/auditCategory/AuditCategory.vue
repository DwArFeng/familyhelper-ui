<template>
  <div class="audit-category-container">
    <root-border-layout-panel
      class="border-layout-panel"
      west-width="38%"
      :west-visible="true"
      :full-screen-tool-visible="false"
      :initial-tool-dock-status="4"
      :initial-tool-y="-200"
    >
      <template v-slot:west>
        <audit-category-list-panel
          ref="auditCategoryListPanelRef"
          :apply-changes-disabled="applyChangesButtonDisabled"
          @onCurrentChanged="handleAuditCategoryListCurrentChanged"
          @onApplyChanges="handleApplyChanges"
        />
      </template>
      <template v-slot:default>
        <placeholder-panel v-show="currentCategoryId === ''" text="请选择审计类别" />
        <audit-category-edit-panel
          v-show="currentCategoryId !== ''"
          :key="currentCategoryId"
          :category-id="currentCategoryId"
          :apply-changes-disabled="applyChangesButtonDisabled"
          upsc="ui_preference.pc.audit_management.audit_category.audit_category_edit_panel"
          @onCategoryPropertyUpdated="handleCategoryPropertyUpdated"
          @onApplyChanges="handleApplyChanges"
        />
      </template>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, useTemplateRef } from 'vue'

import { ElMessage } from 'element-plus'

import { type ComponentExposed } from 'vue-component-type-helpers'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import { type AuditCategory } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/auditCategory.ts'
import { resetAuditRecord } from '@dwarfeng/familyhelper-ui-component-api/src/api/audit/reset.ts'
import { resolveResponse } from '@/util/response.ts'

import AuditCategoryListPanel from './subPanels/AuditCategoryListPanel.vue'
import AuditCategoryEditPanel from './subPanels/AuditCategoryEditPanel.vue'

defineOptions({
  name: 'AuditCategory',
})

// region 审计类别列表当前选中

const currentCategoryId = ref<string>('')
const auditCategoryListPanelRef = useTemplateRef<ComponentExposed<typeof AuditCategoryListPanel>>(
  'auditCategoryListPanelRef',
)

function handleAuditCategoryListCurrentChanged(categoryId: string): void {
  currentCategoryId.value = categoryId
}

// endregion

// region 类别属性更新

function handleCategoryPropertyUpdated(category: AuditCategory): void {
  auditCategoryListPanelRef.value?.applyPatch(category)
}

// endregion

// region 应用变更

const applyChangesButtonDisabled = ref<boolean>(false)
let applyChangesTimer: ReturnType<typeof setTimeout> | null = null

async function handleApplyChanges(): Promise<void> {
  if (applyChangesButtonDisabled.value) {
    return
  }
  applyChangesButtonDisabled.value = true
  try {
    await resolveResponse(resetAuditRecord())
    ElMessage({
      showClose: true,
      message: '变更应用成功！后台状态刷新中，请不要频繁点击。',
      type: 'success',
    })
    applyChangesTimer = setTimeout(() => {
      applyChangesButtonDisabled.value = false
      applyChangesTimer = null
    }, 3000)
  } catch {
    applyChangesButtonDisabled.value = false
  }
}

onUnmounted(() => {
  if (applyChangesTimer !== null) {
    clearTimeout(applyChangesTimer)
  }
})

// endregion
</script>

<style scoped>
.audit-category-container {
  width: 100%;
  height: 100%;
}
</style>
