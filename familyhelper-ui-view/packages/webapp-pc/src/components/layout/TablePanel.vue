<template>
  <div class="table-panel-container">
    <div class="table-container">
      <el-table
        ref="elTable"
        class=table
        height="100%"
        stripe
        tooltip-effect="dark"
        border
        :data="tableData"
        :highlight-current-row="highlightCurrentRow"
        :row-class-name="rowClassName"
        :cell-class-name="cellClassName"
        @row-click="handleRowClick"
        @current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
        @row-contextmenu="mayOpenMenu"
      >
        <slot name="default"/>
        <!--suppress JSValidateTypes -->
        <el-table-column v-if="operateColumnVisible" label="操作" :width="operateColumnWidth">
          <template v-slot="scope">
            <slot
              name="operateColumn"
              :row="scope.row"
              :column="scope.column"
              :$index="scope.$index"
            >
              <el-button-group class=operate-column>
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
                  v-if="deleteButtonVisible && deleteButtonBubbling"
                  @click="handleEntityDelete(scope.$index, scope.row)"
                />
                <el-button
                  class="table-button"
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  v-if="deleteButtonVisible && !deleteButtonBubbling"
                  @click.stop="handleEntityDelete(scope.$index, scope.row)"
                />
              </el-button-group>
            </slot>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="contextmenu.visible"
        ref="contextmenu"
        class="contextmenu"
        aria-modal="true"
        tabindex="0"
        :style="{left:contextmenu.left+'px',top:contextmenu.top+'px',width:contextmenuWidth+'px'}"
        @blur="closeMenu"
      >
        <slot
          name="contextmenu"
          :row="contextmenu.row"
          :index="contextmenu.index"
          :close="closeMenu"
        >
          <ul>
            <li
              v-if="inspectMenuItemVisible"
              @click="handleInspectMenuItemClicked(contextmenu.index,contextmenu.row)"
            >
              查看...
            </li>
            <li
              v-if="editMenuItemVisible"
              @click="handleEditMenuItemClicked(contextmenu.index,contextmenu.row)"
            >
              编辑...
            </li>
            <li
              v-if="deleteMenuItemVisible"
              @click="handleDeleteMenuItemClicked(contextmenu.index,contextmenu.row)"
            >
              删除...
            </li>
          </ul>
        </slot>
      </div>
      <div
        v-if="contextmenu.visible"
        class="contextmenu-modal"
      />
    </div>
    <el-pagination
      class="pagination"
      :class="{compact:paginationStyle==='COMPACT'}"
      background
      :layout="paginationLayout"
      :page-sizes="pageSizes"
      :page-size.sync="watchedPageSize"
      :total="entityCount"
      :current-page.sync="watchedCurrentPage"
      :pager-count="paginationPagerCount"
      @size-change="handlePageSizeChanged"
    />
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
    operateColumnVisible: {
      type: Boolean,
      default: true,
    },
    operateColumnWidth: {
      type: Number,
      default: 103,
    },
    showContextmenu: {
      type: Boolean,
      default: false,
    },
    contextmenuWidth: {
      type: Number,
      default: 85,
    },
    inspectMenuItemVisible: {
      type: Boolean,
      default: true,
    },
    editMenuItemVisible: {
      type: Boolean,
      default: true,
    },
    deleteMenuItemVisible: {
      type: Boolean,
      default: true,
    },
    deleteButtonBubbling: {
      type: Boolean,
      default: true,
    },
    rowClassName: {
      type: [String, Function],
      default: '',
    },
    cellClassName: {
      type: [String, Function],
      default: '',
    },
    paginationAdjustStrategy: {
      type: String,
      default: 'FORCE_NORMAL',
      validator(value) {
        return ['FORCE_NORMAL', 'FORCE_COMPACT', 'AUTO'].indexOf(value) >= 0;
      },
    },
  },
  watch: {
    currentPage(value) {
      this.watchedCurrentPage = value + 1;
    },
    watchedCurrentPage(value) {
      this.$emit('update:currentPage', value - 1);
      this.$emit('onPagingAttributeChanged', value - 1);
    },
    pageSize(value) {
      this.watchedPageSize = value;
    },
    tableData(value) {
      if (this.watchedTableSelection === null || this.watchedTableSelection === undefined) {
        return;
      }
      if (value.indexOf(this.watchedTableSelection) < 0) {
        this.$emit('update:tableSelection', null);
      }
    },
  },
  computed: {
    paginationStyle() {
      if (this.paginationAdjustStrategy === 'FORCE_NORMAL') {
        return 'NORMAL';
      }
      if (this.paginationAdjustStrategy === 'FORCE_COMPACT') {
        return 'COMPACT';
      }
      const totalPages = Math.ceil(this.entityCount / this.pageSize);
      return totalPages >= 7 ? 'COMPACT' : 'NORMAL';
    },
    paginationPagerCount() {
      if (this.paginationStyle === 'COMPACT') {
        return 5;
      }
      return 7;
    },
    paginationLayout() {
      if (this.paginationStyle === 'COMPACT') {
        return 'sizes, pager, jumper';
      }
      return 'total, sizes, prev, pager, next, jumper';
    },
  },
  data() {
    return {
      watchedCurrentPage: 1,
      watchedPageSize: 0,
      watchedTableSelection: null,
      contextmenu: {
        visible: false,
        left: 0,
        top: 0,
        index: -1,
        row: null,
      },
    };
  },
  methods: {
    handlePageSizeChanged() {
      this.$emit('update:pageSize', this.watchedPageSize);
      this.$emit('onPagingAttributeChanged', this.watchedPageSize);
    },
    handleRowClick(row) {
      this.$emit('onRowClick', row);
      this.watchedTableSelection = row;
      this.$emit('update:tableSelection', this.watchedTableSelection);
    },
    syncProps() {
      this.watchedCurrentPage = this.currentPage + 1;
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
    mayOpenMenu(row, column, e) {
      if (!this.showContextmenu) {
        return;
      }

      // 阻止系统菜单弹出。
      e.preventDefault();

      this.contextmenu.row = row;
      this.contextmenu.index = this.findRowIndex(row);

      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      const { offsetWidth } = this.$el; // container width
      const maxLeft = offsetWidth + offsetLeft - this.contextmenuWidth; // left boundary
      const left = e.clientX + 15; // 15: margin right

      if (left > maxLeft) {
        this.contextmenu.left = maxLeft;
      } else {
        this.contextmenu.left = left;
      }

      this.contextmenu.top = e.clientY;

      this.contextmenu.visible = true;

      this.$nextTick(() => {
        this.$refs.contextmenu.focus();
      });
    },
    closeMenu() {
      this.contextmenu.visible = false;
    },
    findRowIndex(row) {
      for (let i = 0; i < this.tableData.length; i += 1) {
        if (this.tableData[i] === row) {
          return i;
        }
      }
      return -1;
    },
    handleInspectMenuItemClicked(index, entity) {
      this.closeMenu();
      this.$emit('onEntityInspect', index, entity);
    },
    handleEditMenuItemClicked(index, entity) {
      this.closeMenu();
      this.$emit('onEntityEdit', index, entity);
    },
    handleDeleteMenuItemClicked(index, entity) {
      this.closeMenu();
      this.$emit('onEntityDelete', index, entity);
    },
  },
  mounted() {
    this.syncProps();
  },
};
</script>

<style scoped>
.table-panel-container {
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

/*noinspection CssUnusedSymbol*/
.pagination >>> .el-pagination__total {
  height: 28px;
  line-height: 29px;
}

.pagination >>> .el-pagination__sizes input {
  height: 28px;
  line-height: 26px;
}

/*noinspection CssUnusedSymbol*/
.pagination >>> .el-pagination__jump {
  height: 28px;
  line-height: 27px;
}

.pagination >>> .el-pagination__jump input {
  height: 28px;
  line-height: 28px;
}

.pagination.compact >>> .el-pager li {
  margin: 0 1px;
}

/*noinspection CssUnusedSymbol*/
.pagination.compact >>> .el-pagination__sizes {
  margin: 0 6px 0 0;
}

/*noinspection CssUnusedSymbol*/
.pagination.compact >>> .el-pagination__sizes .el-input {
  margin: 0;
}

/*noinspection CssUnusedSymbol*/
.pagination.compact >>> .el-pagination__jump {
  margin: 0 0 0 6px;
}

.table-button {
  padding: 7px
}

.contextmenu {
  margin: 0;
  padding: 5px 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #7F7F7F;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
}

.contextmenu:focus {
  outline: none;
}

.contextmenu ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background: #eee;
}

.contextmenu-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2999;
}
</style>
