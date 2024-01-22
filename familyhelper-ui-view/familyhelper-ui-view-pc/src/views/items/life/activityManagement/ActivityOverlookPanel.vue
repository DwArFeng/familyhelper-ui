<template>
  <div class="activity-overlook-panel-container">
    <div class="placeholder" v-if="activityId===''">请选择活动</div>
    <!--suppress VueUnrecognizedDirective -->
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleShowEditDialog"
            >
              编辑属性
            </el-button>
            <el-divider direction="vertical"/>
            <el-button type="success" @click="handleSearch">刷新数据</el-button>
            <div style="flex-grow: 1"/>
            <el-button
              class="icon-button"
              v-if="mode==='DEFAULT'"
              type="info"
              @click="handlePanelFloatyButtonClicked"
            >
              <i class="iconfont">&#xffd3;</i>
            </el-button>
          </div>
        </template>
        <template v-slot:default>
          <title-layout-panel class="property-container" title="属性" bordered>
            <overlay-scrollbars class="scroll-bar">
              <el-form
                class="property-form"
                label-position="left"
                label-width="125px"
                inline
                :model="activity"
              >
                <el-form-item label="类型" style="width: 100%">
                  {{ activity.activity_type_indicator | activityTypeFilter }}
                </el-form-item>
                <el-form-item label="名称" style="width: 100%">
                  {{ activity.name }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ activity.remark }}
                </el-form-item>
                <el-form-item label="开始日期" style="width: 33%">
                  {{ activity.start_date | timestampFilter }}
                </el-form-item>
                <el-form-item label="结束日期" style="width: 67%">
                  {{ activity.end_date | timestampFilter }}
                </el-form-item>
                <el-form-item label="锁定" style="width: 33%">
                  {{ activity.locked | booleanFilter }}
                </el-form-item>
                <el-form-item label="锁定日期" style="width: 67%">
                  {{ activity.locked_date | timestampFilter }}
                </el-form-item>
                <el-form-item label="创建日期" style="width: 33%">
                  {{ activity.created_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="编辑日期" style="width: 33%">
                  {{ activity.modified_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="查看日期" style="width: 34%">
                  {{ activity.inspected_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="所有者" style="width: 33%">
                  {{ activity.owner_account_display_name }}
                </el-form-item>
                <el-form-item label="权限等级" style="width: 67%">
                  {{ activity.permission_level|permissionLevelFilter }}
                </el-form-item>
              </el-form>
            </overlay-scrollbars>
          </title-layout-panel>
        </template>
      </header-layout-panel>
    </div>
    <entity-maintain-dialog
      top="10vh"
      custom-class="entity-maintain-dialog"
      label-width="125px"
      mode="EDIT"
      :visible.sync="maintainDialog.visible"
      :entity="maintainDialog.anchorEntity"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityEdit="handleEntityEdit"
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

import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';

import { all as allActivityTypeIndicator } from '@/api/life/activityTypeIndicator';
import { inspectDisp as inspect, update } from '@/api/life/activity';
import resolveResponse from '@/util/response';

import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ActivityOverlookPanel',
  components: { EntityMaintainDialog, TitleLayoutPanel, HeaderLayoutPanel },
  props: {
    activityId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      required: true,
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
    activityId() {
      this.handleSearch();
    },
  },
  filters: {
    booleanFilter(value) {
      return value ? '是' : '否';
    },
    timestampFilter(value) {
      if (value === '') {
        return '';
      }
      return formatTimestamp(value);
    },
    permissionLevelFilter(value) {
      if (value === 0) {
        return '所有者';
      }
      if (value === 1) {
        return '可查看';
      }
      return '';
    },
    activityTypeFilter(indicator) {
      if (!indicator) {
        return '（未知）';
      }
      const { label } = indicator;
      if (!label) {
        return '（未知）';
      }
      return label;
    },
  },
  data() {
    return {
      loading: false,
      activity: {
        activity_type: '',
        name: '',
        score: 0,
        remark: '',
        locked: false,
        start_date: null,
        end_date: null,
        created_date: null,
        modified_date: null,
        inspected_date: null,
        locked_date: null,
        owner_account_display_name: '',
        permission_level: 0,
        activity_type_indicator: null,
      },
      maintainDialog: {
        loading: false,
        visible: false,
        anchorEntity: {
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
    handleSearch() {
      if (this.activityId === '') {
        return;
      }
      this.inspectEntity();
    },
    inspectEntity() {
      this.loading = true;
      resolveResponse(inspect(this.activityId))
        .then(this.updateEntityView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateEntityView(res) {
      this.activity.activity_type = res.activity_type;
      this.activity.name = res.name;
      this.activity.score = res.score;
      this.activity.remark = res.remark;
      this.activity.locked = res.locked;
      this.activity.start_date = res.start_date;
      this.activity.end_date = res.end_date;
      this.activity.created_date = res.created_date;
      this.activity.modified_date = res.modified_date;
      this.activity.inspected_date = res.inspected_date;
      this.activity.locked_date = res.locked_date;
      // noinspection JSUnresolvedReference
      if (res.owner_account === null) {
        this.activity.owner_account_display_name = '';
      } else {
        // noinspection JSUnresolvedReference
        this.activity.owner_account_display_name = res.owner_account.display_name;
      }
      this.activity.permission_level = res.permission_level;
      this.activity.activity_type_indicator = res.activity_type_indicator;
    },
    handleShowEditDialog() {
      this.syncAnchorEntity();
      this.showDialog();
    },
    syncAnchorEntity() {
      const entity = this.activity;
      const { anchorEntity } = this.maintainDialog;
      anchorEntity.activity_type = entity.activity_type;
      anchorEntity.name = entity.name;
      anchorEntity.remark = entity.remark;
      anchorEntity.start_date = entity.start_date;
      anchorEntity.end_date = entity.end_date;
      anchorEntity.formatted_activity_type = '（未知）';
      // noinspection JSUnresolvedReference
      if (entity.activity_type_indicator) {
        const { label } = entity.activity_type_indicator;
        anchorEntity.formatted_activity_type = label;
      }
      anchorEntity.formatted_start_date = formatTimestamp(entity.start_date);
      anchorEntity.formatted_end_date = formatTimestamp(entity.end_date);
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.activityId,
        this.maintainDialog.anchorEntity.activity_type,
        this.maintainDialog.anchorEntity.name,
        100,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.start_date,
        this.maintainDialog.anchorEntity.end_date,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '活动更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.maintainDialog.visible = false;
          this.$emit('onActivityPropertyUpdated');
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
    handlePanelFloatyButtonClicked() {
      this.$emit('onPanelFloatyButtonClicked');
    },
  },
  mounted() {
    this.handleActivityTypeIndicatorSearch();
    this.handleSearch();
  },
};
</script>

<style scoped>
.activity-overlook-panel-container {
  width: 100%;
  height: 100%;
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

.header-container .icon-button {
  padding-left: 12px;
  padding-right: 12px;
}

.property-container {
  height: 100%;
  width: 100%;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-container .property-form >>> textarea {
  padding: 0;
  border: none;
  font: unset;
  font-size: 14px;
  color: #303133;
}

/*noinspection CssUnusedSymbol*/
.entity-maintain-dialog .short-bar {
  width: 200px;
}

.activity-type-select {
  width: 100%;
}
</style>
