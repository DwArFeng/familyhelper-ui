<template>
  <div class="note-management-container">
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
            :disabled="nonNoteBookSelected || readonly"
            @click="handleShowNodeCreateDialogParent"
          >
            新建节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonNoteBookSelected || readonly || nonNodeSelected"
            @click="handleShowNodeCreateDialogChild"
          >
            新建子节点
          </el-button>
          <el-divider direction="vertical"/>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonNoteBookSelected || readonly"
            @click="handleShowItemCreateDialogParent"
          >
            新建项目
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="nonNoteBookSelected || readonly || nonNodeSelected"
            @click="handleShowItemCreateDialogChild"
          >
            新建子项目
          </el-button>
          <el-divider direction="vertical"/>
          <note-book-indicator mode="NOTE_MANAGEMENT" @change="handleNoteBookChanged"/>
        </div>
      </template>
      <template v-slot:west>
        <note-tree-panel
          ref="noteTreePanel"
          :note-book-key="parentSelection.noteBookId"
          :readonly="readonly"
          @onCurrentChanged="handleCurrentChanged"
          @onEntityDelete="handleEntityDelete"
        />
      </template>
      <template v-slot:default>
        <div class="placeholder" v-show="treePanel.selection.data === null">
          请选择节点或项目
        </div>
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
import NoteBookIndicator from '@/views/items/note/noteBook/NoteBookIndicator.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import ItemEditPanel from '@/views/items/note/noteManagement/ItemEditPanel.vue';
import NodeEditPanel from '@/views/items/note/noteManagement/NodeEditPanel.vue';

import {
  create as createNode,
  inspectDisp as inspectNode,
  remove as removeNode,
} from '@/api/note/noteNode';
import {
  create as createItem,
  inspectDisp as inspectItem,
  remove as removeItem,
} from '@/api/note/noteItem';
import resolveResponse from '@/util/response';
import NoteTreePanel from '@/views/items/note/noteManagement/NoteTreePanel.vue';

export default {
  name: 'NoteManagement',
  components: {
    NoteTreePanel,
    NodeEditPanel,
    ItemEditPanel,
    EntityMaintainDialog,
    NoteBookIndicator,
    BorderLayoutPanel,
  },
  computed: {
    nonNoteBookSelected() {
      return this.parentSelection.noteBookId === '';
    },
    readonly() {
      if (this.parentSelection.noteBook === null) {
        return true;
      }
      return this.parentSelection.noteBook.permission_level === 1;
    },
    nonNodeSelected() {
      const { data } = this.treePanel.selection;
      if (!data) {
        return true;
      }
      // noinspection JSUnresolvedReference
      return data.display_type !== 0;
    },
    treeItemSelected() {
      const { data } = this.treePanel.selection;
      if (!data === null) {
        return false;
      }
      // noinspection JSUnresolvedReference
      return data.display_type === 1;
    },
  },
  data() {
    return {
      parentSelection: {
        noteBookId: '',
        noteBook: null,
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
      comparatorOptions: [
        { key: 0, label: '越高越好' },
        { key: 1, label: '越低越好' },
      ],
      nodeEditPanel: {
        nodeId: '',
      },
      itemEditPanel: {
        itemId: '',
        upsc: 'ui_preference.pc.note.note_management.item_edit_panel',
      },
    };
  },
  methods: {
    handleNoteBookChanged(noteBook) {
      const oldNoteBookId = this.parentSelection.noteBookId;
      if (noteBook === null) {
        this.parentSelection.noteBook = null;
        this.parentSelection.noteBookId = '';
      } else {
        this.parentSelection.noteBook = noteBook;
        this.parentSelection.noteBookId = noteBook.key.long_id;
      }
      if (oldNoteBookId === this.parentSelection.noteBookId) {
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
    syncAnchorNode(noteNode) {
      this.nodeMaintainDialog.anchorEntity.long_id = noteNode.key.long_id;
      if (noteNode.parent_key === null) {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = '';
      } else {
        this.nodeMaintainDialog.anchorEntity.parent_long_id = noteNode.parent_key.long_id;
      }
      this.nodeMaintainDialog.anchorEntity.name = noteNode.name;
      this.nodeMaintainDialog.anchorEntity.remark = noteNode.remark;
    },
    syncAnchorItem(noteItem) {
      this.itemMaintainDialog.anchorEntity.long_id = noteItem.key.long_id;
      if (noteItem.node_key === null) {
        this.itemMaintainDialog.anchorEntity.node_long_id = '';
      } else {
        this.itemMaintainDialog.anchorEntity.node_long_id = noteItem.node_key.long_id;
      }
      this.itemMaintainDialog.anchorEntity.name = noteItem.name;
      this.itemMaintainDialog.anchorEntity.remark = noteItem.remark;
    },
    handleNodeCreate() {
      this.nodeMaintainDialog.loading = true;
      resolveResponse(createNode(
        this.parentSelection.noteBookId,
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
            this.$refs.noteTreePanel.appendRootNoteNode(res);
          } else {
            const { node } = this.treePanel.selection;
            if (this.treePanel.appendChild) {
              this.$refs.noteTreePanel.appendNoteNode(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.noteTreePanel.insertNoteNodeAfter(node, res);
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
        this.parentSelection.noteBookId,
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
            this.$refs.noteTreePanel.appendRootNoteItem(res);
          } else {
            const { node } = this.treePanel.selection;
            if (this.treePanel.appendChild) {
              this.$refs.noteTreePanel.appendNoteItem(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.noteTreePanel.insertNoteItemAfter(node, res);
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
          this.$refs.noteTreePanel.updateNoteNode(res);
        })
        .catch(() => {
        });
    },
    handleItemPropertyUpdated() {
      resolveResponse(inspectItem(this.itemEditPanel.itemId))
        .then((res) => {
          this.$refs.noteTreePanel.updateNoteItem(res);
        })
        .catch(() => {
        });
    },
    handleEntityDelete(node, entity, accept) {
      // noinspection JSUnresolvedReference
      if (entity.display_type === 0) {
        this.handleNoteNodeDelete(node, entity, accept);
      } else {
        this.handleNoteItemDelete(node, entity, accept);
      }
    },
    handleNoteNodeDelete(node, entity, accept) {
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
    handleNoteItemDelete(node, entity, accept) {
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
.note-management-container {
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
</style>
