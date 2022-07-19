<template>
  <div class="pb-management-tree-panel-container">
    <el-input
      placeholder="请输入子节点/项目的名称"
      class="entity-search-panel"
      v-model="itemNameToSearch"
      clearable
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="handleTreeSearch"
      />
    </el-input>
    <tree-panel
      class="tree-panel"
      ref="treePanel"
      v-loading="treeLoading"
      node-key="tree_node_key"
      :tree-data="treeData"
      :tree-props="treeProps"
      :lazy="true"
      :accordion="true"
      :inspect-button-visible="false"
      :edit-button-visible="false"
      :delete-button-visible="false"
      :operate-area-visible="!readOnly"
      :load-handler="handleLoad"
      @onCurrentChanged="handleCurrentChanged"
    >
      <template v-slot:default="{node,data}">
        <div class="icon-wrapper"><i class="iconfont">{{iconValue(data)}}</i></div>
        <div class="label">{{ node.label }}</div>
      </template>
      <template v-slot:operateArea="{node,data}">
        <el-button
          class="button"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleEntityDelete(node,data)"
        />
      </template>
    </tree-panel>
  </div>
</template>

<script>
import TreePanel from '@/components/layout/TreePanel.vue';

import { childForPbSetRootDisp as childNodeForPbSetRoot, childForParentDisp as childNodeForParent } from '@/api/life/pbNode';
import { childForPbSetRootDisp as childItemForPbSetRoot, childForPbNodeDisp as childItemForPbNode } from '@/api/life/pbItem';
import resolveResponse from '@/util/response';

export default {
  name: 'PbManagementTreePanel',
  components: { TreePanel },
  props: {
    pbSetKey: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      validator(value) {
        return ['PB_MANAGEMENT', 'DEFAULT'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconValue() {
      return (entity) => {
        if (entity.display_type === 0) {
          return '\uffd6';
        }
        return '\uffd7';
      };
    },
  },
  watch: {
    pbSetKey(val) {
      if (val === '') {
        this.treeData = [];
      } else {
        this.inspectRoot();
      }
    },
  },
  data() {
    return {
      itemNameToSearch: '',
      treeData: [],
      treeProps: {
        children: 'children',
        label: (data) => data.name,
        isLeaf: (data) => data.has_no_child,
      },
      treeLoading: false,
    };
  },
  methods: {
    inspectRoot() {
      this.treeLoading = true;

      const nodePromise = resolveResponse(childNodeForPbSetRoot(this.pbSetKey, 0, 1000));
      const itemPromise = resolveResponse(childItemForPbSetRoot(this.pbSetKey, 0, 1000));
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          this.treeData = res;
        })
        .finally(() => {
          this.treeLoading = false;
        });
    },
    handleTreeSearch() {
      if (this.pbSetKey === '') {
        this.$message({
          showClose: true,
          message: '请先选择个人最佳集合！',
          type: 'warning',
          center: true,
        });
        return;
      }
      if (this.itemNameToSearch === '') {
        this.treeData = [];
        this.treeSelection = {
          node: null,
          data: null,
        };
        this.inspectRoot();
      }
    },
    handleLoad(node, resolve) {
      if (node.level === 0) {
        return;
      }
      const { data } = node;
      // 获取数据中点展示类型。
      const displayType = data.displey_type;

      // 如果展示类型是 1（个人最佳项目），则没有子节点，直接返回。
      if (displayType === 1) {
        return;
      }
      // 查询节点的子节点和子项目。
      const nodePromise = resolveResponse(childNodeForParent(data.key.long_id, 0, 1000));
      const itemPromise = resolveResponse(childItemForPbNode(data.key.long_id, 0, 1000));
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          resolve(res);
        });
    },
    appendEntitiesProperties(res) {
      const entities = [];
      res[0].data.forEach((pbNode) => {
        this.$set(pbNode, 'tree_node_key', `0_${pbNode.key.long_id}`);
        this.$set(pbNode, 'display_type', 0);
        entities.push(pbNode);
      });
      res[1].data.forEach((pbItem) => {
        this.$set(pbItem, 'tree_node_key', `1_${pbItem.key.long_id}`);
        this.$set(pbItem, 'display_type', 1);
        this.$set(pbItem, 'has_no_child', true);
        entities.push(pbItem);
      });
      return Promise.resolve(entities);
    },
    handleCurrentChanged(node, data) {
      this.$emit('onCurrentChanged', node, data);
    },
    handleEntityDelete(node, data) {
      const accept = () => {
        this.$refs.treePanel.remove(node);
      };
      this.$emit('onEntityDelete', node, data, accept);
    },
    appendRootNode(pbNode) {
      this.appendPbNodeProperties(pbNode);
      this.treeData.push(pbNode);
    },
    appendRootItem(pbItem) {
      this.appendPbItemProperties(pbItem);
      this.treeData.push(pbItem);
    },
    appendNode(nodeRef, pbNode) {
      this.appendPbNodeProperties(pbNode);
      this.$refs.treePanel.append(nodeRef, pbNode);
    },
    appendItem(nodeRef, pbItem) {
      this.appendPbItemProperties(pbItem);
      this.$refs.treePanel.append(nodeRef, pbItem);
    },
    insertNodeAfter(nodeRef, pbNode) {
      this.appendPbNodeProperties(pbNode);
      this.$refs.treePanel.insertAfter(nodeRef, pbNode);
    },
    insertItemAfter(nodeRef, pbItem) {
      this.appendPbItemProperties(pbItem);
      this.$refs.treePanel.insertAfter(nodeRef, pbItem);
    },
    updateNode(pbNode) {
      this.appendPbNodeProperties(pbNode);
      const node = this.$refs.treePanel.getNode(pbNode);
      this.$set(node, 'data', pbNode);
    },
    updateItem(pbItem) {
      this.appendPbItemProperties(pbItem);
      const item = this.$refs.treePanel.getNode(pbItem);
      this.$set(item, 'data', pbItem);
    },
    remove(item) {
      this.appendPbNodeProperties(item);
      this.$refs.treePanel.remove(item);
    },
    appendPbNodeProperties(pbNode) {
      this.$set(pbNode, 'tree_node_key', `0_${pbNode.key.long_id}`);
      this.$set(pbNode, 'display_type', 0);
    },
    appendPbItemProperties(pbItem) {
      this.$set(pbItem, 'tree_node_key', `1_${pbItem.key.long_id}`);
      this.$set(pbItem, 'display_type', 1);
      this.$set(pbItem, 'has_no_child', true);
    },
  },
  mounted() {
    if (this.pbSetKey === '') {
      return;
    }
    this.inspectRoot();
  },
};
</script>

<style scoped>
.pb-management-tree-panel-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.entity-search-panel {
  width: 100%;
  margin-bottom: 5px;
}

.tree-panel {
  height: 0;
  flex-grow: 1;
}

.tree-panel .button{
  padding: 7px;
}

.tree-panel .label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

.tree-panel .icon-wrapper {
  margin-right: 5px;
}

.tree-panel .icon-wrapper .iconfont {
  font-size: 18px;
}
</style>
