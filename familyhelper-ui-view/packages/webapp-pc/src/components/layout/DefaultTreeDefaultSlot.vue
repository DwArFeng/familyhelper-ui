<template>
  <div class="default-tree-default-slot-container">
    <div class="icon-wrapper"><i class="el-icon-menu"/></div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'DefaultTreeDefaultSlot',
  props: {
    label: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.default-tree-default-slot-container{
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
