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
      <div
        v-if="contextMenu.visible"
        ref="contextMenu"
        class="context-menu"
        tabindex="0"
        :style="{left:contextMenu.left+'px',top:contextMenu.top+'px',width:contextMenuWidth+'px'}"
        @blur="closeMenu"
      >
        <slot
          name="contextMenu"
          :item="contextMenu.item"
          :index="contextMenu.index"
          :close="closeMenu"
        >
          <ul>
            <li
              v-if="inspectMenuItemVisible"
              @click="handleInspectMenuItemClicked(contextMenu.index,contextMenu.item)"
            >
              查看...
            </li>
            <li
              v-if="editMenuItemVisible"
              @click="handleEditMenuItemClicked(contextMenu.index,contextMenu.item)"
            >
              编辑...
            </li>
            <li
              v-if="deleteMenuItemVisible"
              @click="handleDeleteMenuItemClicked(contextMenu.index,contextMenu.item)"
            >
              删除...
            </li>
          </ul>
        </slot>
      </div>
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
    showContextMenu: {
      type: Boolean,
      default: false,
    },
    contextMenuWidth: {
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
      contextMenu: {
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
      if (!this.showContextMenu) {
        return;
      }

      // 阻止系统菜单弹出。
      e.preventDefault();

      this.contextMenu.index = index;
      this.contextMenu.item = item;

      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      const { offsetWidth } = this.$el; // container width
      const maxLeft = offsetWidth - this.contextMenuWidth - 2; // left boundary
      const left = e.clientX - offsetLeft + 15; // 15: margin right

      if (left > maxLeft) {
        this.contextMenu.left = maxLeft;
      } else {
        this.contextMenu.left = left;
      }

      const offsetTop = this.$el.getBoundingClientRect().top; // container margin left
      this.contextMenu.top = e.clientY - offsetTop;

      this.contextMenu.visible = true;

      this.$nextTick(() => {
        this.$refs.contextMenu.focus();
      });
    },
    closeMenu() {
      this.contextMenu.visible = false;
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
.card-container-panel {
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

.context-menu {
  margin: 0;
  padding: 5px 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
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

.context-menu:focus {
  outline: none;
}

.context-menu ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.context-menu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.context-menu li:hover {
  background: #eee;
}
</style>
