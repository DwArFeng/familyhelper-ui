<template>
  <div class="login-history-panel-container">
    <div class="placeholder" v-if="accountId===''">请选择账号</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <el-button
              class="item icon-button"
              v-if="mode==='DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <table-panel
            class="table"
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[10,15,20,30]"
            :table-data="table.entities.data"
            :operate-column-width="50"
            :inspect-button-visible="true"
            :edit-button-visible="false"
            :delete-button-visible="false"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
            @onEntityInspect="handleShowLoginHistoryInspectDialog"
          >
            <el-table-column
              prop="happened_date"
              label="登录日期"
              width="180px"
              show-tooltip-when-overflow
              :formatter="timestampFormatter"
            />
            <el-table-column
              prop="response_code"
              label="登录响应"
              width="135px"
              show-tooltip-when-overflow
              :formatter="responseCodeFormatter"
            />
            <el-table-column
              prop="message"
              label="消息"
              show-tooltip-when-overflow
            />
            <el-table-column
              prop="alarm_level"
              label="警报级别"
              width="80px"
              show-tooltip-when-overflow
            />
            <el-table-column
              prop="login_remark"
              label="登录备注"
              show-tooltip-when-overflow
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <login-history-inspect-dialog
      :visible.sync="inspectDialog.visible"
      :login-history-id="inspectDialog.loginHistoryId"
    />
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import LoginHistoryInspectDialog
from '@/views/items/systemSettings/accountSecurity/LoginHistoryInspectDialog.vue';

import { formatTimestamp } from '@/util/timestamp';
import { accountIdEquals } from '@/api/system/loginHistory';
import resolveResponse from '@/util/response';

export default {
  name: 'LoginHistoryPanel',
  components: { LoginHistoryInspectDialog, TablePanel, HeaderLayoutPanel },
  props: {
    accountId: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'DEFAULT',
      validator(value) {
        return ['DEFAULT', 'FLOATY'].indexOf(value) !== -1;
      },
    },
  },
  watch: {
    accountId() {
      this.handleSearch();
    },
  },
  data() {
    return {
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
        pageSize: 10,
      },
      inspectDialog: {
        visible: false,
        loginHistoryId: '',
      },
    };
  },
  methods: {
    handleSearch() {
      if (!this.accountId) {
        return;
      }
      this.loading = true;
      resolveResponse(accountIdEquals(
        this.accountId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(accountIdEquals(
              this.accountId, res.total_pages - 1, this.table.pageSize,
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
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    responseCodeFormatter(row, column) {
      const value = row[column.property];
      switch (value) {
        case 0:
          return '通过';
        case 10:
          return '账号不存在';
        case 20:
          return '账号已禁用';
        case 30:
          return '密码错误';
        case 40:
          return '保护器禁止';
        case 50:
          return '保护器信息不存在';
        default:
          return '（未知）';
      }
    },
    handleShowLoginHistoryInspectDialog(index, row) {
      this.inspectDialog.loginHistoryId = row.key.long_id;
      this.inspectDialog.visible = true;
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.login-history-panel-container {
  width: 100%;
  height: 100%;
  background: #FFFFFF;
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

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  padding: 11px;
}
</style>
