<template>
  <div class="mmd-node-container">
    <div class="mmd-node" :style="nodeStyle">
      <div class="item label" :style="labelStyle">{{ itemData.mmdData.label }}</div>
      <div class="item icon-group" v-if="iconGroupEnabled">
        <i class="iconfont" v-if="noteEnabled">&#xffdf;</i>
        <i class="iconfont" v-if="imageEnabled">&#xffde;</i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MmdNode',
  props: {
    itemData: {
      type: Object,
    },
  },
  computed: {
    label() {
      return this.itemData.mmdData.label;
    },
    imageEnabled() {
      return this.itemData.mmdData.imageEnabled;
    },
    noteEnabled() {
      return this.itemData.mmdData.noteEnabled;
    },
    iconGroupEnabled() {
      return this.imageEnabled || this.noteEnabled;
    },
    nodeStyle() {
      return {
        color: this.itemData.mmdData.foregroundColor,
        background: this.itemData.mmdData.backgroundColor,
      };
    },
    labelStyle() {
      return {
        fontWeight: this.itemData.mmdData.fontWeight,
        fontStyle: this.itemData.mmdData.fontStyle,
      };
    },
  },
};
</script>

<style scoped>
.mmd-node-container {
  height: 47px;
}

.mmd-node {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 15px;
  box-sizing: border-box;
  border-width: 1px;
  border-color: black;
  border-radius: 10px;
  border-style: solid;
  background: white;
}

.mmd-node .item:not(:last-child) {
  margin-right: 10px;
}

.icon-group i{
  font-size: 24px;
}
</style>
