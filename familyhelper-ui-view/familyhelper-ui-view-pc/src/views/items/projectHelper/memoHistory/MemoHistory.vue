<template>
  <div class="memo-history-container">
    <border-layout-panel
      class="border-layout-panel"
      :west-visible="true"
    >
      <div class="west-container" slot="west" v-loading="memoTable.loading">
        <header-layout-panel>
          <template v-slot:header>
            <div class="header">
              <el-button
                type="danger"
                @click="handleRemoveFinishedMemos"
              >
                删除已完成
              </el-button>
              <el-divider direction="vertical"/>
              <el-select class="selector" v-model="selector.value" @change="handleMemoSearch">
                <el-option
                  v-for="item in selector.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </template>
          <template v-slot:default>
            <table-panel
              class="table-panel"
              highlight-current-row
              :page-size.sync="memoTable.pageSize"
              :entity-count="parseInt(memoTable.entities.count)"
              :current-page.sync="memoTable.currentPage"
              :page-sizes="[15,20,30,50]"
              :table-data="memoTable.entities.data"
              :show-contextmenu="false"
              :table-selection.sync="memoTable.selection"
              :operate-column-width="49"
              @onPagingAttributeChanged="handleMemoTablePagingAttributeChanged"
            >
              <template v-slot:default>
                <el-table-column
                  prop="profile"
                  label="简报"
                  show-tooltip-when-overflow
                />
                <el-table-column
                  prop="status"
                  label="状态"
                  width="63"
                  :resizable="false"
                  :formatter="statusFormatter"
                />
              </template>
              <template v-slot:operateColumn="{row}">
                <el-button-group class=operate-column>
                  <el-button
                    class="table-button"
                    size="mini"
                    icon="el-icon-delete"
                    type="danger"
                    @click="handleMemoDelete(row)"
                  />
                </el-button-group>
              </template>
            </table-panel>
          </template>
        </header-layout-panel>
      </div>
      <div class="center-container" v-loading="memoDetail.loading">
        <div class="placeholder" v-if="memoDetail.entity===null">请选择备忘录</div>
        <div class="wrapper" v-else>
          <header-layout-panel>
            <template v-slot:header>
              <div class="header">
                <el-button
                  class="item"
                  type="success"
                  @click="handleMemoFileSearch"
                >
                  刷新文件
                </el-button>
                <el-divider direction="vertical"/>
                <el-select
                  class="select"
                  v-model="memoDetail.select.model"
                  @change="handleMemoDetailRefresh"
                >
                  <el-option
                    v-for="item in memoDetail.select.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </template>
            <template v-slot:default>
              <div class="details-wrapper">
                <title-layout-panel class="details" title="属性" bordered>
                  <el-form
                    class="property-form"
                    label-position="left"
                    label-width="80px"
                    inline
                    :model="memoDetail.entity"
                  >
                    <el-form-item label="简报" style="width: 100%">
                      {{ memoDetail.entity.profile }}
                    </el-form-item>
                    <el-form-item label="备注" style="width: 100%">
                      {{ memoDetail.entity.remark }}
                    </el-form-item>
                    <el-form-item label="创建日期" style="width: 50%">
                      {{ wrappedFormatTimestamp(memoDetail.entity.created_date) }}
                    </el-form-item>
                    <el-form-item label="修改日期" style="width: 50%">
                      {{ wrappedFormatTimestamp(memoDetail.entity.modified_date) }}
                    </el-form-item>
                  </el-form>
                </title-layout-panel>
                <title-layout-panel class="details" title="文件" bordered>
                  <table-panel
                    class="table-panel"
                    v-loading="memoFileTable.loading"
                    :page-size.sync="memoFileTable.pageSize"
                    :entity-count="parseInt(memoFileTable.entities.count)"
                    :current-page.sync="memoFileTable.currentPage"
                    :page-sizes="[10,15,20,30]"
                    :table-data="memoFileTable.entities.data"
                    :operate-column-width="76"
                  >
                    <template v-slot:default>
                      <el-table-column
                        label="图标"
                        width="53px"
                        :resizable="false"
                      >
                        <template v-slot:default="{row}">
                          <div class="icon-wrapper">
                            <!--suppress JSUnresolvedVariable -->
                            <i class="iconfont icon">{{ row.origin_name | fileType }}</i>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="origin_name"
                        label="文件名称"
                        show-tooltip-when-overflow
                      />
                      <el-table-column
                        prop="length"
                        label="大小"
                        width="95px"
                        show-tooltip-when-overflow
                        :formatter="unitFormatter"
                      />
                      <el-table-column
                        prop="inspected_date"
                        label="查看日期"
                        width="180px"
                        show-tooltip-when-overflow
                        :formatter="timestampFormatter"
                      />
                      <el-table-column
                        prop="modified_date"
                        label="编辑日期"
                        width="180px"
                        show-tooltip-when-overflow
                        :formatter="timestampFormatter"
                      />
                      <el-table-column
                        prop="created_date"
                        label="创建日期"
                        width="180px"
                        show-tooltip-when-overflow
                        :formatter="timestampFormatter"
                      />
                      <el-table-column
                        prop="remark"
                        label="备注"
                        show-tooltip-when-overflow
                      />
                    </template>
                    <template v-slot:operateColumn="{row}">
                      <el-button-group class=operate-column>
                        <el-button
                          class="table-button"
                          size="mini"
                          icon="el-icon-search"
                          type="success"
                          :disabled="inspectTableButtonDisabled(row)"
                          @click="handleMemoFileInspect(row)"
                        />
                        <el-button
                          class="table-button"
                          size="mini"
                          icon="el-icon-download"
                          type="success"
                          :disabled="inspectTableButtonDisabled(row)"
                          @click="handleMemoFileDownload(row)"
                        />
                      </el-button-group>
                    </template>
                  </table-panel>
                </title-layout-panel>
              </div>
            </template>
          </header-layout-panel>
        </div>
      </div>
    </border-layout-panel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';

import {
  inspect as inspectMemo,
  childForUser as childMemoForUser,
  childForUserInProgress as childMemoForUserInProgress,
  childForUserFinished as childMemoForUserFinished,
  remove as removeMemo,
  removeFinishedMemos,
} from '@/api/project/memo';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import { dataSizePreset, formatUnit } from '@/util/number';
import {
  childForMemo, childForMemoCreatedDateAsc,
  childForMemoInspectedDateDesc,
  childForMemoModifiedDateDesc, childForMemoOriginNameAsc,
  download, remove,
} from '@/api/project/memoFile';
import { fileType } from '@/util/file';

// noinspection JSAnnotator
export default {
  name: 'MemoHistory',
  components: {
    TitleLayoutPanel, HeaderLayoutPanel, BorderLayoutPanel, TablePanel,
  },
  computed: {
    inspectTableButtonDisabled() {
      return (row) => {
        // noinspection JSUnresolvedVariable
        const typeIndex = fileType(row.origin_name);
        return typeIndex < 0;
      };
    },
    editTableButtonDisabled() {
      return (row) => {
        // noinspection JSUnresolvedVariable
        const typeIndex = fileType(row.origin_name);
        return typeIndex !== 0;
      };
    },
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    'memoTable.selection': {
      handler() {
        this.handleMemoDetailRefresh();
      },
    },
  },
  filters: {
    fileType(fileName) {
      const typeIndex = fileType(fileName);
      switch (typeIndex) {
        case 0:
          return '\uffe4';
        case 1:
          return '\uffe3';
        default:
          return '\uffe5';
      }
    },
  },
  data() {
    return {
      memoTable: {
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
        loading: false,
      },
      memoDetail: {
        entity: null,
        loading: false,
        select: {
          model: 'default',
          options: [
            { value: 'default', label: '默认' },
            { value: 'inspected_date_desc', label: '最近浏览' },
            { value: 'modified_date_desc', label: '最近编辑' },
            { value: 'origin_name_asc', label: '文件名称' },
            { value: 'created_date_asc', label: '创建时间' },
          ],
        },
      },
      memoFileTable: {
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
        loading: false,
      },
      uploadDialog: {
        memoId: '',
        visible: false,
      },
      createDialog: {
        memoId: '',
        visible: false,
      },
      selector: {
        value: 0,
        options: [
          { value: 0, label: '全部' },
          { value: 1, label: '进行中' },
          { value: 2, label: '已完成' },
        ],
      },
    };
  },
  methods: {
    handleMemoTablePagingAttributeChanged() {
      this.handleMemoSearch();
    },
    handleMemoSearch() {
      switch (this.selector.value) {
        case 0:
          this.childMemoForUser(this.me);
          break;
        case 1:
          this.childMemoForUserInProgress(this.me);
          break;
        case 2:
        default:
          this.childMemoForUserFinished(this.me);
      }
    },
    childMemoForUser(user) {
      this.memoTable.loading = true;
      resolveResponse(childMemoForUser(
        user, this.memoTable.currentPage, this.memoTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childMemoForUser(
              user, res.total_pages, this.memoTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoTable.loading = false;
        });
    },
    childMemoForUserInProgress(user) {
      this.memoTable.loading = true;
      resolveResponse(childMemoForUserInProgress(
        user, this.memoTable.currentPage, this.memoTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childMemoForUserInProgress(
              user, res.total_pages, this.memoTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoTable.loading = false;
        });
    },
    childMemoForUserFinished(user) {
      this.memoTable.loading = true;
      resolveResponse(childMemoForUserFinished(
        user, this.memoTable.currentPage, this.memoTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childMemoForUserFinished(
              user, res.total_pages, this.memoTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoTable.loading = false;
        });
    },
    handleMemoDetailRefresh() {
      if (this.memoTable.selection === null) {
        this.memoDetail.entity = null;
        this.memoFileTable.entities.current_page = 0;
        this.memoFileTable.entities.total_pages = 0;
        this.memoFileTable.entities.rows = 0;
        this.memoFileTable.entities.count = '0';
        this.memoFileTable.entities.data = [];
        this.uploadDialog.memoId = '';
        this.createDialog.memoId = '';
      } else {
        this.memoDetail.loading = true;
        const memoId = this.memoTable.selection.key.long_id;
        this.uploadDialog.memoId = memoId;
        this.createDialog.memoId = memoId;
        resolveResponse(inspectMemo(memoId))
          .then((res) => {
            this.memoDetail.entity = res;
          })
          .catch(() => {
          })
          .finally(() => {
            this.memoDetail.loading = false;
          });
        this.handleMemoFileSearch();
      }
    },
    handleMemoFileSearch() {
      switch (this.memoDetail.select.model) {
        case 'default':
          this.lookupChildForMemo();
          break;
        case 'inspected_date_desc':
          this.lookupInspectedDateDesc();
          break;
        case 'modified_date_desc':
          this.lookupModifiedDateDesc();
          break;
        case 'origin_name_asc':
          this.lookupOriginNameAsc();
          break;
        case 'created_date_asc':
          this.lookupCreatedDateAsc();
          break;
        default:
          this.lookupChildForMemo();
          break;
      }
    },
    lookupChildForMemo() {
      const memoId = this.memoTable.selection.key.long_id;
      this.memoFileTable.loading = true;
      resolveResponse(
        childForMemo(memoId, this.memoFileTable.currentPage, this.memoFileTable.pageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForMemo(
              memoId, res.total_pages, this.memoFileTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoFileTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoFileTable.loading = false;
        });
    },
    lookupInspectedDateDesc() {
      const memoId = this.memoTable.selection.key.long_id;
      this.memoFileTable.loading = true;
      resolveResponse(childForMemoInspectedDateDesc(
        memoId, this.memoFileTable.currentPage, this.memoFileTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoInspectedDateDesc(childForMemo(
              memoId, res.total_pages, this.memoFileTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoFileTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoFileTable.loading = false;
        });
    },
    lookupModifiedDateDesc() {
      const memoId = this.memoTable.selection.key.long_id;
      this.memoFileTable.loading = true;
      resolveResponse(childForMemoModifiedDateDesc(
        memoId, this.memoFileTable.currentPage, this.memoFileTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoModifiedDateDesc(childForMemo(
              memoId, res.total_pages, this.memoFileTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoFileTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoFileTable.loading = false;
        });
    },
    lookupOriginNameAsc() {
      const memoId = this.memoTable.selection.key.long_id;
      this.memoFileTable.loading = true;
      resolveResponse(childForMemoOriginNameAsc(
        memoId, this.memoFileTable.currentPage, this.memoFileTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoOriginNameAsc(childForMemo(
              memoId, res.total_pages, this.memoFileTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoFileTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoFileTable.loading = false;
        });
    },
    lookupCreatedDateAsc() {
      const memoId = this.memoTable.selection.key.long_id;
      this.memoFileTable.loading = true;
      resolveResponse(childForMemoCreatedDateAsc(
        memoId, this.memoFileTable.currentPage, this.memoFileTable.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoCreatedDateAsc(childForMemo(
              memoId, res.total_pages, this.memoFileTable.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateMemoFileTableView)
        .catch(() => {
        })
        .finally(() => {
          this.memoFileTable.loading = false;
        });
    },
    updateMemoTableView(res) {
      this.memoTable.entities = res;
      this.memoTable.currentPage = res.current_page;
    },
    updateMemoFileTableView(res) {
      this.memoFileTable.entities = res;
      this.memoFileTable.currentPage = res.current_page;
    },
    handleShowMemoEditDialog(entity) {
      this.syncAnchorMemo(entity);
      this.showDialog('EDIT');
    },
    wrappedFormatTimestamp(timestamp) {
      if (timestamp === null || timestamp === undefined || timestamp === 0) {
        return '（暂无）';
      }
      return formatTimestamp(timestamp);
    },
    unitFormatter(row, column) {
      return formatUnit(row[column.property], dataSizePreset);
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleMemoFileInspect(row) {
      this.$router.push({
        name: 'miscellaneous.fileEditor',
        query: { type: 'project-memo-file', action: 'inspect', id: row.key.long_id },
      });
    },
    handleMemoFileEdit(row) {
      this.$router.push({
        name: 'miscellaneous.fileEditor',
        query: { type: 'project-memo-file', action: 'edit', id: row.key.long_id },
      });
    },
    handleMemoFileDownload(memoFileInfo) {
      download(memoFileInfo.key.long_id)
        .then((blob) => {
          // noinspection JSUnresolvedVariable
          const fileName = memoFileInfo.origin_name;
          const link = document.createElement('a');
          // noinspection JSCheckFunctionSignatures
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(link.href);
        });
    },
    handleMemoFileDelete(memoFileInfo) {
      this.$confirm('此操作将永久删除此备忘录文件。<br>'
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
        .then(() => resolveResponse(remove(memoFileInfo.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录文件删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleMemoFileSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleMemoDelete(row) {
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
        .then((res) => resolveResponse(removeMemo(res)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录已删除',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleMemoSearch();
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
    handleRemoveFinishedMemos() {
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
          this.handleMemoSearch();
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.handleMemoSearch();
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
  display: flex;
  flex-direction: column;
}

.west-container .table-panel {
  height: 0;
  flex-grow: 1;
}

.center-container {
  width: 100%;
  height: 100%;
}

.center-container .wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.center-container .wrapper .table-panel {
  width: 100%;
  height: 100%;
}

.center-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.center-container .property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.center-container .property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.center-container .property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.center-container .select {
  width: 110px;
}

.center-container .table-panel .icon-wrapper {
  height: 32px;
  line-height: 32px;
}

.center-container .table-panel .icon {
  font-size: 32px;
  user-select: none;
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

/*noinspection CssUnusedSymbol*/
.el-divider.horizontal {
  margin-top: 8px;
  margin-bottom: 8px;
}

.table-panel .table-button {
  padding: 7px;
}

.west-container .selector{
  width: 125px;
}

.details-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.details-wrapper .details:not(:first-child){
  margin-top: 5px;
}

.details-wrapper .details:last-child{
  height: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.west-container .header .el-divider{
  margin: 0 8px;
}

/*noinspection CssUnusedSymbol*/
.center-container .header .el-divider{
  margin: 0 8px;
}
</style>
