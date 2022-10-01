<template>
  <div class="note-management-tree-panel-container">
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

import { childForNoteBookRootDisp as childNodeForNoteBookRoot, childForParentDisp as childNodeForParent } from '@/api/note/noteNode';
import { childForNoteBookRootDisp as childItemForNoteBookRoot, childForNoteNodeDisp as childItemForNoteNode } from '@/api/note/noteItem';
import resolveResponse from '@/util/response';

export default {
  name: 'NoteManagementTreePanel',
  components: { TreePanel },
  props: {
    noteBookKey: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      validator(value) {
        return ['NOTE_MANAGEMENT', 'DEFAULT'].indexOf(value) !== -1;
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
    noteBookKey(val) {
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

      const nodePromise = resolveResponse(childNodeForNoteBookRoot(this.noteBookKey, 0, 1000));
      const itemPromise = resolveResponse(childItemForNoteBookRoot(this.noteBookKey, 0, 1000));
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
      if (this.noteBookKey === '') {
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
      const itemPromise = resolveResponse(childItemForNoteNode(data.key.long_id, 0, 1000));
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          resolve(res);
        });
    },
    appendEntitiesProperties(res) {
      const entities = [];
      res[0].data.forEach((noteNode) => {
        this.$set(noteNode, 'tree_node_key', `0_${noteNode.key.long_id}`);
        this.$set(noteNode, 'display_type', 0);
        entities.push(noteNode);
      });
      res[1].data.forEach((noteItem) => {
        this.$set(noteItem, 'tree_node_key', `1_${noteItem.key.long_id}`);
        this.$set(noteItem, 'display_type', 1);
        this.$set(noteItem, 'has_no_child', true);
        entities.push(noteItem);
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
    appendRootNode(noteNode) {
      this.appendNoteNodeProperties(noteNode);
      this.treeData.push(noteNode);
    },
    appendRootItem(noteItem) {
      this.appendNoteItemProperties(noteItem);
      this.treeData.push(noteItem);
    },
    appendNode(nodeRef, noteNode) {
      this.appendNoteNodeProperties(noteNode);
      this.$refs.treePanel.append(nodeRef, noteNode);
    },
    appendItem(nodeRef, noteItem) {
      this.appendNoteItemProperties(noteItem);
      this.$refs.treePanel.append(nodeRef, noteItem);
    },
    insertNodeAfter(nodeRef, noteNode) {
      this.appendNoteNodeProperties(noteNode);
      this.$refs.treePanel.insertAfter(nodeRef, noteNode);
    },
    insertItemAfter(nodeRef, noteItem) {
      this.appendNoteItemProperties(noteItem);
      this.$refs.treePanel.insertAfter(nodeRef, noteItem);
    },
    updateNode(noteNode) {
      this.appendNoteNodeProperties(noteNode);
      const node = this.$refs.treePanel.getNode(noteNode);
      this.$set(node, 'data', noteNode);
    },
    updateItem(noteItem) {
      this.appendNoteItemProperties(noteItem);
      const item = this.$refs.treePanel.getNode(noteItem);
      this.$set(item, 'data', noteItem);
    },
    remove(item) {
      this.appendNoteNodeProperties(item);
      this.$refs.treePanel.remove(item);
    },
    appendNoteNodeProperties(noteNode) {
      this.$set(noteNode, 'tree_node_key', `0_${noteNode.key.long_id}`);
      this.$set(noteNode, 'display_type', 0);
    },
    appendNoteItemProperties(noteItem) {
      this.$set(noteItem, 'tree_node_key', `1_${noteItem.key.long_id}`);
      this.$set(noteItem, 'display_type', 1);
      this.$set(noteItem, 'has_no_child', true);
    },
  },
  mounted() {
    if (this.noteBookKey === '') {
      return;
    }
    this.inspectRoot();
  },
};
</script>

<style scoped>
.note-management-tree-panel-container {
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
