<template>
  <div class="mmd-node-dialog-container">
    <el-dialog
      id="dialog"
      append-to-body
      :title="title"
      :visible.sync="watchedVisible"
      :close-on-click-modal="false"
      @keydown.ctrl.enter.native="handleHotKeyDown"
    >
      <div class="dialog-container">
        <div class="row label-editor">
          <div class="edit-zone">
            <div class="control">
              <!--suppress JSUnresolvedReference -->
              <dialog-toggle-button
                v-model="value.fontWeight" :icon="'\uffda'"
                :values="['normal','bold']"
              />
              <!--suppress JSUnresolvedReference -->
              <dialog-toggle-button
                v-model="value.fontStyle" :icon="'\uffdc'"
                :values="['normal','italic']"
              />
            </div>
            <el-input></el-input>
          </div>
          <div class="preview"></div>
        </div>
        <el-divider class="row"/>
        <div class="row note-editor"></div>
      </div>
      <div slot="footer">
        <el-button
          type="primary"
          @click="handleConfirmButtonClicked"
        >
          确定
        </el-button>
        <el-button
          @click="handleCancelButtonClicked"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import DialogToggleButton
from '@/views/items/miscellaneous/fileEditor/mmdSubEditor/DialogToggleButton.vue';

export default {
  name: 'MmdNodeDialog',
  model: {
    prop: 'value',
    event: 'change',
  },
  components: { DialogToggleButton },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      required: true,
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
  },
  data() {
    return {
      watchedVisible: false,
      foo: 'false',
    };
  },
  methods: {
    syncProps() {
      this.watchedVisible = this.visible;
    },
    handleConfirmButtonClicked() {
      this.$emit('onConfirm', this.entity);
    },
    handleCancelButtonClicked() {
      this.watchedVisible = false;
    },
    handleHotKeyDown() {
      this.$emit('onConfirm', this.entity);
    },
  },
  mounted() {
    this.syncProps();
  },
};
</script>

<style scoped>
.dialog-container {
  height: 475px;
  display: flex;
  flex-direction: column;
}

.dialog-container .row:last-child {
  height: 0;
  flex-grow: 1;
  margin-top: 5px;
}

/*noinspection CssUnusedSymbol*/
.dialog-container .row.el-divider {
  margin: 5px 0;
}

.label-editor {
  display: flex;
  flex-direction: row;
}

.label-editor .edit-zone {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.label-editor .edit-zone .control {
  display: flex;
  flex-direction: row;
  background: #FAFAFA;
}
</style>
