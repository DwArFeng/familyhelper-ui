<template>
  <div class="topic-container">
    <border-layout-panel class="border-layout-panel" west-width="50%" :west-visible="true">
      <template v-slot:west>
        <topic-panel @onCurrentTopicChanged="handleCurrentTopicChanged" />
      </template>
      <template v-slot:default>
        <dispatcher-info-panel :topic="topic" />
      </template>
    </border-layout-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import TopicPanel from './subPanels/TopicPanel.vue'
import DispatcherInfoPanel from './subPanels/DispatcherInfoPanel.vue'

import { type Topic } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/topic.ts'

defineOptions({
  name: 'TopicComponent',
})

const topic = ref<Topic | null>(null)

function handleCurrentTopicChanged(value: Topic | null): void {
  topic.value = value
}
</script>

<style scoped>
.topic-container {
  height: 100%;
  width: 100%;
}
</style>
