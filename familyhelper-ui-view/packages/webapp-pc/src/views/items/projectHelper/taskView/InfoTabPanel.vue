<template>
  <div class="info-tab-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header">
          <el-button type="primary" @click="handleEntityEdit">编辑属性</el-button>
          <el-button type="primary">编辑进度</el-button>
          <el-button type="primary">编辑前置任务</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="details-wrapper">
          <title-layout-panel class="details" title="基础属性" bordered apply-container-height>
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
              :model="form.entity"
            >
              <el-form-item label="名称" style="width: 100%">
                {{ form.entity.name }}
              </el-form-item>
              <el-form-item label="类型" style="width: 33%">
                {{ formattedType }}
              </el-form-item>
              <el-form-item label="状态" style="width: 67%">
                {{ form.entity.status }}
              </el-form-item>
              <el-form-item label="创建日期" style="width: 33%">
                {{ form.entity.created_date | timestamp }}
              </el-form-item>
              <el-form-item label="修改日期" style="width: 33%">
                {{ form.entity.modified_date | timestamp }}
              </el-form-item>
              <el-form-item label="完成日期" style="width: 33%">
                {{ form.entity.scrapped_date | timestamp }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                {{ form.entity.remark }}
              </el-form-item>
              <el-form-item label="已完成任务" style="width: 33%">
                {{ form.entity.finished_mission_count }}
              </el-form-item>
              <el-form-item label="总任务" style="width: 33%">
                {{ form.entity.total_mission_count }}
              </el-form-item>
              <el-form-item label="进度" style="width: 100%">
                <el-progress class="progress" :percentage="percentage"/>
              </el-form-item>
            </el-form>
          </title-layout-panel>
          <title-layout-panel class="details" title="前置任务" bordered apply-container-height>
            <div style="background: #7BBDFF;height: 100%;width: 100%"/>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';

import { formatTimestamp } from '@/util/timestamp';
import resolveResponse from '@/util/response';
import { inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/project/task';

export default {
  name: 'InfoTabPanel',
  components: { TitleLayoutPanel, HeaderLayoutPanel },
  props: {
    taskId: {
      type: String,
      default: '',
    },
  },
  computed: {
    percentage() {
      const total = this.form.entity.total_mission_count;
      const finished = this.form.entity.finished_mission_count;
      if (finished >= total) {
        return 100;
      }
      if (total === finished && total === 0) {
        return 0;
      }
      return finished / (total / 100);
    },
    formattedType() {
      if (this.form.entity.type === '' || this.form.entity.type === null) {
        return '（无）';
      }
      const indicator = this.form.entity.type_indicator;
      if (indicator === null || indicator === undefined) {
        return '（未知）';
      }
      return indicator.label;
    },
  },
  filters: {
    timestamp(timestamp) {
      if (timestamp === null || timestamp === undefined) {
        return '（暂无）';
      }
      return formatTimestamp(timestamp);
    },
  },
  watch: {
    taskId(val) {
      if (val === '') {
        return;
      }
      this.inspectTask();
    },
  },
  data() {
    return {
      form: {
        entity: {
          name: '',
          type: '',
          created_date: 0,
          modified_date: 0,
          finished_date: 0,
          status: 0,
          remark: '',
          total_mission_count: 0,
          finished_mission_count: 0,
          type_indicator: null,
        },
      },
      loading: false,
    };
  },
  methods: {
    inspectTask() {
      this.loading = true;
      resolveResponse(inspectDisp(this.taskId))
        .then(this.updateFormView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateFormView(res) {
      this.$set(this.form, 'entity', res);
    },
    updateView() {
      if (this.taskId === '') {
        return;
      }
      this.inspectTask();
    },
    handleEntityEdit() {
      this.$emit('onEntityEdit');
    },
  },
  mounted() {
    this.updateView();
  },
};
</script>

<style scoped>
.info-tab-panel-container {
  height: 100%;
  width: 100%;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.details-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.details-wrapper .details:not(:first-child){
  margin-top: 5px;
}

.details-wrapper .details:last-child{
  height: 0;
  flex-grow: 1;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-form .progress {
  line-height: 30px;
}
</style>
