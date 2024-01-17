<template>
  <el-dialog
    class="activity-data-item-select-dialog-container"
    ref="dialog"
    tabindex="0"
    destroy-on-close
    title="选择个人最佳集合"
    top="6vh"
    width="80%"
    :visible.sync="watchedVisible"
    :close-on-click-modal="false"
  >
    <div class="body-wrapper">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <activity-data-set-indicator
              mode="ACTIVITY_DATA_ITEM_SELECT_DIALOG"
              @change="handleActivityDataSetChanged"
            />
          </div>
        </template>
        <template v-slot:default>
          <div class="main-container">
            <activity-data-tree-panel
              class="activity-data-tree-panel item"
              ref="activityDataTreePanel"
              readonly
              :activity-data-set-key="parentSelection.activityDataSetId"
              @onCurrentChanged="handleCurrentChanged"
            />
            <el-divider class="item" direction="vertical"/>
            <!--suppress VueUnrecognizedDirective -->
            <table-panel
              class="table-panel item expand"
              v-loading="table.loading"
              highlight-current-row
              :page-size.sync="table.pageSize"
              :entity-count="parseInt(table.entities.count)"
              :current-page.sync="table.currentPage"
              :page-sizes="[10,15,20,50]"
              :table-data="table.entities.data"
              :inspect-button-visible="false"
              :edit-button-visible="false"
              :delete-button-visible="false"
              :operate-column-width="49"
              @onPagingAttributeChanged="handlePagingAttributeChanged"
            >
              <template v-slot:default>
                <el-table-column
                  prop="name"
                  label="名称"
                  show-tooltip-when-overflow
                />
                <el-table-column
                  prop="remark"
                  label="备注"
                  show-tooltip-when-overflow
                />
              </template>
              <template v-slot:operateColumn="{row}">
                <el-button
                  class="button"
                  size="mini"
                  icon="el-icon-plus"
                  type="primary"
                  @click="handleDataItemConfirmButtonClicked(row)"
                />
              </template>
            </table-panel>
          </div>
        </template>
      </header-layout-panel>
    </div>
    <div class="footer-container" slot="footer">
      <el-button
        @click="watchedVisible = false"
      >
        关闭
      </el-button>
    </div>
  </el-dialog>
</template>

<script>

import ActivityDataTreePanel
from '@/views/items/life/activityDataManagement/ActivityDataTreePanel.vue';
import ActivityDataSetIndicator
from '@/views/items/life/activityDataSet/ActivityDataSetIndicator.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import resolveResponse from '@/util/response';
import { childForActivityDataNodeDisp } from '@/api/life/activityDataItem';

export default {
  name: 'ActivityDataItemSelectDialog',
  components: {
    HeaderLayoutPanel, TablePanel, ActivityDataSetIndicator, ActivityDataTreePanel,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      validator(value) {
        return [
          'ACTIVITY_TEMPLATE_DATA_INFO_CREATE_DIALOG', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
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
      parentSelection: {
        activityDataSetId: '',
        activityDataSet: null,
      },
      treePanel: {
        selection: {
          node: null,
          data: null,
        },
        appendChild: false,
      },
      table: {
        loading: false,
        currentPage: 0,
        pageSize: 10,
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
    };
  },
  methods: {
    handleActivityDataSetChanged(activityDataSet) {
      const oldActivityDataSetId = this.parentSelection.activityDataSetId;
      if (activityDataSet === null) {
        this.parentSelection.activityDataSet = null;
        this.parentSelection.activityDataSetId = '';
      } else {
        this.parentSelection.activityDataSet = activityDataSet;
        this.parentSelection.activityDataSetId = activityDataSet.key.long_id;
      }
      if (oldActivityDataSetId === this.parentSelection.activityDataSetId) {
        return;
      }
      this.treePanel.selection.node = null;
      this.treePanel.selection.data = null;
    },
    handleCurrentChanged(node, data) {
      this.treePanel.selection.node = node;
      this.treePanel.selection.data = data;
      this.handleDataItemSearch();
    },
    handlePagingAttributeChanged() {
      this.handleDataItemSearch();
    },
    handleDataItemSearch() {
      if (!this.treePanel.selection.data) {
        return;
      }
      // noinspection JSUnresolvedReference
      if (this.treePanel.selection.data.display_type === 1) {
        this.handleDataItemIdentitySearch();
      } else {
        this.handleDataItemNodeSearch();
      }
    },
    handleDataItemIdentitySearch() {
      this.table.currentPage = 0;
      this.table.entities.current_page = 0;
      this.table.entities.total_pages = 1;
      this.table.entities.rows = this.table.pageSize;
      this.table.entities.count = '1';
      this.table.entities.data = [this.treePanel.selection.data];
    },
    handleDataItemNodeSearch() {
      this.table.loading = true;
      resolveResponse(childForActivityDataNodeDisp(
        this.treePanel.selection.data.key.long_id, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForActivityDataNodeDisp(
              this.treePanel.selection.data.key.long_id,
              res.total_pages, this.record.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .finally(() => {
          this.table.loading = false;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
      return Promise.resolve();
    },
    handleDataItemConfirmButtonClicked(row) {
      this.$emit('onDataItemConfirmButtonClicked', row);
    },
  },
};
</script>

<style scoped>
.body-wrapper {
  width: 100%;
  height: 68vh;
  display: flex;
  flex-direction: column;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.main-container .item {
  height: 100%;
}

.main-container .item:not(:last-child) {
  margin-right: 5px;
}

.main-container .item.expand {
  width: 0 !important;
  flex-grow: 1;
}

.activity-data-tree-panel {
  width: 300px;
}

.table-panel .button {
  padding: 7px
}
</style>
