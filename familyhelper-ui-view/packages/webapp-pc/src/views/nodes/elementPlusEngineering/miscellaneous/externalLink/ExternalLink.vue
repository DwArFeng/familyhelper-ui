<template>
  <div class="external-link-container">
    <root-border-layout-panel :initial-tool-dock-status="4" :initial-tool-y="-200">
      <div class="iframe-wrapper">
        <iframe
          class="iframe"
          v-if="iframeSrc"
          :key="iframeSrc"
          :src="iframeSrc"
          :title="t('views.element_plus_engineering.miscellaneous.external_link_content')"
          referrerpolicy="no-referrer-when-downgrade"
        />
        <placeholder-panel
          v-else
          :text="t('views.element_plus_engineering.miscellaneous.external_link_url_missing')"
        />
      </div>
    </root-border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlusEngineering/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

defineOptions({
  name: 'ExternalLink',
})

// region I18n 引入

const { t } = useI18n()

// endregion

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
