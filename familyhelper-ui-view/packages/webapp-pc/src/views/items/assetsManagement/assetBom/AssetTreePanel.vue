<template>
  <div class="asset-tree-panel-container">
    <div class="placeholder" v-if="assetCatalogKey===''">
      请选择资产目录
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
  childForAssetCatalogRootDisp, childForParentDisp, childForAssetCatalogNameLikeDisp, pathFromRoot,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item';
import resolveResponse from '@/util/response';

export default {
  name: 'AssetBomTreePanel',
  components: { LazySearchTreePanel },
  props: {
    assetCatalogKey: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      validator(value) {
        return ['ASSET_BOM', 'GENERAL', 'DEFAULT', 'DRIVER_SETTING'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    assetCatalogKey(value) {
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
      // 如果 pattern 是空字符串，则接受空数组。
      if (pattern === '') {
        accept([]);
      }
      resolveResponse(childForAssetCatalogNameLikeDisp(this.assetCatalogKey, pattern, 0, 1000))
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    handleLoadRoot(accept) {
      resolveResponse(childForAssetCatalogRootDisp(this.assetCatalogKey, 0, 1000))
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
        .then(this.appendEntitiesProperties)
        .then((res) => {
          accept(res);
        });
    },
    appendEntitiesProperties(res) {
      const entities = [];
      res.data.forEach((entity) => {
        this.$set(entity, 'tree_node_key', entity.key.long_id);
        entities.push(entity);
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
    appendRoot(item) {
      this.appendEntityProperties(item);
      this.$refs.treePanel.appendRoot(item);
    },
    append(nodeRef, item) {
      this.appendEntityProperties(item);
      this.$refs.treePanel.append(nodeRef, item);
    },
    insertBefore(nodeRef, item) {
      this.appendEntityProperties(item);
      this.$refs.treePanel.insertBefore(nodeRef, item);
    },
    insertAfter(nodeRef, item) {
      this.appendEntityProperties(item);
      this.$refs.treePanel.insertAfter(nodeRef, item);
    },
    update(item) {
      this.appendEntityProperties(item);
      const node = this.$refs.treePanel.getNode(item);
      const { data } = node;
      this.syncEntity(data, item);
    },
    syncEntity(target, neoValue) {
      this.$set(target, 'name', neoValue.name);
      this.$set(target, 'remark', neoValue.remark);
    },
    remove(item) {
      this.appendEntityProperties(item);
      this.$refs.treePanel.remove(item);
    },
    appendEntityProperties(item) {
      this.$set(item, 'tree_node_key', item.key.long_id);
    },
  },
};
</script>

<style scoped>
.asset-tree-panel-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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

.button {
  padding: 7px;
}
</style>
