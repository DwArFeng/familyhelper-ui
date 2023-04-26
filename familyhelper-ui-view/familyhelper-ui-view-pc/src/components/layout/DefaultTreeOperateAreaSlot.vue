<template>
  <div class="default-tree-operate-area-slot-container">
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
  </div>
</template>

<script>
export default {
  name: 'DefaultTreeOperateAreaSlot',
  props: {
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
    node: {
      type: Object,
      default: () => {
      },
    },
    data: {
      type: Object,
      default: () => {
      },
    },
  },
  methods: {
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
  },
};
</script>

<style scoped>
.tree-node-button {
  padding: 7px
}
</style>
