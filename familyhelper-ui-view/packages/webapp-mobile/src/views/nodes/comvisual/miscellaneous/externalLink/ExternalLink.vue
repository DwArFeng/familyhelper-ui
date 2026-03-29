<template>
  <div class="external-link-container">
    <border-layout-panel>
      <div class="iframe-wrapper" ref="iframeWrapperRef">
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
        <float-tool :allowed-dock-statuses="[2, 4]" :initial-dock-status="4" :initial-y="-200">
          <div class="full-screen-tool" @click="toggleFullScreen()">
            <span class="float-tool__icon" aria-hidden="true" />
            <span class="float-tool__label">{{ fullScreen ? '退出全屏' : '全屏' }}</span>
          </div>
        </float-tool>
      </div>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import FloatTool from '@/components/comvisual/widget/floatTool/FloatTool.vue'
import BorderLayoutPanel from '@/components/comvisual/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import screenfull from 'screenfull'

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

// region 全屏逻辑

const iframeWrapperRef = useTemplateRef<HTMLElement>('iframeWrapperRef')

const fullScreen = ref(false)

// 事件逃逸标记。
let escapeEventFlag = false

function fullScreenHandler(): void {
  if (escapeEventFlag) {
    escapeEventFlag = false
    return
  }
  fullScreen.value = screenfull.element === iframeWrapperRef.value
}

async function toggleFullScreen(): Promise<void> {
  const iframeWrapper = iframeWrapperRef.value
  if (!iframeWrapper) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  if (screenfull.isEnabled) {
    escapeEventFlag = true
    fullScreen.value = !fullScreen.value
    if (fullScreen.value) {
      screenfull.request(iframeWrapper).finally()
    } else {
      screenfull.exit().finally()
    }
  }
}

onMounted(() => {
  if (screenfull.isEnabled) {
    fullScreen.value = screenfull.element === iframeWrapperRef.value
    screenfull.on('change', fullScreenHandler)
  }
})

onBeforeUnmount(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', fullScreenHandler)
  }
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

.full-screen-tool {
  width: 40px;
  height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
}

.float-tool__icon {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 3px;
}

.float-tool__icon::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px dashed currentColor;
  border-radius: 1px;
  opacity: 0.7;
}

.float-tool__label {
  font-size: 10px;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
</style>
