<template>
<div class="draggable-table-container">
  <el-table
    class=table
    ref="dragTable"
    height="100%"
    stripe
    tooltip-effect="dark"
    border
    :row-key="rowKey"
    :data="tableData"
    :highlight-current-row="highlightCurrentRow"
    @row-click="handleRowClick"
    @current-change="handleCurrentChange"
    @selection-change="handleSelectionChange"
    @row-contextmenu="mayOpenMenu"
  >
    <slot></slot>
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
              v-if="deleteButtonVisible"
              @click="handleEntityDelete(scope.$index, scope.row)"
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
        <li
          v-if="deleteMenuItemVisible"
          @click="handleMoveUp(contextmenu.index,contextmenu.row)"
        >
          上移
        </li>
        <li
          v-if="deleteMenuItemVisible"
          @click="handleMoveDown(contextmenu.index,contextmenu.row)"
        >
          下移
        </li>
        <li
          v-if="deleteMenuItemVisible"
          @click="handleMoveBegin(contextmenu.index,contextmenu.row)"
        >
          移至首位
        </li>
        <li
          v-if="deleteMenuItemVisible"
          @click="handleMoveEnd(contextmenu.index,contextmenu.row)"
        >
          移至末位
        </li>
      </ul>
    </slot>
  </div>
  <div
    v-if="contextmenu.visible"
    class="contextmenu-modal"
  />
</div>
</template>

<script>
import Sortable from 'sortablejs';

export default {
  name: 'DraggableTablePanel',
  props: {
    rowKey: {
      type: String,
      required: true,
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
  },
  watch: {
    tableData(value) {
      this.watchedTableData = value;
    },
    watchedTableData(value) {
      if (value.length === 0) {
        return;
      }
      this.$nextTick(() => {
        this.setSort();
      });
    },
  },
  data() {
    return {
      watchedTableSelection: null,
      contextmenu: {
        visible: false,
        left: 0,
        top: 0,
        index: -1,
        row: null,
      },
      sortable: null,
      watchedTableData: [],
    };
  },
  methods: {
    handleRowClick(row) {
      this.watchedTableSelection = row;
      this.$emit('update:tableSelection', this.watchedTableSelection);
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
    handleMoveUp(index) {
      this.closeMenu();
      if (index === 0) {
        return;
      }
      const targetRow = this.watchedTableData.splice(index, 1)[0];
      this.watchedTableData.splice(index - 1, 0, targetRow);
      this.$emit('update:tableData', this.watchedTableData);
      this.$emit('onEntityOrderChanged', this.watchedTableData);
    },
    handleMoveDown(index) {
      this.closeMenu();
      if (index === this.watchedTableData.length - 1) {
        return;
      }
      const targetRow = this.watchedTableData.splice(index, 1)[0];
      this.watchedTableData.splice(index + 1, 0, targetRow);
      this.$emit('update:tableData', this.watchedTableData);
      this.$emit('onEntityOrderChanged', this.watchedTableData);
    },
    handleMoveBegin(index) {
      this.closeMenu();
      if (index === 0) {
        return;
      }
      const targetRow = this.watchedTableData.splice(index, 1)[0];
      this.watchedTableData.splice(0, 0, targetRow);
      this.$emit('update:tableData', this.watchedTableData);
      this.$emit('onEntityOrderChanged', this.watchedTableData);
    },
    handleMoveEnd(index) {
      this.closeMenu();
      const { length } = this.watchedTableData;
      if (index === length - 1) {
        return;
      }
      const targetRow = this.watchedTableData.splice(index, 1)[0];
      this.watchedTableData.splice(length, 0, targetRow);
      this.$emit('update:tableData', this.watchedTableData);
      this.$emit('onEntityOrderChanged', this.watchedTableData);
    },
    setSort() {
      if (this.sortable !== null) {
        this.sortable.destroy();
      }

      if (this.watchedTableData.length === 0) {
        return;
      }

      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
      // noinspection JSUnusedGlobalSymbols
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData(dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData('Text', '');
        },
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          if (oldIndex === newIndex) {
            return;
          }
          const targetRow = this.watchedTableData.splice(oldIndex, 1)[0];
          this.watchedTableData.splice(newIndex, 0, targetRow);
          this.$emit('update:tableData', this.watchedTableData);
          this.$emit('onEntityOrderChanged', this.watchedTableData);
        },
      });
    },
  },
};
</script>

<style scoped>
.draggable-table-container {
  height: 100%;
  width: 100%;
}

.table {
  min-width: 100%;
}

.table-button {
  padding: 7px
}

.operate-column {
  /*display: flex;*/
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
