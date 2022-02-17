<template>
  <div class="task-view-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:default>
        <div class="placeholder" v-if="listPanel.selection.data.key.long_id === ''">
          请选择项目
        </div>
        <el-tabs
          class="task-tabs"
          tab-position="left"
          v-model="taskTabs.activeName"
          v-else
        >
          <el-tab-pane label="信息" name="info">
            <coming-soon/>
<!--            <info-tab-panel ref="infoTabPanel" :item-id="taskTabs.taskId"/>-->
          </el-tab-pane>
          <el-tab-pane label="资料" name="file">
            <coming-soon/>
<!--            <file-tab-panel :item-id="taskTabs.taskId"/>-->
          </el-tab-pane>
          <el-tab-pane label="参数" name="params">
            <coming-soon/>
<!--            <params-tab-panel/>-->
          </el-tab-pane>
        </el-tabs>
      </template>
      <task-list-panel
        class="list-container"
        slot="west"
        ref="assetBomListPanel"
        mode="TASK_VIEW"
        :project-key="parentSelection.projectId"
        @onCurrentChanged="handleCurrentChanged"
        @onEntityDelete="handleEntityDelete"
      />
      <div class="header-container" slot="header">
        <el-button
          class="header-button"
          type="primary"
          :disabled="headerButtonDisabled"
          @click="handleShowEntityCreateDialog"
        >
          新建任务
        </el-button>
        <el-divider direction="vertical"/>
        <el-input
          class="header-project-indicator"
          v-model="parentSelection.displayValue"
          readonly
        >
          <span slot="prepend">当前工程</span>
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleShowProjectSelectDialog"
          />
        </el-input>
      </div>
    </border-layout-panel>
    <project-select-dialog
      type="BANK_CARD"
      :visible.sync="projectSelectDialog.visible"
      @onConfirm="handleProjectConfirmed"
    />
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import ProjectSelectDialog from '@/views/items/projectHelper/project/ProjectSelectDialog.vue';
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';
import TaskListPanel from '@/views/items/projectHelper/taskView/TaskListPanel.vue';

export default {
  name: 'Task',
  components: {
    TaskListPanel,
    BorderLayoutPanel,
    ProjectSelectDialog,
    ComingSoon,
  },
  computed: {
    headerButtonDisabled() {
      return this.parentSelection.projectId === ''
        || this.parentSelection.projectId.permission_level === 1;
    },
  },
  data() {
    return {
      parentSelection: {
        projectId: '',
        project: null,
        displayValue: '',
      },
      projectSelectDialog: {
        visible: false,
      },
      listPanel: {
        selection: {
          node: null,
          data: {
            key: {
              long_id: '',
            },
            parent_key: null,
            has_no_child: true,
          },
        },
        appendChild: false,
      },
      taskTabs: {
        activeName: 'info',
        taskId: '',
      },
    };
  },
  methods: {
    handleShowProjectSelectDialog() {
      this.projectSelectDialog.visible = true;
    },
    handleProjectConfirmed(project) {
      this.parentSelection.project = project;
      this.parentSelection.projectId = project.key.long_id;
      this.parentSelection.displayValue = project.name;
      this.handleSearch();
    },
    handleSearch() {

    },
    handleCurrentChanged(node, data) {
      this.listPanel.selection.node = node;
      this.listPanel.selection.data = data;
      this.taskTabs.taskId = data.key.long_id;
    },
    handleShowEntityCreateDialog() {
    },
    handleEntityDelete() {
      // TODO
    },
    updateParentSelectionDisplayValue() {
      if (this.parentSelection.project === null) {
        this.parentSelection.displayValue = '（未选择项目）';
      } else {
        this.parentSelection.displayValue = this.parentSelection.project.name;
      }
    },
  },
  mounted() {
    this.updateParentSelectionDisplayValue();
  },
};
</script>

<style scoped>
.task-view-container {
  height: 100%;
  width: 100%;
}

.list-container {
  width: calc(25vw - 230px - 20px + 80px);
  height: 100%;
}

.header-project-indicator {
  width: 360px;
}

/*noinspection CssUnusedSymbol*/
.header-project-indicator >>> .el-input__inner {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.header-project-indicator >>> .el-input-group__prepend {
  padding: 0 10px;
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

.task-tabs {
  width: 100%;
  height: 100%;
}
</style>
