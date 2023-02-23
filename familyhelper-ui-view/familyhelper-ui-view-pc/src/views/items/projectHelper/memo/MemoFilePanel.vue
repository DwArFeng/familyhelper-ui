<template>
  <div class="memo-file-panel-container">
    <div class="placeholder" v-if="memoId===''">请选择备忘录</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="uploadDialog.visible=true"
            >
              上传文件
            </el-button>
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="createDialog.visible=true"
            >
              新建文件
            </el-button>
            <el-divider direction="vertical"/>
            <el-button
              class="item"
              type="success"
              @click="handleSearch"
            >
              刷新文件
            </el-button>
            <el-divider direction="vertical"/>
            <el-select
              class="select"
              v-model="orderSelector.model"
              @change="handleSearch"
            >
              <el-option
                v-for="item in orderSelector.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
            :operate-column-width="130"
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
                  @click="handleFileInspect(row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  :disabled="editTableButtonDisabled(row)"
                  @click="handleFileEdit(row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-download"
                  type="success"
                  @click="handleFileDownload(row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  :disabled="deleteTableButtonDisabled()"
                  @click="handleFileDelete(row)"
                />
              </el-button-group>
            </template>
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <file-upload-dialog
      title="上传文件"
      :visible.sync="uploadDialog.visible"
      @onConfirmed="handleUploadConfirmed"
    />
    <file-create-dialog
      title="新建文件"
      :visible.sync="createDialog.visible"
      @onConfirmed="handleCreateConfirmed"
    />
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import FileCreateDialog from '@/components/file/FileCreateDialog.vue';
import FileUploadDialog from '@/components/file/FileUploadDialog.vue';
import TablePanel from '@/components/layout/TablePanel.vue';

import { PROJECT_MEMO_FILE } from '@/views/items/miscellaneous/fileEditor/filtTypeConstants';

import {
  childForMemo, childForMemoCreatedDateAsc,
  childForMemoInspectedDateDesc,
  childForMemoModifiedDateDesc, childForMemoOriginNameAsc, download, remove,
  upload,
} from '@/api/project/memoFile';
import resolveResponse from '@/util/response';
import { fileType } from '@/util/file';
import { dataSizePreset, formatUnit } from '@/util/number';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'MemoFilePanel',
  components: {
    TablePanel, FileUploadDialog, FileCreateDialog, HeaderLayoutPanel,
  },
  props: {
    memoId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      required: true,
    },
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
        return typeIndex !== 0 || this.readonly;
      };
    },
    deleteTableButtonDisabled() {
      return () => this.readonly;
    },
  },
  watch: {
    memoId() {
      this.handleSearch();
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
      loading: false,
      orderSelector: {
        model: 'default',
        options: [
          { value: 'default', label: '默认' },
          { value: 'inspected_date_desc', label: '最近浏览' },
          { value: 'modified_date_desc', label: '最近编辑' },
          { value: 'origin_name_asc', label: '文件名称' },
          { value: 'created_date_asc', label: '创建时间' },
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
        loading: false,
      },
      uploadDialog: {
        visible: false,
      },
      createDialog: {
        visible: false,
      },
    };
  },
  methods: {
    handleSearch() {
      if (this.memoId === '') {
        return;
      }
      switch (this.orderSelector.model) {
        case 'default':
          this.lookupDefault();
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
          this.lookupDefault();
          break;
      }
    },
    lookupDefault() {
      this.loading = true;
      resolveResponse(
        childForMemo(this.memoId, this.table.currentPage, this.table.pageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForMemo(
              this.memoId, res.total_pages, this.table.pageSize,
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
    lookupInspectedDateDesc() {
      this.loading = true;
      resolveResponse(childForMemoInspectedDateDesc(
        this.memoId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoInspectedDateDesc(childForMemo(
              this.memoId, res.total_pages, this.table.pageSize,
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
    lookupModifiedDateDesc() {
      this.loading = true;
      resolveResponse(childForMemoModifiedDateDesc(
        this.memoId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoModifiedDateDesc(childForMemo(
              this.memoId, res.total_pages, this.table.pageSize,
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
    lookupOriginNameAsc() {
      this.loading = true;
      resolveResponse(childForMemoOriginNameAsc(
        this.memoId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoOriginNameAsc(childForMemo(
              this.memoId, res.total_pages, this.table.pageSize,
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
    lookupCreatedDateAsc() {
      this.loading = true;
      resolveResponse(childForMemoCreatedDateAsc(
        this.memoId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForMemoCreatedDateAsc(childForMemo(
              this.memoId, res.total_pages, this.table.pageSize,
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
    unitFormatter(row, column) {
      return formatUnit(row[column.property], dataSizePreset);
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleFileInspect(row) {
      this.$router.push({
        name: 'miscellaneous.fileEditor',
        query: { type: PROJECT_MEMO_FILE, id: row.key.long_id, action: 'inspect' },
      });
    },
    handleFileEdit(row) {
      this.$router.push({
        name: 'miscellaneous.fileEditor',
        query: { type: PROJECT_MEMO_FILE, id: row.key.long_id, action: 'edit' },
      });
    },
    handleFileDownload(row) {
      download(row.key.long_id)
        .then((blob) => {
          // noinspection JSUnresolvedVariable
          const fileName = row.origin_name;
          const link = document.createElement('a');
          // noinspection JSCheckFunctionSignatures
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(link.href);
        });
    },
    handleFileDelete(row) {
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
        .then(() => resolveResponse(remove(row.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '备忘录文件删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.$emit('onMemoFileUpdated');
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleUploadConfirmed(files, callback) {
      const promises = [];
      files.forEach((file) => {
        const formData = new FormData();
        formData.append('file', file.blob, file.name);
        promises.push(resolveResponse(upload(this.memoId, formData)));
      });
      Promise.all(promises)
        .then(() => {
          this.$message({
            showClose: true,
            message: '文件上传成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.$emit('onMemoFileUpdated');
        })
        .then(() => {
          callback(true);
        })
        .catch(() => {
          callback(false);
        });
    },
    handleCreateConfirmed(file, callback) {
      const formData = new FormData();
      formData.append('file', file.blob, file.name);
      resolveResponse(upload(this.memoId, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '文件新建成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.$emit('onMemoFileUpdated');
        })
        .then(() => {
          callback(true);
        })
        .catch(() => {
          callback(false);
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.memo-file-panel-container {
  height: 100%;
  width: 100%;
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

.header-container .select {
  width: 110px;
}

.table .icon-wrapper {
  height: 32px;
  line-height: 32px;
}

.table .icon {
  font-size: 32px;
  user-select: none;
}

.table .table-button {
  padding: 7px;
}
</style>