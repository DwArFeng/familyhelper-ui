<template>
  <div class="activity-data-management-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="320px"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="header-button"
            type="primary"
            :disabled="isActivityDataSetSelected || readonly"
            @click="handleShowNodeCreateDialogParent"
          >
            新建节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="isActivityDataSetSelected || readonly || treeItemSelected"
            @click="handleShowNodeCreateDialogChild"
          >
            新建子节点
          </el-button>
          <el-divider direction="vertical"/>
          <el-button
            class="header-button"
            type="primary"
            :disabled="isActivityDataSetSelected || readonly"
            @click="handleShowItemCreateDialogParent"
          >
            新建项目
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="isActivityDataSetSelected || readonly || treeItemSelected"
            @click="handleShowItemCreateDialogChild"
          >
            新建子项目
          </el-button>
          <el-divider direction="vertical"/>
          <activity-data-set-indicator
            mode="ACTIVITY_DATA_MANAGEMENT"
            @change="handleActivityDataSetChanged"
          />
        </div>
      </template>
      <template v-slot:west>
        <activity-data-tree-panel
          ref="activityDataTreePanel"
          :activity-data-set-key="parentSelection.activityDataSetId"
          :readonly="readonly"
          @onCurrentChanged="handleCurrentChanged"
          @onEntityDelete="handleEntityDelete"
        />
      </template>
      <template v-slot:default>
        <!--suppress JSUnresolvedReference -->
        <node-edit-panel
          v-show="treePanel.selection.data !== null && treePanel.selection.data.display_type===0"
          :node-id="nodeEditPanel.nodeId"
          :readonly="readonly"
          :upsc="nodeEditPanel.upsc"
          @onNodePropertyUpdated="handleNodePropertyUpdated"
        />
        <!--suppress JSUnresolvedReference -->
        <item-edit-panel
          v-show="treePanel.selection.data !== null && treePanel.selection.data.display_type===1"
          :item-id="itemEditPanel.itemId"
          :readonly="readonly"
          :upsc="itemEditPanel.upsc"
          @onItemPropertyUpdated="handleItemPropertyUpdated"
        />
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      create-title="创建节点"
      mode="CREATE"
      :visible.sync="nodeMaintainDialog.visible"
      :entity="nodeMaintainDialog.anchorEntity"
      :create-rules="nodeMaintainDialog.rules"
      :close-on-click-modal="false"
      :loading="nodeMaintainDialog.loading"
      @onEntityCreate="handleNodeCreate"
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
      create-title="创建项目"
      mode="CREATE"
      :visible.sync="itemMaintainDialog.visible"
      :entity="itemMaintainDialog.anchorEntity"
      :create-rules="itemMaintainDialog.rules"
      :close-on-click-modal="false"
      :loading="itemMaintainDialog.loading"
      @onEntityCreate="handleItemCreate"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="itemMaintainDialog.anchorEntity.name"
          placeholder="必填"
        />
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
import ActivityDataSetIndicator
from '@/views/items/life/activityDataSet/ActivityDataSetIndicator.vue';
import ActivityDataTreePanel
from '@/views/items/life/activityDataManagement/ActivityDataTreePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import NodeEditPanel from '@/views/items/life/activityDataManagement/NodeEditPanel.vue';
import ItemEditPanel from '@/views/items/life/activityDataManagement/ItemEditPanel.vue';

import {
  create as createNode,
  inspectDisp as inspectNode,
  remove as removeNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityDataNode';
import {
  create as createItem,
  inspectDisp as inspectItem,
  remove as removeItem,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityDataItem';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityDataManagement',
  components: {
    ItemEditPanel,
    NodeEditPanel,
    EntityMaintainDialog,
    ActivityDataTreePanel,
    ActivityDataSetIndicator,
    BorderLayoutPanel,
  },
  computed: {
    isActivityDataSetSelected() {
      return this.parentSelection.activityDataSetId === '';
    },
    readonly() {
      if (this.parentSelection.activityDataSet === null) {
        return true;
      }
      return this.parentSelection.activityDataSet.permission_level === 1;
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
        activityDataSetId: '',
        activityDataSet: null,
      },
      treePanel: {
        selection: {
          node: null,
          data: null,
        },
        appendChild: false,
      },
      nodeMaintainDialog: {
        loading: false,
        visible: false,
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
      },
      itemMaintainDialog: {
        loading: false,
        visible: false,
        anchorEntity: {
          long_id: '',
          node_long_id: '',
          name: '',
          remark: '',
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
        },
      },
      nodeEditPanel: {
        nodeId: '',
      },
      itemEditPanel: {
        itemId: '',
        upsc: 'ui_preference.pc.life.activity_data_management.item_edit_panel',
      },
    };
  },
  methods: {
    handleActivityDataSetChanged(activityDataSet) {
      const oldActivityDataSetId = this.parentSelection.activityDataSetId;
      if (activityDataSet === null) {
        this.parentSelection.activityDataSet = null;
        this.parentSelection.activityDataSetId = '';
      } else {
        this.parentSelection.activityDataSet = activityDataSet;
        this.parentSelection.activityDataSetId = activityDataSet.key.long_id;
      }
      if (oldActivityDataSetId === this.parentSelection.activityDataSetId) {
        return;
      }
      this.treePanel.selection.node = null;
      this.treePanel.selection.data = null;
      this.nodeEditPanel.nodeId = '';
      this.itemEditPanel.itemId = '';
    },
    handleCurrentChanged(node, data) {
      this.treePanel.selection.node = node;
      this.treePanel.selection.data = data;

      if (data === null) {
        this.nodeEditPanel.nodeId = '';
        this.itemEditPanel.itemId = '';
        return;
      }

      // noinspection JSUnresolvedReference
      if (data.display_type === 0) {
        this.nodeEditPanel.nodeId = data.key.long_id;
      } else {
        this.itemEditPanel.itemId = data.key.long_id;
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
    syncAnchorNode(activityDataNode) {
      this.nodeMaintainDialog.anchorEntity.long_id = activityDataNode.key.long_id;
      if (activityDataNode.parent_key === null) {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = '';
      } else {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = activityDataNode.parent_key.long_id;
      }
      this.nodeMaintainDialog.anchorEntity.name = activityDataNode.name;
      this.nodeMaintainDialog.anchorEntity.remark = activityDataNode.remark;
    },
    syncAnchorItem(activityDataItem) {
      this.itemMaintainDialog.anchorEntity.long_id = activityDataItem.key.long_id;
      if (activityDataItem.node_key === null) {
        this.itemMaintainDialog.anchorEntity.node_long_id = '';
      } else {
        this.itemMaintainDialog.anchorEntity.node_long_id = activityDataItem.node_key.long_id;
      }
      this.itemMaintainDialog.anchorEntity.name = activityDataItem.name;
      this.itemMaintainDialog.anchorEntity.remark = activityDataItem.remark;
    },
    handleNodeCreate() {
      this.nodeMaintainDialog.loading = true;
      resolveResponse(createNode(
        this.parentSelection.activityDataSetId,
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
            this.$refs.activityDataTreePanel.appendRootActivityDataNode(res);
          } else {
            const { node } = this.treePanel.selection;
            if (this.treePanel.appendChild) {
              this.$refs.activityDataTreePanel.appendActivityDataNode(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.activityDataTreePanel.insertActivityDataNodeAfter(node, res);
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
    handleItemCreate() {
      this.itemMaintainDialog.loading = true;
      resolveResponse(createItem(
        this.parentSelection.activityDataSetId,
        this.itemMaintainDialog.anchorEntity.node_long_id,
        this.itemMaintainDialog.anchorEntity.name,
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
            this.$refs.activityDataTreePanel.appendRootActivityDataItem(res);
          } else {
            const { node } = this.treePanel.selection;
            if (this.treePanel.appendChild) {
              this.$refs.activityDataTreePanel.appendActivityDataItem(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.activityDataTreePanel.insertActivityDataItemAfter(node, res);
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
    handleNodePropertyUpdated() {
      resolveResponse(inspectNode(this.nodeEditPanel.nodeId))
        .then((res) => {
          this.$refs.activityDataTreePanel.updateActivityDataNode(res);
        })
        .catch(() => {
        });
    },
    handleItemPropertyUpdated() {
      resolveResponse(inspectItem(this.itemEditPanel.itemId))
        .then((res) => {
          this.$refs.activityDataTreePanel.updateActivityDataItem(res);
        })
        .catch(() => {
        });
    },
    handleEntityDelete(node, entity, accept) {
      // noinspection JSUnresolvedReference
      if (entity.display_type === 0) {
        this.handleActivityDataNodeDelete(node, entity, accept);
      } else {
        this.handleActivityDataItemDelete(node, entity, accept);
      }
    },
    handleActivityDataNodeDelete(node, entity, accept) {
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
          if (entity.key.long_id === this.nodeEditPanel.nodeId) {
            this.nodeEditPanel.nodeId = '';
          }
        })
        .catch(() => {
        });
    },
    handleActivityDataItemDelete(node, entity, accept) {
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
          if (entity.key.long_id === this.itemEditPanel.itemId) {
            this.itemEditPanel.itemId = '';
          }
        })
        .catch(() => {
        });
    },
  },
};
</script>

<style scoped>
.activity-data-management-container {
  width: 100%;
  height: 100%;
}

.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
