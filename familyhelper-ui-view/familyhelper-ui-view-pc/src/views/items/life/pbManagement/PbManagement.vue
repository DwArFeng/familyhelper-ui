<template>
  <div class="pb-management-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="350px"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="header-button"
            type="primary"
            :disabled="noPbSetSelected || readOnly"
            @click="handleShowNodeCreateDialogParent"
          >
            新建节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="noPbSetSelected || readOnly || treeItemSelected"
            @click="handleShowNodeCreateDialogChild"
          >
            新建子节点
          </el-button>
          <el-divider direction="vertical"/>
          <el-button
            class="header-button"
            type="primary"
            :disabled="noPbSetSelected || readOnly"
            @click="handleShowItemCreateDialogParent"
          >
            新建项目
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="noPbSetSelected || readOnly || treeItemSelected"
            @click="handleShowItemCreateDialogChild"
          >
            新建子项目
          </el-button>
          <el-divider direction="vertical"/>
          <pb-set-indicator mode="PB_MANAGEMENT" @change="handlePbSetChanged"/>
        </div>
      </template>
      <template v-slot:west>
        <pb-tree-panel
          ref="pbManagementTreePanel"
          :pb-set-key="parentSelection.pbSetId"
          :read-only="readOnly"
          @onCurrentChanged="handleCurrentChanged"
          @onEntityDelete="handleEntityDelete"
        />
      </template>
      <template v-slot:default>
        <div class="placeholder" v-if="treePanel.selection.data === null">
          请选择节点或项目
        </div>
        <!--suppress JSUnresolvedReference -->
        <el-tabs
          class="asset-tabs"
          tab-position="left"
          v-model="nodeTabs.activeName"
          v-else-if="treePanel.selection.data.display_type===0"
        >
          <el-tab-pane label="概览" name="overlook">
            <node-overlook-panel
              ref="nodeOverlookPanel"
              :node-id="nodeTabs.nodeId"
              :read-only="readOnly"
              @onNodeEdit="handleShowNodeEditDialog"
            />
          </el-tab-pane>
        </el-tabs>
        <el-tabs
          class="asset-tabs"
          tab-position="left"
          v-model="itemTabs.activeName"
          v-else
        >
          <el-tab-pane label="概览" name="overlook">
            <item-overlook-panel
              ref="itemOverlookPanel"
              :item-id="itemTabs.itemId"
              :read-only="readOnly"
              @onItemEdit="handleShowItemEditDialog"
            />
          </el-tab-pane>
          <el-tab-pane label="记录" name="record">
            <item-record-panel
              :item-id="itemTabs.itemId"
              :read-only="readOnly"
              @onContextChanged="handleRecordContextChanged"
            />
          </el-tab-pane>
        </el-tabs>
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      inspect-title="查看节点"
      create-title="创建节点"
      edit-title="编辑节点"
      :visible.sync="nodeMaintainDialog.visible"
      :mode="nodeMaintainDialog.mode"
      :entity="nodeMaintainDialog.anchorEntity"
      :create-rules="nodeMaintainDialog.rules"
      :edit-rules="nodeMaintainDialog.rules"
      :close-on-click-modal="false"
      :loading="nodeMaintainDialog.loading"
      @onEntityCreate="handleNodeCreate"
      @onEntityEdit="handleNodeEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="nodeMaintainDialog.anchorEntity.name"
          placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="nodeMaintainDialog.anchorEntity.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <entity-maintain-dialog
      label-width="100px"
      inspect-title="查看项目"
      create-title="创建项目"
      edit-title="编辑项目"
      :visible.sync="itemMaintainDialog.visible"
      :mode="itemMaintainDialog.mode"
      :entity="itemMaintainDialog.anchorEntity"
      :create-rules="itemMaintainDialog.rules"
      :edit-rules="itemMaintainDialog.rules"
      :close-on-click-modal="false"
      :loading="itemMaintainDialog.loading"
      @onEntityCreate="handleItemCreate"
      @onEntityEdit="handleItemEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="itemMaintainDialog.anchorEntity.name"
          placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input
          v-model="itemMaintainDialog.anchorEntity.unit"
          placeholder="数据单位"
        />
      </el-form-item>
      <el-form-item label="比较" prop="comparator">
        <el-select
          class='asset-bom-select'
          v-model="itemMaintainDialog.anchorEntity.comparator"
          placeholder="请选择"
        >
          <el-option
            v-for="option in comparatorOptions"
            :key="option.key"
            :label="option.label"
            :value="option.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="itemMaintainDialog.anchorEntity.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import PbSetIndicator from '@/views/items/life/pbSet/PbSetIndicator.vue';
import PbTreePanel from '@/views/items/life/pbManagement/PbTreePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import NodeOverlookPanel from '@/views/items/life/pbManagement/NodeOverlookPanel.vue';
import ItemOverlookPanel from '@/views/items/life/pbManagement/ItemOverlookPanel.vue';
import ItemRecordPanel from '@/views/items/life/pbManagement/ItemRecordPanel.vue';

import {
  create as createNode, inspectDisp as inspectNode, update as updateNode, remove as removeNode,
} from '@/api/life/pbNode';
import {
  create as createItem, inspectDisp as inspectItem, update as updateItem, remove as removeItem,
} from '@/api/life/pbItem';
import resolveResponse from '@/util/response';

export default {
  name: 'PbManagement',
  components: {
    ItemRecordPanel,
    ItemOverlookPanel,
    NodeOverlookPanel,
    EntityMaintainDialog,
    PbTreePanel,
    PbSetIndicator,
    BorderLayoutPanel,
  },
  computed: {
    noPbSetSelected() {
      return this.parentSelection.pbSetId === '';
    },
    readOnly() {
      if (this.parentSelection.pbSet === null) {
        return true;
      }
      return this.parentSelection.pbSet.permission_level === 1;
    },
    treeItemSelected() {
      const { data } = this.treePanel.selection;
      if (data === null) {
        return false;
      }
      // noinspection JSUnresolvedReference
      return data.display_type === 1;
    },
  },
  data() {
    return {
      parentSelection: {
        pbSetId: '',
        pbSet: null,
      },
      treePanel: {
        selection: {
          node: null,
          data: null,
        },
        appendChild: false,
      },
      nodeMaintainDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          long_id: '',
          parent_long_id: '',
          name: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
        },
        loading: false,
      },
      itemMaintainDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          long_id: '',
          node_long_id: '',
          name: '',
          unit: '',
          comparator: 0,
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
        },
        loading: false,
      },
      comparatorOptions: [
        { key: 0, label: '越高越好' },
        { key: 1, label: '越低越好' },
      ],
      nodeTabs: {
        activeName: 'overlook',
        nodeId: '',
      },
      itemTabs: {
        activeName: 'overlook',
        itemId: '',
      },
    };
  },
  methods: {
    handlePbSetChanged(pbSet) {
      this.parentSelection.pbSet = pbSet;
      this.parentSelection.pbSetId = pbSet.key.long_id;
    },
    handleCurrentChanged(node, data) {
      this.treePanel.selection.node = node;
      this.treePanel.selection.data = data;

      if (data === null) {
        this.nodeTabs.nodeId = '';
        this.itemTabs.itemId = '';
        return;
      }

      // noinspection JSUnresolvedReference
      if (data.display_type === 0) {
        this.nodeTabs.nodeId = data.key.long_id;
      } else {
        this.itemTabs.itemId = data.key.long_id;
      }
      this.syncAnchorEntity(data);
    },
    handleShowNodeCreateDialogParent() {
      this.treePanel.appendChild = false;
      // noinspection JSIncompatibleTypesComparison
      if (this.treePanel.selection.data === null) {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = '';
      } else if (this.treeItemSelected) {
        if (this.treePanel.selection.data.node_key === null) {
          this.nodeMaintainDialog.anchorEntity.parent_long_id = '';
        } else {
          this.nodeMaintainDialog.anchorEntity.parent_long_id = this
            .treePanel.selection.data.node_key.long_id;
        }
      } else if (this.treePanel.selection.data.parent_key === null) {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = '';
      } else {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = this
          .treePanel.selection.data.parent_key.long_id;
      }
      this.showNodeDialog('CREATE');
    },
    handleShowNodeCreateDialogChild() {
      this.treePanel.appendChild = true;
      this.nodeMaintainDialog.anchorEntity.parent_long_id = this.treePanel.selection.data.key
        .long_id;
      this.showNodeDialog('CREATE');
    },
    handleShowNodeEditDialog() {
      this.showNodeDialog('EDIT');
    },
    handleShowItemCreateDialogParent() {
      this.treePanel.appendChild = false;
      // noinspection JSIncompatibleTypesComparison
      if (this.treePanel.selection.data === null) {
        this.itemMaintainDialog.anchorEntity.node_long_id = '';
      } else if (this.treeItemSelected) {
        if (this.treePanel.selection.data.node_key === null) {
          this.itemMaintainDialog.anchorEntity.node_long_id = '';
        } else {
          this.itemMaintainDialog.anchorEntity.node_long_id = this
            .treePanel.selection.data.node_key.long_id;
        }
      } else if (this.treePanel.selection.data.parent_key === null) {
        this.itemMaintainDialog.anchorEntity.node_long_id = '';
      } else {
        this.itemMaintainDialog.anchorEntity.node_long_id = this
          .treePanel.selection.data.parent_key.long_id;
      }
      this.showItemDialog('CREATE');
    },
    handleShowItemCreateDialogChild() {
      this.treePanel.appendChild = true;
      this.itemMaintainDialog.anchorEntity.node_long_id = this.treePanel.selection.data.key
        .long_id;
      this.showItemDialog('CREATE');
    },
    handleShowItemEditDialog() {
      this.showItemDialog('EDIT');
    },
    showNodeDialog(mode) {
      this.nodeMaintainDialog.mode = mode;
      this.nodeMaintainDialog.visible = true;
    },
    showItemDialog(mode) {
      this.itemMaintainDialog.mode = mode;
      this.itemMaintainDialog.visible = true;
    },
    syncAnchorEntity(entity) {
      // noinspection JSUnresolvedReference
      if (entity.display_type === 0) {
        this.syncAnchorNode(entity);
      } else {
        this.syncAnchorItem(entity);
      }
    },
    syncAnchorNode(pbNode) {
      this.nodeMaintainDialog.anchorEntity.long_id = pbNode.key.long_id;
      if (pbNode.parent_key === null) {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = '';
      } else {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = pbNode.parent_key.long_id;
      }
      this.nodeMaintainDialog.anchorEntity.name = pbNode.name;
      this.nodeMaintainDialog.anchorEntity.remark = pbNode.remark;
    },
    syncAnchorItem(pbItem) {
      this.itemMaintainDialog.anchorEntity.long_id = pbItem.key.long_id;
      if (pbItem.node_key === null) {
        this.itemMaintainDialog.anchorEntity.node_long_id = '';
      } else {
        this.itemMaintainDialog.anchorEntity.node_long_id = pbItem.node_key.long_id;
      }
      this.itemMaintainDialog.anchorEntity.name = pbItem.name;
      this.itemMaintainDialog.anchorEntity.unit = pbItem.unit;
      this.itemMaintainDialog.anchorEntity.comparator = pbItem.comparator;
      this.itemMaintainDialog.anchorEntity.remark = pbItem.remark;
    },
    handleNodeCreate() {
      this.nodeMaintainDialog.loading = true;
      resolveResponse(createNode(
        this.parentSelection.pbSetId,
        this.nodeMaintainDialog.anchorEntity.parent_long_id,
        this.nodeMaintainDialog.anchorEntity.name,
        this.nodeMaintainDialog.anchorEntity.remark,
      ))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `节点 ${this.nodeMaintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
          return res;
        })
        .then((res) => resolveResponse(inspectNode(res.long_id)))
        .then((res) => {
          const parentId = this.nodeMaintainDialog.anchorEntity.parent_long_id;
          if (parentId === '') {
            this.$refs.pbManagementTreePanel.appendRootPbNode(res);
          } else {
            const { node } = this.treePanel.selection;
            if (this.treePanel.appendChild) {
              this.$refs.pbManagementTreePanel.appendPbNode(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.pbManagementTreePanel.insertPbNodeAfter(node, res);
            }
          }
          this.nodeMaintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.nodeMaintainDialog.loading = false;
        });
    },
    handleNodeEdit() {
      this.nodeMaintainDialog.loading = true;
      resolveResponse(updateNode(
        this.nodeMaintainDialog.anchorEntity.long_id,
        this.nodeMaintainDialog.anchorEntity.parent_long_id,
        this.nodeMaintainDialog.anchorEntity.name,
        this.nodeMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `节点 ${this.nodeMaintainDialog.anchorEntity.name} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => resolveResponse(inspectNode(this.nodeMaintainDialog.anchorEntity.long_id)))
        .then((res) => {
          this.$refs.pbManagementTreePanel.updatePbNode(res);
          this.$refs.nodeOverlookPanel.updateView();
          this.nodeMaintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.nodeMaintainDialog.loading = false;
        });
    },
    handleItemCreate() {
      this.itemMaintainDialog.loading = true;
      resolveResponse(createItem(
        this.parentSelection.pbSetId,
        this.itemMaintainDialog.anchorEntity.node_long_id,
        this.itemMaintainDialog.anchorEntity.name,
        this.itemMaintainDialog.anchorEntity.unit,
        this.itemMaintainDialog.anchorEntity.comparator,
        this.itemMaintainDialog.anchorEntity.remark,
      ))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `项目 ${this.itemMaintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
          return res;
        })
        .then((res) => resolveResponse(inspectItem(res.long_id)))
        .then((res) => {
          const nodeId = this.itemMaintainDialog.anchorEntity.node_long_id;
          if (nodeId === '') {
            this.$refs.pbManagementTreePanel.appendRootPbItem(res);
          } else {
            const { node } = this.treePanel.selection;
            if (this.treePanel.appendChild) {
              this.$refs.pbManagementTreePanel.appendPbItem(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.pbManagementTreePanel.insertPbItemAfter(node, res);
            }
          }
          this.itemMaintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.itemMaintainDialog.loading = false;
        });
    },
    handleItemEdit() {
      this.itemMaintainDialog.loading = true;
      resolveResponse(updateItem(
        this.itemMaintainDialog.anchorEntity.long_id,
        this.itemMaintainDialog.anchorEntity.node_long_id,
        this.itemMaintainDialog.anchorEntity.name,
        this.itemMaintainDialog.anchorEntity.unit,
        this.itemMaintainDialog.anchorEntity.comparator,
        this.itemMaintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `项目 ${this.itemMaintainDialog.anchorEntity.name} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => resolveResponse(inspectItem(this.itemMaintainDialog.anchorEntity.long_id)))
        .then((res) => {
          this.$refs.pbManagementTreePanel.updatePbItem(res);
          this.$refs.itemOverlookPanel.updateView();
          this.itemMaintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.itemMaintainDialog.loading = false;
        });
    },
    handleEntityDelete(node, entity, accept) {
      // noinspection JSUnresolvedReference
      if (entity.display_type === 0) {
        this.handlePbNodeDelete(node, entity, accept);
      } else {
        this.handlePbItemDelete(node, entity, accept);
      }
    },
    handlePbNodeDelete(node, entity, accept) {
      this.$confirm('此操作将永久删除此节点，此节点的子节点将会一同被删除。<br>'
        + '<b>此操作不可恢复</b><br>'
        + '是否继续?',
      '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(removeNode(entity.key.long_id)))
        .then(() => {
          accept();
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: `节点 ${entity.name} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        });
    },
    handlePbItemDelete(node, entity, accept) {
      this.$confirm('此操作将永久删除此项目。<br>'
        + '<b>此操作不可恢复</b><br>'
        + '是否继续?',
      '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(removeItem(entity.key.long_id)))
        .then(() => {
          accept();
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: `项目 ${entity.name} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        });
    },
    handleRecordContextChanged() {
      this.$refs.itemOverlookPanel.updateView();
    },
  },
};
</script>

<style scoped>
.pb-management-container {
  height: 100%;
  width: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
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

.asset-tabs {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.asset-tabs >>> .el-tabs__content {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.asset-tabs >>> .el-tab-pane {
  height: 100%;
}
</style>
