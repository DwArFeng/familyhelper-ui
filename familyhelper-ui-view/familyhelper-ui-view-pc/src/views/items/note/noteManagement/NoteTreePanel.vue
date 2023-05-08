<template>
  <div class="note-tree-panel">
    <div class="placeholder" v-if="noteBookKey===''">
      请选择笔记本
    </div>
    <div class="main-container" v-else>
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
        :edit-button-visible="false"
        :delete-button-visible="false"
        :operate-area-visible="!readonly"
        @onCurrentChanged="handleCurrentChanged"
      >
        <template v-slot:default="{data}">
          <div class="item-container">
            <div class="icon-wrapper"><i class="iconfont">{{ iconValue(data) }}</i></div>
            <!--suppress JSUnresolvedReference -->
            <div class="label">{{ data.name }}</div>
          </div>
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
      </lazy-search-tree-panel>
    </div>
  </div>
</template>

<script>
import LazySearchTreePanel from '@/components/layout/LazySearchTreePanel.vue';

import {
  childForNoteBookNameLikeDisp as childNodeForNoteBookNameLike,
  childForNoteBookRootDisp as childNodeForNoteBookRoot,
  childForParentDisp as childNodeForParent,
  nodePathFromRootDisp as nodePathFromRoot,
  itemPathFromRootDisp as itemPathFromRoot,
} from '@/api/note/noteNode';
import {
  childForNoteBookNameLikeDisp as childItemForNoteNodeNameLike,
  childForNoteBookRootDisp as childItemForNoteBookRoot,
  childForNoteNodeDisp as childItemForNoteNode,
} from '@/api/note/noteItem';
import resolveResponse from '@/util/response';

export default {
  name: 'NoteTreePanel',
  components: { LazySearchTreePanel },
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
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconValue() {
      return (entity) => {
        // noinspection JSUnresolvedReference
        if (entity.display_type === 0) {
          return '\uffd6';
        }
        return '\uffd7';
      };
    },
  },
  watch: {
    noteBookKey(value) {
      if (value !== '') {
        const { treePanel } = this.$refs;
        if (treePanel) {
          treePanel.refresh();
        }
      }
    },
  },
  methods: {
    handleSearchOption(pattern, accept) {
      // 如果 noteBookKey 为空字符串，则接受空数组。
      if (this.noteBookKey === '') {
        accept([]);
        return;
      }
      // 如果 pattern 是空字符串，则接受空数组。
      if (pattern === '') {
        accept([]);
        return;
      }
      const nodePromise = resolveResponse(
        childNodeForNoteBookNameLike(this.noteBookKey, pattern, 0, 10),
      );
      const itemPromise = resolveResponse(
        childItemForNoteNodeNameLike(this.noteBookKey, pattern, 0, 10),
      );
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleLoadRoot(accept) {
      // 如果 noteBookKey 为空字符串，则接受空数组。
      if (this.noteBookKey === '') {
        accept([]);
        return;
      }
      // 查询笔记本的根节点和根项目。
      const nodePromise = resolveResponse(childNodeForNoteBookRoot(this.noteBookKey, 0, 1000));
      const itemPromise = resolveResponse(childItemForNoteBookRoot(this.noteBookKey, 0, 1000));
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleLoadChild(key, accept) {
      // 如果 noteBookKey 为空字符串，则接受空数组。
      if (this.noteBookKey === '') {
        accept([]);
        return;
      }
      // 如果 key 以 '1_' 开头，说明是项目，没有子节点，接受空数组。
      if (key.startsWith('1_')) {
        accept([]);
        return;
      }
      // 去除 key 中的前缀。
      const longId = key.substring(2);
      // 查询节点的子节点和子项目。
      const nodePromise = resolveResponse(childNodeForParent(longId, 0, 1000));
      const itemPromise = resolveResponse(childItemForNoteNode(longId, 0, 1000));
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleQueryPath(key, accept) {
      // 如果 noteBookKey 为空字符串，则接受空数组。
      if (this.noteBookKey === '') {
        accept([]);
        return;
      }
      // 判断 key 的类型，分别调用不同的接口。
      //   如果 key 以 '0_' 开头，说明是笔记节点，调用笔记节点的路径查询接口。
      //   如果 key 以 '1_' 开头，说明是笔记项目，调用笔记项目的路径查询接口。
      let promise;
      if (key.startsWith('0_')) {
        promise = resolveResponse(nodePathFromRoot(key.substring(2)));
      } else {
        promise = resolveResponse(itemPathFromRoot(key.substring(2)));
      }
      promise.then((res) => {
        const entities = [];
        res.data.forEach((noteNode) => {
          this.$set(noteNode, 'tree_node_key', `0_${noteNode.key.long_id}`);
          this.$set(noteNode, 'display_type', 0);
          entities.push(noteNode);
        });
        accept(entities);
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
    appendRootNoteNode(noteNode) {
      this.appendNoteNodeProperties(noteNode);
      this.$refs.treePanel.appendRoot(noteNode);
    },
    appendRootNoteItem(noteItem) {
      this.appendNoteItemProperties(noteItem);
      this.$refs.treePanel.appendRoot(noteItem);
    },
    appendNoteNode(nodeRef, noteNode) {
      this.appendNoteNodeProperties(noteNode);
      this.$refs.treePanel.append(nodeRef, noteNode);
    },
    appendNoteItem(nodeRef, noteItem) {
      this.appendNoteItemProperties(noteItem);
      this.$refs.treePanel.append(nodeRef, noteItem);
    },
    insertNoteNodeAfter(nodeRef, noteNode) {
      this.appendNoteNodeProperties(noteNode);
      this.$refs.treePanel.insertAfter(nodeRef, noteNode);
    },
    insertNoteItemAfter(nodeRef, noteItem) {
      this.appendNoteItemProperties(noteItem);
      this.$refs.treePanel.insertAfter(nodeRef, noteItem);
    },
    updateNoteNode(noteNode) {
      this.appendNoteNodeProperties(noteNode);
      const node = this.$refs.treePanel.getNode(noteNode);
      const { data } = node;
      this.syncNoteNode(data, noteNode);
    },
    syncNoteNode(target, neoValue) {
      this.$set(target, 'name', neoValue.name);
      this.$set(target, 'remark', neoValue.remark);
      this.$set(target, 'has_no_child', neoValue.has_no_child);
    },
    updateNoteItem(noteItem) {
      this.appendNoteItemProperties(noteItem);
      const item = this.$refs.treePanel.getNode(noteItem);
      const { data } = item;
      this.syncNoteItem(data, noteItem);
    },
    syncNoteItem(target, neoValue) {
      this.$set(target, 'name', neoValue.name);
      this.$set(target, 'remark', neoValue.remark);
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
};
</script>

<style scoped>
.note-tree-panel {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #BFBFBF;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
}

.item-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.button {
  padding: 7px;
}

.label {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

.icon-wrapper {
  margin-right: 5px;
}

.icon-wrapper .iconfont {
  font-size: 18px;
}
</style>
