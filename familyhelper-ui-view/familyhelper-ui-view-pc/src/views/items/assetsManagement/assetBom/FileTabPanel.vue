<template>
  <div class="file-tab-panel-container" v-loading="loading">
    <div class="header">
      <el-button
        class="item"
        type="primary"
        @click="uploadDialog.visible=true"
      >
        上传
      </el-button>
      <el-button
        class="item"
        type="success"
        @click="handleSearch"
      >
        刷新
      </el-button>
      <el-select class="item select" v-model="select.model" @change="handleSearch">
        <el-option
          v-for="item in select.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <el-divider/>
    <table-panel
      class="table-panel"
      operate-column-width="130px"
      :page-size.sync="tablePanel.pageSize"
      :entity-count="parseInt(tablePanel.entities.count)"
      :current-page.sync="tablePanel.currentPage"
      :page-sizes="[10,15,20,30]"
      :table-data="tablePanel.entities.data"
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
            :disabled="inspectTableButtonDisabled(row)"
            @click="handleItemFileInspect(row)"
          />
          <el-button
            class="table-button"
            size="mini"
            icon="el-icon-edit"
            type="primary"
            :disabled="editTableButtonDisabled(row)"
          />
          <el-button
            class="table-button"
            size="mini"
            icon="el-icon-download"
            type="success"
            :disabled="inspectTableButtonDisabled(row)"
            @click="handleItemFileDownload(row)"
          />
          <el-button
            class="table-button"
            size="mini"
            icon="el-icon-delete"
            type="danger"
            @click="handleItemFileDelete(row)"
          />
        </el-button-group>
      </template>
    </table-panel>
    <file-upload-dialog
      title="上传文件"
      :visible.sync="uploadDialog.visible"
      :item-id="itemId"
      @onItemFileChanged="handleSearch"
    />
  </div>
</template>

<script>
import TablePanel from '@/components/table/TablePanel.vue';
import FileUploadDialog from '@/components/file/FileUploadDialog.vue';

import { dataSizePreset, formatUnit } from '@/util/number';
import { formatTimestamp } from '@/util/timestamp';
import {
  childForItem,
  childForItemCreatedDateAsc,
  childForItemInspectedDateDesc,
  childForItemModifiedDateDesc,
  childForItemOriginNameAsc,
  remove,
  download,
} from '@/api/assets/itemFile';
import resolveResponse from '@/util/response';
import { fileType } from '@/util/file';

export default {
  name: 'FileTabPanel',
  components: { FileUploadDialog, TablePanel },
  props: {
    itemId: {
      type: String,
      default: '',
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
        return typeIndex !== 0;
      };
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
      tablePanel: {
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
      uploadDialog: {
        visible: false,
      },
      loading: false,
    };
  },
  methods: {
    handleSearch() {
      if (this.itemId === '') {
        return;
      }
      switch (this.select.model) {
        case 'default':
          this.lookupChildForItem();
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
          this.lookupChildForItem();
          break;
      }
    },
    lookupChildForItem() {
      resolveResponse(
        childForItem(this.itemId, this.tablePanel.currentPage, this.tablePanel.pageSize),
      )
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForItem(res.total_pages, this.tablePanel.pageSize));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .catch(() => {
        });
    },
    lookupInspectedDateDesc() {
      resolveResponse(childForItemInspectedDateDesc(
        this.itemId, this.tablePanel.currentPage, this.tablePanel.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemInspectedDateDesc(childForItem(
              res.total_pages, this.tablePanel.pageSize,
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
        this.itemId, this.tablePanel.currentPage, this.tablePanel.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemModifiedDateDesc(childForItem(
              res.total_pages, this.tablePanel.pageSize,
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
        this.itemId, this.tablePanel.currentPage, this.tablePanel.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemOriginNameAsc(childForItem(
              res.total_pages, this.tablePanel.pageSize,
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
        this.itemId, this.tablePanel.currentPage, this.tablePanel.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return childForItemCreatedDateAsc(childForItem(
              res.total_pages, this.tablePanel.pageSize,
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
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    unitFormatter(row, column) {
      return formatUnit(row[column.property], dataSizePreset);
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleItemFileDownload(itemFileInfo) {
      download(itemFileInfo.key.long_id)
        .then((blob) => {
          // noinspection JSUnresolvedVariable
          const fileName = itemFileInfo.origin_name;
          const link = document.createElement('a');
          // noinspection JSCheckFunctionSignatures
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(link.href);
        });
    },
    handleItemFileDelete(itemFileInfo) {
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
        .then(() => { this.loading = true; })
        .then(() => resolveResponse(remove(itemFileInfo.key.long_id)))
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
    handleItemFileInspect(row) {
      this.$router.push({ name: 'miscellaneous.fileEditor', query: { type: 'itemFile', action: 'inspect', id: row.key.long_id } });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.file-tab-panel-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.file-tab-panel-container .header {
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.file-tab-panel-container .el-divider {
  margin: 5px 0;
}

.file-tab-panel-container .table-panel {
  height: 0;
  flex-grow: 1;
}

.table-panel .icon-wrapper {
  height: 32px;
  line-height: 32px;
}

.table-panel .icon {
  font-size: 32px;
  user-select: none;
}

.table-panel .table-button {
  padding: 7px;
}

.header .item:not(:first-child) {
  margin-left: 10px;
}

.header .select {
  width: 110px;
}
</style>
