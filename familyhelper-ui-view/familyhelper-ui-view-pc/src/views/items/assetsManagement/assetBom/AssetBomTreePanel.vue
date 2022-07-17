<template>
  <div class="asset-bom-tree-panel-container">
    <el-input
      placeholder="请输入子项目的名称"
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
      v-loading="treeLoading"
      node-key="node_key"
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
      @onEntityDelete="handleEntityDelete"
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
    </tree-panel>
  </div>
</template>

<script>
import TreePanel from '@/components/layout/TreePanel.vue';

import resolveResponse from '@/util/response';
import { childForAssetCatalogRootDisp, childForParentDisp } from '@/api/assets/item';

export default {
  name: 'AssetBomTreePanel',
  components: { TreePanel },
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
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    assetCatalogKey(val) {
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
      resolveResponse(childForAssetCatalogRootDisp(this.assetCatalogKey, 0, 1000))
        .then(this.appendEntitiesNodeKey)
        .then((res) => {
          this.treeData = res.data;
        })
        .finally(() => {
          this.treeLoading = false;
        });
    },
    handleTreeSearch() {
      if (this.assetCatalogKey === '') {
        this.$message({
          showClose: true,
          message: '请先选择资产目录！',
          type: 'warning',
          center: true,
        });
        return;
      }
      if (this.itemNameToSearch === '') {
        this.treeData = [];
        this.inspectRoot();
      }
    },
    handleLoad(node, resolve) {
      if (node.level === 0) {
        return;
      }

      const item = node.data;
      resolveResponse(childForParentDisp(item.key.long_id, 0, 1000))
        .then(this.appendEntitiesNodeKey)
        .then((res) => {
          resolve(res.data);
        });
    },
    appendEntitiesNodeKey(res) {
      res.data.forEach((item) => {
        this.$set(item, 'node_key', item.key.long_id);
      });
      return Promise.resolve(res);
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
      this.appendItemNodeKey(item);
      this.treeData.push(item);
    },
    append(nodeRef, item) {
      this.appendItemNodeKey(item);
      this.$refs.treePanel.append(nodeRef, item);
    },
    insertBefore(nodeRef, item) {
      this.appendItemNodeKey(item);
      this.$refs.treePanel.insertBefore(nodeRef, item);
    },
    insertAfter(nodeRef, item) {
      this.appendItemNodeKey(item);
      this.$refs.treePanel.insertAfter(nodeRef, item);
    },
    update(item) {
      this.appendItemNodeKey(item);
      const node = this.$refs.treePanel.getNode(item);
      this.$set(node, 'data', item);
    },
    remove(item) {
      this.appendItemNodeKey(item);
      this.$refs.treePanel.remove(item);
    },
    appendItemNodeKey(item) {
      this.$set(item, 'node_key', item.key.long_id);
    },
  },
  mounted() {
    if (this.assetCatalogKey === '') {
      return;
    }
    this.inspectRoot();
  },
};
</script>

<style scoped>
.asset-bom-tree-panel-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.item-search-panel {
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
</style>
