<template>
  <div class="permission-node-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        class="table"
        :page-size.sync="pageSize"
        :entity-count="parseInt(entities.count)"
        :current-page.sync="currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="entities.data"
        :show-contextmenu="true"
        :contextmenu-width="100"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onEntityInspect="handleShowEntityInspectDialog"
        @onEntityEdit="handleShowEntityEditDialog"
        @onEntityDelete="handleEntityDelete"
      >
        <template v-slot:default>
          <el-table-column
            prop="key.string_id"
            label="权限节点"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="group_key.string_id"
            label="权限组"
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
        </template>
        <template v-slot:contextmenu="{row,index,close}">
          <ul>
            <li @click="handleCopyKeyContextmenuClicked(row,close)">
              复制主键
            </li>
            <el-divider/>
            <li @click="handleInspectContextmenuClicked(row,index,close)">
              查看...
            </li>
            <li @click="handleEditContextmenuClicked(row,index,close)">
              编辑...
            </li>
            <li @click="handleDeleteContextmenuClicked(row,index,close)">
              删除...
            </li>
          </ul>
        </template>
      </table-panel>
      <div class="header-container" slot="header">
        <el-button
          class="insert-button"
          type="primary"
          @click="handleShowEntityCreateDialog"
        >
          新建权限
        </el-button>
        <el-button type="success" @click="handleSearch">刷新数据</el-button>
        <el-divider direction="vertical"/>
        <el-input
          class="id-search-bar"
          v-model="idSearchBar.value"
          clearable
          @keydown.enter.native="handleSearch"
          @clear="handleSearch"
        >
          <span slot="prepend">权限节点</span>
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSearch"
          />
        </el-input>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      :mode="dialogMode"
      :visible.sync="dialogVisible"
      :entity="anchorEntity"
      :create-rules="createRules"
      :edit-rules="editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="权限节点" prop="key.string_id">
        <el-input
          v-model="anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="dialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="权限组ID" prop="group_key.string_id">
        <el-input
          v-model="anchorEntity.group_key.string_id"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="anchorEntity.name"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="anchorEntity.remark"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  all, exists, idLike, insert, remove, update,
} from '@/api/system/permission';
import { exists as permissionGroupExists } from '@/api/system/permissionGroup';
import resolveResponse from '@/util/response';

export default {
  name: 'PermissionNode',
  components: { EntityMaintainDialog, BorderLayoutPanel, TablePanel },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('权限节点不能为空'));
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
    const groupKeyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            return Promise.resolve(true);
          }
          return resolveResponse(permissionGroupExists(res));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('权限组节点不存在'));
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
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
      currentPage: 0,
      pageSize: 15,
      dialogVisible: false,
      dialogMode: 'CREATE',
      anchorEntity: {
        key: {
          string_id: '',
        },
        group_key: {
          string_id: '',
        },
        name: '',
        remark: '',
      },
      createRules: {
        'key.string_id': [
          { validator: keyValidator, trigger: 'blur' },
        ],
        'group_key.string_id': [
          { validator: groupKeyValidator, trigger: 'blur' },
        ],
        name: [
          { required: true, message: '权限名称不能为空', trigger: 'blur' },
        ],
      },
      editRules: {
        'group_key.string_id': [
          { validator: groupKeyValidator, trigger: 'blur' },
        ],
        name: [
          { required: true, message: '权限名称不能为空', trigger: 'blur' },
        ],
      },
      idSearchBar: {
        value: '',
      },
      loading: false,
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.idSearchBar.value !== '') {
        this.lookupIdLike();
      } else {
        this.lookupAll();
      }
    },
    lookupAll() {
      this.loading = true;
      resolveResponse(all(this.currentPage, this.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(res.total_pages, this.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    lookupIdLike() {
      this.loading = true;
      resolveResponse(idLike(this.idSearchBar.value, this.currentPage, this.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(this.idSearchBar.value, res.total_pages, this.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateTableView(res) {
      this.entities = res;
      this.currentPage = res.current_page;
    },
    handleEntityCreate() {
      resolveResponse(insert(
        this.anchorEntity.key.string_id,
        this.anchorEntity.group_key.string_id,
        this.anchorEntity.name,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `权限节点 ${this.anchorEntity.key.string_id} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
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
        this.anchorEntity.group_key.string_id,
        this.anchorEntity.name,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `权限节点 ${this.anchorEntity.key.string_id} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleShowEntityCreateDialog() {
      this.showDialog('CREATE');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('INSPECT');
    },
    handleInspectContextmenuClicked(row, index, close) {
      this.handleShowEntityInspectDialog(index, row);
      close();
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    handleEditContextmenuClicked(row, index, close) {
      this.handleShowEntityEditDialog(index, row);
      close();
    },
    handleEntityDelete(node, entity) {
      Promise.resolve(entity.key.string_id)
        .then((res) => this.$confirm('此操作将永久删除此权限节点。<br>'
          + '<div style="color: #b22222"><b>如果您不知道删除该节点后会产生什么后果，'
          + '请不要进行操作！</b></div>'
          + '<b>错误的操作可能导致前端界面、后台出错，甚至崩溃！</b><br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res)).then(() => res))
        .then((res) => {
          this.$message({
            showClose: true,
            message: `权限节点 ${res} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
    handleDeleteContextmenuClicked(row, index, close) {
      this.handleEntityDelete(index, row);
      close();
    },
    syncAnchorEntity(entity) {
      this.anchorEntity.key.string_id = entity.key.string_id;
      if (entity.group_key == null) {
        this.anchorEntity.group_key.string_id = '';
      } else {
        this.anchorEntity.group_key.string_id = entity.group_key.string_id;
      }
      this.anchorEntity.name = entity.name;
      this.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.dialogMode = mode;
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
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
    this.handleSearch();
  },
};
</script>

<style scoped>
.permission-node-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.id-search-bar{
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.id-search-bar >>> .el-input-group__prepend {
  padding: 0 10px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .contextmenu .el-divider--horizontal{
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
