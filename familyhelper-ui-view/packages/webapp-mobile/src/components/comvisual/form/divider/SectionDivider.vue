<template>
  <div class="section-divider" role="separator">
    <span v-if="title" class="section-divider__title">{{ title }}</span>
    <hr class="section-divider__line" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SectionDivider',
})

// region Props 定义

type Props = {
  title?: string
}

defineProps<Props>()

// endregion
</script>

<style scoped>
.section-divider {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  width: 100%;
}

.section-divider__title {
  flex-shrink: 0;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.section-divider__line {
  flex: 1;
  border: none;
  border-top: 1px solid #ebeef5;
  margin: 0;
  min-width: 0;
}
</style>
