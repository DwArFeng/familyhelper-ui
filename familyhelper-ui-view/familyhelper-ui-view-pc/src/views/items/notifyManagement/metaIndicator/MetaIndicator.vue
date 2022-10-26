<template>
  <div class="meta-indicator-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="50%"
      :west-visible="true"
    >
      <div class="main-container" v-loading="west.loading" slot="west">
        <header-layout-panel>
          <template v-slot:header>
            <div class="header-container">
              <el-button type="success" @click="handleTopicSearch">刷新数据</el-button>
            </div>
          </template>
          <template v-slot:default>
            <table-panel
              class="table"
              highlight-current-row
              :page-size.sync="west.table.pageSize"
              :entity-count="parseInt(west.table.entities.count)"
              :current-page.sync="west.table.currentPage"
              :page-sizes="[15,20,30,50]"
              :table-data="west.table.entities.data"
              :table-selection.sync="west.table.selection"
              :operate-column-visible="false"
              @onPagingAttributeChanged="handleTopicPagingAttributeChanged"
            >
              <el-table-column
                prop="key.string_id"
                label="ID"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="label"
                label="名称"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="enabled"
                label="使能"
                width="50px"
                :formatter="booleanFormatter"
              />
              <el-table-column
                prop="priority"
                label="优先级"
                width="75px"
              />
              <el-table-column
                prop="remark"
                label="备注"
                show-tooltip-when-overflow
              />
            </table-panel>
          </template>
        </header-layout-panel>
      </div>
      <div class="main-container" v-loading="center.loading">
        <div class="placeholder" v-if="west.table.selection===null">
          请选择主题
        </div>
        <header-layout-panel v-else>
          <template v-slot:header>
            <div class="header-container">
              <el-button
                type="primary"
                @click="handleShowIndicatorCreateDialog"
              >
                新建指示器
              </el-button>
              <el-divider direction="vertical"/>
              <el-button type="success" @click="handleIndicatorSearch">刷新数据</el-button>
            </div>
          </template>
          <template v-slot:default>
            <table-panel
              class="table"
              highlight-current-row
              :page-size.sync="center.table.pageSize"
              :entity-count="parseInt(center.table.entities.count)"
              :current-page.sync="center.table.currentPage"
              :page-sizes="[15,20,30,50]"
              :table-data="center.table.entities.data"
              :table-selection.sync="center.table.selection"
              @onPagingAttributeChanged="handleIndicatorPagingAttributeChanged"
              @onEntityInspect="handleShowIndicatorInspectDialog"
              @onEntityEdit="handleShowIndicatorEditDialog"
              @onEntityDelete="handleIndicatorDelete"
            >
              <el-table-column
                prop="key.meta_id"
                label="元数据ID"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="label"
                label="名称"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="default_value"
                label="默认值"
                show-tooltip-when-overflow
              />
              <el-table-column
                prop="remark"
                label="备注"
                show-tooltip-when-overflow
              />
            </table-panel>
          </template>
        </header-layout-panel>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      top="10vh"
      :mode="center.maintainDialog.mode"
      :visible.sync="center.maintainDialog.visible"
      :entity="center.maintainDialog.anchorEntity"
      :create-rules="center.maintainDialog.createRules"
      :edit-rules="center.maintainDialog.editRules"
      :close-on-click-modal="false"
      :loading="center.maintainDialog.loading"
      @onEntityCreate="handleIndicatorCreate"
      @onEntityEdit="handleIndicatorEdit"
    >
      <el-form-item label="元数据ID" prop="key.meta_id">
        <el-input
          v-model="center.maintainDialog.anchorEntity.key.meta_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="center.maintainDialog.mode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="名称" prop="label">
        <el-input
          v-model="center.maintainDialog.anchorEntity.label"
          :readonly="center.maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="默认值" prop="default_value">
        <el-input
          v-model="center.maintainDialog.anchorEntity.default_value"
          :readonly="center.maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="center.maintainDialog.anchorEntity.remark"
          :readonly="center.maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  all as allTopic,
} from '@/api/notify/topic';
import resolveResponse from '@/util/response';
import {
  exists as existsIndicator,
  insert as insertIndicator,
  update as updateIndicator,
  remove as removeIndicator,
  childForTopic as childForTopicIndicator,
} from '@/api/notify/metaIndicator';

export default {
  name: 'MetaIndicator',
  components: {
    EntityMaintainDialog, TablePanel, HeaderLayoutPanel, BorderLayoutPanel,
  },
  watch: {
    'west.table.selection': {
      handler() {
        this.handleIndicatorSearch();
      },
    },
  },
  data() {
    const indicatorKeyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('指示器不能为空'));
            return Promise.reject();
          }
          return resolveResponse(existsIndicator(
            this.west.table.selection.key.string_id, value,
          ));
        })
        .then((res) => {
          if (res) {
            callback(new Error('指示器已经存在'));
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
      west: {
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
          selection: null,
        },
      },
      center: {
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
        maintainDialog: {
          loading: false,
          visible: false,
          mode: 'CREATE',
          anchorEntity: {
            key: {
              meta_id: '',
            },
            label: '',
            remark: '',
            default_value: '',
          },
          createRules: {
            'key.meta_id': [
              { validator: indicatorKeyValidator, trigger: 'blur' },
            ],
            label: [
              { required: true, message: '主题标签不能为空', trigger: 'blur' },
            ],
          },
          editRules: {
            label: [
              { required: true, message: '主题标签不能为空', trigger: 'blur' },
            ],
          },
        },
      },
    };
  },
  methods: {
    handleTopicPagingAttributeChanged() {
      this.handleTopicSearch();
    },
    handleTopicSearch() {
      this.lookupAllTopic();
    },
    lookupAllTopic() {
      this.west.loading = true;
      resolveResponse(allTopic(this.west.table.currentPage, this.west.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allTopic(res.total_pages, this.west.table.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTopicTableView)
        .catch(() => {
        })
        .finally(() => {
          this.west.loading = false;
        });
    },
    updateTopicTableView(res) {
      this.west.table.entities = res;
      this.west.table.currentPage = res.current_page;
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
    handleIndicatorPagingAttributeChanged() {
      this.handleIndicatorSearch();
    },
    handleIndicatorSearch() {
      if (this.west.table.selection === null) {
        return;
      }
      this.lookupChildForTopicIndicator();
    },
    lookupChildForTopicIndicator() {
      this.center.loading = true;
      resolveResponse(childForTopicIndicator(
        this.west.table.selection.key.string_id,
        this.center.table.currentPage, this.center.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForTopicIndicator(
              this.west.table.selection.key.string_id,
              res.total_pages, this.center.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateIndicatorTableView)
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    updateIndicatorTableView(res) {
      this.center.table.entities = res;
      this.center.table.currentPage = res.current_page;
    },
    handleIndicatorCreate() {
      this.center.maintainDialog.loading = true;
      resolveResponse(insertIndicator(
        this.west.table.selection.key.string_id,
        this.center.maintainDialog.anchorEntity.key.meta_id,
        this.center.maintainDialog.anchorEntity.label,
        this.center.maintainDialog.anchorEntity.remark,
        this.center.maintainDialog.anchorEntity.default_value,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `指示器 ${this.center.maintainDialog.anchorEntity.label} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleIndicatorSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.center.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.maintainDialog.loading = false;
        });
    },
    handleIndicatorEdit() {
      this.center.maintainDialog.loading = true;
      resolveResponse(updateIndicator(
        this.west.table.selection.key.string_id,
        this.center.maintainDialog.anchorEntity.key.meta_id,
        this.center.maintainDialog.anchorEntity.label,
        this.center.maintainDialog.anchorEntity.remark,
        this.center.maintainDialog.anchorEntity.default_value,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `指示器 ${this.center.maintainDialog.anchorEntity.label} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleIndicatorSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.center.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.maintainDialog.loading = false;
        });
    },
    handleShowIndicatorCreateDialog() {
      this.showIndicatorMaintainDialog('CREATE');
    },
    handleShowIndicatorInspectDialog(index, entity) {
      this.syncAnchorIndicator(entity);
      this.showIndicatorMaintainDialog('INSPECT');
    },
    handleShowIndicatorEditDialog(index, entity) {
      this.syncAnchorIndicator(entity);
      this.showIndicatorMaintainDialog('EDIT');
    },
    handleIndicatorDelete(index, entity) {
      Promise.resolve()
        .then(() => this.$confirm('此操作将永久删除此指示器。<br>'
          + '该操作不可恢复！<br>'
          + '是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject()))
        .then(() => {
          this.center.loading = true;
        })
        .then(() => resolveResponse(removeIndicator(entity.key.topic_id, entity.key.meta_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: `指示器 ${entity.label} 删除成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleIndicatorSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.center.loading = false;
        });
    },
    syncAnchorIndicator(entity) {
      this.west.table.selection.key.string_id = entity.key.topic_id;
      this.center.maintainDialog.anchorEntity.key.meta_id = entity.key.meta_id;
      this.center.maintainDialog.anchorEntity.label = entity.label;
      this.center.maintainDialog.anchorEntity.remark = entity.remark;
      this.center.maintainDialog.anchorEntity.default_value = entity.default_value;
    },
    showIndicatorMaintainDialog(mode) {
      this.center.maintainDialog.mode = mode;
      this.center.maintainDialog.visible = true;
    },
  },
  mounted() {
    this.handleTopicSearch();
  },
};
</script>

<style scoped>
.meta-indicator-container {
  height: 100%;
  width: 100%;
}

.main-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
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
