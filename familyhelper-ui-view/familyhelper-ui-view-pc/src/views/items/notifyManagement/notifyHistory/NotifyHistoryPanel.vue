<template>
  <div class="notify-history-panel-container">
    <header-layout-panel v-loading="loading">
      <template v-slot:header>
        <div class="header-container">
          <el-button type="success" @click="handleSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table"
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="table.entities.data"
          :edit-button-visible="false"
          :table-selection.sync="table.selection"
          :operate-column-width="76"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
          @onEntityInspect="handleShowEntityInspectDialog"
          @onEntityDelete="handleEntityDelete"
        >
          <el-table-column
            prop="notify_setting"
            label="通知设置"
            show-tooltip-when-overflow
            :formatter="notifySettingFormatter"
          />
          <el-table-column
            prop="happened_date"
            label="通知日期"
            width="180px"
            show-tooltip-when-overflow
            :formatter="timestampFormatter"
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
        </table-panel>
      </template>
    </header-layout-panel>
    <entity-maintain-dialog
      label-width="68px"
      inspect-title="查看记录"
      mode="INSPECT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :close-on-click-modal="false"
    >
      <el-form-item label="通知设置" prop="name">
        <el-input
          v-model="maintainDialog.anchorEntity.label"
          readonly
        />
      </el-form-item>
      <el-form-item label="通知日期" prop="name">
        <el-input
          v-model="maintainDialog.anchorEntity.happened_date"
          readonly
        />
      </el-form-item>
      <el-form-item label="备注" prop="name">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          readonly
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { allDisp as all, remove } from '@/api/notify/notifyHistory';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'NotifyHistoryPanel',
  components: { EntityMaintainDialog, TablePanel, HeaderLayoutPanel },
  watch: {
    'table.selection': {
      handler(value) {
        this.$emit('onNotifyHistoryChanged', value);
      },
    },
  },
  data() {
    return {
      loading: false,
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
      maintainDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          label: '',
          happened_date: '',
          remark: '',
        },
      },
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
    notifySettingFormatter(row, column) {
      const notifySetting = row[column.property];
      if (notifySetting === null || notifySetting === undefined) {
        return '（未知）';
      }
      return notifySetting.label;
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog();
    },
    syncAnchorEntity(entity) {
      let label;

      const notifySetting = entity.notify_setting;
      if (notifySetting === null || notifySetting === undefined) {
        label = '（未知）';
      } else {
        label = notifySetting.label;
      }

      const happenedDate = formatTimestamp(entity.happened_date);

      this.maintainDialog.anchorEntity.label = label;
      this.maintainDialog.anchorEntity.happened_date = happenedDate;
      this.maintainDialog.anchorEntity.remark = entity.remark;
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    handleEntityDelete(row, entity) {
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此通知历史。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res)).then(() => res))
        .then(() => {
          this.$message({
            showClose: true,
            message: '通知历史删除成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
        })
        .catch(() => {
        });
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.notify-history-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}
</style>
