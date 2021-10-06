<template>
  <overlay-scrollbars class="scroll-bar">
    <div
      class="card-container-panel"
    >
      <el-card
        class="box-card"
        v-for="(item, index) in data"
        :key="index"
        :style="cardStyle"
        :body-style="bodyStyle"
      >
        <div class="clearfix">
          <div class="title">{{ getDeepPropertyBridge(item, titleProp, '') }}</div>
          <el-button-group class="button-group">
            <el-button
              class="card-button"
              size="mini"
              icon="el-icon-search"
              v-if="inspectButtonVisible"
              @click="handleItemToInspect(index, item)"
            >
            </el-button>
            <el-button
              class="card-button"
              size="mini"
              icon="el-icon-delete"
              v-if="deleteButtonVisible"
              @click="handleItemToDelete(index,item)"
            >
            </el-button>
          </el-button-group>
        </div>
        <el-divider class="divider"></el-divider>
        <div class="slot-container">
          <slot :item="item" :index="index"></slot>
        </div>
      </el-card>
      <el-card
        class="box-card addon"
        v-if="addonButtonVisible"
        :style="cardStyle"
      >
        <el-tooltip
          effect="dark"
          content="卡片数量已经达到最大值"
          placement="top"
          :disabled="data.length < maxCard"
        >
          <div>
            <el-button
              class="addon-button"
              icon="el-icon-plus"
              circle
              :disabled="data.length >= maxCard"
              @click="handleAddonClicked"
            ></el-button>
          </div>
        </el-tooltip>
      </el-card>
    </div>
  </overlay-scrollbars>
</template>

<script>
import getDeepProperty from '@/util/objects';

export default {
  name: 'CardListPanel',
  props: {
    cardWidth: {
      type: [Number, String],
      default: '300px',
    },
    cardHeight: {
      type: [Number, String],
      default: '210px',
    },
    titleProp: {
      type: String,
      default: 'title',
    },
    data: {
      type: Array,
      default: () => [],
    },
    maxCard: {
      type: Number,
      default: 10,
    },
    inspectButtonVisible: {
      type: Boolean,
      default: true,
    },
    deleteButtonVisible: {
      type: Boolean,
      default: true,
    },
    addonButtonVisible: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    cardWidth(value) {
      let width = value;
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(width)) {
        width += 'px';
      }
      this.cardStyle.width = width;
    },
    cardHeight(value) {
      let height = value;
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(height)) {
        height += 'px';
      }
      this.cardStyle.height = height;
    },
  },
  data() {
    return {
      cardStyle: {
        width: this.initCardWidth(),
        height: this.initCardHeight(),
      },
      bodyStyle: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0',
      },
    };
  },
  methods: {
    getDeepPropertyBridge(target, property, defaultResult) {
      return getDeepProperty(target, property, defaultResult);
    },
    handleAddonClicked() {
      this.$emit('onAddonClicked', this.watchedCurrentPage);
    },
    handleItemToInspect(index, item) {
      this.$emit('onItemToInspect', index, item);
    },
    handleItemToDelete(index, item) {
      this.$emit('onItemToDelete', index, item);
    },
    initCardWidth() {
      let width = this.cardWidth;
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(width)) {
        width += 'px';
      }
      return width;
    },
    initCardHeight() {
      let height = this.cardHeight;
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(height)) {
        height += 'px';
      }
      return height;
    },
  },
};
</script>

<style scoped>
.card-container-panel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

.box-card {
  margin: 8px;
}

.clearfix {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
}

.divider{
  margin: 0;
}

.slot-container{
  flex-grow: 1;
  height: 0;
}

.title {
  text-align: center;
  flex-grow: 1;
  padding-right: 10px;
  font-size: 14px;
}

.button-group {
  display: flex;
}

.addon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.addon-button {
  font-size: 40px;
}

.card-button {
  padding: 7px
}
</style>
