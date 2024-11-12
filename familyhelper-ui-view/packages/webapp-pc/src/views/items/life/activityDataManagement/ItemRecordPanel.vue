<template>
  <div class="item-record-panel-container">
    <div class="placeholder" v-if="itemId===''">请选择项目</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <el-divider direction="vertical"/>
            <el-select
              class="select"
              v-model="select.value"
              placeholder="请选择"
              @change="handleSearch"
            >
              <el-option
                v-for="item in select.options"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              />
            </el-select>
            <div style="flex-grow: 1"/>
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
          <!--suppress VueUnrecognizedDirective -->
          <table-panel
            class="table-panel"
            v-loading="table.loading"
            highlight-current-row
            :page-size.sync="table.pageSize"
            :entity-count="parseInt(table.entities.count)"
            :current-page.sync="table.currentPage"
            :page-sizes="[10,15,20,50]"
            :table-data="table.entities.data"
            :table-selection.sync="table.selection"
            :edit-button-visible="false"
            :delete-button-visible="false"
            :operate-column-width="49"
            @onPagingAttributeChanged="handlePagingAttributeChanged"
            @onEntityInspect="handleShowEntityInspectDialog"
          >
            <el-table-column
              prop="activity_key"
              label="活动"
              show-tooltip-when-overflow
              :formatter="activityFormatter"
            />
            <el-table-column
              prop="value"
              label="值"
              show-tooltip-when-overflow
            />
            <el-table-column
              prop="recorded_date"
              label="记录日期"
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
    </div>
    <entity-maintain-dialog
      label-width="100px"
      mode="INSPECT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
    >
      <el-form-item label="活动" prop="activity_name">
        <el-input v-model="maintainDialog.anchorEntity.activity_name" readonly/>
      </el-form-item>
      <el-form-item label="值" prop="value">
        <el-input v-model="maintainDialog.anchorEntity.value" readonly/>
      </el-form-item>
      <el-form-item label="记录日期" prop="recorded_date">
        <el-input v-model="maintainDialog.anchorEntity.formatted_recorded_date" readonly/>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="maintainDialog.anchorEntity.remark" readonly/>
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  childForItemRecordedDateAscDisp,
  childForItemRecordedDateDescDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityDataRecord';
import resolveResponse from '@/util/response';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ItemRecordPanel',
  components: { EntityMaintainDialog, TablePanel, HeaderLayoutPanel },
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
  watch: {
    itemId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: false,
      select: {
        value: 'recorded-date-desc',
        options: [
          { key: 'recorded-date-desc', label: '由新到旧' },
          { key: 'recorded-date-asc', label: '由旧到新' },
        ],
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
        selection: null,
      },
      maintainDialog: {
        loading: false,
        visible: false,
        anchorEntity: {
          long_id: '',
          activity_id: '',
          value: '',
          recorded_date: '',
          remark: '',
          activity_name: '',
          formatted_recorded_date: '',
        },
      },
    };
  },
  methods: {
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.itemId === '') {
        return;
      }
      if (this.select.value === 'recorded-date-asc') {
        this.lookupChildForItemRecordedDateAsc();
      } else if (this.select.value === 'recorded-date-desc') {
        this.lookupChildForItemRecordedDateDesc();
      }
    },
    lookupChildForItemRecordedDateAsc() {
      this.loading = true;
      resolveResponse(childForItemRecordedDateAscDisp(
        this.itemId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForItemRecordedDateAscDisp(
              this.itemId, res.total_pages - 1, this.record.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .finally(() => {
          this.loading = false;
        });
    },
    lookupChildForItemRecordedDateDesc() {
      this.loading = true;
      resolveResponse(childForItemRecordedDateDescDisp(
        this.itemId, this.table.currentPage, this.table.pageSize,
      ))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(childForItemRecordedDateDescDisp(
              this.itemId, res.total_pages - 1, this.record.table.pageSize,
            ));
          }
          return Promise.resolve(res);
        })
        .then(this.updateTableView)
        .finally(() => {
          this.loading = false;
        });
    },
    updateTableView(res) {
      this.table.entities = res;
      this.table.currentPage = res.current_page;
      return Promise.resolve();
    },
    activityFormatter(row) {
      if (!row.activity) {
        return '（未知）';
      }
      return row.activity.name;
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog();
    },
    syncAnchorEntity(entity) {
      const { anchorEntity } = this.maintainDialog;
      anchorEntity.long_id = entity.key.long_id;
      anchorEntity.activity_id = entity.activity_id;
      anchorEntity.value = entity.value;
      anchorEntity.recorded_date = entity.recorded_date;
      anchorEntity.remark = entity.remark;
      anchorEntity.activity_name = entity.activity.name;
      anchorEntity.formatted_recorded_date = formatTimestamp(entity.recorded_date);
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.item-record-panel-container {
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
  width: 135px;
}

.header-container .icon-button {
  padding: 11px;
}
</style>
