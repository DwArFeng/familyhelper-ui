<template>
  <div class="ez-nav-container">
    <div class="router-link-container-wrapper">
      <div class="loading" v-if="loading">正在加载，请稍候...</div>
      <div class="router-link-container" v-else>
        <!--suppress JSUnresolvedVariable, JSUnresolvedFunction -->
        <div
          class="ez-nav-item"
          :class="isCurrent(item.key) ? 'active' : ''"
          v-for="item in navItems"
          :key="item.key"
          @click="handleNav(item.key)"
          @contextmenu.prevent="openMenu(item.key, $event)"
        >
          <!--suppress JSUnresolvedFunction -->
          <i class="el-icon-lock prefix-icon" v-if="annotation(item.key) === 'affix'"/>
          <i class="el-icon-link prefix-icon" v-if="annotation(item.key) === 'pinned'"/>
          <vim-label :type="item.meta.display.labelType" :content="item.meta.display.labelContent"/>
          <!--suppress JSUnresolvedFunction -->
          <i
            class="el-icon-close close-icon"
            v-if="annotation(item.key) === 'active'"
            @click.stop="handleRemove(item.key)"
          />
        </div>
      </div>
    </div>
    <ul
      v-if="contextmenu.visible"
      ref="contextmenu"
      class="contextmenu"
      tabindex="0"
      :style="{left:contextmenu.left+'px',top:contextmenu.top+'px'}"
      @blur="closeMenu"
    >
      <li
        v-if="annotation(contextmenu.itemKey) === 'active'"
        @click="closeMenu();pin(contextmenu.itemKey)"
      >
        固定
      </li>
      <li
        v-if="annotation(contextmenu.itemKey) === 'pinned'"
        @click="closeMenu();unpin(contextmenu.itemKey)"
      >
        解除固定
      </li>
      <li
        v-if="annotation(contextmenu.itemKey) === 'pinned'"
        @click="closeMenu();unpinAndClose()"
      >
        解除固定并清除
      </li>
      <li
        v-if="annotation(contextmenu.itemKey) === 'active'"
        @click="closeMenu();removeItemKey(contextmenu.itemKey)"
      >
        清除
      </li>
      <li
        v-if="annotation(contextmenu.itemKey) === 'active'"
        @click="closeMenu();clearOther()"
      >
        清除其它
      </li>
      <!--suppress JSUnresolvedFunction -->
      <li
        v-if="annotation(contextmenu.itemKey) === 'active'"
        @click="closeMenu();clearActive()"
      >
        清除所有
      </li>
      <!--suppress JSUnresolvedFunction -->
      <li
        v-if="annotation(contextmenu.itemKey) !== 'affix'"
        @click="closeMenu();showEditDialog()"
      >
        调整顺序...
      </li>
      <li @click="closeMenu();handleNav(contextmenu.itemKey)">转到</li>
    </ul>
    <div
      v-if="contextmenu.visible"
      class="contextmenu-modal"
    />
    <el-dialog
      class="edit-dialog-container"
      ref="dialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="编辑快捷导航栏"
      top="6vh"
      width="40%"
      :visible.sync="editDialog.visible"
      :close-on-click-modal="false"
      @keydown.native="handleEditDialogHotKeyDown"
    >
      <div class="editor-container">
        <div class="editor-column">
          <span class="editor-title">固定标签</span>
          <draggable class="editor-dragger" v-model="editDialog.pinnedNavItems" group="nav">
            <div
              class="editor-nav-item"
              v-for="(item,index) in editDialog.pinnedNavItems"
              :key="item.key"
            >
              <editor-nav-bar
                annotation="pinned"
                :item="item"
                @onDelete="handleEditorNavItemDelete('pinned', index)"
              />
            </div>
          </draggable>
        </div>
        <div class="editor-column">
          <span class="editor-title">活动标签</span>
          <draggable class="editor-dragger" v-model="editDialog.activeNavItems" group="nav">
            <div
              class="editor-nav-item"
              v-for="(item,index) in editDialog.activeNavItems"
              :key="item.key"
            >
              <editor-nav-bar
                annotation="active"
                :item="item"
                @onDelete="handleEditorNavItemDelete('active', index)"
              />
            </div>
          </draggable>
        </div>
      </div>
      <div class="footer-container" slot="footer">
        <el-button
          type="primary"
          @click="handleEditorConfirm"
        >
          确定
        </el-button>
        <el-button
          @click="editDialog.visible = false"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

import Draggable from 'vuedraggable';
import VimLabel from '@/components/vim/VimLabel.vue';
import EditorNavBar from '@/elements/modules/elementUI/layout/ezNavView/EditorNavBar.vue';

// noinspection JSAnnotator
export default {
  name: 'TagsView',
  components: { EditorNavBar, VimLabel, Draggable },
  computed: {
    ...mapGetters('vimEzNav', ['navItems', 'annotation', 'pinnedNavItems', 'activeNavItems', 'itemMeta', 'loading']),
    ...mapGetters('vim', ['isCurrent']),
  },
  data() {
    return {
      contextmenu: {
        visible: false,
        left: 0,
        top: 0,
        itemKey: '',
      },
      editDialog: {
        visible: false,
        pinnedNavItems: [],
        activeNavItems: [],
      },
    };
  },
  methods: {
    handleNav(itemKey) {
      const { params, query } = this.itemMeta(itemKey);
      const location = { name: itemKey, params, query };
      this.$router.push(location);
    },
    handleRemove(itemKey) {
      this.removeItemKey(itemKey);
    },
    openMenu(itemKey, e) {
      this.contextmenu.itemKey = itemKey;

      const menuMinWidth = 120;
      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      const { offsetWidth } = this.$el; // container width
      const maxLeft = offsetWidth - menuMinWidth; // left boundary
      const left = e.clientX - offsetLeft + 15; // 15: margin right

      if (left > maxLeft) {
        this.contextmenu.left = maxLeft;
      } else {
        this.contextmenu.left = left;
      }

      const offsetTop = this.$el.getBoundingClientRect().top; // container margin left
      this.contextmenu.top = e.clientY - offsetTop;

      this.contextmenu.visible = true;

      this.$nextTick(() => {
        this.$refs.contextmenu.focus();
      });
    },
    closeMenu() {
      this.contextmenu.visible = false;
    },
    unpinAndClose() {
      this.unpin(this.contextmenu.itemKey);
      this.removeItemKey(this.contextmenu.itemKey);
    },
    clearOther() {
      this.clearActive();
      this.pushItemKey(this.contextmenu.itemKey);
    },
    showEditDialog() {
      this.editDialog.pinnedNavItems = [];
      this.editDialog.activeNavItems = [];
      this.pinnedNavItems.forEach((i) => this.editDialog.pinnedNavItems.push(i));
      this.activeNavItems.forEach((i) => this.editDialog.activeNavItems.push(i));
      this.editDialog.visible = true;
    },
    handleEditorConfirm() {
      this.updatePinnedItemKeys(this.editDialog.pinnedNavItems.map((i) => i.key));
      this.updateActiveItemKeys(this.editDialog.activeNavItems.map((i) => i.key));
      this.editDialog.visible = false;
    },
    handleEditDialogHotKeyDown(event) {
      if (this.selection === null) {
        return;
      }
      if (event.key === 'Enter' && event.shiftKey === false && event.altKey === false) {
        this.handleEditorConfirm();
      }
    },
    handleEditorNavItemDelete(annotation, index) {
      if (annotation === 'pinned') {
        this.editDialog.pinnedNavItems.splice(index, 1);
      } else {
        this.editDialog.activeNavItems.splice(index, 1);
      }
    },
    ...mapMutations('vimEzNav', [
      'removeItemKey', 'pin', 'unpin', 'clearActive', 'pushItemKey', 'updatePinnedItemKeys',
      'updateActiveItemKeys',
    ]),
  },
};
</script>

<style scoped>
.ez-nav-container {
  height: fit-content;
  width: 100%;
  background: #fff;
  position: relative;
}

.router-link-container-wrapper {
  width: 100%;
}

.router-link-container-wrapper .loading{
  margin: 0 14px;
  padding: 1px 0;
  line-height: 30px;
  font-size: 14px;
  user-select: none;
}

.router-link-container {
  height: fit-content;
  width: fit-content;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: flex-end;
  box-sizing: border-box;
  margin: 0 14px;
  padding: 1px 0;
}

.ez-nav-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  border: 1px solid #d8dce5;
  color: #495060;
  background: #fff;
  padding: 0 8px;
  font-size: 12px;
  white-space: nowrap;
  margin: 1px 1px;
}

/*noinspection CssUnusedSymbol*/
.ez-nav-item.active {
  background-color: #42b983;
  color: #fff;
  border-color: #42b983;
}

/*noinspection CssUnusedSymbol*/
.ez-nav-item.active::before {
  content: '';
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  margin-right: 2px;
}

/*noinspection CssUnusedSymbol*/
.ez-nav-item >>> .vim-label {
  user-select: none;
  margin: 0 4px;
}

.prefix-icon {
  width: 16px;
  height: 16px;
  vertical-align: 2px;
  border-radius: 50%;
  text-align: center;
}

.prefix-icon:before {
  display: inline-block;
  vertical-align: -3px;
}

.close-icon {
  width: 16px;
  height: 16px;
  vertical-align: 2px;
  border-radius: 50%;
  text-align: center;
  transition: all .3s cubic-bezier(.645, .045, .355, 1);
  transform-origin: 100% 50%;
}

.close-icon:before {
  display: inline-block;
  vertical-align: -3px;
}

.close-icon:hover {
  background-color: #b4bccc;
  color: #fff;
}

.contextmenu {
  width: 120px;
  min-width: 120px;
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
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

/*noinspection CssUnusedSymbol*/
.edit-dialog-container >>> .el-dialog {
  margin-bottom: 0 !important;
}

.editor-container {
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.editor-column {
  height: 100%;
  width: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.editor-column:first-child {
  margin-right: 15px;
}

.editor-title {
  font-size: 16px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "微软雅黑", Arial, sans-serif;
  user-select: none;
  margin-bottom: 5px;
  padding-left: 2px;
}

.editor-dragger {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.editor-nav-item:not(:first-child) {
  margin-top: 2px;
}
</style>
