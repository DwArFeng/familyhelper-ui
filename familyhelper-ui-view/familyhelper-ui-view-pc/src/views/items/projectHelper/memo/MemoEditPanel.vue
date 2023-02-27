<template>
  <div class="memo-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabs.activeName" tab-position="left">
      <el-tab-pane name="memoInfo" label="概览">
        <memo-info-panel
          :memo-id="memoId"
          :readonly="readonly"
          @onMemoPropertyUpdated="handleMemoPropertyUpdated"
        />
      </el-tab-pane>
      <el-tab-pane name="memoFile" label="文件">
        <memo-file-panel
          :memo-id="memoId"
          :readonly="readonly"
          @onMemoFileUpdated="handleMemoFileUpdated"
        />
      </el-tab-pane>
      <el-tab-pane name="memoRemind" label="提醒">
        <memo-remind-panel
          :memo-id="memoId"
          :readonly="readonly"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import MemoInfoPanel from '@/views/items/projectHelper/memo/MemoInfoPanel.vue';
import MemoFilePanel from '@/views/items/projectHelper/memo/MemoFilePanel.vue';
import MemoRemindPanel from '@/views/items/projectHelper/memo/MemoRemindPanel.vue';

export default {
  name: 'MemoEditPanel',
  components: { MemoRemindPanel, MemoFilePanel, MemoInfoPanel },
  props: {
    memoId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tabs: {
        activeName: 'memoInfo',
      },
    };
  },
  methods: {
    handleMemoPropertyUpdated() {
      this.$emit('onMemoPropertyUpdated');
    },
    handleMemoFileUpdated() {
      this.$emit('onMemoFileUpdated');
    },
  },
};
</script>

<style scoped>
.memo-edit-panel-container {
  height: 100%;
  width: 100%;
}

.tabs-panel {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel >>> .el-tabs__content {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel >>> .el-tab-pane {
  height: 100%;
}
</style>
