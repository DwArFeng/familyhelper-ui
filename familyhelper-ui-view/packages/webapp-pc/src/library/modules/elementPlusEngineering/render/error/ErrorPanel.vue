<template>
  <div
    class="error-panel-container"
    v-cloak
    :style="backgroundImageStyle"
    v-loading="backgroundLoading"
    element-loading-background="var(--element-plus-engineering-login-loading-mask-background)"
  >
    <div class="error-panel">
      <div class="home-button-container">
        <el-tooltip
          effect="dark"
          :content="t('library.element_plus_engineering.error_panel.back_home')"
          placement="right"
        >
          <el-button
            class="home-button"
            type="primary"
            :icon="HomeFilled"
            @click="handleBackToHomeButtonClicked"
          />
        </el-tooltip>
      </div>
      <div class="slot-container">
        <slot name="default" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { type CustomizeStore } from '@/store/modules/customize.ts'

import {
  applyElementPlusEngineeringResponsiveBackgroundSize,
  type ElementPlusEngineeringCustomizeBackgroundKeys,
  notifyElementPlusEngineeringCustomizeError,
  preloadElementPlusEngineeringBackgroundImage,
  readElementPlusEngineeringCustomizeBackgroundConfig,
  registerElementPlusEngineeringResponsiveBackgroundResize,
  resolveElementPlusEngineeringCustomizeBackgroundUrl,
  revokeElementPlusEngineeringCustomizeObjectUrl,
} from '@/library/modules/elementPlusEngineering/util/customize.ts'

import { HomeFilled } from '@element-plus/icons-vue'

defineOptions({
  name: 'ErrorPanel',
})

// region Props 定义

const props = defineProps<{
  backgroundKeys: ElementPlusEngineeringCustomizeBackgroundKeys
  embeddedBackgroundUrl: string
}>()

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region 背景样式处理

const customizeStore = vim.ctx().store().vueStore<'customize', CustomizeStore>('customize')

const backgroundLoading = ref<boolean>(true)

const backgroundImageStyle = reactive({
  backgroundImage: 'none',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'auto 100%',
  backgroundPosition: 'center',
})

let errorPanelBackgroundObjectUrl: string | null = null
let errorPanelBackgroundLoadGeneration = 0

async function reloadErrorPanelBackground(): Promise<void> {
  backgroundLoading.value = true
  const generation = ++errorPanelBackgroundLoadGeneration
  const readValue = (key: string): string | null => customizeStore.customizeValue(key).value
  const config = readElementPlusEngineeringCustomizeBackgroundConfig(
    readValue,
    props.backgroundKeys,
  )
  const resolvedUrl = await resolveElementPlusEngineeringCustomizeBackgroundUrl(
    config,
    props.embeddedBackgroundUrl,
  )
  if (generation !== errorPanelBackgroundLoadGeneration) {
    if (resolvedUrl.startsWith('blob:')) {
      revokeElementPlusEngineeringCustomizeObjectUrl(resolvedUrl)
    }
    return
  }
  let displayUrl = resolvedUrl
  try {
    await preloadElementPlusEngineeringBackgroundImage(resolvedUrl)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    notifyElementPlusEngineeringCustomizeError(message)
    if (resolvedUrl !== props.embeddedBackgroundUrl) {
      displayUrl = props.embeddedBackgroundUrl
    }
    try {
      await preloadElementPlusEngineeringBackgroundImage(displayUrl)
    } catch {
      // 预加载失败时仍展示 URL 并结束 loading，避免页面无法交互。
    }
  }
  if (generation !== errorPanelBackgroundLoadGeneration) {
    if (resolvedUrl.startsWith('blob:')) {
      revokeElementPlusEngineeringCustomizeObjectUrl(resolvedUrl)
    }
    return
  }
  revokeElementPlusEngineeringCustomizeObjectUrl(errorPanelBackgroundObjectUrl)
  errorPanelBackgroundObjectUrl = displayUrl.startsWith('blob:') ? displayUrl : null
  if (displayUrl !== resolvedUrl && resolvedUrl.startsWith('blob:')) {
    revokeElementPlusEngineeringCustomizeObjectUrl(resolvedUrl)
  }
  backgroundImageStyle.backgroundImage = `url(${displayUrl})`
  applyElementPlusEngineeringResponsiveBackgroundSize(backgroundImageStyle)
  backgroundLoading.value = false
}

watch(
  () => customizeStore.customizeItem,
  () => {
    void reloadErrorPanelBackground()
  },
  { deep: true, immediate: true },
)

let unregisterErrorPanelBackgroundResize: (() => void) | null = null

onMounted(() => {
  applyElementPlusEngineeringResponsiveBackgroundSize(backgroundImageStyle)
  unregisterErrorPanelBackgroundResize =
    registerElementPlusEngineeringResponsiveBackgroundResize(backgroundImageStyle)
  void reloadErrorPanelBackground()
})

onBeforeUnmount(() => {
  errorPanelBackgroundLoadGeneration += 1
  unregisterErrorPanelBackgroundResize?.()
  revokeElementPlusEngineeringCustomizeObjectUrl(errorPanelBackgroundObjectUrl)
  errorPanelBackgroundObjectUrl = null
})

// endregion

// region 方法定义

function handleBackToHomeButtonClicked(): void {
  vim.ctx().router().vueRouter().push({ name: 'vim.layout' })
}

// endregion
</script>

<style scoped>
.error-panel-container {
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}

.error-panel {
  position: relative;
  background-color: var(--element-plus-engineering-error-panel-background);
  height: min(768px, 85%);
  width: min(1024px, 85%);
  border-radius: 5px;
  box-shadow: var(--el-box-shadow-dark);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 40px;
  box-sizing: border-box;
}

.slot-container {
  position: relative;
  z-index: 1;
  flex-grow: 1;
  width: 100%;
  height: 100%;
}

.home-button-container {
  height: 32px;
  width: 32px;
  position: absolute;
  z-index: 2;
  left: 40px;
  top: 25px;
}

.home-button {
  padding: 8px;
}
</style>
