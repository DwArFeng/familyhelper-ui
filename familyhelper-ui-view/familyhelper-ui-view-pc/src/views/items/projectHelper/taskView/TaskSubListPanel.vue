<template>
  <div class="task-sub-list-panel-container">
    <div v-if="taskList.length>0">
      <div
        class="task-item" v-for="(task, index) in taskList"
        :class="isActive(task) ? 'active': 'inactive'"
        :key="index"
        @click="handleTaskClicked(task)"
      >
        <div class="task-item-body">
          <span>{{ task.name }}</span>
          <el-progress
            class="progress"
            :percentage="percentage(task)"
            :show-text="false"
          />
        </div>
        <el-button class="button" type="danger" icon="el-icon-delete" size="mini"/>
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
      required: true,
    },
  },
  computed: {
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
    isActive() {
      return (task) => {
        if (this.selection === null) {
          return false;
        }
        return task.key.long_id === this.selection.key.long_id;
      };
    },
  },
  methods: {
    handleTaskClicked(task) {
      this.$emit('onTaskClicked', task);
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
  flex-direction: row;
  align-items: center;
  padding: 4px;
  margin-left: 12px;
  margin-right: 4px;
}

.task-item-body {
  width: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-right: 5px;
}

.task-item .button{
  padding: 7px;
}

/*noinspection CssUnusedSymbol*/
.task-item.active {
  background: #F5F7FA;
}

/*noinspection CssUnusedSymbol*/
.task-item.inactive:hover {
  background: #F5F7FA;
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
