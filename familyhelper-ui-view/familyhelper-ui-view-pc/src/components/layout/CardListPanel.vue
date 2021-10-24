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
        :body-style="calculateBodyStyle(index)"
      >
        <div
          class="box-card-wrapper"
          @mouseenter="handleHoverChanged(index)"
          @mouseleave="handleHoverChanged(-1)"
          @click="handleSelectionChanged(index)"
        >
          <div class="clearfix">
            <div class="title">{{ getDeepPropertyBridge(item, titleProp, '') }}</div>
            <div>
              <slot name="header" :item="item" :index="index">
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
                    icon="el-icon-edit"
                    v-if="editButtonVisible"
                    @click="handleItemToEdit(index, item)"
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
              </slot>
            </div>
          </div>
          <el-divider class="divider"></el-divider>
          <div class="slot-container">
            <slot :item="item" :index="index"></slot>
          </div>
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
    editButtonVisible: {
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
    selectMode: {
      type: String,
      validator(value) {
        return [
          'NONE', 'SINGLE', 'MULTI',
        ].indexOf(value) !== -1;
      },
      default: 'NONE',
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
    selectMode(value) {
      switch (value) {
        case 'NONE':
          this.cardStyle.cursor = 'auto';
          break;
        case 'SINGLE':
        case 'MULTI':
          this.cardStyle.cursor = 'pointer';
          break;
        default:
          this.cardStyle.cursor = 'auto';
          break;
      }
    },
  },
  data() {
    return {
      cardStyle: {
        width: this.initCardWidth(),
        height: this.initCardHeight(),
        cursor: this.initCardCursor(),
      },
      bodyStyle: {
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '0',
      },
      selection: {
        singleSelectionIndex: -1,
        multiSelectionIndex: [],
      },
      hoverIndex: -1,
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
    handleItemToEdit(index, item) {
      this.$emit('onItemToEdit', index, item);
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
    initCardCursor() {
      switch (this.selectMode) {
        case 'NONE':
          return 'auto';
        case 'SINGLE':
        case 'MULTI':
          return 'pointer';
        default:
          return 'auto';
      }
    },
    handleHoverChanged(index) {
      this.hoverIndex = index;
    },
    calculateBodyStyle(index) {
      // 通常的样式，如果没有选择模式，则返回该样式。
      const normalTemplate = {
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '2px',
        boxSizing: 'border-box',
      };
      if (this.selectMode === 'NONE') {
        return normalTemplate;
      }

      // 被选中的样式，有选择模式且被选中，则返回该样式。
      const selectedTemplate = {
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '0px',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#409EFF',
        boxSizing: 'border-box',
      };
      if (this.selectMode === 'SINGLE' && this.selection.singleSelectionIndex === index) {
        return selectedTemplate;
      }

      // 鼠标停留时的样式，有选择模式且鼠标停留时选择的样式。
      const hoverTemplate = {
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '1px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#409EFF',
        boxSizing: 'border-box',
      };
      if (index === this.hoverIndex) {
        return hoverTemplate;
      }

      // 处于选择模式，但既没有被选中，鼠标又没有停留，同样使用一般样式。
      return normalTemplate;
    },
    handleSelectionChanged(index) {
      switch (this.selectMode) {
        case 'NONE':
          break;
        case 'SINGLE':
          if (this.selection.singleSelectionIndex === index) {
            this.selection.singleSelectionIndex = -1;
          } else {
            this.selection.singleSelectionIndex = index;
          }
          this.$emit('onSelectionChanged', this.selection.singleSelectionIndex);
          break;
        case 'MULTI':
          // TODO 由于没有使用需求，暂不实现。
          break;
        default:
          break;
      }
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

.divider {
  margin: 0;
}

.slot-container {
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

.box-card-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0
}
</style>
