<template>
  <div class="memo-history-container">
    <border-layout-panel
      class="border-layout-panel"
      west-width="30%"
      :west-visible="true"
    >
      <div class="west-container" slot="west" v-loading="westLoading">
        <header-layout-panel>
          <template v-slot:header>
            <div class="header-container">
              <div class="header-row">
                <el-input
                  class="profile-search-bar"
                  v-model="profileSearchBar.value"
                  clearable
                  @keydown.enter.native="handleSearch"
                  @clear="handleSearch"
                >
                  <template v-slot:prepend>
                    <span>概要</span>
                  </template>
                  <template v-slot:append>
                    <el-button
                      icon="el-icon-search"
                      @click="handleSearch"
                    />
                  </template>
                </el-input>
                <el-select class="selector" v-model="statusSelector.value" @change="handleSearch">
                  <el-option
                    v-for="item in statusSelector.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="header-row">
                <el-button
                  type="success"
                  @click="handleSearch"
                >
                  刷新数据
                </el-button>
                <el-divider direction="vertical"/>
                <el-button
                  type="danger"
                  @click="handleRemoveFinished"
                >
                  删除已完成
                </el-button>
              </div>
            </div>
          </template>
          <template v-slot:default>
            <table-panel
              class="table"
              highlight-current-row
              :page-size.sync="table.pageSize"
              :entity-count="parseInt(table.entities.count)"
              :current-page.sync="table.currentPage"
              :page-sizes="[15,20,30,50]"
              :table-data="table.entities.data"
              :table-selection.sync="table.selection"
              :operate-column-width="49"
              :show-contextmenu="true"
              :contextmenu-width="100"
              @onPagingAttributeChanged="handlePagingAttributeChanged"
            >
              <template v-slot:default>
                <el-table-column
                  prop="profile"
                  label="概要"
                  show-tooltip-when-overflow
                />
                <el-table-column
                  prop="status"
                  label="状态"
                  width="63"
                  :resizable="false"
                  :formatter="statusFormatter"
                />
                <el-table-column
                  prop="star_flag"
                  label="星标"
                  width="50px"
                  align="center"
                  :resizable="false"
                >
                  <template v-slot:default="{row,column}">
                    <!--suppress JSUnresolvedReference -->
                    <i class="iconfont">
                      {{ row[column.property] ? '\uffd4' : '\uffd5' }}
                    </i>
                  </template>
                </el-table-column>
              </template>
              <template v-slot:operateColumn="{row}">
                <el-button-group class=operate-column>
                  <el-button
                    class="table-button"
                    size="mini"
                    icon="el-icon-delete"
                    type="danger"
                    @click="handleEntityDelete(row)"
                  />
                </el-button-group>
              </template>
              <template v-slot:contextmenu="{row,close}">
                <ul>
                  <li @click="handleIndependentEditContextmenuClicked(row,close)">
                    独立编辑
                  </li>
                </ul>
              </template>
            </table-panel>
          </template>
        </header-layout-panel>
      </div>
      <div class="center-container">
        <memo-edit-panel
          :memo-id="memoEditPanel.memoId"
          :readonly="memoEditPanel.readonly"
          :upsc="memoEditPanel.upsc"
          @onMemoPropertyUpdated="handleSearch"
        />
      </div>
    </border-layout-panel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import MemoEditPanel from '@/views/items/projectHelper/memo/MemoEditPanel.vue';

import {
  childForUserDefaultOrder as childForUserDefault,
  childForUserFinishedDefaultOrder as childForUserFinished,
  childForUserInProgressDefaultOrder as childForUserInProgress,
  childForUserProfileLikeDefaultOrder as childForUserDefaultProfileLike,
  childForUserFinishedProfileLikeDefaultOrder as childForUserFinishedProfileLike,
  childForUserInProgressProfileLikeDefaultOrder as childForUserInProgressProfileLike,
  remove,
  removeFinishedMemos,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/project/memo';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'MemoHistory',
  components: {
    MemoEditPanel,
    HeaderLayoutPanel,
    BorderLayoutPanel,
    TablePanel,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    'table.selection': {
      handler(value) {
        if (value === null || value === undefined) {
          this.memoEditPanel.memoId = '';
          this.memoEditPanel.readonly = false;
        } else {
          this.memoEditPanel.memoId = value.key.long_id;
          this.memoEditPanel.readonly = value.status === 1;
        }
      },
    },
  },
  data() {
    return {
      westLoading: false,
      profileSearchBar: {
        value: '',
      },
      statusSelector: {
        value: 0,
        options: [
          { value: 0, label: '全部' },
          { value: 1, label: '进行中' },
          { value: 2, label: '已完成' },
        ],
      },
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
      memoEditPanel: {
        memoId: '',
        readonly: false,
        upsc: 'ui_preference.pc.project_helper.memo_history.memo_edit_panel',
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      const pattern = this.profileSearchBar.value;
      if (!pattern) {
        switch (this.statusSelector.value) {
          case 0:
            this.lookupChildForUserDefault(this.me);
            break;
          case 1:
            this.lookupChildForUserInProgress(this.me);
            break;
          case 2:
          default:
            this.lookupChildForUserFinished(this.me);
        }
      } else {
        switch (this.statusSelector.value) {
          case 0:
            this.lookupChildForUserDefaultProfileLike(this.me, pattern);
            break;
          case 1:
            this.lookupChildForUserInProgressProfileLike(this.me, pattern);
            break;
          case 2:
          default:
            this.lookupChildForUserFinishedProfileLike(this.me, pattern);
        }
      }
    },
    lookupChildForUserDefault(user) {
      this.westLoading = true;
      resolveResponse(childForUserDefault(
        user, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUserDefault(
              user, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.westLoading = false;
        });
    },
    lookupChildForUserInProgress(user) {
      this.westLoading = true;
      resolveResponse(childForUserInProgress(
        user, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUserInProgress(
              user, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.westLoading = false;
        });
    },
    lookupChildForUserFinished(user) {
      this.westLoading = true;
      resolveResponse(childForUserFinished(
        user, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUserFinished(
              user, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.westLoading = false;
        });
    },
    lookupChildForUserDefaultProfileLike(user, pattern) {
      this.westLoading = true;
      resolveResponse(childForUserDefaultProfileLike(
        user, pattern, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUserDefaultProfileLike(
              user, pattern, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.westLoading = false;
        });
    },
    lookupChildForUserInProgressProfileLike(user, pattern) {
      this.westLoading = true;
      resolveResponse(childForUserInProgressProfileLike(
        user, pattern, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUserInProgressProfileLike(
              user, pattern, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.westLoading = false;
        });
    },
    lookupChildForUserFinishedProfileLike(user, pattern) {
      this.westLoading = true;
      resolveResponse(childForUserFinishedProfileLike(
        user, pattern, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForUserFinishedProfileLike(
              user, pattern, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.westLoading = false;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handleEntityDelete(row) {
      let message;
      if (row.status === 0) {
        message = '<b>您正在删除还未完成的备忘录！</b><br>此操作将永久删除此备忘录，该操作不可恢复。<br>是否继续?';
      } else {
        message = '此操作将永久删除此备忘录，该操作不可恢复。<br>是否继续?';
      }
      Promise.resolve(row.key.long_id)
        .then((res) => this.$confirm(message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录已删除',
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
    statusFormatter(row, column) {
      switch (row[column.property]) {
        case 0:
          return '进行中';
        case 1:
          return '已完成';
        default:
          return '进行中';
      }
    },
    handleRemoveFinished() {
      this.$confirm('此操作将永久删除所有已完成的备忘录。<br>'
        + '该操作不可恢复！<br>'
        + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box__w500',
        type: 'warning',
      })
        .then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => {
          this.loading = true;
        })
        .then(() => resolveResponse(removeFinishedMemos()))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录删除成功',
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
          this.loading = false;
        });
    },
    handleIndependentEditContextmenuClicked(row, close) {
      close();
      this.$router.push({
        name: 'projectHelper.memoEditor',
        query: { 'memo-id': row.key.long_id },
      });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.memo-history-container {
  width: 100%;
  height: 100%;
}

.west-container {
  width: 100%;
  height: 100%;
}

.west-container .header-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.west-container .header-container .header-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.west-container .header-container .header-row:not(:last-child){
  margin-bottom: 5px;
}

/*noinspection CssUnusedSymbol*/
.west-container .header-container .el-divider--vertical {
  margin: 0 8px;
}

.west-container .header-container .profile-search-bar {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
}

.west-container .header-container .selector{
  width: 100px;
}

.west-container .table .table-button {
  padding: 7px;
}

.center-container {
  width: 100%;
  height: 100%;
}
</style>
