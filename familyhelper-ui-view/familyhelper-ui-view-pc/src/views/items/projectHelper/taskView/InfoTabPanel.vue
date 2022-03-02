<template>
  <div class="info-tab-panel-container">
    <div class="edit-panel" v-loading="editPanelLoading">
      <div class="divider-block">
        <el-divider
          class="divider"
          content-position="left"
        >
          基本信息
        </el-divider>
        <el-button
          class="button"
          size="mini"
          type="primary"
          icon="el-icon-edit"
          @click="itemCoverEditDialog.visible=true"
        />
      </div>
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
          {{ wrappedFormatTimestamp(form.entity.created_date) }}
        </el-form-item>
        <el-form-item label="修改日期" style="width: 33%">
          {{ wrappedFormatTimestamp(form.entity.modified_date) }}
        </el-form-item>
        <el-form-item label="完成日期" style="width: 33%">
          {{ wrappedFormatTimestamp(form.entity.scrapped_date) }}
        </el-form-item>
        <el-form-item label="备注" style="width: 100%">
          {{ form.entity.remark }}
        </el-form-item>
      </el-form>
      <div class="divider-block">
        <el-divider
          class="divider"
          content-position="left"
        >
          进度
        </el-divider>
        <el-button
          class="button"
          size="mini"
          type="primary"
          icon="el-icon-edit"
          @click="itemCoverEditDialog.visible=true"
        />
      </div>
      <el-form
        class="property-form"
        label-position="left"
        label-width="80px"
        inline
        :model="form.entity"
      >
        <el-form-item label="已完成任务" style="width: 50%">
          {{ form.entity.finished_mission_count }}
        </el-form-item>
        <el-form-item label="总任务" style="width: 50%">
          {{ form.entity.total_mission_count }}
        </el-form-item>
        <el-form-item label="进度" style="width: 100%">
          <el-progress class="progress" :percentage="percentage"/>
        </el-form-item>
      </el-form>
      <div class="divider-block">
        <el-divider
          class="divider"
          content-position="left"
        >
          前置任务
        </el-divider>
        <el-button
          class="button"
          size="mini"
          type="primary"
          icon="el-icon-edit"
          @click="itemCoverEditDialog.visible=true"
        />
      </div>
      <div style="background: #7BBDFF;flex-grow: 1"></div>
      <div class="divider-block">
        <el-divider
          class="divider"
          content-position="left"
        >
          其它操作
        </el-divider>
      </div>
      <div>
        <el-button type="primary">复制</el-button>
        <el-button type="success">刷新状态</el-button>
        <el-button type="danger">删除</el-button>
      </div>
    </div>
    <overlay-scrollbars class="timeline-panel">
      <el-timeline class="timeline-block">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp">
          {{activity.content}}
        </el-timeline-item>
      </el-timeline>
    </overlay-scrollbars>
  </div>
</template>

<script>
import { formatTimestamp } from '@/util/timestamp';
import resolveResponse from '@/util/response';
import { inspectDisp } from '@/api/project/task';

export default {
  name: 'InfoTabPanel',
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
      editPanelLoading: false,
      activities: [{
        content: '活动按期开始123123123123123123123123',
        timestamp: '2018-04-15',
      }, {
        content: '通过审核',
        timestamp: '2018-04-13',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }, {
        content: '创建成功',
        timestamp: '2018-04-11',
      }],
    };
  },
  methods: {
    inspectTask() {
      this.editPanelLoading = true;
      resolveResponse(inspectDisp(this.taskId))
        .then(this.updateFormView)
        .catch(() => {
        })
        .finally(() => {
          this.editPanelLoading = false;
        });
    },
    updateFormView(res) {
      this.$set(this.form, 'entity', res);
    },
    wrappedFormatTimestamp(timestamp) {
      if (timestamp === null || timestamp === undefined || timestamp === 0) {
        return '（暂无）';
      }
      return formatTimestamp(timestamp);
    },
  },
  mounted() {
    if (this.taskId === '') {
      return;
    }
    this.inspectTask();
  },
};
</script>

<style scoped>
.info-tab-panel-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.edit-panel {
  width: 0;
  flex-grow: 1;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
}

.edit-panel .divider-block {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.edit-panel .divider-block .divider {
  margin-top: 18px;
  margin-bottom: 18px;
  flex-grow: 1;
}

.edit-panel .divider-block .button {
  margin-left: 20px;
  padding: 7px
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form >>> label {
  width: 240px;
  color: #99a9bf;
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
}

.property-form .progress{
  line-height: 40px;
}

.timeline-panel{
  width: 250px;
}

.timeline-panel .timeline-block{
  width: 245px;
  margin-right: 5px;
}
</style>
