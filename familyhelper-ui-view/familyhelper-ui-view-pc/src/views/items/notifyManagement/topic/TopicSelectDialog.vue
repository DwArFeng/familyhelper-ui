<template>
  <div class="topic-select-dialog-container">
    <el-dialog
      tabindex="0"
      id="dialog"
      title="主题选择"
      width="70vw"
      :visible.sync="watchedVisible"
      :close-on-click-modal="closeOnClickModal"
      append-to-body
      destroy-on-close
      @keydown.ctrl.enter.native="handleConfirmHotKeyDown"
      @open="handleDialogOpen"
    >
      <table-panel
        class="table-panel"
        highlight-current-row
        :page-size.sync="table.pageSize"
        :entity-count="parseInt(table.entities.count)"
        :current-page.sync="table.currentPage"
        :page-sizes="[5,10,15]"
        :table-data="table.entities.data"
        :operate-column-visible="false"
        :table-selection.sync="table.selection"
        @onPagingAttributeChanged="handlePagingAttributeChanged"
      >
        <el-table-column
          prop="label"
          label="名称"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="remark"
          label="备注"
          show-tooltip-when-overflow
        />
      </table-panel>
      <div slot="footer">
        <el-button
          type="primary"
          :disabled="loading || table.selection===null"
          @click="handleConfirmButtonClicked"
        >
          确认
        </el-button>
        <el-button
          :disabled="loading"
          @click="handleCancelButtonClicked"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TablePanel from '@/components/layout/TablePanel.vue';

import { all } from '@/api/notify/topic';
import resolveResponse from '@/util/response';

export default {
  name: 'TopicSelectDialog',
  components: { TablePanel },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
  },
  data() {
    return {
      loading: false,
      watchedVisible: false,
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
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearchHotKeyDown() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupAll();
    },
    lookupAll() {
      this.loading = true;
      resolveResponse(all(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(all(res.total_pages, this.table.pageSize));
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
    handleConfirmButtonClicked() {
      this.handleConfirm();
    },
    handleConfirmHotKeyDown() {
      if (this.table.selection === null) {
        return;
      }
      this.handleConfirm();
    },
    handleConfirm() {
      this.$emit('onTopicSelected', this.table.selection);
      this.watchedVisible = false;
    },
    handleCancelButtonClicked() {
      this.watchedVisible = false;
    },
    handleDialogOpen() {
      this.table.selection = null;
      this.handleSearch();
    },
    categoryTypeFormatter(row) {
      if (row.category === null) {
        return '未指定';
      }
      return row.category.label;
    },
    locationTypeFormatter(row) {
      if (row.location === null) {
        return '未指定';
      }
      return row.location.label;
    },
  },
  mounted() {
    this.table.selection = null;
    this.handleSearch();
  },
};
</script>

<style scoped>
.table-panel {
  height: 512px;
}
</style>
