<template>
  <div class="message-authorize-container">
    <border-layout-panel header-visible>
      <template v-slot:header>
        <div class="header-container">
          <el-button type="primary" @click="handleShowEntityCreateDialog">新建授权</el-button>
          <el-divider direction="vertical"/>
          <el-button type="success" @click="handleSearch">刷新</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-container"
          v-loading="table.loading"
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="table.entities.data"
          :show-contextmenu="true"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
          @onEntityInspect="handleShowEntityInspectDialog"
          @onEntityEdit="handleShowEntityEditDialog"
          @onEntityDelete="handleEntityDelete"
        >
          <template v-slot:default>
            <el-table-column
              prop="authorized_send_account"
              label="用户"
              show-tooltip-when-overflow
              :formatter="accountFormatter"
            />
            <el-table-column
              prop="enabled"
              label="授权"
              show-tooltip-when-overflow
              :formatter="booleanFormatter"
            />
            <el-table-column
              prop="remark"
              label="备注"
              show-tooltip-when-overflow
            />
            <el-table-column
              prop="created_date"
              label="创建时间"
              width="180px"
              show-tooltip-when-overflow
              :formatter="timestampFormatter"
            />
          </template>
        </table-panel>
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      :loading="maintainDialog.loading > 0"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.createRules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="用户" prop="authorized_send_user_id">
        <!--suppress JSUnresolvedReference -->
        <account-selector
          v-if="maintainDialog.mode === 'CREATE'"
          v-model="maintainDialog.anchorEntity.authorized_send_user_id"
          :filter="(d)=> d.key.string_id !== me"
        />
        <el-input
          v-else
          v-model="maintainDialog.anchorEntity.authorized_send_user_id"
          readonly
        />
      </el-form-item>
      <el-form-item label="授权" prop="enabled">
        <el-switch
          v-model="maintainDialog.anchorEntity.enabled"
          active-text="是"
          inactive-text="否"
          :disabled="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
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
import AccountSelector from '@/views/items/systemSettings/account/AccountSelector.vue';

import resolveResponse from '@/util/response';
import {
  childForReceiveAccountDisp,
  create,
  exists,
  remove,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/messageAuthorization';

import { formatTimestamp } from '@/util/timestamp';

// noinspection JSAnnotator
export default {
  name: 'MessageAuthorize',
  components: {
    AccountSelector, EntityMaintainDialog, TablePanel, BorderLayoutPanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  data() {
    const authorizedSendUserIdValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('用户不能为空'));
            return Promise.reject();
          }
          return resolveResponse(exists(this.me, res));
        })
        .then((res) => {
          if (res) {
            callback(new Error('用户授权已存在'));
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
      table: {
        loading: 0,
        pageSize: 15,
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
      },
      maintainDialog: {
        loading: 0,
        mode: 'CREATE',
        visible: false,
        anchorEntity: {
          authorized_send_user_id: '',
          enabled: false,
          remark: '',
        },
        createRules: {
          authorized_send_user_id: [
            { validator: authorizedSendUserIdValidator, trigger: 'blur' },
          ],
        },
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.table.loading += 1;
      resolveResponse(childForReceiveAccountDisp(
        this.me, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForReceiveAccountDisp(
              this.me, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.table.loading -= 1;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    accountFormatter(row, column) {
      const account = row[column.property];
      return `${account.display_name}(${account.key.string_id})`;
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleShowEntityCreateDialog() {
      this.showEntityMaintainDialog('CREATE');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showEntityMaintainDialog('INSPECT');
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showEntityMaintainDialog('EDIT');
    },
    syncAnchorEntity(entity) {
      const { anchorEntity } = this.maintainDialog;
      anchorEntity.authorized_send_user_id = entity.key.authorized_send_user_id;
      anchorEntity.enabled = entity.enabled;
      anchorEntity.remark = entity.remark;
    },
    showEntityMaintainDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleEntityCreate() {
      this.maintainDialog.loading += 1;
      resolveResponse(create(
        this.me,
        this.maintainDialog.anchorEntity.authorized_send_user_id,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '留言授权创建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading -= 1;
        });
    },
    handleEntityEdit() {
      this.maintainDialog.loading += 1;
      resolveResponse(update(
        this.me,
        this.maintainDialog.anchorEntity.authorized_send_user_id,
        this.maintainDialog.anchorEntity.enabled,
        this.maintainDialog.anchorEntity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '留言授权更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .then(() => {
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading -= 1;
        });
    },
    handleEntityDelete(index, entity) {
      let deleteFlag = false;
      Promise.resolve(entity.key.authorized_send_user_id)
        .then((res) => this.$confirm('此操作将永久删除此留言授权。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => {
          this.table.loading += 1;
          deleteFlag = true;
          return resolveResponse(remove(this.me, res)).then(() => res);
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: '留言授权删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          if (deleteFlag) {
            this.table.loading -= 1;
          }
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.message-authorize-container {
  height: 100%;
  width: 100%;
}

.message-authorize-container .header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.message-authorize-container .header-container .el-divider--vertical {
  margin: 0 8px;
}

.message-authorize-container .table-container {
  width: 100%;
  height: 100%;
}
</style>
