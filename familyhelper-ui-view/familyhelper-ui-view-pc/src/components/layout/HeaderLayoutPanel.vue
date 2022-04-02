<template>
  <div class="header-layout-container">
    <slot name="header"/>
    <el-divider v-if="$slots.header"/>
    <slot name="default"/>
  </div>
</template>

<script>
export default {
  name: 'HeaderLayoutPanel',
};
</script>

<style scoped>
.header-layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.el-divider {
  margin: 5px 0;
}
</style>
