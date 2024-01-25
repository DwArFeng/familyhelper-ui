<template>
<div class="task-maintain-dialog-container">
  <entity-maintain-dialog
    inspect-title="查看任务"
    create-title="创建任务"
    edit-title="编辑任务"
    :visible.sync="watchedVisible"
    :mode="mode"
    :entity="watchedAnchorTask"
    :create-rules="rules"
    :edit-rules="rules"
    :close-on-click-modal="false"
    :loading="loading"
  >
    <el-form-item label="名称" prop="name">
      <!--suppress JSUnresolvedReference -->
      <el-input
        v-model="createDialog.formModel.name"
        placeholder="必填"
      />
    </el-form-item>
    <el-form-item label="类型" prop="type">
      <!--suppress JSUnresolvedReference -->
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
      <!--suppress JSUnresolvedReference -->
      <el-input-number
        v-model="createDialog.formModel.totalMissionCount"
        :min="1"
      />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <!--suppress JSUnresolvedReference -->
      <el-input
        v-model="createDialog.formModel.remark"
      />
    </el-form-item>
  </entity-maintain-dialog>
</div>
</template>

<script>
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

export default {
  name: 'TaskMaintainDialog',
  components: { EntityMaintainDialog },
  model: {
    prop: 'anchorTask',
    event: 'change',
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      validator(value) {
        return ['CREATE', 'EDIT', 'INSPECT'].indexOf(value) !== -1;
      },
      default: 'INSPECT',
    },
    anchorTask: {
      type: Object,
      required: true,
    },
  },
  watch: {
    visible(value) {
      if (value) {
        // this.syncData();
      }
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
    anchorTask: {
      handler(newVal) {
        this.watchedAnchorTask = newVal;
      },
      deep: true,
    },
    watchedAnchorTask: {
      handler(newVal) {
        this.$emit('change', newVal);
      },
      deep: true,
    },
  },
  data() {
    return {
      watchedVisible: false,
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'change' },
        ],
        type: [
          { required: true, message: '类型不能为空', trigger: 'blur' },
        ],
      },
      watchedAnchorTask: {
        long_id: '',
        project_long_id: '',
        type: '',
        name: '',
        remark: '',
        total_mission_count: 0,
        finished_mission_count: 0,
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
      label: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      lifeCycle: {
        entities: {
          data: [
            { key: 0, label: '准备中' },
            { key: 1, label: '使用中' },
            { key: 2, label: '禁用中' },
            { key: 3, label: '已废弃' },
          ],
        },
      },
      loading: false,
    };
  },
};
</script>

<style scoped>

</style>
