<template>
  <div class="memo-container">
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
              </div>
              <div class="header-row">
                <el-button type="primary" @click="handleShowCreateDialog">新建</el-button>
                <el-divider direction="vertical"/>
                <el-button type="success" @click="handleSearch">刷新数据</el-button>
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
              :operate-column-width="76"
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
                    icon="el-icon-check"
                    type="success"
                    @click="handleEntityFinish(row)"
                  />
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
          :upsc="memoEditPanel.upsc"
          @onMemoPropertyUpdated="handleSearch"
        />
      </div>
    </border-layout-panel>
    <entity-maintain-dialog
      custom-class="entity-maintain-dialog"
      top="12vh"
      label-width="100px"
      mode="CREATE"
      :visible.sync="maintainDialog.dialogVisible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
    >
      <el-form-item label="概要" prop="profile">
        <el-input
          v-model="maintainDialog.anchorEntity.profile"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
        />
      </el-form-item>
      <el-form-item label="星标" prop="star_flag">
        <el-switch
          v-model="maintainDialog.anchorEntity.star_flag"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-input-number
          class="short-bar"
          v-model="maintainDialog.anchorEntity.priority"
          :min="0"
          :max="10"
        />
      </el-form-item>
      <el-form-item label="预期完成时间" prop="expected_finish_date">
        <!--suppress JSValidateTypes -->
        <el-date-picker
          class="short-bar"
          v-model="maintainDialog.anchorEntity.expected_finish_date"
          type="datetime"
          placeholder="选择时间"
          :picker-options="maintainDialog.pickerOptions"
        />
      </el-form-item>
      <el-form-item label="简报" prop="brief">
        <el-input
          v-model="maintainDialog.anchorEntity.brief"
          type="textarea"
          resize="none"
          :rows="6"
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
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';

import {
  childForUserInProgressDefaultOrder as childForUserInProgress,
  childForUserInProgressProfileLikeDefaultOrder as childForUserInProgressProfileLike,
  create,
  finish,
  remove,
} from '@/api/project/memo';
import resolveResponse from '@/util/response';

import MemoEditPanel from '@/views/items/projectHelper/memo/MemoEditPanel.vue';

// noinspection JSAnnotator
export default {
  name: 'Memo',
  components: {
    MemoEditPanel,
    HeaderLayoutPanel,
    EntityMaintainDialog,
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
        } else {
          this.memoEditPanel.memoId = value.key.long_id;
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
      maintainDialog: {
        loading: false,
        dialogVisible: false,
        dialogMode: 'CREATE',
        anchorEntity: {
          long_id: '',
          profile: '',
          remark: '',
          star_flag: false,
          priority: 0,
          expected_finish_date: null,
          brief: '',
        },
        rules: {
          profile: [
            { required: true, message: '概要不能为空', trigger: 'blur' },
          ],
        },
        pickerOptions: {
          shortcuts: [
            {
              text: '今天',
              onClick(picker) {
                picker.$emit('pick', new Date());
              },
            },
            {
              text: '明天',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24);
                picker.$emit('pick', date);
              },
            },
            {
              text: '一周后',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                picker.$emit('pick', date);
              },
            },
            {
              text: '30天后',
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 30);
                picker.$emit('pick', date);
              },
            },
          ],
        },
      },
      memoEditPanel: {
        memoId: '',
        upsc: 'ui_preference.pc.project_helper.memo.memo_edit_panel',
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
        this.lookupChildForUserInProgress(this.me);
      } else {
        this.lookupChildForUserInProgressProfileLike(this.me, pattern);
      }
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
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
    },
    handleShowCreateDialog() {
      this.showDialog();
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.profile = entity.profile;
      this.maintainDialog.anchorEntity.remark = entity.remark;
      this.maintainDialog.anchorEntity.star_flag = entity.star_flag;
      this.maintainDialog.anchorEntity.priority = entity.priority;
    },
    showDialog() {
      this.maintainDialog.dialogVisible = true;
    },
    handleEntityCreate() {
      this.maintainDialog.loading = true;
      resolveResponse(create(
        this.me,
        this.maintainDialog.anchorEntity.profile,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.star_flag,
        this.maintainDialog.anchorEntity.priority,
        this.maintainDialog.anchorEntity.expected_finish_date,
        this.maintainDialog.anchorEntity.brief,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录创建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.maintainDialog.dialogVisible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
    handleEntityFinish(row) {
      Promise.resolve(row.key.long_id)
        .then((res) => this.$confirm('此操作将会完成该备忘录，此操作不可撤回。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(finish(res)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录已完成',
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
    handleEntityDelete(row) {
      Promise.resolve(row.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此备忘录。<br>'
          + '是否继续?',
        '提示', {
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
.memo-container {
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

.west-container .table .table-button {
  padding: 7px;
}

.center-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.entity-maintain-dialog .short-bar {
  width: 200px;
}
</style>
