<template>
  <div class="setting-node-init-dialog-container">
    <el-dialog
      append-to-body
      destroy-on-close
      title="初始化节点"
      :visible.sync="mainDialog.visible"
      :close-on-click-modal="false"
      @opened="handleMainDialogOpened"
      @keydown.ctrl.enter.native="handleHotKeyDown"
    >
      <template v-slot:default>
        <el-form
          ref="form"
          v-loading="mainDialog.loading"
          label-width="80px"
          :model="mainDialog.model"
          :rules="mainDialog.rules"
          :validate-on-rule-change="false"
          @submit.native.prevent
        >
          <el-form-item label="权限节点" prop="category">
            <el-input
              v-model="mainDialog.model.category"
            >
              <template v-slot:append>
                <el-button-group class="button-group">
                  <el-button
                    class="button"
                    icon="el-icon-search"
                    @click="handleShowSettingCategorySelectDialog"
                  />
                  <el-button
                    class="button"
                    icon="el-icon-document-copy"
                    @click="handleShowSettingNodeSelectDialog"
                  />
                </el-button-group>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="参数" prop="args">
            <vue-json-editor
              class="json-editor"
              ref="jsonEditor"
              mode="code"
              lang="zh"
              v-model="mainDialog.model.args"
              :showBtns="false"
            />
          </el-form-item>
          <el-form-item label="权限节点" prop="type">
            <el-select
              class='type-select'
              v-model="mainDialog.model.type"
              placeholder="请选择"
            >
              <el-option
                v-for="item in itemTypeIndicator"
                :key="item.type"
                :label="item.label"
                :value="item.type"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="mainDialog.model.remark"
            />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer>
        <div class="footer-container">
          <el-button
            type="primary"
            :disabled="mainDialog.loading"
            @click="handleConfirmButtonClicked"
          >
            确定
          </el-button>
          <el-button
            :disabled="mainDialog.loading"
            @click="handleCancelButtonClicked"
          >
            取消
          </el-button>
        </div>
      </template>
    </el-dialog>
    <setting-category-select-dialog
      :visible.sync="settingCategorySelectDialog.visible"
      @onConfirmed="handleSettingCategorySelectConfirmed"
    />
    <setting-node-select-dialog
      :visible.sync="settingNodeSelectDialog.visible"
      @onConfirmed="handleSettingNodeSelectConfirmed"
    />
  </div>
</template>

<script>
import VueJsonEditor from 'vue-json-editor';
import SettingCategorySelectDialog
from '@/views/items/settingrepo/settingCategory/SettingCategorySelectDialog.vue';
import SettingNodeSelectDialog
from '@/views/items/settingrepo/settingNode/SettingNodeSelectDialog.vue';

import {
  exists as settingCategoryExists,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingCategory';
import {
  operateInit as settingNodeOperateInit,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode';
import resolveResponse from '@/util/response';

const SETTING_NODE_TYPE_INDICATOR = [
  { type: 0, label: '文本' },
  { type: 2, label: '图片' },
  { type: 3, label: '图片列表' },
];

export default {
  name: 'SettingNodeInitDialog',
  components: { SettingNodeSelectDialog, VueJsonEditor, SettingCategorySelectDialog },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    visible(value) {
      this.mainDialog.visible = value;
    },
    'mainDialog.visible': {
      handler(value) {
        this.$emit('update:visible', value);
      },
    },
  },
  data() {
    const categoryValidator = (rule, value, callback) => {
      Promise.resolve(value)
        .then((res) => {
          if (res === '') {
            callback(new Error('设置类型不能为空'));
            return Promise.reject();
          }
          return resolveResponse(settingCategoryExists(value));
        })
        .then((res) => {
          if (!res) {
            callback(new Error('设置类型不存在'));
            return Promise.reject();
          }
          return Promise.resolve();
        })
        .then(() => {
          callback();
        })
        .catch(() => {
        });
    };
    const argsValidator = (rule, value, callback) => {
      // 参数不允许为 null。
      if (value === null) {
        callback(new Error('参数不能为 null'));
        return;
      }
      // 如果参数不为 null，则必须是数组。
      if (!Array.isArray(value)) {
        callback(new Error('参数必须是数组'));
        return;
      }
      // 数组中的每一个元素都是字符串。
      if (value.some((item) => typeof item !== 'string')) {
        callback(new Error('参数数组中的每一个元素必须是字符串'));
        return;
      }
      // 通过验证。
      callback();
    };
    return {
      mainDialog: {
        visible: false,
        loading: false,
        model: {
          category: '',
          args: [],
          type: 0,
          remark: '',
        },
        rules: {
          category: [
            { validator: categoryValidator, trigger: 'blur' },
          ],
          args: [
            { validator: argsValidator, trigger: 'blur' },
          ],
        },
      },
      settingCategorySelectDialog: {
        visible: false,
      },
      settingNodeSelectDialog: {
        visible: false,
      },
      itemTypeIndicator: SETTING_NODE_TYPE_INDICATOR,
    };
  },
  methods: {
    handleMainDialogOpened() {
      this.$refs.jsonEditor.$data.editor.aceEditor.on('blur', () => {
        this.$refs.form.validateField('args');
      });
    },
    handleShowSettingCategorySelectDialog() {
      this.settingCategorySelectDialog.visible = true;
    },
    handleSettingCategorySelectConfirmed(selection) {
      this.mainDialog.model.category = selection.key.string_id;
    },
    handleShowSettingNodeSelectDialog() {
      this.settingNodeSelectDialog.visible = true;
    },
    handleSettingNodeSelectConfirmed(selection) {
      this.mainDialog.model.category = selection.category;
      this.$set(this.mainDialog.model, 'args', selection.args);
    },
    handleConfirmButtonClicked() {
      this.$refs.form.validate((accept) => {
        if (accept) {
          this.initSettingNode();
        }
      });
    },
    handleCancelButtonClicked() {
      this.mainDialog.visible = false;
    },
    handleHotKeyDown() {
      this.$refs.form.validate((accept) => {
        if (accept) {
          this.initSettingNode();
        }
      });
    },
    initSettingNode() {
      this.mainDialog.loading = true;
      resolveResponse(settingNodeOperateInit(
        this.mainDialog.model.category,
        this.mainDialog.model.args,
        this.mainDialog.model.type,
        this.mainDialog.model.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '设置节点初始化成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.$emit('onSettingNodeInited');
          this.mainDialog.visible = false;
        })
        .catch(() => {
        })
        .finally(() => {
          this.mainDialog.loading = false;
        });
    },
  },
  mounted() {
    this.mainDialog.visible = this.visible;
  },
};
</script>

<style scoped>
.button-group {
  display: flex;
}

.button-group .button {
  padding-left: 10px;
  padding-right: 10px;
}

.json-editor {
  height: 250px;
}

/*noinspection CssUnusedSymbol*/
.json-editor >>> .jsoneditor-vue {
  height: 100%;
}

.type-select {
  width: 100%;
}

.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
