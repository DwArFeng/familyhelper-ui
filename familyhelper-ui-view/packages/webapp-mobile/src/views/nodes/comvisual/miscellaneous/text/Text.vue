<template>
  <div class="text-container">
    <border-layout-panel>
      <div class="text-wrapper">
        <placeholder-panel v-if="placeholderContent" :text="placeholderContent" />
        <placeholder-panel v-else text="未配置文本内容（请在路由 componentParam 中提供 content）" />
      </div>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, ref, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'

defineOptions({
  name: 'TextComponent',
})

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
