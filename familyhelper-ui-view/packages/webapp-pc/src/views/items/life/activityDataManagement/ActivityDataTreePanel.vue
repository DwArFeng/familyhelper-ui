<template>
  <div class="activity-data-tree-panel">
    <div class="placeholder" v-if="activityDataSetKey===''">
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
  childForActivityDataSetNameLikeDisp as childNodeForActivityDataSetNameLike,
  childForActivityDataSetRootDisp as childNodeForActivityDataSetRoot,
  childForParentDisp as childNodeForParent,
  nodePathFromRootDisp as nodePathFromRoot,
  itemPathFromRootDisp as itemPathFromRoot,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityDataNode';
import {
  childForActivityDataSetNameLikeDisp as childItemForActivityDataNodeNameLike,
  childForActivityDataSetRootDisp as childItemForActivityDataSetRoot,
  childForActivityDataNodeDisp as childItemForActivityDataNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityDataItem';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityDataTreePanel',
  components: { LazySearchTreePanel },
  props: {
    activityDataSetKey: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      validator(value) {
        return ['ACTIVITY_DATA_MANAGEMENT', 'DEFAULT'].indexOf(value) !== -1;
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
    activityDataSetKey(value) {
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
      // 如果 activityDataSetKey 为空字符串，则接受空数组。
      if (this.activityDataSetKey === '') {
        accept([]);
        return;
      }
      // 如果 pattern 是空字符串，则接受空数组。
      if (pattern === '') {
        accept([]);
        return;
      }
      const nodePromise = resolveResponse(
        childNodeForActivityDataSetNameLike(this.activityDataSetKey, pattern, 0, 10),
      );
      const itemPromise = resolveResponse(
        childItemForActivityDataNodeNameLike(this.activityDataSetKey, pattern, 0, 10),
      );
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleLoadRoot(accept) {
      // 如果 activityDataSetKey 为空字符串，则接受空数组。
      if (this.activityDataSetKey === '') {
        accept([]);
        return;
      }
      // 查询笔记本的根节点和根项目。
      const nodePromise = resolveResponse(childNodeForActivityDataSetRoot(
        this.activityDataSetKey, 0, 1000,
      ));
      const itemPromise = resolveResponse(childItemForActivityDataSetRoot(
        this.activityDataSetKey, 0, 1000,
      ));
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleLoadChild(key, accept) {
      // 如果 activityDataSetKey 为空字符串，则接受空数组。
      if (this.activityDataSetKey === '') {
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
      const itemPromise = resolveResponse(childItemForActivityDataNode(longId, 0, 1000));
      Promise.all([nodePromise, itemPromise])
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleQueryPath(key, accept) {
      // 如果 activityDataSetKey 为空字符串，则接受空数组。
      if (this.activityDataSetKey === '') {
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
        res.data.forEach((activityDataNode) => {
          this.$set(activityDataNode, 'tree_node_key', `0_${activityDataNode.key.long_id}`);
          this.$set(activityDataNode, 'display_type', 0);
          entities.push(activityDataNode);
        });
        accept(entities);
      });
    },
    appendEntitiesProperties(res) {
      const entities = [];
      res[0].data.forEach((activityDataNode) => {
        this.$set(activityDataNode, 'tree_node_key', `0_${activityDataNode.key.long_id}`);
        this.$set(activityDataNode, 'display_type', 0);
        entities.push(activityDataNode);
      });
      res[1].data.forEach((activityDataItem) => {
        this.$set(activityDataItem, 'tree_node_key', `1_${activityDataItem.key.long_id}`);
        this.$set(activityDataItem, 'display_type', 1);
        this.$set(activityDataItem, 'has_no_child', true);
        entities.push(activityDataItem);
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
    appendRootActivityDataNode(activityDataNode) {
      this.appendActivityDataNodeProperties(activityDataNode);
      this.$refs.treePanel.appendRoot(activityDataNode);
    },
    appendRootActivityDataItem(activityDataItem) {
      this.appendActivityDataItemProperties(activityDataItem);
      this.$refs.treePanel.appendRoot(activityDataItem);
    },
    appendActivityDataNode(nodeRef, activityDataNode) {
      this.appendActivityDataNodeProperties(activityDataNode);
      this.$refs.treePanel.append(nodeRef, activityDataNode);
    },
    appendActivityDataItem(nodeRef, activityDataItem) {
      this.appendActivityDataItemProperties(activityDataItem);
      this.$refs.treePanel.append(nodeRef, activityDataItem);
    },
    insertActivityDataNodeAfter(nodeRef, activityDataNode) {
      this.appendActivityDataNodeProperties(activityDataNode);
      this.$refs.treePanel.insertAfter(nodeRef, activityDataNode);
    },
    insertActivityDataItemAfter(nodeRef, activityDataItem) {
      this.appendActivityDataItemProperties(activityDataItem);
      this.$refs.treePanel.insertAfter(nodeRef, activityDataItem);
    },
    updateActivityDataNode(activityDataNode) {
      this.appendActivityDataNodeProperties(activityDataNode);
      const node = this.$refs.treePanel.getNode(activityDataNode);
      const { data } = node;
      this.syncActivityDataNode(data, activityDataNode);
    },
    syncActivityDataNode(target, neoValue) {
      this.$set(target, 'name', neoValue.name);
      this.$set(target, 'remark', neoValue.remark);
      this.$set(target, 'has_no_child', neoValue.has_no_child);
    },
    updateActivityDataItem(activityDataItem) {
      this.appendActivityDataItemProperties(activityDataItem);
      const item = this.$refs.treePanel.getNode(activityDataItem);
      const { data } = item;
      this.syncActivityDataItem(data, activityDataItem);
    },
    syncActivityDataItem(target, neoValue) {
      this.$set(target, 'name', neoValue.name);
      this.$set(target, 'remark', neoValue.remark);
    },
    appendActivityDataNodeProperties(activityDataNode) {
      this.$set(activityDataNode, 'tree_node_key', `0_${activityDataNode.key.long_id}`);
      this.$set(activityDataNode, 'display_type', 0);
    },
    appendActivityDataItemProperties(activityDataItem) {
      this.$set(activityDataItem, 'tree_node_key', `1_${activityDataItem.key.long_id}`);
      this.$set(activityDataItem, 'display_type', 1);
      this.$set(activityDataItem, 'has_no_child', true);
    },
  },
};
</script>

<style scoped>
.activity-data-tree-panel {
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
