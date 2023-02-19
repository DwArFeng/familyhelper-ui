<template>
  <div class="notify-info-record-panel-container">
    <div v-if="notifyHistoryId===''" class="placeholder">
      请选择通知历史
    </div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
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
            :delete-button-visible="false"
            :operate-column-width="49"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
            @onEntityInspect="handleShowEntityInspectDialog"
          >
            <el-table-column
              prop="key.type"
              label="信息类型"
              width="100px"
              show-tooltip-when-overflow
              :formatter="typeFormatter"
            />
            <el-table-column
              prop="key.record_id"
              label="记录ID"
              width="150px"
              show-tooltip-when-overflow
            />
            <el-table-column
              class-name="single-line"
              prop="value"
              label="值"
            />
          </table-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      label-width="68px"
      inspect-title="查看记录"
      mode="INSPECT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :close-on-click-modal="false"
    >
      <el-form-item label="信息类型" prop="type">
        <el-input
          v-model="maintainDialog.anchorEntity.type"
          readonly
        />
      </el-form-item>
      <el-form-item label="记录ID" prop="record_id">
        <el-input
          v-model="maintainDialog.anchorEntity.record_id"
          readonly
        />
      </el-form-item>
      <el-form-item label="值" prop="value">
        <text-editor
          class="text-editor"
          v-model="maintainDialog.anchorEntity.value"
          readonly
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import { childForNotifySettingDisp as childForNotifySetting } from '@/api/notify/notifyInfoRecord';
import resolveResponse from '@/util/response';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TextEditor from '@/components/text/TextEditor.vue';

export default {
  name: 'NotifyInfoRecordPanel',
  components: {
    TextEditor, EntityMaintainDialog, TablePanel, HeaderLayoutPanel,
  },
  props: {
    notifyHistoryId: {
      type: String,
      required: true,
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
      },
      maintainDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          type: '',
          record_id: '',
          value: '',
        },
      },
    };
  },
  watch: {
    notifyHistoryId(value) {
      if (value === '') {
        return;
      }
      this.handleSearch();
    },
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      this.lookupChildForNotifySetting();
    },
    lookupChildForNotifySetting() {
      this.loading = true;
      resolveResponse(childForNotifySetting(
        this.notifyHistoryId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForNotifySetting(
              this.notifyHistoryId, res.total_pages, this.table.pageSize,
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
    typeFormatter(row) {
      const { type } = row.key;
      return this.formatType(type);
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog();
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.type = this.formatType(entity.key.type);
      this.maintainDialog.anchorEntity.record_id = entity.key.record_id;
      this.maintainDialog.anchorEntity.value = entity.value;
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    formatType(type) {
      switch (type) {
        case 0:
          return '路由器信息';
        case 1:
          return '调度器信息';
        case 2:
          return '发送器信息';
        default:
          return '（未知）';
      }
    },
  },
  mounted() {
    if (this.notifyHistoryId === '') {
      return;
    }
    this.handleSearch();
  },
};
</script>

<style scoped>
.notify-info-record-panel-container {
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

.main-container{
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
.table >>> .single-line .cell{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-editor {
  height: 300px;
}
</style>
