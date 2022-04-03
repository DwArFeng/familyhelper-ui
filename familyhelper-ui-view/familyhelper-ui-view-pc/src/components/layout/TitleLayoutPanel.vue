<template>
  <div
    class="title-layout-panel-container"
    :class="{bordered:bordered}"
  >
    <div class="title" :class="{bordered:bordered}" v-if="title">{{ title }}</div>
    <div class="content">
      <slot name="default"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleLayoutPanel',
  props: {
    title: {
      type: String,
    },
    bordered: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.title-layout-panel-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.title-layout-panel-container.bordered {
  border: solid 1px #DCDFE6;
  border-radius: 4px;
}

.title {
  width: 100%;
  font-size: 14px;
  line-height: 30px;
  background: #F5F7FA;
  padding: 0 10px;
  box-sizing: border-box;
}

.title.bordered {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.content {
  width: 100%;
  height: 100%;
  padding: 3px 10px;
  box-sizing: border-box;
}
</style>
