<template>
  <div class="table-content-panel">
    <div class="table-container">
      <el-table
        class=table
        height="100%"
        stripe
        tooltip-effect="dark"
        border
        :data="tableData"
        :highlight-current-row="highlightCurrentRow"
        @row-click="handleRowClick"
        @current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      >
        <slot></slot>
        <el-table-column v-if="entityOperateColumnVisible" label="操作" :width="103">
          <template slot-scope="scope">
            <el-button-group class = operate-column>
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-search"
                type="success"
                v-if="inspectButtonVisible"
                @click="handleEntityInspect(scope.$index, scope.row)"
              />
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-edit"
                type="primary"
                v-if="editButtonVisible"
                @click="handleEntityEdit(scope.$index, scope.row)"
              />
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-delete"
                type="danger"
                v-if="deleteButtonVisible"
                @click="handleEntityDelete(scope.$index, scope.row)"
              />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="pageSizes"
      :page-size.sync="watchedPageSize"
      :total="entityCount"
      :current-page.sync="watchedCurrentPage"
      @current-change="handleCurrentPageChanged"
      @size-change="handlePageSizeChanged"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'TablePanel',
  props: {
    pageSize: {
      type: Number,
      default: () => 0,
    },
    pageSizes: {
      type: Array,
      default: () => [10, 15, 20, 30, 50],
    },
    entityCount: {
      type: Number,
      default: () => 0,
    },
    currentPage: {
      type: Number,
      default: () => 0,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    tableSelection: {
      type: Object,
      default: () => null,
    },
    inspectButtonVisible: {
      type: Boolean,
      default: true,
    },
    editButtonVisible: {
      type: Boolean,
      default: true,
    },
    deleteButtonVisible: {
      type: Boolean,
      default: true,
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    currentPage(value) {
      this.watchedCurrentPage = value;
    },
    pageSize(value) {
      this.watchedPageSize = value + 1;
    },
  },
  computed: {
    entityOperateColumnVisible() {
      return this.inspectButtonVisible || this.editButtonVisible || this.deleteButtonVisible;
    },
  },
  data() {
    return {
      watchedCurrentPage: 0,
      watchedPageSize: 0,
      watchedTableSelection: null,
    };
  },
  methods: {
    handleCurrentPageChanged() {
      this.$emit('update:currentPage', this.watchedCurrentPage);
      this.$emit('onPagingAttributeChanged', this.watchedCurrentPage);
    },
    handlePageSizeChanged() {
      this.$emit('update:pageSize', this.watchedPageSize);
      this.$emit('onPagingAttributeChanged', this.watchedPageSize);
    },
    handleRowClick(row) {
      this.watchedTableSelection = row;
      this.$emit('update:tableSelection', this.watchedTableSelection);
    },
    syncProps() {
      this.watchedCurrentPage = this.currentPage;
      this.watchedPageSize = this.pageSize;
    },
    handleEntityInspect(index, entity) {
      this.$emit('onEntityInspect', index, entity);
    },
    handleEntityEdit(index, entity) {
      this.$emit('onEntityEdit', index, entity);
    },
    handleEntityDelete(index, entity) {
      this.$emit('onEntityDelete', index, entity);
    },
    handleCurrentChange(selection) {
      this.$emit('onCurrentChanged', selection);
    },
    handleSelectionChange(selection) {
      this.$emit('onSelectionChanged', selection);
    },
  },
  mounted() {
    this.syncProps();
  },
};
</script>

<style scoped>
.table-content-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.table-container {
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.table {
  min-width: 100%;
}

.pagination {
  text-align: center;
  padding: 0;
  margin-top: 2px;
}

.table-button {
  padding: 7px
}

.operate-column {
  /*display: flex;*/
}
</style>
