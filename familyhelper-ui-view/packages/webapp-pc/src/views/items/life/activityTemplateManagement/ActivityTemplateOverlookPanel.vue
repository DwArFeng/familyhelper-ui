<template>
  <div class="activity-template-overlook-panel-container">
    <div class="placeholder" v-if="activityTemplateId===''">请选择活动模板</div>
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
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleCreateActivity"
            >
              生成活动
            </el-button>
            <el-button
              type="primary"
              :disabled="readonly"
              @click="handleCreateActivityForTest"
            >
              测试模板
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
                :model="activityTemplate"
              >
                <el-form-item label="类型" style="width: 100%">
                  {{ activityTemplate.activity_type_indicator | activityTypeFilter }}
                </el-form-item>
                <el-form-item label="名称" style="width: 100%">
                  {{ activityTemplate.name }}
                </el-form-item>
                <el-form-item label="备注" style="width: 100%">
                  {{ activityTemplate.remark }}
                </el-form-item>
                <el-form-item label="活动名称模板" style="width: 100%">
                  <el-input
                    v-model="activityTemplate.activity_name_template"
                    type="textarea"
                    resize="none"
                    readonly
                    :rows="3"
                  />
                </el-form-item>
                <el-form-item label="活动备注模板" style="width: 100%">
                  <el-input
                    v-model="activityTemplate.activity_remark_template"
                    type="textarea"
                    resize="none"
                    readonly
                    :rows="3"
                  />
                </el-form-item>
                <el-form-item label="活动开始时间模板" style="width: 100%">
                  <el-input
                    v-model="activityTemplate.activity_start_date_template"
                    type="textarea"
                    resize="none"
                    readonly
                    :rows="3"
                  />
                </el-form-item>
                <el-form-item label="活动结束时间模板" style="width: 100%">
                  <el-input
                    v-model="activityTemplate.activity_end_date_template"
                    type="textarea"
                    resize="none"
                    readonly
                    :rows="3"
                  />
                </el-form-item>
                <el-form-item label="基线日期" style="width: 100%">
                  {{ activityTemplate.baseline_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="创建日期" style="width: 33%">
                  {{ activityTemplate.created_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="编辑日期" style="width: 33%">
                  {{ activityTemplate.modified_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="查看日期" style="width: 34%">
                  {{ activityTemplate.inspected_date|timestampFilter }}
                </el-form-item>
                <el-form-item label="所有者" style="width: 33%">
                  {{ activityTemplate.owner_account_display_name }}
                </el-form-item>
                <el-form-item label="权限等级" style="width: 67%">
                  {{ activityTemplate.permission_level|permissionLevelFilter }}
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
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
        />
      </el-form-item>
      <el-form-item label="活动名称模板" prop="activity_name_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_name_template"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="活动备注模板" prop="activity_remark_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_remark_template"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="活动开始时间模板" prop="activity_start_date_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_start_date_template"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="活动结束时间模板" prop="activity_end_date_template">
        <el-input
          v-model="maintainDialog.anchorEntity.activity_end_date_template"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="基线日期" prop="baseline_date">
        <el-date-picker
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
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import {
  inspectDisp as inspect, update, createActivity, createActivityForTest,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTemplate';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';
import {
  all as allActivityTypeIndicator,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTypeIndicator';

export default {
  name: 'ActivityTemplateOverlookPanel',
  components: { EntityMaintainDialog, TitleLayoutPanel, HeaderLayoutPanel },
  props: {
    activityTemplateId: {
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
    activityTemplateId() {
      this.handleSearch();
    },
  },
  filters: {
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
      activityTemplate: {
        activity_type: '',
        name: '',
        remark: '',
        activity_name_template: '',
        activity_remark_template: '',
        activity_start_date_template: '',
        activity_end_date_template: '',
        baseline_date: 0,
        created_date: 0,
        modified_date: 0,
        inspected_date: 0,
        generated_count: 0,
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
          remark: '',
          activity_name_template: '',
          activity_remark_template: '',
          activity_start_date_template: '',
          activity_end_date_template: '',
          baseline_date: 0,
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
    handleSearch() {
      if (this.activityTemplateId === '') {
        return;
      }
      this.inspectEntity();
    },
    inspectEntity() {
      this.loading = true;
      resolveResponse(inspect(this.activityTemplateId))
        .then(this.updateEntityView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateEntityView(res) {
      this.activityTemplate.activity_type = res.activity_type;
      this.activityTemplate.name = res.name;
      this.activityTemplate.remark = res.remark;
      this.activityTemplate.activity_name_template = res.activity_name_template;
      this.activityTemplate.activity_remark_template = res.activity_remark_template;
      this.activityTemplate.activity_start_date_template = res.activity_start_date_template;
      this.activityTemplate.activity_end_date_template = res.activity_end_date_template;
      this.activityTemplate.baseline_date = res.baseline_date;
      this.activityTemplate.created_date = res.created_date;
      this.activityTemplate.modified_date = res.modified_date;
      this.activityTemplate.inspected_date = res.inspected_date;
      this.activityTemplate.generated_count = res.generated_count;
      // noinspection JSUnresolvedReference
      if (res.owner_account === null) {
        this.activityTemplate.owner_account_display_name = '';
      } else {
        // noinspection JSUnresolvedReference
        this.activityTemplate.owner_account_display_name = res.owner_account.display_name;
      }
      this.activityTemplate.permission_level = res.permission_level;
      this.activityTemplate.activity_type_indicator = res.activity_type_indicator;
    },
    handleShowEditDialog() {
      this.syncAnchorEntity();
      this.showDialog();
    },
    syncAnchorEntity() {
      const entity = this.activityTemplate;
      const { anchorEntity } = this.maintainDialog;
      anchorEntity.activity_type = entity.activity_type;
      anchorEntity.name = entity.name;
      anchorEntity.remark = entity.remark;
      anchorEntity.activity_name_template = entity.activity_name_template;
      anchorEntity.activity_remark_template = entity.activity_remark_template;
      anchorEntity.activity_start_date_template = entity.activity_start_date_template;
      anchorEntity.activity_end_date_template = entity.activity_end_date_template;
      anchorEntity.baseline_date = entity.baseline_date;
    },
    showDialog() {
      this.maintainDialog.visible = true;
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.activityTemplateId,
        this.maintainDialog.anchorEntity.activity_type,
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.activity_name_template,
        this.maintainDialog.anchorEntity.activity_remark_template,
        this.maintainDialog.anchorEntity.activity_start_date_template,
        this.maintainDialog.anchorEntity.activity_end_date_template,
        this.maintainDialog.anchorEntity.baseline_date,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '活动模板更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.handleSearch();
          this.maintainDialog.visible = false;
          this.$emit('onActivityTemplatePropertyUpdated');
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
    handleCreateActivity() {
      resolveResponse(createActivity(this.activityTemplateId))
        .then(() => {
          this.$message({
            showClose: true,
            message: '活动创建成功',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
        });
    },
    handleCreateActivityForTest() {
      resolveResponse(createActivityForTest(this.activityTemplateId))
        .then(() => {
          this.$message({
            showClose: true,
            message: '活动创建测试成功，请前往活动页面查看',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
        });
    },
  },
  mounted() {
    this.handleActivityTypeIndicatorSearch();
    this.handleSearch();
  },
};
</script>

<style scoped>
.activity-template-overlook-panel-container {
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

.header-container .icon-button {
  padding: 11px;
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
