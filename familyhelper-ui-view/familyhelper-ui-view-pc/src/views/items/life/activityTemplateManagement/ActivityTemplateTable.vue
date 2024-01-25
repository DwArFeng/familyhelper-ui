<template>
  <div class="activity-template-table-container">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button
            v-if="mode==='ACTIVITY_TEMPLATE_MANAGEMENT'"
            type="primary"
            @click="handleShowEntityCreateDialog"
          >
            新建模板
          </el-button>
          <el-divider v-if="mode==='ACTIVITY_TEMPLATE_MANAGEMENT'" direction="vertical"/>
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
                v-if="mode==='ACTIVITY_TEMPLATE_MANAGEMENT'"
                size="mini"
                icon="el-icon-delete"
                type="danger"
                :disabled="activityTemplateReadonly(row)"
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
      <el-form-item label="活动名称模板" prop="activity_name_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_name_template"
          type="textarea"
          resize="none"
          :readonly="maintainDialog.mode === 'INSPECT'"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="活动备注模板" prop="activity_remark_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_remark_template"
          type="textarea"
          resize="none"
          :readonly="maintainDialog.mode === 'INSPECT'"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="活动开始时间模板" prop="activity_start_date_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_start_date_template"
          type="textarea"
          resize="none"
          :readonly="maintainDialog.mode === 'INSPECT'"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="活动结束时间模板" prop="activity_end_date_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_end_date_template"
          type="textarea"
          resize="none"
          :readonly="maintainDialog.mode === 'INSPECT'"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="基线日期" prop="baseline_date">
        <el-input
          v-if="maintainDialog.mode === 'INSPECT'"
          v-model="maintainDialog.anchorEntity.formatted_baseline_date"
          readonly
        />
        <el-date-picker
          v-else
          class="short-bar"
          v-model="maintainDialog.anchorEntity.baseline_date"
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

import { all as allActivityTypeIndicator } from '@/api/life/activityTypeIndicator';
import {
  allOwnedDisp, allPermittedDisp, create, remove,
} from '@/api/life/activityTemplate';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

// noinspection JSAnnotator
export default {
  name: 'ActivityTemplateTable',
  components: {
    EntityMaintainDialog, TablePanel, HeaderLayoutPanel,
  },
  props: {
    mode: {
      type: String,
      validator(value) {
        return ['ACTIVITY_TEMPLATE_MANAGEMENT', 'DEFAULT'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    activityTemplateReadonly() {
      return (activityTemplate) => activityTemplate.permission_level === 1;
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
          remark: '',
          activity_name_template: '',
          activity_remark_template: '',
          activity_start_date_template: '',
          activity_end_date_template: '',
          baseline_date: 0,
          formatted_baseline_date: '',
          formatted_activity_type: '',
        },
        rules: {
          activity_type: [
            { required: true, message: '请选择活动类型', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '活动模板名称不能为空', trigger: 'blur' },
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
      this.maintainDialog.anchorEntity.activity_name_template = entity.activity_name_template;
      this.maintainDialog.anchorEntity.activity_remark_template = entity.activity_remark_template;
      this.maintainDialog.anchorEntity
        .activity_start_date_template = entity.activity_start_date_template;
      this.maintainDialog.anchorEntity
        .activity_end_date_template = entity.activity_end_date_template;
      this.maintainDialog.anchorEntity.baseline_date = entity.baseline_date;
      this.maintainDialog.anchorEntity
        .formatted_baseline_date = formatTimestamp(entity.baseline_date);
      this.maintainDialog.anchorEntity.formatted_activity_type = '（未知）';
      // noinspection JSUnresolvedReference
      if (entity.activity_type_indicator) {
        const { label } = entity.activity_type_indicator;
        this.maintainDialog.anchorEntity.formatted_activity_type = label;
      }
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
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.activity_name_template,
        this.maintainDialog.anchorEntity.activity_remark_template,
        this.maintainDialog.anchorEntity.activity_start_date_template,
        this.maintainDialog.anchorEntity.activity_end_date_template,
        this.maintainDialog.anchorEntity.baseline_date,
      )).then(() => {
        this.$message({
          showClose: true,
          message: `活动模板 ${this.maintainDialog.anchorEntity.name} 创建成功`,
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
        .then((res) => this.$confirm('此操作将永久删除此活动模板。<br>'
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
            message: `活动模板 ${entity.name} 删除成功`,
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
    updateEntity(activityTemplate) {
      // 在 this.table.entities.data 中找到对应的 entity 的索引。
      // 规则是 data.key.long_id === activityTemplate.key.long_id。
      const index = this.table.entities.data.findIndex(
        (entity) => entity.key.long_id === activityTemplate.key.long_id,
      );
      // 如果找到了，就更新。
      if (index !== -1) {
        this.$set(this.table.entities.data, index, activityTemplate);
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
.activity-template-table-container {
  height: 100%;
  width: 100%;
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
