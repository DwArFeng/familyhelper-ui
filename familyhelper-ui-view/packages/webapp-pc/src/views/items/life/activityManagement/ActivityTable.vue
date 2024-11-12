<template>
  <div class="activity-table-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button
            v-if="mode==='ACTIVITY_MANAGEMENT'"
            type="primary"
            @click="handleShowEntityCreateDialog"
          >
            新建活动
          </el-button>
          <el-divider v-if="mode==='ACTIVITY_MANAGEMENT'" direction="vertical"/>
          <el-switch
            v-model="inspectAllSwitch.inspectAll"
            active-text="看所有的"
            inactive-text="看自己的"
            @change="handleSearch"
          />
          <el-divider direction="vertical"/>
          <el-button type="success" @click="handleSearch">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <table-panel
          class="table-panel"
          highlight-current-row
          :page-size.sync="table.pageSize"
          :entity-count="parseInt(table.entities.count)"
          :current-page.sync="table.currentPage"
          :page-sizes="[15,20,30,50]"
          :table-data="table.entities.data"
          :operate-column-width="76"
          :table-selection.sync="table.selection"
          @onPagingAttributeChanged="handlePagingAttributeChanged"
        >
          <template v-slot:default>
            <el-table-column
              prop="activity_type_indicator.label"
              label="类型"
              show-tooltip-when-overflow
              :formatter="activityTypeFormatter"
            />
            <el-table-column
              prop="name"
              label="名称"
              show-tooltip-when-overflow
            />
            <el-table-column
              prop="start_date"
              label="开始日期"
              width="180px"
              show-tooltip-when-overflow
              :formatter="timestampFormatter"
            />
            <el-table-column
              prop="end_date"
              label="结束日期"
              width="180px"
              show-tooltip-when-overflow
              :formatter="timestampFormatter"
            />
            <el-table-column
              prop="locked"
              label="锁定"
              show-tooltip-when-overflow
              :formatter="booleanFormatter"
            />
            <el-table-column
              prop="remark"
              label="备注"
              show-tooltip-when-overflow
            />
          </template>
          <template v-slot:operateColumn="{$index, row}">
            <el-button-group>
              <el-button
                class="table-button"
                size="mini"
                icon="el-icon-search"
                type="success"
                @click="handleShowEntityInspectDialog($index, row)"
              />
              <el-button
                class="table-button"
                v-if="mode==='ACTIVITY_MANAGEMENT'"
                size="mini"
                icon="el-icon-delete"
                type="danger"
                :disabled="activityReadonly(row)"
                @click="handleEntityDelete($index,row)"
              />
            </el-button-group>
          </template>
        </table-panel>
      </template>
    </header-layout-panel>
    <entity-maintain-dialog
      top="10vh"
      custom-class="entity-maintain-dialog"
      label-width="125px"
      :mode="maintainDialog.mode"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
    >
      <el-form-item label="类型" prop="activity_type">
        <el-input
          v-if="maintainDialog.mode === 'INSPECT'"
          v-model="maintainDialog.anchorEntity.formatted_activity_type"
          readonly
        />
        <el-select
          class='activity-type-select'
          v-else
          v-model="maintainDialog.anchorEntity.activity_type"
          placeholder="请选择"
        >
          <el-option
            v-for="item in activityTypeIndicator.data"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="maintainDialog.anchorEntity.name"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
          :readonly="maintainDialog.mode === 'INSPECT'"
        />
      </el-form-item>
      <el-form-item label="开始日期" prop="start_date">
        <el-input
          v-if="maintainDialog.mode === 'INSPECT'"
          v-model="maintainDialog.anchorEntity.formatted_start_date"
          readonly
        />
        <el-date-picker
          v-else
          class="short-bar"
          v-model="maintainDialog.anchorEntity.start_date"
          type="datetime"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="end_date">
        <el-input
          v-if="maintainDialog.mode === 'INSPECT'"
          v-model="maintainDialog.anchorEntity.formatted_end_date"
          readonly
        />
        <el-date-picker
          v-else
          class="short-bar"
          v-model="maintainDialog.anchorEntity.end_date"
          type="datetime"
          placeholder="选择日期"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TablePanel from '@/components/layout/TablePanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  all as allActivityTypeIndicator,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTypeIndicator';
import {
  allOwnedDisp, allPermittedDisp, create, remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activity';
import resolveResponse from '@/util/response';

import { formatTimestamp } from '@/util/timestamp';

// noinspection JSAnnotator
export default {
  name: 'ActivityTable',
  components: { EntityMaintainDialog, TablePanel, HeaderLayoutPanel },
  props: {
    mode: {
      type: String,
      validator(value) {
        return ['ACTIVITY_MANAGEMENT', 'DEFAULT'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    activityReadonly() {
      return (activity) => {
        const modifiedPermission = activity.permission_level === 1;
        const unlocked = !activity.locked;
        return modifiedPermission && unlocked;
      };
    },
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    'table.selection': {
      handler() {
        this.$emit('onSelectionChanged', this.table.selection);
      },
    },
  },
  data() {
    return {
      inspectAllSwitch: {
        inspectAll: false,
      },
      table: {
        pageSize: 15,
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
        currentPage: 0,
        selection: null,
      },
      maintainDialog: {
        loading: false,
        mode: 'CREATE',
        visible: false,
        anchorEntity: {
          long_id: '',
          activity_type: '',
          name: '',
          score: 0,
          remark: '',
          start_date: null,
          end_date: null,
          formatted_activity_type: '',
          formatted_start_date: '',
          formatted_end_date: '',
        },
        rules: {
          activity_type: [
            { required: true, message: '请选择活动类型', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '活动名称不能为空', trigger: 'blur' },
          ],
        },
      },
      activityTypeIndicator: {
        data: [],
      },
    };
  },
  methods: {
    handleActivityTypeIndicatorSearch() {
      this.lookupAllActivityTypeIndicator();
    },
    lookupAllActivityTypeIndicator() {
      resolveResponse(allActivityTypeIndicator(0, 1000))
        .then(this.updateActivityTypeIndicator)
        .catch(() => {
        });
    },
    updateActivityTypeIndicator(res) {
      this.activityTypeIndicator.data = res.data;
    },
    handlePagingAttributeChanged() {
      this.handleSearch();
    },
    handleSearch() {
      if (this.inspectAllSwitch.inspectAll) {
        this.lookupAllPermitted();
      } else {
        this.lookupAllOwned();
      }
    },
    lookupAllPermitted() {
      this.loading = true;
      resolveResponse(allPermittedDisp(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allPermittedDisp(
              res.total_pages - 1, this.table.pageSize,
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
    lookupAllOwned() {
      this.loading = true;
      resolveResponse(allOwnedDisp(this.table.currentPage, this.table.pageSize))
        .then((res) => {
          // 当查询的页数大于总页数，自动查询最后一页。
          if (res.current_page > res.total_pages && res.total_pages > 0) {
            return resolveResponse(allOwnedDisp(
              res.total_pages - 1, this.table.pageSize,
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
    activityTypeFormatter(row) {
      // noinspection JSUnresolvedReference
      const indicator = row.activity_type_indicator;
      if (!indicator) {
        return '（未知）';
      }
      const { label } = indicator;
      if (!label) {
        return '（未知）';
      }
      return label;
    },
    timestampFormatter(row, column) {
      return formatTimestamp(row[column.property]);
    },
    booleanFormatter(row, column) {
      const value = row[column.property];
      if (value === null || value === undefined) {
        return '';
      }
      return value ? '是' : '否';
    },
    handleShowEntityCreateDialog() {
      this.showDialog('CREATE');
    },
    handleShowEntityInspectDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('INSPECT');
    },
    handleShowEntityEditDialog(index, entity) {
      this.syncAnchorEntity(entity);
      this.showDialog('EDIT');
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.activity_type = entity.activity_type;
      this.maintainDialog.anchorEntity.name = entity.name;
      this.maintainDialog.anchorEntity.remark = entity.remark;
      this.maintainDialog.anchorEntity.start_date = entity.start_date;
      this.maintainDialog.anchorEntity.end_date = entity.end_date;
      this.maintainDialog.anchorEntity.formatted_activity_type = '（未知）';
      // noinspection JSUnresolvedReference
      if (entity.activity_type_indicator) {
        const { label } = entity.activity_type_indicator;
        this.maintainDialog.anchorEntity.formatted_activity_type = label;
      }
      this.maintainDialog.anchorEntity.formatted_start_date = formatTimestamp(entity.start_date);
      this.maintainDialog.anchorEntity.formatted_end_date = formatTimestamp(entity.end_date);
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.maintainDialog.visible = true;
    },
    handleEntityCreate() {
      this.maintainDialog.loading = true;
      resolveResponse(create(
        this.maintainDialog.anchorEntity.activity_type,
        this.maintainDialog.anchorEntity.name,
        100,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.start_date,
        this.maintainDialog.anchorEntity.end_date,
      )).then(() => {
        this.$message({
          showClose: true,
          message: `活动 ${this.maintainDialog.anchorEntity.name} 创建成功`,
          type: 'success',
          center: true,
        });
      })
        .then(() => {
          this.handleSearch();
          return Promise.resolve();
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.visible = false;
          this.maintainDialog.loading = false;
        });
    },
    handleEntityDelete(index, entity) {
      Promise.resolve(entity.key.long_id)
        .then((res) => this.$confirm('此操作将永久删除此活动。<br>'
          + '是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve(res)).catch(() => Promise.reject()))
        .then((res) => resolveResponse(remove(res)))
        .then(() => {
          this.$message({
            showClose: true,
            message: `活动 ${entity.name} 删除成功`,
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
    updateEntity(activity) {
      // 在 this.table.entities.data 中找到对应的 entity 的索引。
      // 规则是 data.key.long_id === activity.key.long_id。
      const index = this.table.entities.data.findIndex(
        (entity) => entity.key.long_id === activity.key.long_id,
      );
      // 如果找到了，就更新。
      if (index !== -1) {
        this.$set(this.table.entities.data, index, activity);
      }
    },
  },
  mounted() {
    this.handleActivityTypeIndicatorSearch();
    this.handleSearch();
  },
};
</script>

<style scoped>
.activity-table-container {
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

.table-button {
  padding: 7px
}

/*noinspection CssUnusedSymbol*/
.entity-maintain-dialog .short-bar {
  width: 200px;
}

.activity-type-select {
  width: 100%;
}
</style>
