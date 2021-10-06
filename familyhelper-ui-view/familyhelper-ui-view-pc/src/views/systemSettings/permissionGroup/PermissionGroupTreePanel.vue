<template>
  <div class="permission-group-tree-panel-container">
    <el-input
      placeholder="请输入子部件的名称"
      class="item-search-panel"
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
      v-cloak
      node-key="node_key"
      :tree-data="treeData"
      :tree-props="treeProps"
      :lazy="true"
      :accordion="true"
      :inspect-button-visible="false"
      :load-handler="handleLoad"
      @onCurrentChanged="handleCurrentChanged"
      @onEntityInspect="handleEntityInspect"
      @onEntityEdit="handleEntityEdit"
      @onEntityDelete="handleEntityDelete"
    />
  </div>
</template>

<script>
import TreePanel from '@/components/layout/TreePanel.vue';

import resolveResponse from '@/util/response';
import { childForParentDisp } from '@/api/system/permissionGroup';

export default {
  name: 'PermissionGroupTreePanel',
  components: { TreePanel },
  props: {
    mode: {
      type: String,
      validator(value) {
        return ['PERMISSION_GROUP', 'GENERAL', 'DEFAULT', 'DRIVER_SETTING'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
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
    };
  },
  methods: {
    inspectRoot() {
      resolveResponse(this, childForParentDisp('', 0, 1000))
        .then(this.appendEntitiesNodeKey)
        .then((res) => {
          this.treeData = res.data;
        });
    },
    handleTreeSearch() {
      if (this.itemNameToSearch === '') {
        this.treeData = [];
        this.treeSelection = {
          node: null,
          data: {
            key: {
              string_id: '',
            },
            parent_permission_group: {
              key: {
                string_id: '',
              },
              parent_key: {
                string_id: '',
              },
              name: '',
              remark: '',
            },
            name: '',
            remark: '',
            has_no_child: true,
          },
        };
        this.inspectRoot();
      }
    },
    handleLoad(node, resolve) {
      if (node.level === 0) {
        return;
      }

      const permissionGroup = node.data;
      resolveResponse(this, childForParentDisp(permissionGroup.key.string_id, 0, 1000))
        .then(this.appendEntitiesNodeKey)
        .then((res) => {
          resolve(res.data);
        });
    },
    appendEntitiesNodeKey(res) {
      res.data.forEach((permissionGroup) => {
        this.$set(permissionGroup, 'node_key', permissionGroup.key.string_id);
      });
      return Promise.resolve(res);
    },
    handleCurrentChanged(node, data) {
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
    handleEntityDelete(node, data, accept) {
      this.$emit('onEntityDelete', node, data, accept);
    },
    appendRoot(permissionGroup) {
      this.appendPermissionGroupNodeKey(permissionGroup);
      this.treeData.push(permissionGroup);
    },
    append(nodeRef, permissionGroup) {
      this.appendPermissionGroupNodeKey(permissionGroup);
      this.$refs.treePanel.append(nodeRef, permissionGroup);
    },
    insertBefore(nodeRef, permissionGroup) {
      this.appendPermissionGroupNodeKey(permissionGroup);
      this.$refs.treePanel.insertBefore(nodeRef, permissionGroup);
    },
    insertAfter(nodeRef, permissionGroup) {
      this.appendPermissionGroupNodeKey(permissionGroup);
      this.$refs.treePanel.insertAfter(nodeRef, permissionGroup);
    },
    update(permissionGroup) {
      this.appendPermissionGroupNodeKey(permissionGroup);
      const node = this.$refs.treePanel.getNode(permissionGroup);
      this.$set(node, 'data', permissionGroup);
    },
    remove(permissionGroup) {
      this.appendPermissionGroupNodeKey(permissionGroup);
      this.$refs.treePanel.remove(permissionGroup);
    },
    appendPermissionGroupNodeKey(permissionGroup) {
      this.$set(permissionGroup, 'node_key', permissionGroup.key.string_id);
    },
  },
  mounted() {
    this.inspectRoot();
  },
};
</script>

<style scoped>
.permission-group-tree-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.item-search-panel {
  width: 100%;
  margin-bottom: 5px;
}

.tree-panel {
  height: 0;
  flex-grow: 1;
}
</style>
