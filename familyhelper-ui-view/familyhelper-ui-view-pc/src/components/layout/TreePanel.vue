<template>
  <div class="tree-panel-container">
    <overlay-scrollbars class="scroll-bar">
      <el-tree
        class="tree-panel"
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
        <template v-slot="{node,data}">
          <div class="tree-node">
            <div class="tree-node-content">
              <slot :node="node" :data="data">
                <div class="item-container">
                  <div class="icon-wrapper"><i class="el-icon-menu"/></div>
                  <div class="label">{{ node.label }}</div>
                </div>
              </slot>
            </div>
            <div
              class="tree-node-operate-area"
              v-if="operateAreaVisible"
              @mouseenter="operateAreaHover=true"
              @mouseleave="operateAreaHover=false"
            >
              <slot name="operateArea" :node="node" :data="data">
                <el-button-group>
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
              </slot>
            </div>
          </div>
        </template>
        </el-tree>
      </overlay-scrollbars>
  </div>
</template>

<script>
export default {
  name: 'TreePanel',
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
    operateAreaVisible: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      operateAreaHover: false,
    };
  },
  methods: {
    handleCurrentChanged(data, node) {
      if (this.operateAreaHover) {
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
    nodeMap() {
      return this.$refs.tree.store.nodesMap;
    },
  },
};
</script>

<style scoped>
.tree-panel-container {
  height: 100%;
  width: 100%;
}

.tree-panel {
  display: inline-block;
  min-width: 100%;
}

/*noinspection CssUnusedSymbol*/
.tree-panel >>> .el-tree-node__content {
  height: 100%;
  margin-bottom: 2px;
}

.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
}

.tree-node-content {
  height: 100%;
  width: 0;
  flex-grow: 1;
}

.tree-node-operate-area {
  height: 100%;
}

.tree-panel .item-container {
  height: 28px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.tree-node .icon-wrapper {
  margin-right: 5px;
  font-size: 18px;
}

.tree-node .label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

.tree-node-button {
  padding: 7px
}
</style>
