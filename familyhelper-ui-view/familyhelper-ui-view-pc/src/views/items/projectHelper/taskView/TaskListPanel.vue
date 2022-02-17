<template>
  <div class="task-list-panel-container">
    <el-input
      placeholder="请输入任务的名称"
      class="item-search-panel"
      v-model="taskNameToSearch"
      clearable
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="handleListSearch"
      />
    </el-input>
    <overlay-scrollbars class="scroll-bar">
      <el-collapse v-model="listActiveName" accordion>
        <el-collapse-item title="正在进行" name="inProgress">
        </el-collapse-item>
        <el-collapse-item title="还未开始" name="notStart">
        </el-collapse-item>
        <el-collapse-item title="已经完成" name="finished">
        </el-collapse-item>
      </el-collapse>
    </overlay-scrollbars>
  </div>
</template>

<script>
export default {
  name: 'TaskListPanel',
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
  data() {
    return {
      taskNameToSearch: '',
      listActiveName: 'inProgress',
      listLoading: false,
      inProgress: [],
      notStart: [],
      finished: [],
    };
  },
  methods: {
    inspectData() {

    },
    handleListSearch() {
      if (this.projectKey === '') {
        this.$message({
          showClose: true,
          message: '请先选择资产目录！',
          type: 'warning',
          center: true,
        });
      }
      if (this.taskNameToSearch === '') {
        this.listData = [];
        this.listSelection = {
          node: null,
          data: null,
        };
        this.inspectData();
      }
    },
  },
  mounted() {
    if (this.assetCatalogKey === '') {
      return;
    }
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
