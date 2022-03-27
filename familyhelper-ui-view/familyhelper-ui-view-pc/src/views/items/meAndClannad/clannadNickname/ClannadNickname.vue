<template>
  <div class="clannad-nickname-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
    >
      <table-panel
        class="table-panel"
        :page-size.sync="tablePanel.pageSize"
        :entity-count="parseInt(tablePanel.entities.count)"
        :current-page.sync="tablePanel.currentPage"
        :page-sizes="[15,20,30,50]"
        :table-data="tablePanel.entities.data"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
        @onEntityInspect="handleShowEntityInspectDialog"
        @onEntityEdit="handleShowEntityEditDialog"
        @onEntityDelete="handleEntityDelete"
      >
        <el-table-column
          prop="key.object_user_id"
          label="家人"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="call"
          label="称呼"
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
          新建昵称设置
        </el-button>
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      label-width="100px"
      :mode="maintainDialog.dialogMode"
      :visible.sync="maintainDialog.dialogVisible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.createRules"
      :edit-rules="maintainDialog.editRules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="家人ID" prop="object_user_id">
        <el-input
          v-model="maintainDialog.anchorEntity.object_user_id"
          readonly
          v-if="maintainDialog.dialogMode === 'INSPECT'"
        />
        <el-select
          class='account-select'
          v-model="maintainDialog.anchorEntity.object_user_id"
          placeholder="请选择"
          v-else
        >
          <el-option
            v-for="item in accountIndicator.entities.data"
            :key="item.key.string_id"
            :label="`${item.name}(${item.key.string_id})`"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="称呼" prop="call">
        <el-input
          v-model="maintainDialog.anchorEntity.call"
          :readonly="maintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.dialogMode === 'INSPECT'"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  exists, insert, remove, update, childForSubjectUser,
} from '@/api/clannad/nickname';
import { exists as existsAccount, all as allAccount } from '@/api/system/account';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'ClannadNickname',
  components: { BorderLayoutPanel, TablePanel, EntityMaintainDialog },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  data() {
    const objectUserIdValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('家人ID不能为空'));
            return Promise.reject();
          }
          return resolveResponse(existsAccount(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('家人ID不存在'));
            return Promise.reject();
          }
          return resolveResponse(exists(this.me, value));
        })
        .then((res) => {
          if (res) {
            callback(new Error('对于此家人的昵称已经存在'));
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
      tablePanel: {
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
        dialogVisible: false,
        dialogMode: 'CREATE',
        anchorEntity: {
          object_user_id: '',
          call: '',
          remark: '',
        },
        createRules: {
          object_user_id: [
            { validator: objectUserIdValidator, trigger: 'blur' },
          ],
          call: [
            { required: true, message: '称呼不能为空', trigger: 'blur' },
          ],
        },
        editRules: {
          call: [
            { required: true, message: '称呼不能为空', trigger: 'blur' },
          ],
        },
      },
      accountIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
    };
  },
  methods: {
    handleAccountSearch() {
      this.lookupAllAccount();
    },
    lookupAllAccount() {
      resolveResponse(allAccount(0, 1000))
        .then(this.updateAccountObject)
        .catch(() => {
        });
    },
    updateAccountObject(res) {
      this.accountIndicator.entities = res;
    },
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupChildForSubjectUser();
    },
    lookupChildForSubjectUser() {
      resolveResponse(childForSubjectUser(
        this.me, this.tablePanel.currentPage, this.tablePanel.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForSubjectUser(
              this.me, res.total_pages, this.tablePanel.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    updateTableView(res) {
      this.tablePanel.entities = res;
      this.tablePanel.currentPage = res.current_page;
    },
    handleEntityCreate() {
      resolveResponse(insert(
        this.me,
        this.maintainDialog.anchorEntity.object_user_id,
        this.maintainDialog.anchorEntity.call,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '昵称创建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleEntityEdit() {
      resolveResponse(update(
        this.me,
        this.maintainDialog.anchorEntity.object_user_id,
        this.maintainDialog.anchorEntity.call,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '昵称更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.dialogVisible = false;
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
      this.$confirm('是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      })
        .then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(remove(this.me, entity.key.object_user_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '昵称删除成功',
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
      this.maintainDialog.anchorEntity.object_user_id = entity.key.object_user_id;
      this.maintainDialog.anchorEntity.call = entity.call;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog(mode) {
      this.maintainDialog.dialogMode = mode;
      this.$nextTick(() => {
        this.maintainDialog.dialogVisible = true;
      });
    },
  },
  mounted() {
    this.handleAccountSearch();
    this.handleSearch();
  },
};
</script>

<style scoped>
.clannad-nickname-container {
  width: 100%;
  height: 100%;
}

.account-select {
  width: 100%;
}
</style>
