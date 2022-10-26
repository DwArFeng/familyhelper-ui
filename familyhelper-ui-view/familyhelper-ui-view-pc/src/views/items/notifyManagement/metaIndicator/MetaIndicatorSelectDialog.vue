<template>
  <div class="meta-indicator-select-dialog-container">
    <el-dialog
      id="dialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="选择缺少的元数据项"
      :close-on-click-modal="false"
      :visible.sync="watchedVisible"
      @keydown.ctrl.enter.native="handleHotKeyDown"
    >
      <div class="main-container">
        <child-for-meta-missing-sub-panel
          :notify-setting-id="notifySettingId"
          :topic-id="topicId"
          :account-id="accountId"
          @onSelectionChanged="handleSelectionChanged"
        />
      </div>
      <div class="footer-container" slot="footer">
        <el-button
          type="primary"
          :disabled="loading || notConfirmable"
          @click="handleConfirm"
        >
          确认
        </el-button>
        <el-button
          :disabled="loading"
          @click="watchedVisible=false"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ChildForMetaMissingSubPanel
from '@/views/items/notifyManagement/metaIndicator/ChildForMetaMissingSubPanel.vue';

export default {
  name: 'MetaIndicatorSelectDialog',
  components: { ChildForMetaMissingSubPanel },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    notifySettingId: {
      type: String,
      default: '',
    },
    topicId: {
      type: String,
      default: '',
    },
    accountId: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      validator(value) {
        return ['CHILD_FOR_META_MISSING'].indexOf(value) !== -1;
      },
      default: 'CHILD_FOR_META_MISSING',
    },
  },
  computed: {
    notConfirmable() {
      if (this.mode === 'CHILD_FOR_META_MISSING') {
        return this.multiSelection.length === 0;
      }
      return true;
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
      loading: false,
      multiSelection: [],
      singleSelection: null,
    };
  },
  methods: {
    handleHotKeyDown() {
      if (this.notConfirmable) {
        return;
      }
      this.handleConfirm();
    },
    handleConfirm() {
      if (this.mode === 'CHILD_FOR_META_MISSING') {
        this.$emit('onConfirmed', this.multiSelection);
        this.watchedVisible = false;
      }
    },
    handleSelectionChanged(selection) {
      if (this.mode === 'CHILD_FOR_META_MISSING') {
        this.multiSelection = selection;
      }
    },
  },
  mounted() {
    this.watchedVisible = this.visible;
    this.multiSelection = [];
    this.singleSelection = null;
  },
};
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 512px;
}

.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
