<template>
  <div class="activity-template-poat-panel-container">
    <div class="placeholder" v-if="activityTemplateId===''">请选择活动模板</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <div class="label with-margin">用户</div>
            <!--suppress JSUnresolvedReference -->
            <account-selector
              class="account-selector with-margin"
              v-model="accountSelector.userId"
              :filter="(d)=> d.key.string_id !== me"
            />
            <div class="label with-margin">权限等级</div>
            <el-select
              class="permission-level-selector with-margin"
              v-model="permissionLevelSelector.permissionLevel"
              placeholder="权限等级"
              :disabled="readonly"
            >
              <el-option
                v-for="indicator in permissionLevelIndicators"
                :key="indicator.key"
                :label="indicator.label"
                :value="indicator.key"
                :disabled="!indicator.selectable"
              />
            </el-select>
            <el-button
              type="primary"
              :disabled="readonly||accountSelector.userId === ''"
              @click="handleUpsertButtonClicked"
            >
              添加/更改
            </el-button>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <el-button
              class="icon-button"
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
                :disabled="readonly||row.account.key.string_id === me"
                @click="handleDeleteButtonClicked($index,row)"
              />
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import AccountSelector from '@/views/items/systemSettings/account/AccountSelector.vue';
import TablePanel from '@/components/layout/TablePanel.vue';

import { childForActivityTemplateDisp } from '@/api/life/poat';
import { upsertPermission, removePermission } from '@/api/life/activityTemplate';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'ActivityTemplatePoatPanel',
  components: { TablePanel, AccountSelector, HeaderLayoutPanel },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  props: {
    activityTemplateId: {
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
    activityTemplateId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: false,
      accountSelector: {
        userId: '',
      },
      permissionLevelSelector: {
        permissionLevel: 1,
      },
      permissionLevelIndicators: [
        { key: 0, label: '所有者', selectable: false },
        { key: 1, label: '访客', selectable: true },
      ],
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
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.activityTemplateId === '') {
        return;
      }
      this.lookupChildForActivityTemplate();
    },
    lookupChildForActivityTemplate() {
      this.loading = true;
      resolveResponse(childForActivityTemplateDisp(
        this.activityTemplateId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForActivityTemplateDisp(
              this.activityTemplateId, res.total_pages - 1, this.table.pageSize,
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
    accountFormatter(row, column) {
      const account = row[column.property];
      return `${account.display_name}(${account.key.string_id})`;
    },
    permissionLevelFormatter(row, column) {
      for (let i = 0; i < this.permissionLevelIndicators.length; i += 1) {
        const indicator = this.permissionLevelIndicators[i];
        if (indicator.key === row[column.property]) {
          return indicator.label;
        }
      }
      return '（未知）';
    },
    handleUpsertButtonClicked() {
      resolveResponse(upsertPermission(
        this.activityTemplateId,
        this.accountSelector.userId,
        this.permissionLevelSelector.permissionLevel,
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
    handleDeleteButtonClicked(index, row) {
      // noinspection JSUnresolvedVariable
      Promise.resolve(row)
        .then((res) => this.$confirm(
          `此操作将删除 ${row.account.display_name}(${row.account.key.string_id}) 对该活动模板的权限。<br>是否继续?`,
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            customClass: 'custom-message-box__w500',
            type: 'warning',
          },
        ).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(
          removePermission(this.activityTemplateId, res.key.user_string_id),
        ))
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
.activity-template-poat-panel-container {
  height: 100%;
  width: 100%;
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

.header-container .label {
  font-size: 14px;
}

.header-container .account-selector {
  width: 200px;
}

.header-container .permission-level-selector {
  width: 100px;
}

.header-container .with-margin {
  margin-right: 10px;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  padding-left: 12px;
  padding-right: 12px;
}

.table-button {
  padding: 7px
}
</style>
