<template>
  <div class="permission-group-container">
    <content-panel
      class="content-panel"
      :header-visible="true"
      :west-visible="true"
      :breadcrumb="['系统设置', '权限分组管理']"
    >
      <permission-group-tree-panel
        class="tree-container"
        slot="west"
        ref="permissionGroupTreePanel"
        mode="PERMISSION_GROUP"
        @onCurrentChanged="handleCurrentChanged"
        @onEntityEdit="handleShowEntityEditDialog"
        @onEntityDelete="handleEntityDelete"
      />
      <div class="header-container" slot="header">
        <el-button
          class="header-button"
          type="primary"
          @click="handleShowEntityCreateDialogParent"
        >
          新建权限组
        </el-button>
        <el-button
          class="header-button"
          type="primary"
          @click="handleShowEntityCreateDialogChild"
        >
          新建子权限组
        </el-button>
        <el-button
          class="header-button"
          type="primary"
          :disabled="treeSelection.data.key.string_id === ''"
          @click="handleShowPermissionAttachDialogVisible"
        >
          关联权限节点
        </el-button>
        <el-button
          class="header-button"
          type="primary"
          :disabled="permissionToUnattach.length === 0"
          @click="handleUnattachPermission"
        >
          取消关联权限节点
        </el-button>
      </div>
      <div class="center-container">
        <el-form class="detail-form" inline>
          <el-form-item label="权限组ID" style="width: 33%">
            {{ treeSelection.data.key.string_id }}
          </el-form-item>
          <!--suppress JSIncompatibleTypesComparison -->
          <el-form-item label="父权限组ID" style="width: 33%">
            {{
              treeSelection.data.parent_permission_group === null ?
                '(根节点)' : treeSelection.data.parent_permission_group.key.string_id
            }}
          </el-form-item>
          <el-form-item label="名称" style="width: 33%">
            {{ treeSelection.data.name }}
          </el-form-item>
          <el-form-item label="备注" style="width: 100%">
            {{ treeSelection.data.remark }}
          </el-form-item>
        </el-form>
        <el-divider class="divider"/>
        <table-panel
          class="permission-table-panel"
          :page-size.sync="permissionPageSize"
          :entity-count="parseInt(permissionEntities.count)"
          :current-page.sync="permissionCurrentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="permissionEntities.data"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          @onPagingAttributeChanged="handleUnattachPagingAttributeChanged"
          @onSelectionChanged="handleUnattachSelectionChanged"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            prop="key.string_id"
            label="权限节点"
            show-overflow-tooltip
          />
          <el-table-column
            prop="name"
            label="名称"
            show-overflow-tooltip
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-overflow-tooltip
          />
        </table-panel>
      </div>
    </content-panel>
    <entity-maintain-dialog
      label-width="120px"
      :mode="dialogMode"
      :visible.sync="dialogVisible"
      :entity="anchorEntity"
      :create-rules="createRules"
      :edit-rules="editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="权限组ID" prop="key.string_id">
        <el-input
          v-model="anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          placeholder="必填，非空，不能重复"
          :disabled="dialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="anchorEntity.name"
          placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="anchorEntity.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <el-dialog
      append-to-body
      destroy-on-close
      title="关联权限节点"
      top="6vh"
      width="80%"
      :visible.sync="permissionAttachDialogVisible"
      @keydown.ctrl.enter.native="handleAttachPermission"
    >
      <table-panel
        class="permission-to-attach-table-panel"
        :page-size.sync="permissionToAttachPageSize"
        :entity-count="parseInt(permissionToAttachEntities.count)"
        :current-page.sync="permissionToAttachCurrentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="permissionToAttachEntities.data"
        :inspect-button-visible="false"
        :edit-button-visible="false"
        :delete-button-visible="false"
        @onPagingAttributeChanged="handleAttachPagingAttributeChanged"
        @onSelectionChanged="handleAttachSelectionChanged"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="key.string_id"
          label="权限节点"
        />
        <el-table-column
          prop="name"
          label="名称"
        />
        <el-table-column
          prop="remark"
          label="备注"
        />
      </table-panel>
      <div class="footer-container" slot="footer">
        <el-button
          type="primary"
          :disabled="permissionToAttach.length === 0"
          @click="handleAttachPermission"
        >
          关联
        </el-button>
        <el-button
          @click="permissionAttachDialogVisible = false"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import EntityMaintainDialog from '@/components/dialog/EntityMaintainDialog.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import PermissionGroupTreePanel
from '@/views/systemSettings/permissionGroup/PermissionGroupTreePanel.vue';

import {
  childForParentDisp,
  exists,
  insert,
  inspectDisp,
  remove,
  update,
} from '@/api/system/permissionGroup';
import resolveResponse from '@/util/response';
import { childForGroup, update as updatePermission } from '@/api/system/permission';

export default {
  name: 'PermissionGroup',
  components: {
    PermissionGroupTreePanel,
    TablePanel,
    ContentPanel,
    EntityMaintainDialog,
  },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('权限组ID不能为空'));
            return Promise.reject();
          }
          return Promise.resolve(value);
        })
        .then((res) => {
          if (res === 'root') {
            callback(new Error('权限组ID不能取名为root'));
            return Promise.reject();
          }
          return resolveResponse(this, exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('权限节点已经存在'));
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          callback();
        })
        .catch(() => {
        });
    };
    const parentKeyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            return Promise.resolve(true);
          }
          return resolveResponse(this, exists(res));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('权限节点不存在'));
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          callback();
        })
        .catch(() => {
        });
    };
    return {
      treeData: [],
      treeProps: {
        children: 'children',
        label: (data) => data.name,
        isLeaf: (data) => data.has_no_child,
      },
      treeSelection: {
        node: null,
        data: {
          key: {
            string_id: '',
          },
          parent_permission_group: {
            key: {
              string_id: '',
            },
            parent_key: {
              string_id: '',
            },
            name: '',
            remark: '',
          },
          name: '',
          remark: '',
          has_no_child: true,
        },
      },
      dialogVisible: false,
      dialogMode: 'CREATE',
      anchorEntity: {
        key: {
          string_id: '',
        },
        parent_key: {
          string_id: '',
        },
        name: '',
        remark: '',
        has_no_child: true,
      },
      createRules: {
        'key.string_id': [
          { validator: keyValidator, trigger: 'blur' },
          { required: true },
        ],
        'parent_key.string_id': [
          { validator: parentKeyValidator, trigger: 'blur' },
        ],
        name: [
          { required: true, message: '权限组名称不能为空', trigger: 'blur' },
        ],
      },
      editRules: {
        'parent_key.string_id': [
          { validator: parentKeyValidator, trigger: 'blur' },
        ],
        name: [
          { required: true, message: '权限组名称不能为空', trigger: 'blur' },
        ],
      },
      permissionEntities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      permissionCurrentPage: 0,
      permissionPageSize: 15,
      permissionToAttachEntities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      permissionToAttachCurrentPage: 0,
      permissionToAttachPageSize: 15,
      permissionToAttach: [],
      permissionToUnattach: [],
      permissionAttachDialogVisible: false,
      appendChild: false,
    };
  },
  methods: {
    inspectRoot() {
      resolveResponse(this, childForParentDisp('', 0, 1000))
        .then((res) => {
          this.treeData = res.data;
        });
    },
    handleLoad(node, resolve) {
      if (node.level === 0) {
        return;
      }

      const bill = node.data;
      resolveResponse(this, childForParentDisp(bill.key.string_id, 0, 1000))
        .then((res) => {
          resolve(res.data);
        });
    },
    handleEntityCreate() {
      resolveResponse(this, insert(
        this.anchorEntity.key.string_id,
        this.anchorEntity.parent_key.string_id,
        this.anchorEntity.name,
        this.anchorEntity.remark,
      ))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `权限组 ${res.string_id} 创建成功`,
            type: 'success',
            center: true,
          });
          return res;
        })
        .then((res) => resolveResponse(this, inspectDisp(res.string_id)))
        .then((res) => {
          const parentId = this.anchorEntity.parent_key.string_id;
          if (parentId === '') {
            this.$refs.permissionGroupTreePanel.appendRoot(res);
          } else {
            const { node } = this.treeSelection;
            if (this.appendChild) {
              this.$refs.permissionGroupTreePanel.append(node, res);
              this.$set(node, 'isLeaf', false);
            } else {
              this.$refs.permissionGroupTreePanel.insertAfter(node, res);
            }
          }
        })
        .then(() => {
          this.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleEntityEdit() {
      resolveResponse(this, update(
        this.anchorEntity.key.string_id,
        this.anchorEntity.parent_key.string_id,
        this.anchorEntity.name,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `数据点 ${this.anchorEntity.key.string_id} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => resolveResponse(this, inspectDisp(this.anchorEntity.key.string_id)))
        .then((res) => {
          this.$refs.permissionGroupTreePanel.update(res);
        })
        .then(() => {
          this.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleShowEntityCreateDialogParent() {
      this.appendChild = false;
      // noinspection JSIncompatibleTypesComparison
      if (this.treeSelection.data.parent_permission_group === null) {
        this.anchorEntity.parent_key.string_id = '';
      } else {
        this.anchorEntity.parent_key.string_id = this
          .treeSelection.data.parent_permission_group.key.string_id;
      }
      this.showDialog('CREATE');
    },
    handleShowEntityCreateDialogChild() {
      this.appendChild = true;
      this.anchorEntity.parent_key.string_id = this.treeSelection.data.key.string_id;
      this.showDialog('CREATE');
    },
    handleShowEntityEditDialog(node, data) {
      this.syncAnchorEntity(data);
      this.showDialog('EDIT');
    },
    handleEntityDelete(node, entity, accept) {
      Promise.resolve(entity.key.string_id)
        .then((res) => this.$confirm('此操作将永久删除此权限节点，以及其子权限节点。<br>'
          + '<b>此操作不可恢复</b><br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(this, remove(res, true)).then(() => res))
        .then((res) => {
          accept();
          return res;
        })
        .then((res) => {
          this.$message({
            showClose: true,
            message: `数据点 ${res} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(this.resetTreeView)
        .catch(() => {
        });
    },
    syncAnchorEntity(entity) {
      this.anchorEntity.key.string_id = entity.key.string_id;
      if (entity.parent_permission_group == null) {
        this.anchorEntity.parent_key.string_id = '';
      } else {
        this.anchorEntity.parent_key.string_id = entity.parent_permission_group.key.string_id;
      }
      this.anchorEntity.name = entity.name;
      this.anchorEntity.remark = entity.remark;
      this.anchorEntity.has_no_child = entity.has_no_child;
    },
    showDialog(mode) {
      this.dialogMode = mode;
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
    },
    resetTreeView() {
      this.treeData = [];
      this.treeSelection = {
        node: null,
        data: {
          key: {
            string_id: '',
          },
          parent_permission_group: {
            key: {
              string_id: '',
            },
            parent_key: {
              string_id: '',
            },
            name: '',
            remark: '',
          },
          name: '',
          remark: '',
          has_no_child: true,
        },
      };
      this.inspectRoot();
      return Promise.resolve();
    },
    inspectChildPermission(key) {
      resolveResponse(this, childForGroup(key, this.permissionCurrentPage, this.permissionPageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(
              this, childForGroup(key, res.total_pages, this.permissionPageSize),
            );
          }
          return Promise.resolve(res);
        })
        .then(this.updatePermissionTableView)
        .catch(() => {
        });
    },
    updatePermissionTableView(res) {
      this.permissionEntities = res;
      this.permissionCurrentPage = res.current_page;
    },
    handleCurrentChanged(node, data) {
      this.treeSelection.node = node;
      this.treeSelection.data = data;
      if (data.key.string_id !== '') {
        this.inspectChildPermission(data.key.string_id);
      }
    },
    handleShowPermissionAttachDialogVisible() {
      resolveResponse(
        this, childForGroup('', this.permissionToAttachCurrentPage, this.permissionToAttachPageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(
              this, childForGroup('', res.total_pages, this.permissionToAttachPageSize),
            );
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          this.updatePermissionToAttachTableView(res);
          return Promise.resolve();
        })
        .then(() => {
          this.permissionAttachDialogVisible = true;
        })
        .catch(() => {
        });
    },
    updatePermissionToAttachTableView(res) {
      this.permissionToAttachEntities = res;
      this.permissionToAttachCurrentPage = res.current_page;
    },
    handleAttachSelectionChanged(selection) {
      this.permissionToAttach = selection;
    },
    handleAttachPermission() {
      const promises = [];
      this.permissionToAttach.forEach((permission) => {
        promises.push(
          resolveResponse(this, updatePermission(
            permission.key.string_id,
            this.treeSelection.data.key.string_id,
            permission.name,
            permission.remark,
          )),
        );
      });
      Promise.all(promises)
        .then((res) => {
          this.$message({
            showClose: true,
            message: `成功添加 ${res.length} 个权限的关联`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          if (this.treeSelection.data.key.string_id !== '') {
            this.inspectChildPermission(this.treeSelection.data.key.string_id);
          }
          this.permissionAttachDialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleAttachPagingAttributeChanged() {
      resolveResponse(
        this, childForGroup('', this.permissionToAttachCurrentPage, this.permissionToAttachPageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(
              this, childForGroup('', res.total_pages, this.permissionToAttachPageSize),
            );
          }
          return Promise.resolve(res);
        })
        .then((res) => {
          this.updatePermissionToAttachTableView(res);
          return Promise.resolve();
        })
        .catch(() => {
        });
    },
    handleUnattachSelectionChanged(selection) {
      this.permissionToUnattach = selection;
    },
    handleUnattachPermission() {
      const promises = [];
      this.permissionToUnattach.forEach((permission) => {
        promises.push(
          resolveResponse(this, updatePermission(
            permission.key.string_id,
            '',
            permission.name,
            permission.remark,
          )),
        );
      });
      Promise.all(promises)
        .then((res) => {
          this.$message({
            showClose: true,
            message: `成功解除 ${res.length} 个权限的关联`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          if (this.treeSelection.data.key.string_id !== '') {
            this.inspectChildPermission(this.treeSelection.data.key.string_id);
          }
        })
        .catch(() => {
        });
    },
    handleUnattachPagingAttributeChanged() {
      this.inspectChildPermission(this.treeSelection.data.key.string_id);
    },
  },
  mounted() {
    this.inspectRoot();
  },
};
</script>

<style scoped>
.permission-group-container {
  height: 100%;
  width: 100%;
}

.tree-container {
  width: calc(25vw - 230px - 20px + 80px);
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.center-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.detail-form >>> label {
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item__content {
  padding-right: 20px;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}

.divider {
  margin: 15px 0;
}

.permission-table-panel {
  flex-grow: 1;
}

.permission-to-attach-table-panel {
  height: 70vh;
}
</style>
