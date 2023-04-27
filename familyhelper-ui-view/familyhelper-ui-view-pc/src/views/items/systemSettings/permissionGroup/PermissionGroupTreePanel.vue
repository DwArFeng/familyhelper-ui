<template>
  <div class="permission-group-tree-panel-container">
    <lazy-search-tree-panel
      ref="treePanel"
      key-field="tree_node_key"
      label-field="name"
      is-leaf-field="has_no_child"
      accordion
      :search-option-handler="handleSearchOption"
      :load-root-handler="handleLoadRoot"
      :load-child-handler="handleLoadChild"
      :query-path-handler="handleQueryPath"
      :inspect-button-visible="false"
      @onCurrentChanged="handleCurrentChanged"
      @onEntityInspect="handleEntityInspect"
      @onEntityEdit="handleEntityEdit"
      @onEntityDelete="handleEntityDelete"
    />
  </div>
</template>

<script>
import LazySearchTreePanel from '@/components/layout/LazySearchTreePanel.vue';

import { childForParentDisp, nameLikeDisp, pathFromRoot } from '@/api/system/permissionGroup';
import resolveResponse from '@/util/response';

export default {
  name: 'PermissionGroupTreePanel',
  components: { LazySearchTreePanel },
  props: {
    mode: {
      type: String,
      validator(value) {
        return ['PERMISSION_GROUP', 'GENERAL', 'DEFAULT', 'DRIVER_SETTING'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  methods: {
    handleSearchOption(pattern, accept) {
      // 如果 pattern 是空字符串，则接受空数组。
      if (pattern === '') {
        accept([]);
      }
      resolveResponse(nameLikeDisp(pattern, 0, 1000))
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleLoadRoot(accept) {
      resolveResponse(childForParentDisp('', 0, 1000))
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleLoadChild(key, accept) {
      resolveResponse(childForParentDisp(key, 0, 1000))
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleQueryPath(key, accept) {
      resolveResponse(pathFromRoot(key))
        .then((res) => {
          const path = [];
          res.forEach((k) => {
            path.push(k.string_id);
          });
          accept(path);
        });
    },
    appendEntitiesProperties(res) {
      const entities = [];
      res.data.forEach((entity) => {
        this.$set(entity, 'tree_node_key', entity.key.string_id);
        entities.push(entity);
      });
      return Promise.resolve(entities);
    },
    handleCurrentChanged(node, data) {
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
      this.appendEntityProperties(permissionGroup);
      this.$refs.treePanel.appendRoot(permissionGroup);
    },
    append(nodeRef, permissionGroup) {
      this.appendEntityProperties(permissionGroup);
      this.$refs.treePanel.append(nodeRef, permissionGroup);
    },
    insertBefore(nodeRef, permissionGroup) {
      this.appendEntityProperties(permissionGroup);
      this.$refs.treePanel.insertBefore(nodeRef, permissionGroup);
    },
    insertAfter(nodeRef, permissionGroup) {
      this.appendEntityProperties(permissionGroup);
      this.$refs.treePanel.insertAfter(nodeRef, permissionGroup);
    },
    update(permissionGroup) {
      this.appendEntityProperties(permissionGroup);
      const node = this.$refs.treePanel.getNode(permissionGroup);
      const { data } = node;
      this.syncPermissionGroup(data, permissionGroup);
    },
    syncPermissionGroup(target, neoValue) {
      this.$set(target, 'name', neoValue.name);
      this.$set(target, 'remark', neoValue.remark);
    },
    appendEntityProperties(entity) {
      this.$set(entity, 'tree_node_key', entity.key.string_id);
    },
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
</style>
