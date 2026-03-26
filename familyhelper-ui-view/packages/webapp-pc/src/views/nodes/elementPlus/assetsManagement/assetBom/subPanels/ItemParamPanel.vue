<template>
  <div class="item-params-panel-container">
    <placeholder-panel v-if="itemId === ''" text="请选择项目" />
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button class="item" type="success"> 刷新 </el-button>
            <div v-if="mode === 'DEFAULT'" style="flex-grow: 1" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <coming-soon />
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import ComingSoon from '@/components/comvisual/layout/comingSoon/ComingSoon.vue'
import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

defineOptions({
  name: 'ItemParamPanel',
})

// region Props 定义

type Props = {
  itemId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

defineProps<Props>()

// endregion

// region Emits 定义

type Emits = {
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 头部面板

function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// endregion
</script>

<style scoped>
.item-params-panel-container {
  height: 100%;
  width: 100%;
  background: #ffffff;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}
</style>
