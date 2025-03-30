<template>
  <div class="meta-indicator-container">
    <border-layout-panel class="border-layout-panel" west-width="50%" :west-visible="true">
      <template v-slot:west>
        <topic-panel @onCurrentTopicChanged="handleCurrentTopicChanged" />
      </template>
      <template v-slot:default>
        <meta-indicator-panel :topic="topic" />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import TopicPanel from './TopicPanel.vue'
import MetaIndicatorPanel from '../MetaIndicatorPanel.vue'

import type { Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'

defineOptions({
  name: 'MetaIndicator',
})

const topic = ref<Topic | null>(null)

function handleCurrentTopicChanged(value: Topic | null): void {
  topic.value = value
}
</script>

<style scoped>
.meta-indicator-container {
  height: 100%;
  width: 100%;
}

.main-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}
</style>
