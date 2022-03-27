<template>
  <div class="card-panel-container">
    <overlay-scrollbars class="scroll-bar">
      <div class="card-container">
        <el-card
          class="box-card"
          v-for="(item, index) in data"
          :key="index"
          :style="cardStyle"
          :body-style="bodyStyle"
        >
          <div
            ref="mainContainer"
            class="main-container"
            :class="isSelected(index) ? 'active' : 'inactive'"
            @click="handleSelectionChanged(index)"
            @contextmenu="mayOpenMenu(index,item, $event)"
          >
            <div class="clearfix">
              <div class="title">{{ innerGetDeepProperty(item, titleProp, '') }}</div>
              <div>
                <slot name="header" :item="item" :index="index">
                  <el-button-group class="button-group">
                    <el-button
                      class="card-button"
                      size="mini"
                      icon="el-icon-search"
                      v-if="inspectButtonVisible"
                      @click="handleItemToInspect(index, item)"
                    />
                    <el-button
                      class="card-button"
                      size="mini"
                      icon="el-icon-edit"
                      v-if="editButtonVisible"
                      @click="handleItemToEdit(index, item)"
                    />
                    <el-button
                      class="card-button"
                      size="mini"
                      icon="el-icon-delete"
                      v-if="deleteButtonVisible"
                      @click="handleItemToDelete(index,item)"
                    />
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
          class="box-card"
          v-if="addonButtonVisible"
          :style="cardStyle"
          :body-style="bodyStyle"
        >
          <div class="addon-container">
            <el-tooltip
              effect="dark"
              content="卡片数量已经达到最大值"
              placement="top"
              :disabled="data.length < maxCard"
            >
              <div>
                <el-button
                  class="addon-container-button"
                  icon="el-icon-plus"
                  circle
                  :disabled="data.length >= maxCard"
                  @click="handleAddonClicked"
                />
              </div>
            </el-tooltip>
          </div>
        </el-card>
      </div>
    </overlay-scrollbars>
    <div
      v-if="contextmenu.visible"
      ref="contextmenu"
      class="contextmenu"
      aria-modal="true"
      tabindex="0"
      :style="{left:contextmenu.left+'px',top:contextmenu.top+'px',width:contextmenuWidth+'px'}"
      @blur="closeMenu"
    >
      <slot
        name="contextmenu"
        :item="contextmenu.item"
        :index="contextmenu.index"
        :close="closeMenu"
      >
        <ul>
          <li
            v-if="inspectMenuItemVisible"
            @click="handleInspectMenuItemClicked(contextmenu.index,contextmenu.item)"
          >
            查看...
          </li>
          <li
            v-if="editMenuItemVisible"
            @click="handleEditMenuItemClicked(contextmenu.index,contextmenu.item)"
          >
            编辑...
          </li>
          <li
            v-if="deleteMenuItemVisible"
            @click="handleDeleteMenuItemClicked(contextmenu.index,contextmenu.item)"
          >
            删除...
          </li>
        </ul>
      </slot>
    </div>
    <div
      v-if="contextmenu.visible"
      class="contextmenu-modal"
    />
  </div>
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
    showContextmenu: {
      type: Boolean,
      default: false,
    },
    contextmenuWidth: {
      type: Number,
      default: 85,
    },
    inspectMenuItemVisible: {
      type: Boolean,
      default: true,
    },
    editMenuItemVisible: {
      type: Boolean,
      default: true,
    },
    deleteMenuItemVisible: {
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
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '0',
      },
      selection: {
        singleSelectionIndex: -1,
        multiSelectionIndex: [],
      },
      contextmenu: {
        visible: false,
        left: 0,
        top: 0,
        index: -1,
        item: null,
      },
    };
  },
  methods: {
    innerGetDeepProperty(target, property, defaultResult) {
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
    isSelected(index) {
      if (this.selectMode === 'SINGLE' && this.selection.singleSelectionIndex === index) {
        return true;
      }
      // 为了代码的可读性，此处语法不做简化。
      // noinspection RedundantIfStatementJS
      if (this.selectMode === 'MULTI' && this.selection.multiSelectionIndex.includes(index)) {
        return true;
      }
      return false;
    },
    mayOpenMenu(index, item, e) {
      if (!this.showContextmenu) {
        return;
      }

      // 阻止系统菜单弹出。
      e.preventDefault();

      this.contextmenu.index = index;
      this.contextmenu.item = item;

      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      const { offsetWidth } = this.$el; // container width
      const maxLeft = offsetWidth + offsetLeft - this.contextmenuWidth - 2; // left boundary
      const left = e.clientX + 15; // 15: margin right

      if (left > maxLeft) {
        this.contextmenu.left = maxLeft;
      } else {
        this.contextmenu.left = left;
      }

      this.contextmenu.top = e.clientY;

      this.contextmenu.visible = true;

      this.$nextTick(() => {
        this.$refs.contextmenu.focus();
      });
    },
    closeMenu() {
      this.contextmenu.visible = false;
    },
    handleInspectMenuItemClicked(index, item) {
      this.closeMenu();
      this.$emit('onItemToInspect', index, item);
    },
    handleEditMenuItemClicked(index, item) {
      this.closeMenu();
      this.$emit('onItemToEdit', index, item);
    },
    handleDeleteMenuItemClicked(index, item) {
      this.closeMenu();
      this.$emit('onItemToDelete', index, item);
    },
  },
};
</script>

<style scoped>
.card-panel-container {
  height: 100%;
  width: 100%;
}

.card-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
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
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.button-group {
  display: flex;
}

.addon-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.addon-container-button {
  font-size: 40px;
}

.card-button {
  padding: 7px;
}

.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/*noinspection CssUnusedSymbol*/
.main-container.inactive {
  padding: 2px;
}

/*noinspection CssUnusedSymbol*/
.main-container.active {
  padding: 0;
  border-style: solid;
  border-width: 2px;
  border-color: #409EFF;
}

.main-container:hover {
  background: rgba(0, 0, 0, .025);
}

.contextmenu {
  margin: 0;
  padding: 5px 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #7F7F7F;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
}

.contextmenu:focus {
  outline: none;
}

.contextmenu ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background: #eee;
}

.contextmenu-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2999;
}
</style>
