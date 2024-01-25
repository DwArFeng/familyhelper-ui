<template>
  <div class="setting-category-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        class="table"
        :page-size.sync="table.pageSize"
        :entity-count="parseInt(table.entities.count)"
        :current-page.sync="table.currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="table.entities.data"
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
            label="设置类型"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="formatter_type"
            label="格式化器类型"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="formatter_param"
            label="格式化器参数"
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
              复制类型
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
        <el-button type="success" @click="handleSearch">刷新数据</el-button>
        <el-divider direction="vertical"/>
        <el-input
          class="id-search-bar"
          v-model="idSearchBar.value"
          clearable
          @keydown.enter.native="handleSearch"
          @clear="handleSearch"
        >
          <span slot="prepend">设置类型</span>
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSearch"
          />
        </el-input>
        <el-divider direction="vertical"/>
        <el-button
          type="primary"
          :disabled="applyChangesButton.disabled"
          @click="handleApplyChanges"
        >
          应用变更
        </el-button>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      :mode="entityDialog.mode"
      :visible.sync="entityDialog.visible"
      :entity="entityDialog.anchorEntity"
      :create-rules="entityDialog.createRules"
      :edit-rules="entityDialog.editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="设置类型" prop="key.string_id">
        <el-input
          v-model="entityDialog.anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="entityDialog.mode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="格式化器类型" prop="formatter_type">
        <el-input
          v-model="entityDialog.anchorEntity.formatter_type"
          :readonly="entityDialog.mode === 'INSPECT'"
        >
          <el-button
            v-if="entityDialog.mode !== 'INSPECT'"
            slot="append"
            icon="el-icon-search"
            @click="supportDialog.visible = true"
          />
        </el-input>
      </el-form-item>
      <el-form-item label="格式化器参数" prop="formatter_param">
        <el-input
          v-model="entityDialog.anchorEntity.formatter_param"
          type="textarea"
          resize="none"
          :rows="10"
          :readonly="entityDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="entityDialog.anchorEntity.remark"
          :readonly="entityDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
    <support-dialog
      :visible.sync="supportDialog.visible"
      @onConfirmed="handleSupportSelected"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import SupportDialog from '@/views/items/systemSettings/settingCategory/SupportDialog.vue';

import {
  all, exists, idLike, insert, remove, update,
} from '@/api/settingrepo/settingCategory';
import { exists as existsSupport } from '@/api/settingrepo/formatterSupport';
import { resetFormat } from '@/api/settingrepo/reset';
import resolveResponse from '@/util/response';

export default {
  name: 'SettingCategory',
  components: {
    SupportDialog, EntityMaintainDialog, BorderLayoutPanel, TablePanel,
  },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('设置类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('设置类型已经存在'));
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
    const formatterTypeValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('格式化器类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(existsSupport(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('格式化器类型不支持'));
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
      idSearchBar: {
        value: '',
      },
      applyChangesButton: {
        disabled: false,
      },
      loading: false,
      table: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
        pageSize: 15,
      },
      entityDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          key: {
            string_id: '',
          },
          formatter_type: '',
          formatter_param: '',
          remark: '',
        },
        createRules: {
          'key.string_id': [
            { validator: keyValidator, trigger: 'blur' },
          ],
          formatter_type: [
            { validator: formatterTypeValidator, trigger: 'blur' },
          ],
        },
        editRules: {
          formatter_type: [
            { validator: formatterTypeValidator, trigger: 'blur' },
          ],
        },
      },
      supportDialog: {
        visible: false,
      },
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
      resolveResponse(all(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(res.total_pages - 1, this.table.pageSize));
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
      resolveResponse(idLike(
        this.idSearchBar.value, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(
              this.idSearchBar.value, res.total_pages - 1, this.table.pageSize,
            ));
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
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handleEntityCreate() {
      resolveResponse(insert(
        this.entityDialog.anchorEntity.key.string_id,
        this.entityDialog.anchorEntity.formatter_type,
        this.entityDialog.anchorEntity.formatter_param,
        this.entityDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `设置类型 ${this.entityDialog.anchorEntity.key.string_id} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.entityDialog.visible = false;
        })
        .catch(() => {
        });
    },
    handleEntityEdit() {
      resolveResponse(update(
        this.entityDialog.anchorEntity.key.string_id,
        this.entityDialog.anchorEntity.formatter_type,
        this.entityDialog.anchorEntity.formatter_param,
        this.entityDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `设置类型 ${this.entityDialog.anchorEntity.key.string_id} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.entityDialog.visible = false;
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
    handleEntityInspectContextmenuClicked(row, index, close) {
      close();
      this.handleShowEntityInspectDialog(index, row);
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    handleEntityEditContextmenuClicked(row, index, close) {
      close();
      this.handleShowEntityEditDialog(index, row);
    },
    handleEntityDelete(category, entity) {
      Promise.resolve(entity.key.string_id)
        .then((res) => this.$confirm('此操作将永久删除此设置类型。<br>'
          + '<div style="color: #b22222"><b>如果您不知道删除该类型后会产生什么后果，'
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
            message: `设置类型 ${res} 删除成功`,
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
      this.entityDialog.anchorEntity.key.string_id = entity.key.string_id;
      this.entityDialog.anchorEntity.formatter_type = entity.formatter_type;
      this.entityDialog.anchorEntity.formatter_param = entity.formatter_param;
      this.entityDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.entityDialog.mode = mode;
      this.$nextTick(() => {
        this.entityDialog.visible = true;
      });
    },
    handleSupportSelected(selection) {
      this.entityDialog.anchorEntity.formatter_type = selection.key.string_id;
      // noinspection JSUnresolvedVariable
      this.entityDialog.anchorEntity.formatter_param = selection.example_param;
    },
    handleApplyChanges() {
      this.applyChangesButton.disabled = true;
      resolveResponse(resetFormat())
        .then(() => {
          this.$message({
            showClose: true,
            message: '变更应用成功！后台状态刷新中，请不要频繁点击',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
          setTimeout(() => {
            this.applyChangesButton.disabled = false;
          }, 3000);
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
.setting-category-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.id-search-bar {
  width: 400px;
}

/*noinspection CssUnusedSymbol*/
.id-search-bar >>> .el-input-group__prepend {
  padding: 0 10px;
}

/*noinspection CssUnusedSymbol*/
.table >>> .single-line .cell {
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
