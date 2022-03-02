<template>
  <div class="task-sub-list-panel-container">
    <div v-if="taskList.length>0">
      <div
        class="task-item" v-for="(task, index) in taskList"
        :class="task.key.long_id === selection ? 'active': 'inactive'"
        :key="index"
        @click="handleTaskClicked(task.key.long_id)"
      >
        <span>{{ task.name }}</span>
        <el-progress
          class="progress"
          :percentage="percentage(task)"
          :show-text="false"
        />
      </div>
    </div>
    <span class="placeholder" v-else>（暂无内容）</span>
  </div>
</template>

<script>
export default {
  name: 'TaskSubListPanel',
  props: {
    taskList: {
      type: Array,
      default: () => [],
    },
    selection: {
      type: String,
      default: '',
    },
  },
  computed: {
    hasRemark() {
      return (task) => task.remark !== null && task.remark !== '';
    },
    percentage() {
      return (task) => {
        const total = task.total_mission_count;
        const finished = task.finished_mission_count;
        if (finished >= total) {
          return 100;
        }
        if (total === finished && total === 0) {
          return 0;
        }
        return finished / (total / 100);
      };
    },
  },
  methods: {
    handleTaskClicked(taskId) {
      this.$emit('onTaskClicked', taskId);
    },
  },
};
</script>

<style scoped>
.task-sub-list-panel-container {
  width: 100%;
}

.task-item {
  display: flex;
  flex-direction: column;
  padding: 4px;
  margin-left: 12px;
  margin-right: 4px;
}

/*noinspection CssUnusedSymbol*/
.task-item.active {
  background: rgba(0, 0, 0, .025);
}

/*noinspection CssUnusedSymbol*/
.task-item.inactive:hover {
  background: rgba(0, 0, 0, .025);
}

.task-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.task-item .progress{
  padding-bottom: 5px;
}

.placeholder {
  width: 100%;
  height: 37px;
  margin-left: 12px;
  margin-right: 4px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: #BFBFBF;
  user-select: none;
  background: rgba(0, 0, 0, .025)
}
</style>
