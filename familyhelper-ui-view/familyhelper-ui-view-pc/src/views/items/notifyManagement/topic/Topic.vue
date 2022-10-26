<template>
  <div class="topic-container">
    <border-layout-panel
      class="border-layout-panel"
      v-loading="loading"
      :header-visible="true"
    >
      <table-panel
        :page-size.sync="pageSize"
        :entity-count="parseInt(entities.count)"
        :current-page.sync="currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="entities.data"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onEntityInspect="handleShowEntityInspectDialog"
        @onEntityEdit="handleShowEntityEditDialog"
        @onEntityDelete="handleEntityDelete"
      >
        <el-table-column
          prop="key.string_id"
          label="主题ID"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="label"
          label="标签"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="preferred"
          label="首选"
          :formatter="booleanFormatter"
        />
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
        />
      </table-panel>
      <div class="header-container" slot="header">
        <el-button
          class="insert-button"
          type="primary"
          @click="handleShowEntityCreateDialog"
        >
          新建主题
        </el-button>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      :mode="dialogMode"
      :visible.sync="dialogVisible"
      :entity="anchorEntity"
      :create-rules="createRules"
      :edit-rules="editRules"
      :close-on-click-modal="false"
      :loading="dialogLoading"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="主题" prop="key.string_id">
        <el-input
          v-model="anchorEntity.key.string_id"
          oninput="this.value = this.value.toLowerCase()"
          :disabled="dialogMode !== 'CREATE'"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input
          v-model="anchorEntity.label"
          :readonly="dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="首选" prop="preferred">
        <el-switch
          class="focusable-switch"
          tabindex="0"
          v-model="anchorEntity.preferred"
          active-text="是"
          inactive-text="否"
          :disabled="dialogMode === 'INSPECT'"
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
  all, exists, insert, remove, update,
} from '@/api/notify/topic';
import resolveResponse from '@/util/response';

export default {
  name: 'Topic',
  components: { EntityMaintainDialog, BorderLayoutPanel, TablePanel },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('主题不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('主题已经存在'));
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
        label: '',
        remark: '',
        preferred: false,
      },
      createRules: {
        'key.string_id': [
          { validator: keyValidator, trigger: 'blur' },
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
      loading: false,
      dialogLoading: false,
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupAll();
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
    updateTableView(res) {
      this.entities = res;
      this.currentPage = res.current_page;
    },
    handleEntityCreate() {
      this.dialogLoading = true;
      resolveResponse(insert(
        this.anchorEntity.key.string_id,
        this.anchorEntity.label,
        this.anchorEntity.remark,
        this.anchorEntity.preferred,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `主题 ${this.anchorEntity.key.string_id} 创建成功`,
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
        })
        .finally(() => {
          this.dialogLoading = false;
        });
    },
    handleEntityEdit() {
      this.dialogLoading = true;
      resolveResponse(update(
        this.anchorEntity.key.string_id,
        this.anchorEntity.label,
        this.anchorEntity.remark,
        this.anchorEntity.preferred,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `主题 ${this.anchorEntity.key.string_id} 更新成功`,
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
        })
        .finally(() => {
          this.dialogLoading = false;
        });
    },
    handleShowEntityCreateDialog() {
      this.showDialog('CREATE');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('INSPECT');
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    handleEntityDelete(node, entity) {
      Promise.resolve(entity.key.string_id)
        .then((res) => this.$confirm('此操作将永久删除此主题。<br>'
          + '<div style="color: #b22222"><b>如果您不知道删除该节点后会产生什么后果，'
          + '请不要进行操作！</b></div>'
          + '<b>错误的操作可能导致依赖此主题的消息发送机制发送错误，甚至崩溃！</b><br>'
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
            message: `主题 ${res} 删除成功`,
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
    syncAnchorEntity(entity) {
      this.anchorEntity.key.string_id = entity.key.string_id;
      this.anchorEntity.label = entity.label;
      this.anchorEntity.remark = entity.remark;
      this.anchorEntity.preferred = entity.preferred;
    },
    showDialog(mode) {
      this.dialogMode = mode;
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value == null) {
        return '';
      }
      return value ? '是' : '否';
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.topic-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.focusable-switch:focus {
  outline: none;
}
</style>
