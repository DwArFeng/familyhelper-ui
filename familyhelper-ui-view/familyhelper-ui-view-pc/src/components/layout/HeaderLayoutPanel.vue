<template>
  <div class="header-layout-panel-container">
    <div class="header-container-wrapper">
      <slot name="header"/>
    </div>
    <el-divider v-if="$slots.header"/>
    <div class="main-container-wrapper" :class="{expand:!applyContainerHeight}">
      <slot name="default"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderLayoutPanel',
  props: {
    applyContainerHeight: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.header-layout-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.el-divider {
  margin: 5px 0;
}

.main-container-wrapper {
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.main-container-wrapper.expand {
  height: 0;
  flex-grow: 1;
}
</style>
