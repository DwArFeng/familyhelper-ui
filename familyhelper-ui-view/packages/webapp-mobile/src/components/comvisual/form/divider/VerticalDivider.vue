<template>
  <span class="vertical-divider" role="separator" aria-orientation="vertical" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'VerticalDivider',
})
</script>

<style scoped>
.vertical-divider {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 8px;
  vertical-align: middle;
  background: #dcdfe6;
  flex-shrink: 0;
}
</style>
