<template>
  <div class="task-view-container">
    <border-layout-panel
      class="border-layout-panel"
      :header-visible="true"
      :west-visible="true"
    >
      <template v-slot:header>
        <div class="header-container">
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
      </template>
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
            <info-tab-panel
              ref="infoTabPanel"
              :task-id="taskTabs.taskId"
              @onEntityEdit="handleShowEntityEditDialog"
            />
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
      <template v-slot:west>
        <task-list-panel
          class="list-container"
          ref="taskViewListPanel"
          mode="TASK_VIEW"
          :project-key="parentSelection.projectId"
          @onCurrentChanged="handleCurrentChanged"
        />
      </template>
    </border-layout-panel>
    <entity-maintain-dialog
      inspect-title="查看任务"
      create-title="创建任务"
      edit-title="编辑任务"
      label-width="82px"
      :visible.sync="maintainDialog.visible"
      :mode="maintainDialog.mode"
      :entity="maintainDialog.anchorEntity"
      :create-rules="maintainDialog.rules"
      :edit-rules="maintainDialog.rules"
      :close-on-click-modal="false"
      :loading="maintainDialog.loading"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="maintainDialog.anchorEntity.name"
          placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          class='task-view-select'
          v-model="maintainDialog.anchorEntity.type"
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
      <el-form-item
        v-if="maintainDialog.mode==='EDIT'"
        label="完成任务数"
        prop="finished_mission_count"
      >
        <el-input-number
          v-model="maintainDialog.anchorEntity.finished_mission_count"
          :min="1"
          :max="maintainDialog.anchorEntity.total_mission_count"
        />
      </el-form-item>
      <el-form-item label="总任务数" prop="total_mission_count">
        <el-input-number
          v-model="maintainDialog.anchorEntity.total_mission_count"
          :min="1"
          @change="handleTotalMissionCountChanged"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="maintainDialog.anchorEntity.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';
import TaskListPanel from '@/views/items/projectHelper/taskView/TaskListPanel.vue';
import InfoTabPanel from '@/views/items/projectHelper/taskView/InfoTabPanel.vue';
import ProjectIndicator from '@/views/items/projectHelper/project/ProjectIndicator.vue';
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import resolveResponse from '@/util/response';
import {
  all as allTypeIndicator,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/project/taskTypeIndicator';
import {
  inspectDisp,
  create,
  update,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/project/task';

export default {
  name: 'Task',
  components: {
    EntityMaintainDialog,
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
      maintainDialog: {
        visible: false,
        mode: 'CREATE',
        anchorEntity: {
          long_id: '',
          type: '',
          name: '',
          remark: '',
          total_mission_count: 0,
          finished_mission_count: 0,
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
          type: [
            { required: true, message: '类型不能为空', trigger: 'blur' },
          ],
        },
        loading: false,
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
    handleCurrentChanged(data) {
      this.taskTabs.taskId = data.key.long_id;
      this.syncAnchorEntity(data);
    },
    handleShowEntityCreateDialog() {
      this.showDialog('CREATE');
    },
    handleShowEntityEditDialog() {
      this.showDialog('EDIT');
    },
    handleEntityCreate() {
      this.maintainDialog.loading = true;
      resolveResponse(create(
        this.parentSelection.projectId,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.total_mission_count,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `任务 ${this.maintainDialog.anchorEntity.name} 创建成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.$refs.taskViewListPanel.inspectData();
        })
        .then(() => {
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
    handleEntityEdit() {
      this.maintainDialog.loading = true;
      resolveResponse(update(
        this.maintainDialog.anchorEntity.long_id,
        this.maintainDialog.anchorEntity.type,
        this.maintainDialog.anchorEntity.name,
        this.maintainDialog.anchorEntity.remark,
        this.maintainDialog.anchorEntity.total_mission_count,
        this.maintainDialog.anchorEntity.finished_mission_count,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: `任务 ${this.maintainDialog.anchorEntity.name} 更新成功`,
            type: 'success',
            center: true,
          });
        })
        .then(() => resolveResponse(inspectDisp(this.maintainDialog.anchorEntity.long_id)))
        .then(() => {
          this.$refs.taskViewListPanel.inspectData();
          this.$refs.infoTabPanel.updateView();
          this.maintainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.maintainDialog.loading = false;
        });
    },
    handleEntityDelete() {
      // TODO
    },
    syncAnchorEntity(entity) {
      this.maintainDialog.anchorEntity.long_id = entity.key.long_id;
      this.maintainDialog.anchorEntity.name = entity.name;
      this.maintainDialog.anchorEntity.type = entity.type;
      this.maintainDialog.anchorEntity.remark = entity.remark;
      this.maintainDialog.anchorEntity.total_mission_count = entity.total_mission_count;
      this.maintainDialog.anchorEntity.finished_mission_count = entity.finished_mission_count;
    },
    showDialog(mode) {
      this.maintainDialog.mode = mode;
      this.$nextTick(() => {
        this.maintainDialog.visible = true;
      });
    },
    handleTotalMissionCountChanged() {
      this.maintainDialog.anchorEntity.finished_mission_count = Math.min(
        this.maintainDialog.anchorEntity.finished_mission_count,
        this.maintainDialog.anchorEntity.total_mission_count,
      );
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
