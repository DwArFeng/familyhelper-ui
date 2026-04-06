<template>
  <div class="external-link-container">
    <root-border-layout-panel :initial-tool-dock-status="4" :initial-tool-y="-200">
      <div class="iframe-wrapper">
        <iframe
          class="iframe"
          v-if="iframeSrc"
          :key="iframeSrc"
          :src="iframeSrc"
          title="外链内容"
          referrerpolicy="no-referrer-when-downgrade"
        />
        <placeholder-panel
          v-else
          text="未配置有效的外链地址（请在路由 componentParam 中提供 url）"
        />
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
  name: 'ExternalLink',
})

// region 外链 URL

type ComponentParam = {
  src?: string
}

const router = vim.ctx().router().vueRouter()

const iframeSrc = ref<string>('')

function syncUrl(): void {
  if (router.currentRoute.value.meta.compreg !== 'miscellaneous.externalLink') {
    iframeSrc.value = ''
    return
  }
  const componentParam: ComponentParam = router.currentRoute.value.meta
    .componentParam as ComponentParam
  iframeSrc.value = componentParam.src ?? ''
}

watch(router.currentRoute, () => {
  syncUrl()
})

onMounted(() => {
  syncUrl()
})

// endregion
</script>

<style scoped>
.external-link-container {
  width: 100%;
  height: 100%;
}

.iframe-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
}

.iframe-wrapper .iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}
</style>
