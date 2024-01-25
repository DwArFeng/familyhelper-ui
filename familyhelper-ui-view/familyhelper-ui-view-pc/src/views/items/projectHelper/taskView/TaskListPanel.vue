<template>
  <div class="task-list-panel-container">
    <el-input
      placeholder="请输入任务的名称"
      class="item-search-panel"
      v-model="taskNameToSearch"
      clearable
    >
      <template v-slot:append>
        <el-button
          icon="el-icon-search"
          @click="handleListSearch"
        />
      </template>
    </el-input>
    <overlay-scrollbars class="scroll-bar">
      <el-collapse v-loading="listLoading" v-model="listActiveName">
        <el-collapse-item title="正在进行" name="inProgress">
          <task-sub-list-panel
            :task-list="inProgress"
            :selection="selection"
            @onTaskClicked="handleTaskClicked"
          />
        </el-collapse-item>
        <el-collapse-item title="还未开始" name="notStart">
          <task-sub-list-panel
            :task-list="notStart"
            :selection="selection"
            @onTaskClicked="handleTaskClicked"
          />
        </el-collapse-item>
        <el-collapse-item title="已经完成" name="finished">
          <task-sub-list-panel
            :task-list="finished"
            :selection="selection"
            @onTaskClicked="handleTaskClicked"
          />
        </el-collapse-item>
      </el-collapse>
    </overlay-scrollbars>
  </div>
</template>

<script>
import TaskSubListPanel from '@/views/items/projectHelper/taskView/TaskSubListPanel.vue';

import resolveResponse from '@/util/response';
import { childForProjectDisp } from '@/api/project/task';

export default {
  name: 'TaskListPanel',
  components: { TaskSubListPanel },
  props: {
    projectKey: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      validator(value) {
        return ['TASK_VIEW', 'DEFAULT'].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  watch: {
    projectKey() {
      this.inspectData();
    },
  },
  data() {
    return {
      taskNameToSearch: '',
      listActiveName: 'inProgress',
      listLoading: false,
      inProgress: [],
      notStart: [],
      finished: [],
      selection: null,
    };
  },
  methods: {
    inspectData() {
      if (this.projectKey === '') {
        return;
      }
      this.listLoading = true;
      resolveResponse(childForProjectDisp(this.projectKey, 0, 1000))
        .then(this.updateListView)
        .catch(() => {
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    updateListView(res) {
      this.inProgress.splice(0, this.inProgress.length);
      this.notStart.splice(0, this.notStart.length);
      this.finished.splice(0, this.finished.length);
      res.data.forEach((task) => {
        switch (task.status) {
          case 0:
            this.notStart.push(task);
            break;
          case 1:
            this.inProgress.push(task);
            break;
          case 2:
            this.finished.push(task);
            break;
          default:
        }
      });
    },
    handleListSearch() {
      this.inspectData();
    },
    handleTaskClicked(task) {
      this.selection = task;
      this.$emit('onCurrentChanged', this.selection);
    },
  },
  mounted() {
    this.inspectData();
  },
};
</script>

<style scoped>
.task-list-panel-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>
