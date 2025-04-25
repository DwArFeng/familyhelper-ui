<template>
  <div class="setting-node-editor-container">
    <setting-node-edit-panel
      :id="settingNodeEditPanelId"
      :readonly="settingNodeEditPanelReadonly"
      :watching-route-name="ROUTE_NAME"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, ref, watch } from 'vue'

import SettingNodeEditPanel from '@/views/nodes/settingrepo/settingNode/SettingNodeEditPanel.vue'

// -----------------------------------------------------------Router 引入-----------------------------------------------------------
const router = vim.ctx().router().vueRouter()

// -----------------------------------------------------------配置节点编辑面板-----------------------------------------------------------
const ROUTE_NAME: string = 'settingrepo.settingNodeEditor'

const settingNodeEditPanelId = ref<string>('')

const settingNodeEditPanelReadonly = ref<boolean>(false)

watch(router.currentRoute, (route) => {
  if (route.name !== ROUTE_NAME) {
    return
  }
  const id: string = route.query.id as string
  const action: string = route.query.action as string
  settingNodeEditPanelId.value = id
  settingNodeEditPanelReadonly.value = action === 'inspect'
})

onMounted(() => {
  const route = router.currentRoute.value
  if (route.name !== ROUTE_NAME) {
    return
  }
  const id: string = route.query.id as string
  const action: string = route.query.action as string
  settingNodeEditPanelId.value = id
  settingNodeEditPanelReadonly.value = action === 'inspect'
})
</script>

<style scoped>
.setting-node-editor-container {
  width: 100%;
  height: 100%;
}
</style>
