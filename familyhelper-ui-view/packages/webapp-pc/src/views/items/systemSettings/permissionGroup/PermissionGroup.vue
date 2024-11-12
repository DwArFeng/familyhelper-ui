<template>
  <div class="permission-group-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="350px"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:header>
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
            :disabled="permissionGroupId === ''"
            @click="handleShowPermissionAttachDialogVisible"
          >
            关联权限节点
          </el-button>
          <el-button
            class="header-button"
            type="primary"
            :disabled="permissionToDetach.length === 0"
            @click="handleDetachPermission"
          >
            取消关联权限节点
          </el-button>
        </div>
      </template>
      <template v-slot:west>
        <permission-group-tree-panel
          ref="permissionGroupTreePanel"
          mode="PERMISSION_GROUP"
          @onCurrentChanged="handleCurrentChanged"
          @onEntityEdit="handleShowEntityEditDialog"
          @onEntityDelete="handleEntityDelete"
        />
      </template>
      <template v-slot:default>
        <div class="center-container-wrapper">
          <div class="placeholder" v-if="permissionGroupId===''">
            请选择权限组
          </div>
          <div class="center-container" v-else>
            <el-form
              class="detail-form"
              label-position="left"
              label-width="80px"
              inline
            >
              <el-form-item label="权限组ID" style="width: 50%">
                {{ treeSelection.data.key.string_id }}
              </el-form-item>
              <!--suppress JSIncompatibleTypesComparison -->
              <el-form-item label="父权限组ID" style="width: 50%">
                {{
                  treeSelection.data.parent_permission_group === null ?
                    '(根节点)' : treeSelection.data.parent_permission_group.key.string_id
                }}
              </el-form-item>
              <el-form-item label="名称" style="width: 100%">
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
              :operate-column-visible="false"
              :show-contextmenu="true"
              :contextmenu-width="100"
              @onPagingAttributeChanged="handleDetachPagingAttributeChanged"
              @onSelectionChanged="handleDetachSelectionChanged"
            >
              <template v-slot:default>
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
              </template>
              <template v-slot:contextmenu="{row,close}">
                <ul>
                  <li @click="handleCopyKeyContextmenuClicked(row,close)">
                    复制主键
                  </li>
                </ul>
              </template>
            </table-panel>
          </div>
        </div>
      </template>
    </border-layout-panel>
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
      class="permission-attach-dialog"
      append-to-body
      destroy-on-close
      title="关联权限节点"
      top="5vh"
      width="80%"
      :visible.sync="permissionAttachDialogVisible"
      :close-on-click-modal="false"
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
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="name"
          label="名称"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
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
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import PermissionGroupTreePanel
from '@/views/items/systemSettings/permissionGroup/PermissionGroupTreePanel.vue';

import {
  childForParentDisp,
  exists,
  insert,
  inspectDisp,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup';
import resolveResponse from '@/util/response';
import {
  childForGroup,
  update as updatePermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permission';

export default {
  name: 'PermissionGroup',
  components: {
    PermissionGroupTreePanel,
    TablePanel,
    BorderLayoutPanel,
    EntityMaintainDialog,
  },
  computed: {
    permissionGroupId() {
      if (this.treeSelection.data) {
        return this.treeSelection.data.key.string_id;
      }
      return '';
    },
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
          return resolveResponse(exists(value));
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
          return resolveResponse(exists(res));
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
        data: null,
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
      permissionToDetach: [],
      permissionAttachDialogVisible: false,
      appendChild: false,
    };
  },
  methods: {
    inspectRoot() {
      resolveResponse(childForParentDisp('', 0, 1000))
        .then((res) => {
          this.treeData = res.data;
        });
    },
    handleEntityCreate() {
      resolveResponse(insert(
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
        .then((res) => resolveResponse(inspectDisp(res.string_id)))
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
      resolveResponse(update(
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
        .then(() => resolveResponse(inspectDisp(this.anchorEntity.key.string_id)))
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
        .then((res) => resolveResponse(remove(res, true)).then(() => res))
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
      resolveResponse(childForGroup(key, this.permissionCurrentPage, this.permissionPageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(
              childForGroup(key, res.total_pages - 1, this.permissionPageSize),
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

      if (data === null) {
        return;
      }

      if (data.key.string_id !== '') {
        this.inspectChildPermission(data.key.string_id);
      }
    },
    handleShowPermissionAttachDialogVisible() {
      resolveResponse(
        childForGroup('', this.permissionToAttachCurrentPage, this.permissionToAttachPageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(
              childForGroup('', res.total_pages - 1, this.permissionToAttachPageSize),
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
          resolveResponse(updatePermission(
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
        childForGroup('', this.permissionToAttachCurrentPage, this.permissionToAttachPageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(
              childForGroup('', res.total_pages - 1, this.permissionToAttachPageSize),
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
    handleDetachSelectionChanged(selection) {
      this.permissionToDetach = selection;
    },
    handleDetachPermission() {
      const promises = [];
      this.permissionToDetach.forEach((permission) => {
        promises.push(
          resolveResponse(updatePermission(
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
    handleDetachPagingAttributeChanged() {
      this.inspectChildPermission(this.permissionGroupId);
    },
    handleCopyKeyContextmenuClicked(row, close) {
      close();
      navigator.clipboard.writeText(row.key.string_id)
        .then(() => {
          this.$message({
            showClose: true,
            message: '复制成功',
            type: 'success',
            center: true,
          });
        });
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

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.center-container-wrapper {
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

.center-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.detail-form {
  display: flex;
  flex-wrap: wrap;
}

.detail-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

.divider {
  margin: 15px 0;
}

.permission-table-panel {
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.permission-attach-dialog >>> .el-dialog {
  margin-bottom: 0 !important;
}

.permission-to-attach-table-panel {
  height: 70vh;
}
</style>
