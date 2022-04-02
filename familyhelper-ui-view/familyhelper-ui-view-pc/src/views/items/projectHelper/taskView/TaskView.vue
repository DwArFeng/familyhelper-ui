<template>
  <div class="task-view-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:default>
        <div class="placeholder" v-if="taskTabs.taskId === ''">
          请选择项目
        </div>
        <el-tabs
          class="task-tabs"
          tab-position="left"
          v-model="taskTabs.activeName"
          v-else
        >
          <el-tab-pane label="信息" name="info">
            <info-tab-panel ref="infoTabPanel" :task-id="taskTabs.taskId"/>
          </el-tab-pane>
          <el-tab-pane label="待做清单" name="todoList">
            <coming-soon/>
            <!--            <file-tab-panel :item-id="taskTabs.taskId"/>-->
          </el-tab-pane>
          <el-tab-pane label="资料" name="file">
            <coming-soon/>
            <!--            <file-tab-panel :item-id="taskTabs.taskId"/>-->
          </el-tab-pane>
        </el-tabs>
      </template>
      <task-list-panel
        class="list-container"
        slot="west"
        ref="taskViewListPanel"
        mode="TASK_VIEW"
        :project-key="parentSelection.projectId"
        @onCurrentChanged="handleCurrentChanged"
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
        <project-indicator mode="TASK_VIEW" @change="handleProjectChanged"/>
      </div>
    </border-layout-panel>
    <el-dialog
      id="dialog"
      append-to-body
      destroy-on-close
      title="新建任务"
      :visible.sync="createDialog.visible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleEntityCreate"
    >
      <!--suppress HtmlUnknownAttribute -->
      <el-form
        class="editor-container"
        ref="createForm"
        v-loading="createDialog.loading"
        label-width="100px"
        :model="createDialog.formModel"
        :rules="createDialog.rules"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="createDialog.formModel.name"
            placeholder="必填"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select
            class='task-view-select'
            v-model="createDialog.formModel.type"
            placeholder="请选择"
          >
            <el-option
              v-for="item in typeIndicator.entities.data"
              :key="item.key.string_id"
              :label="item.label"
              :value="item.key.string_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="总任务数" prop="totalMissionCount">
          <el-input-number
            v-model="createDialog.formModel.totalMissionCount"
            :min="1"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="createDialog.formModel.remark"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          type="primary"
          :disabled="createDialog.loading"
          @click="handleEntityCreate"
        >
          确认
        </el-button>
        <el-button
          :disabled="createDialog.loading"
          @click="createDialog.visible=false"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';
import TaskListPanel from '@/views/items/projectHelper/taskView/TaskListPanel.vue';
import InfoTabPanel from '@/views/items/projectHelper/taskView/InfoTabPanel.vue';
import ProjectIndicator from '@/views/items/projectHelper/project/ProjectIndicator.vue';

import resolveResponse from '@/util/response';
import { all as allTypeIndicator } from '@/api/project/taskTypeIndicator';
import { create } from '@/api/project/task';

export default {
  name: 'Task',
  components: {
    ProjectIndicator,
    TaskListPanel,
    BorderLayoutPanel,
    ComingSoon,
    InfoTabPanel,
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
      },
      taskTabs: {
        activeName: 'info',
        taskId: '',
      },
      createDialog: {
        visible: false,
        loading: false,
        formModel: {
          type: '',
          name: '',
          remark: '',
          totalMissionCount: 0,
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
          type: [
            { required: true, message: '类型不能为空', trigger: 'blur' },
          ],
        },
      },
      typeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
    };
  },
  methods: {
    handleTypeIndicatorSearch() {
      this.lookupAllTypeIndicator();
    },
    lookupAllTypeIndicator() {
      resolveResponse(allTypeIndicator(0, 1000))
        .then(this.updateTypeIndicatorObject)
        .catch(() => {
        });
    },
    updateTypeIndicatorObject(res) {
      this.typeIndicator.entities = res;
    },
    handleProjectChanged(project) {
      this.parentSelection.project = project;
      this.parentSelection.projectId = project.key.long_id;
    },
    handleCurrentChanged(taskId) {
      this.taskTabs.taskId = taskId;
    },
    handleShowEntityCreateDialog() {
      this.createDialog.visible = true;
    },
    handleEntityCreate() {
      this.$refs.createForm.validate()
        .then(() => {
          this.createDialog.loading = true;
        })
        .then(() => resolveResponse(create(
          this.parentSelection.projectId,
          this.createDialog.formModel.type,
          this.createDialog.formModel.name,
          this.createDialog.formModel.remark,
          this.createDialog.formModel.totalMissionCount,
        )))
        .then(() => {
          this.$message({
            showClose: true,
            message: `任务 ${this.createDialog.formModel.name} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.$refs.taskViewListPanel.inspectData();
        })
        .then(() => {
          this.createDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.createDialog.loading = false;
        });
    },
    handleEntityDelete() {
      // TODO
    },
  },
  mounted() {
    this.handleTypeIndicatorSearch();
  },
};
</script>

<style scoped>
.header-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.task-view-container {
  height: 100%;
  width: 100%;
}

.list-container {
  width: calc(25vw - 230px - 20px + 80px);
  height: 100%;
}

.task-view-select {
  width: 100%;
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

/*noinspection CssUnusedSymbol*/
.task-tabs >>> .el-tabs__content {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.task-tabs >>> .el-tab-pane {
  height: 100%;
}
</style>
