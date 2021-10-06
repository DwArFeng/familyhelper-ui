<template>
  <div class="entity-maintain-dialog-container">
    <el-dialog
      id="dialog"
      append-to-body
      destroy-on-close
      :title="title"
      :visible.sync="watchedVisible"
      :close-on-click-modal="closeOnClickModal"
      @keydown.ctrl.enter.native="handleHotKeyDown"
    >
      <el-form
        ref="form"
        :model="entity"
        :label-width="labelWidth"
        :rules="rules"
        :validate-on-rule-change="false"
        @submit.native.prevent
      >
        <slot></slot>
      </el-form>
      <div class="footer-container" slot="footer">
        <el-button
          type="primary"
          v-if="mode !== 'INSPECT'"
          @click="handleFirstButtonClicked"
        >
          {{ firstButtonLabel }}
        </el-button>
        <el-button
          @click="handleSecondButtonClicked"
        >
          {{ secondButtonLabel }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'EntityMaintainDialogPanel',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    entity: {
      type: Object,
      default: () => {
      },
    },
    mode: {
      type: String,
      validator(value) {
        return ['CREATE', 'EDIT', 'INSPECT'].indexOf(value) !== -1;
      },
      default: 'INSPECT',
    },
    labelWidth: {
      type: String,
      default: '80px',
    },
    createRules: {
      type: Object,
      default: null,
    },
    editRules: {
      type: Object,
      default: null,
    },
    createTitle: {
      type: String,
      default: '新建',
    },
    editTitle: {
      type: String,
      default: '编辑',
    },
    inspectTitle: {
      type: String,
      default: '查看',
    },
    createConfirmButtonLabel: {
      type: String,
      default: '新建',
    },
    editConfirmButtonLabel: {
      type: String,
      default: '编辑',
    },
    createCancelButtonLabel: {
      type: String,
      default: '取消',
    },
    editCancelButtonLabel: {
      type: String,
      default: '取消',
    },
    inspectCloseButtonLabel: {
      type: String,
      default: '关闭',
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
    mode() {
      this.clearValidate();
    },
  },
  computed: {
    title() {
      switch (this.mode) {
        case 'CREATE':
          return this.createTitle;
        case 'EDIT':
          return this.editTitle;
        case 'INSPECT':
          return this.inspectTitle;
        default:
          return '';
      }
    },
    firstButtonLabel() {
      switch (this.mode) {
        case 'CREATE':
          return this.createConfirmButtonLabel;
        case 'EDIT':
          return this.editConfirmButtonLabel;
        default:
          return '';
      }
    },
    secondButtonLabel() {
      switch (this.mode) {
        case 'CREATE':
          return this.createCancelButtonLabel;
        case 'EDIT':
          return this.editCancelButtonLabel;
        case 'INSPECT':
          return this.inspectCloseButtonLabel;
        default:
          return '';
      }
    },
    rules() {
      switch (this.mode) {
        case 'CREATE':
          return this.createRules;
        case 'EDIT':
          return this.editRules;
        default:
          return null;
      }
    },
  },
  data() {
    return {
      watchedVisible: false,
    };
  },
  methods: {
    syncProps() {
      this.watchedVisible = this.visible;
    },
    handleFirstButtonClicked() {
      switch (this.mode) {
        case 'CREATE':
          this.$refs.form.validate((accept) => {
            if (accept) {
              this.$emit('onEntityCreate', this.entity);
            }
          });
          break;
        case 'EDIT':
          this.$refs.form.validate((accept) => {
            if (accept) {
              this.$emit('onEntityEdit', this.entity);
            }
          });
          break;
        default:
      }
    },
    handleSecondButtonClicked() {
      this.watchedVisible = false;
    },
    clearValidate() {
      if (this.$refs.form !== undefined) {
        this.$refs.form.clearValidate();
      }
    },
    handleHotKeyDown() {
      switch (this.mode) {
        case 'CREATE':
          this.$refs.form.validate((accept) => {
            if (accept) {
              this.$emit('onEntityCreate', this.entity);
            }
          });
          break;
        case 'EDIT':
          this.$refs.form.validate((accept) => {
            if (accept) {
              this.$emit('onEntityEdit', this.entity);
            }
          });
          break;
        case 'INSPECT':
          this.watchedVisible = false;
          break;
        default:
      }
    },
  },
  mounted() {
    this.syncProps();
  },
};
</script>

<style scoped>
.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
