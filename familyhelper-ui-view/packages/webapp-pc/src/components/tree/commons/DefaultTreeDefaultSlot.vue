<template>
  <div class="default-tree-default-slot-container">
    <el-icon class="icon-wrapper">
      <menu-icon />
    </el-icon>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { Menu as MenuIcon } from '@element-plus/icons-vue'

defineOptions({
  name: 'DefaultTreeDefaultSlot',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  label: string
}

defineProps<Props>()
</script>

<style scoped>
.default-tree-default-slot-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icon-wrapper {
  margin-right: 5px;
  font-size: 18px;
}

.label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-family: Arial, sans-serif;
}
</style>
