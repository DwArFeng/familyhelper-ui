<template>
  <div class="text-node-edit-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-button
            class="confirm-button"
            type="primary"
            :disabled="readonly"
            @click="handleCommitButtonClicked"
          >
            <span class="unsaved-emphasis" v-if="contentChanged"/>
            <span class="text">提交</span>
          </el-button>
          <el-button
            type="danger"
            :disabled="readonly"
            @click="handleResetButtonClicked"
          >
            重置
          </el-button>
        </div>
      </template>
      <template v-slot:default>
        <text-editor
          v-model="editor.content"
          :readonly="readonly"
        />
      </template>
    </header-layout-panel>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TextEditor from '@/components/text/TextEditor.vue';

import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode';
import resolveResponse from '@/util/response';

export default {
  name: 'TextNodeEditPanel',
  components: { TextEditor, HeaderLayoutPanel },
  props: {
    category: {
      type: String,
      required: true,
    },
    args: {
      type: Array,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    settingNodeInvalid() {
      return !this.category || !this.args;
    },
    contentChanged() {
      return this.editor.content !== this.editor.backupContent;
    },
  },
  watch: {
    category() {
      this.handleInspect();
    },
    args() {
      this.handleInspect();
    },
  },
  data() {
    return {
      loading: false,
      editor: {
        content: '',
        backupContent: '',
      },
    };
  },
  methods: {
    handleInspect() {
      if (this.settingNodeInvalid) {
        return;
      }
      this.loading = true;
      resolveResponse(operateInspect(this.category, this.args))
        .then(this.updateEditor)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateEditor(res) {
      this.editor.content = res.value;
      this.editor.backupContent = res.value;
    },
    handleCommitButtonClicked() {
      this.putTextNode();
    },
    putTextNode() {
      this.loading = true;
      resolveResponse(operatePut(this.category, this.args, this.editor.content))
        .then(() => {
          this.editor.backupContent = this.editor.content;
        })
        .then(() => {
          this.$message({
            showClose: true,
            message: '提交成功',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleResetButtonClicked() {
      this.editor.content = this.editor.backupContent;
    },
  },
  mounted() {
    this.handleInspect();
  },
};
</script>

<style scoped>
.text-node-edit-panel-container {
  height: 100%;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.header-container .confirm-button {
  height: 40px;
  width: 70px;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.header-container .confirm-button .unsaved-emphasis {
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  margin-left: -6px;
}
</style>
