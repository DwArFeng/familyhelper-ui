<template>
  <div class="permit-maintain-dialog-container">
    <el-dialog
      id="dialog"
      append-to-body
      destroy-on-close
      title="权限管理"
      top="6vh"
      :visible.sync="dialog.watchedVisible"
      :close-on-click-modal="false"
    >
      <div class="dialog-container">
        <div class="header-container">
          <el-form class="header-form" :inline="true" :model="form">
            <el-form-item class="header-form-item" label="用户">
              <!--suppress JSUnresolvedReference -->
              <account-selector v-model="form.userId" :filter="(d)=> d.key.string_id !== me"/>
            </el-form-item>
            <el-form-item class="header-form-item" label="权限等级">
              <el-select v-model="form.permissionLevel" placeholder="权限等级">
                <el-option
                  v-for="indicator in plIndicator"
                  :key="indicator.key"
                  :label="indicator.label"
                  :value="indicator.key"
                  :disabled="!indicator.selectable"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="header-form-item">
              <el-button
                type="primary"
                :disabled="form.userId === ''"
                @click="handleUpsertButtonClicked"
              >
                添加/更改
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <!--suppress JSUnresolvedFunction -->
        <table-panel
          class="table-container"
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="table.entities.data"
          :inspect-button-visible="false"
          :edit-button-visible="false"
          :delete-button-visible="false"
          :operate-column-width="50"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
        >
          <template v-slot:default>
            <el-table-column
              prop="account"
              label="用户"
              show-tooltip-when-overflow
              :formatter="accountFormatter"
            />
            <el-table-column
              prop="permission_level"
              label="权限等级"
              show-tooltip-when-overflow
              width="85px"
              :formatter="permissionLevelFormatter"
            />
          </template>
          <template v-slot:operateColumn="{$index,row}">
            <!--suppress JSUnresolvedVariable -->
            <el-button
              class="table-button"
              size="mini"
              icon="el-icon-delete"
              type="danger"
              :disabled="row.account.key.string_id === me"
              @click="handleDeleteButtonClicked($index,row)"
            />
          </template>
        </table-panel>
      </div>
      <div class="footer-container" slot="footer">
        <el-button @click="dialog.watchedVisible=false">
          关闭窗口
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import TablePanel from '@/components/layout/TablePanel.vue';
import AccountSelector from '@/views/items/systemSettings/account/AccountSelector.vue';

import resolveResponse from '@/util/response';
import {
  childForCertificateDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/poce';
import {
  removePermission,
  upsertPermission,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/certificate';

// noinspection JSAnnotator
export default {
  name: 'PermitMaintainDialog',
  components: { AccountSelector, TablePanel },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    certificateId: {
      type: String,
      default: '',
    },
  },
  watch: {
    visible(value) {
      this.dialog.watchedVisible = value;
    },
    certificateId(value) {
      if (value === '') {
        return;
      }
      this.handleSearch();
    },
    'dialog.watchedVisible': {
      handler(value) {
        this.$emit('update:visible', value);
      },
    },
  },
  data() {
    return {
      dialog: {
        watchedVisible: false,
      },
      table: {
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
      plIndicator: [
        { key: 0, label: '所有者', selectable: false },
        { key: 1, label: '访客', selectable: true },
      ],
      form: {
        userId: '',
        permissionLevel: 1,
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupChildForCertificate();
    },
    lookupChildForCertificate() {
      resolveResponse(childForCertificateDisp(
        this.certificateId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForCertificateDisp(
              this.certificateId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
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
    permissionLevelFormatter(row, column) {
      for (let i = 0; i < this.plIndicator.length; i += 1) {
        const indicator = this.plIndicator[i];
        if (indicator.key === row[column.property]) {
          return indicator.label;
        }
      }
      return '（未知）';
    },
    handleDeleteButtonClicked(index, row) {
      // noinspection JSUnresolvedVariable
      Promise.resolve(row)
        .then((res) => this.$confirm(
          `此操作将删除 ${row.account.display_name}(${row.account.key.string_id}) 对该账本的权限。<br>是否继续?`,
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          },
        ).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(removePermission(this.certificateId, res.key.user_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '权限删除成功',
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
    handleUpsertButtonClicked() {
      resolveResponse(upsertPermission(
        this.certificateId, this.form.userId, this.form.permissionLevel,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '用户权限添加/更改成功',
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
  },
};
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 68vh;
  display: flex;
  flex-direction: column;
}

.header-container {
  width: 100%;
  margin-bottom: 5px;
}

.header-form {
  display: flex
}

.header-form-item {
  display: flex
}

/*noinspection CssUnusedSymbol*/
.header-form >>> .el-form-item__content {
  flex-grow: 1;
}

.header-form-item:first-child {
  width: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.header-form-item:nth-child(2) >>> .el-form-item__content {
  width: 100px;
}

.header-form-item:last-child {
  margin-right: 0;
}

.table-container {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.table-button {
  padding: 7px
}
</style>
