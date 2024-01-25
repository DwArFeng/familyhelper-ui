<template>
  <div class="dispatcher-support-select-dialog-container">
    <el-dialog
      tabindex="0"
      id="dialog"
      title="模板选择"
      destroy-on-close
      :visible.sync="watchedVisible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleHotKeyDown"
    >
      <table-panel
        class="table"
        v-loading="loading"
        highlight-current-row
        :page-size.sync="table.pageSize"
        :entity-count="parseInt(table.entities.count)"
        :current-page.sync="table.currentPage"
        :page-sizes="[5,15]"
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
          prop="key.string_id"
          label="ID"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="description"
          label="描述"
          show-tooltip-when-overflow
        />
        <el-table-column
          prop="example_param"
          label="参数示例"
          show-tooltip-when-overflow
        />
      </table-panel>
      <div slot="footer">
        <el-button
          type="primary"
          :disabled="loading || table.selection === null"
          @click="handleConfirmed"
        >
          确认
        </el-button>
        <el-button
          :disabled="loading"
          @click="handleCanceled"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TablePanel from '@/components/layout/TablePanel.vue';

import resolveResponse from '@/util/response';
import { all } from '@/api/notify/dispatcherSupport';

export default {
  name: 'DispatcherSupportSelectDialog',
  components: { TablePanel },
  props: {
    visible: {
      type: Boolean,
      default: false,
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
        pageSize: 5,
        selection: null,
      },
      loading: false,
    };
  },
  methods: {
    handlePagingAttributeChanged() {
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
            return resolveResponse(all(res.total_pages - 1, this.table.pageSize));
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
    handleConfirmed() {
      this.$emit('onConfirmed', this.table.selection);
      this.watchedVisible = false;
    },
    handleCanceled() {
      this.watchedVisible = false;
    },
    handleHotKeyDown() {
      if (this.table.selection === null) {
        return;
      }
      this.handleConfirmed();
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.table {
  height: 450px;
}
</style>
