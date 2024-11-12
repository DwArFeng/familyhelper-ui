<template>
  <div class="activity-type-indicator-container">
    <border-layout-panel
      class="border-layout-panel"
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
          label="活动类型"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="label"
          label="标签"
          show-tooltip-when-overflow
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
          新建活动类型
        </el-button>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      :mode="dialogMode"
      :visible.sync="dialogVisible"
      :entity="anchorEntity"
      :create-rules="createRules"
      :edit-rules="editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="活动类型" prop="string_id">
        <el-input
          v-model="anchorEntity.string_id"
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
import resolveResponse from '@/util/response';
import {
  exists, all, insert, remove, update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTypeIndicator';

export default {
  name: 'ActivityTypeIndicator',
  components: { EntityMaintainDialog, BorderLayoutPanel, TablePanel },
  data() {
    const keyValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('活动类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('活动类型已经存在'));
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
        string_id: '',
        label: '',
        remark: '',
      },
      createRules: {
        string_id: [
          { validator: keyValidator, trigger: 'blur' },
        ],
        label: [
          { required: true, message: '标签不能为空', trigger: 'blur' },
        ],
      },
      editRules: {
        label: [
          { required: true, message: '标签不能为空', trigger: 'blur' },
        ],
      },
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
      resolveResponse(all(this.currentPage, this.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(res.total_pages - 1, this.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    updateTableView(res) {
      this.entities = res;
      this.currentPage = res.current_page;
    },
    handleEntityCreate() {
      resolveResponse(insert(
        this.anchorEntity.string_id,
        this.anchorEntity.label,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `活动类型 ${this.anchorEntity.string_id} 创建成功`,
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
        this.anchorEntity.string_id,
        this.anchorEntity.label,
        this.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `活动类型 ${this.anchorEntity.string_id} 更新成功`,
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
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    handleEntityDelete(node, entity) {
      Promise.resolve(entity.key.string_id)
        .then((res) => this.$confirm('此操作将永久删除此活动类型。<br>'
          + '如果已经有活动属于这个类型，那么该银行的类型将会变为"（未知）"！<br>'
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
            message: `活动类型 ${res} 删除成功`,
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
      this.anchorEntity.string_id = entity.key.string_id;
      this.anchorEntity.label = entity.label;
      this.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.dialogMode = mode;
      this.$nextTick(() => {
        this.dialogVisible = true;
      });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.activity-type-indicator-container {
  width: 100%;
  height: 100%;
}
</style>
