<template>
  <div class="item-file-panel-container">
    <div class="placeholder" v-if="itemId===''">请选择项目</div>
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
              上传附件
            </el-button>
            <el-button
              class="item"
              type="primary"
              :disabled="readonly"
              @click="createDialog.visible=true"
            >
              新建附件
            </el-button>
            <el-button
              class="item"
              type="success"
              @click="handleSearch"
            >
              刷新附件
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
            <div v-if="mode==='DEFAULT'" style="flex-grow: 1"/>
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
            :operate-column-width="130"
            :show-contextmenu="true"
            :contextmenu-width="100"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
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
                  :disabled="!fileRowInspectEnabled(row)"
                  @click="handleFileInspect(row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  :disabled="!fileRowEditEnabled(row)"
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
                  :disabled="!fileRowDeleteEnabled"
                  @click="handleFileDelete(row)"
                />
              </el-button-group>
            </template>
            <template v-slot:contextmenu="{row,close}">
              <ul>
                <li
                  v-if="fileRowInspectEnabled(row)"
                  @click="handleFileInspectFloatyContextmenuClicked(row,close)"
                >
                  弹窗查看...
                </li>
                <li
                  v-if="fileRowEditEnabled(row)"
                  @click="handleFileEditFloatyContextmenuClicked(row,close)"
                >
                  弹窗编辑...
                </li>
                <el-divider v-if="fileRowInspectEnabled(row)||fileRowEditEnabled(row)"/>
                <li
                  v-if="fileRowInspectEnabled(row)"
                  @click="handleFileInspectContextmenuClicked(row,close)"
                >
                  查看...
                </li>
                <li
                  v-if="fileRowEditEnabled(row)"
                  @click="handleFileEditContextmenuClicked(row,close)"
                >
                  编辑...
                </li>
                <el-divider v-if="fileRowInspectEnabled(row)||fileRowEditEnabled(row)"/>
                <li @click="handleFileDownloadContextmenuClicked(row,close)">
                  下载...
                </li>
                <li
                  v-if="fileRowDeleteEnabled"
                  @click="handleFileDeleteContextmenuClicked(row,close)"
                >
                  删除...
                </li>
              </ul>
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
import axios from 'axios';

import { ASSETS_ITEM_FILE } from '@/views/items/miscellaneous/fileEditor/fileTypeConstants';

import TablePanel from '@/components/layout/TablePanel.vue';
import FileUploadDialog from '@/components/file/FileUploadDialog.vue';
import FileCreateDialog from '@/components/file/FileCreateDialog.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';

import { dataSizePreset, formatUnit } from '@/util/number';
import { formatTimestamp } from '@/util/timestamp';
import {
  childForItem,
  childForItemCreatedDateAsc,
  childForItemInspectedDateDesc,
  childForItemModifiedDateDesc,
  childForItemOriginNameAsc,
  remove,
  requestItemFileStreamVoucher,
  upload,
  uploadStream,
} from '@/api/assets/itemFile';
import resolveResponse from '@/util/response';
import { fileType } from '@/util/file';

export default {
  name: 'ItemFilePanel',
  components: {
    HeaderLayoutPanel, FileCreateDialog, FileUploadDialog, TablePanel,
  },
  props: {
    itemId: {
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
  computed: {
    fileRowInspectEnabled() {
      return (row) => {
        // noinspection JSUnresolvedVariable
        const typeIndex = fileType(row.origin_name);
        return typeIndex >= 0;
      };
    },
    fileRowEditEnabled() {
      return (row) => {
        // noinspection JSUnresolvedVariable
        const typeIndex = fileType(row.origin_name);
        return typeIndex === 0 && !this.readonly;
      };
    },
    fileRowDeleteEnabled() {
      return !this.readonly;
    },
  },
  watch: {
    itemId() {
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
        pageSize: 10,
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
      if (this.itemId === '') {
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
      resolveResponse(
        childForItem(this.itemId, this.table.currentPage, this.table.pageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForItem(
              this.itemId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    lookupInspectedDateDesc() {
      resolveResponse(childForItemInspectedDateDesc(
        this.itemId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemInspectedDateDesc(childForItem(
              this.itemId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    lookupModifiedDateDesc() {
      resolveResponse(childForItemModifiedDateDesc(
        this.itemId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemModifiedDateDesc(childForItem(
              this.itemId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    lookupOriginNameAsc() {
      resolveResponse(childForItemOriginNameAsc(
        this.itemId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemOriginNameAsc(childForItem(
              this.itemId, res.total_pages - 1, this.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    lookupCreatedDateAsc() {
      resolveResponse(childForItemCreatedDateAsc(
        this.itemId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemCreatedDateAsc(childForItem(
              this.itemId, res.total_pages - 1, this.table.pageSize,
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
    handlePagingAttributeChanged() {
      this.handleSearch();
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
        query: { type: ASSETS_ITEM_FILE, id: row.key.long_id, action: 'inspect' },
      });
    },
    handleFileInspectContextmenuClicked(row, close) {
      close();
      this.handleFileInspect(row);
    },
    handleFileEdit(row) {
      this.$router.push({
        name: 'miscellaneous.fileEditor',
        query: { type: ASSETS_ITEM_FILE, id: row.key.long_id, action: 'edit' },
      });
    },
    handleFileEditContextmenuClicked(row, close) {
      close();
      this.handleFileEdit(row);
    },
    handleFileDownload(attachmentFileInfo) {
      resolveResponse(requestItemFileStreamVoucher(attachmentFileInfo.key.long_id))
        .then((voucherKey) => {
          // 进行提示。
          this.$message({
            showClose: true,
            message: '后台正在准备文件，文件越大，准备时间越长，请耐心等待...',
            type: 'success',
            center: true,
            duration: 10000,
          });
          // 执行下载。
          const iframe = document.createElement('iframe');
          iframe.setAttribute('hidden', 'hidden');
          document.body.appendChild(iframe);
          const url = `${axios.defaults.baseURL}/assets/item-file/download-by-voucher?voucher-id=${voucherKey.long_id}`;
          iframe.setAttribute('src', url);
        });
    },
    handleFileDownloadContextmenuClicked(row, close) {
      close();
      this.handleFileDownload(row);
    },
    handleFileDelete(attachmentFileInfo) {
      this.$confirm('此操作将永久删除此项目文件。<br>'
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
        .then(() => resolveResponse(remove(attachmentFileInfo.key.long_id)))
        .then(() => {
          this.$message({
            showClose: true,
            message: '项目文件删除成功',
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
    handleFileDeleteContextmenuClicked(row, close) {
      close();
      this.handleFileDelete(row);
    },
    handleUploadConfirmed(files, callback) {
      const promises = [];
      files.forEach((file) => {
        const formData = new FormData();
        formData.append('file', file.blob, file.name);
        promises.push(resolveResponse(uploadStream(this.itemId, formData)));
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
          this.$emit('onItemFileUpdated');
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
      resolveResponse(upload(this.itemId, formData))
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
          this.$emit('onItemFileUpdated');
        })
        .then(() => {
          callback(true);
        })
        .catch(() => {
          callback(false);
        });
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
    handleFileInspectFloatyContextmenuClicked(row, close) {
      close();
      // noinspection JSUnresolvedReference
      const floatyInfo = {
        id: row.key.long_id,
        originName: row.origin_name,
        mode: 'INSPECT',
      };
      this.$emit('onFileFloaty', floatyInfo);
    },
    handleFileEditFloatyContextmenuClicked(row, close) {
      close();
      // noinspection JSUnresolvedReference
      const floatyInfo = {
        id: row.key.long_id,
        originName: row.origin_name,
        mode: 'EDIT',
      };
      this.$emit('onFileFloaty', floatyInfo);
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.item-file-panel-container {
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

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .select {
  width: 110px;
}

.header-container .icon-button {
  padding: 11px;
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

/*noinspection CssUnusedSymbol*/
.table >>> .contextmenu .el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
