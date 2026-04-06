<template>
  <div class="text-container">
    <root-border-layout-panel :initial-tool-dock-status="4" :initial-tool-y="-200">
      <div class="text-wrapper">
        <placeholder-panel v-if="placeholderContent" :text="placeholderContent" />
        <placeholder-panel v-else text="未配置文本内容（请在路由 componentParam 中提供 content）" />
      </div>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

defineOptions({
  name: 'TextComponent',
})

// region 路由与 componentParam 文本

type ComponentParam = {
  content?: string
}

const router = vim.ctx().router().vueRouter()

const placeholderContent = ref<string>('')

function syncContent(): void {
  if (router.currentRoute.value.meta.compreg !== 'miscellaneous.text') {
    placeholderContent.value = ''
    return
  }
  const componentParam: ComponentParam = router.currentRoute.value.meta
    .componentParam as ComponentParam
  placeholderContent.value = componentParam.content ?? ''
}

watch(router.currentRoute, () => {
  syncContent()
})

onMounted(() => {
  syncContent()
})

// endregion
</script>

<style scoped>
.text-container {
  width: 100%;
  height: 100%;
}

.text-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}
</style>
