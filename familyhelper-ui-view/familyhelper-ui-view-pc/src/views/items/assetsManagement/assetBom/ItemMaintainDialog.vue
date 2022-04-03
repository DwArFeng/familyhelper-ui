<template>
  <div class="item-maintain-dialog-container">
    <entity-maintain-dialog
      label-width="100px"
      inspect-title="查看项目"
      create-title="创建项目"
      edit-title="编辑项目"
      :visible.sync="watchedVisible"
      :mode="mode"
      :entity="watchedAnchorItem"
      :create-rules="rules"
      :edit-rules="rules"
      :close-on-click-modal="false"
      :loading="loading"
      @onEntityCreate="handleEntityCreate"
      @onEntityEdit="handleEntityEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="anchorItem.name"
          placeholder="必填"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          class='asset-bom-select'
          v-model="anchorItem.type"
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
      <el-form-item label="标签" prop="label_keys">
        <el-select
          class='asset-bom-select'
          v-model="anchorItem.label_keys"
          placeholder="请选择"
          multiple
        >
          <el-option
            v-for="item in label.entities.data"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生命周期" prop="life_cycle">
        <el-select
          class='asset-bom-select'
          v-model="anchorItem.life_cycle"
          placeholder="请选择"
        >
          <el-option
            v-for="item in lifeCycle.entities.data"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="anchorItem.remark"
        />
      </el-form-item>
    </entity-maintain-dialog>
  </div>
</template>

<script>
import EntityMaintainDialog from '@/components/entity/EntityMaintainDialog.vue';

import { all as allLabel, allExists as allLabelExists } from '@/api/assets/itemLabel';
import resolveResponse from '@/util/response';
import { all as allTypeIndicator } from '@/api/assets/itemTypeIndicator';

export default {
  name: 'ItemMaintainDialog',
  components: { EntityMaintainDialog },
  model: {
    prop: 'anchorItem',
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
    anchorItem: {
      type: Object,
      required: true,
    },
  },
  watch: {
    visible(value) {
      if (value) {
        this.syncData();
      }
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
    anchorItem: {
      handler(newVal) {
        this.watchedAnchorItem = newVal;
      },
      deep: true,
    },
    watchedAnchorItem: {
      handler(newVal) {
        this.$emit('change', newVal);
      },
      deep: true,
    },
  },
  data() {
    const labelExistsValidator = (rule, value, callback) => {
      if (value === [] || value === null || value === undefined) {
        callback();
        return;
      }
      const keys = value.map((key) => ({ string_id: key }));
      resolveResponse(allLabelExists(keys))
        .then((res) => {
          if (!res) {
            callback(new Error('至少一个标签不存在'));
          } else {
            callback();
          }
        })
        .catch(() => {
          callback(new Error('通信故障'));
        });
    };
    return {
      watchedVisible: false,
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'change' },
        ],
        label_keys: [
          { validator: labelExistsValidator, trigger: 'blur' },
        ],
        type: [
          { required: true, message: '类型不能为空', trigger: 'blur' },
        ],
        life_cycle: [
          { required: true, message: '生命周期不能为空', trigger: 'blur' },
        ],
      },
      watchedAnchorItem: {
        long_id: '',
        parent_long_id: '',
        name: '',
        label_keys: [],
        type: '',
        life_cycle: '',
        remark: '',
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
  methods: {
    handleEntityCreate() {
      this.$emit('onEntityCreate', this.watchedAnchorItem);
    },
    handleEntityEdit() {
      this.$emit('onEntityEdit', this.watchedAnchorItem);
    },
    syncData() {
      this.loading = true;
      resolveResponse(allTypeIndicator(0, 1000))
        .then(this.updateTypeIndicatorObject)
        .then(() => resolveResponse(allLabel(0, 1000)))
        .then(this.updateLabelObject)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateTypeIndicatorObject(res) {
      this.typeIndicator.entities = res;
    },
    updateLabelObject(res) {
      this.label.entities = res;
    },
  },
};
</script>

<style scoped>
.asset-bom-select {
  width: 100%;
}
</style>
