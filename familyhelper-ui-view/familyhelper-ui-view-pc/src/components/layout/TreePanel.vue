<template>
  <div class="tree-content-panel">
    <div class="slot-header">
      <slot name="header"></slot>
    </div>
    <div class="tree-container">
      <overlay-scrollbars class="scroll-bar">
        <el-tree
          class="tree"
          ref="tree"
          :data="treeData"
          :props="treeProps"
          :lazy="lazy"
          :accordion="accordion"
          :load="loadHandler"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          :node-key="nodeKey"
          :highlight-current="true"
          @current-change="handleCurrentChanged"
        >
          <span class="tree-node" slot-scope="{ node, data }">
            <span style="margin-right: 5px"><i class="el-icon-menu"></i> </span>
            <span class="tree-node-label">{{ node.label }}</span>
            <span>
              <el-button-group
                class="tree-node-button-group"
                v-if="entityOperateColumnVisible"
                @mouseenter.native="handleMouseEntered"
                @mouseleave.native="handleMouseLeft"
              >
                <el-button
                  class="tree-node-button"
                  size="mini"
                  icon="el-icon-search"
                  type="success"
                  v-if="inspectButtonVisible"
                  @click="handleEntityInspect(node, data)"
                />
                <el-button
                  class="tree-node-button"
                  size="mini"
                  icon="el-icon-edit"
                  v-if="editButtonVisible"
                  @click="handleEntityEdit(node, data)"
                />
                <el-button
                  class="tree-node-button"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  v-if="deleteButtonVisible"
                  @click="handleEntityDelete(node,data)"
                />
              </el-button-group>
            </span>
          </span>
        </el-tree>
      </overlay-scrollbars>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TablePanel',
  props: {
    treeData: {
      type: Array,
      default: () => [],
    },
    treeProps: {
      type: Object,
      default: () => ({
        children: 'children',
        label: 'label',
      }),
    },
    lazy: {
      type: Boolean,
      default: () => false,
    },
    accordion: {
      type: Boolean,
      default: () => false,
    },
    loadHandler: {
      type: Function,
      default: () => {
      },
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
    nodeKey: {
      type: String,
      default: '',
    },
  },
  computed: {
    entityOperateColumnVisible() {
      return this.inspectButtonVisible || this.editButtonVisible || this.deleteButtonVisible;
    },
  },
  data() {
    return {
      buttonHover: false,
    };
  },
  methods: {
    handleCurrentChanged(data, node) {
      if (this.buttonHover) {
        return;
      }
      this.$emit('onCurrentChanged', node, data);
    },
    handleEntityInspect(node, data) {
      this.$emit('onEntityInspect', node, data);
    },
    handleEntityEdit(node, data) {
      this.$emit('onEntityEdit', node, data);
    },
    handleEntityDelete(node, data) {
      const accept = () => {
        this.$refs.tree.remove(node);
      };
      this.$emit('onEntityDelete', node, data, accept);
    },
    handleMouseEntered() {
      this.buttonHover = true;
    },
    handleMouseLeft() {
      this.buttonHover = false;
    },
    getNode(data) {
      return this.$refs.tree.getNode(data);
    },
    append(nodeRef, data) {
      this.$refs.tree.append(data, nodeRef);
    },
    insertBefore(nodeRef, data) {
      this.$refs.tree.insertBefore(data, nodeRef);
    },
    insertAfter(nodeRef, data) {
      this.$refs.tree.insertAfter(data, nodeRef);
    },
    remove(nodeRef) {
      this.$refs.tree.remove(nodeRef);
    },
  },
};
</script>

<style scoped>
.tree-content-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.slot-header {
  width: 100%;
  height: auto;
}

.tree-container {
  height: 0;
  width: 100%;
  flex-grow: 1;
}

.tree {
  display: inline-block;
  min-width: 100%;
}

/*noinspection CssUnusedSymbol*/
.tree >>> .el-tree-node__content {
  height: 100%;
  margin-bottom: 2px;
}

.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

.tree-node-label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.tree-node-button-group {
  display: flex;
  width: 100%;
}

.tree-node-button {
  padding: 7px
}
</style>