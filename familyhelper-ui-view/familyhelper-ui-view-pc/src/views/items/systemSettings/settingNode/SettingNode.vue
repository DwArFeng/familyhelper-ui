<template>
  <div class="setting-node-container">
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
            label="设置节点"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="value"
            label="值"
            class-name="single-line"
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
        </template>
        <template v-slot:contextmenu="{row,index,close}">
          <ul>
            <li @click="handleEntityCopyKeyContextmenuClicked(row,close)">
              复制节点
            </li>
            <el-divider/>
            <li @click="handleEntityInspectContextmenuClicked(row,index,close)">
              查看...
            </li>
            <li @click="handleEntityEditContextmenuClicked(row,index,close)">
              编辑...
            </li>
            <li @click="handleEntityDeleteContextmenuClicked(row,index,close)">
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
          新建设置
        </el-button>
        <el-button
          class="insert-button"
          type="success"
          @click="handleSearch"
        >
          刷新数据
        </el-button>
        <el-divider direction="vertical"/>
        <el-input
          class="id-search-bar"
          v-model="idSearchBar.value"
          clearable
          @keydown.enter.native="handleSearch"
          @clear="handleSearch"
        >
          <span slot="prepend">设置节点</span>
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
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="设置节点" prop="key.string_id">
        <el-input
          v-model="anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="dialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="值" prop="value">
        <text-editor
          class="text-editor"
          v-model="anchorEntity.value"
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
import TextEditor from '@/components/text/TextEditor.vue';

import {
  all, exists, idLike, insert, remove, update,
} from '@/api/settingrepo/settingNode';
import resolveResponse from '@/util/response';

export default {
  name: 'SettingNode',
  components: {
    TextEditor, EntityMaintainDialog, BorderLayoutPanel, TablePanel,
  },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('设置节点不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('设置节点已经存在'));
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
        value: '',
        remark: '',
      },
      createRules: {
        'key.string_id': [
          { validator: keyValidator, trigger: 'blur' },
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
        this.anchorEntity.value,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `设置节点 ${this.anchorEntity.key.string_id} 创建成功`,
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
        this.anchorEntity.value,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `设置节点 ${this.anchorEntity.key.string_id} 更新成功`,
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
    handleEntityEditContextmenuClicked(row, index, close) {
      close();
      this.handleShowEntityEditDialog(index, row);
    },
    handleShowEntityCreateDialog() {
      this.showDialog('CREATE');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('INSPECT');
    },
    handleEntityInspectContextmenuClicked(row, index, close) {
      close();
      this.handleShowEntityInspectDialog(index, row);
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    handleEntityDelete(node, entity) {
      Promise.resolve(entity.key.string_id)
        .then((res) => this.$confirm('此操作将永久删除此设置节点。<br>'
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
            message: `设置节点 ${res} 删除成功`,
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
    handleEntityDeleteContextmenuClicked(row, index, close) {
      close();
      this.handleEntityDelete(index, row);
    },
    syncAnchorEntity(entity) {
      this.anchorEntity.key.string_id = entity.key.string_id;
      this.anchorEntity.value = entity.value;
      this.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.dialogMode = mode;
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
    },
    handleEntityCopyKeyContextmenuClicked(row, close) {
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
.setting-node-container {
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

.text-editor{
  height: 300px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*noinspection CssUnusedSymbol*/
.table >>> .contextmenu .el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
