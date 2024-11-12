<template>
  <div class="node-edit-panel-container">
    <el-tabs class="tabs-panel" v-model="tabs.activeName" tab-position="left">
      <el-tab-pane label="概览" name="overlook">
        <node-overlook-panel
          ref="nodeOverlookPanel"
          :node-id="nodeId"
          :readonly="readonly"
          @onNodePropertyUpdated="handleNodePropertyUpdated"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import NodeOverlookPanel from '@/views/items/note/noteManagement/NodeOverlookPanel.vue';

export default {
  name: 'NodeEditPanel',
  components: { NodeOverlookPanel },
  props: {
    nodeId: {
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
      loading: false,
      tabs: {
        activeName: 'overlook',
      },
    };
  },
  methods: {
    handleNodePropertyUpdated() {
      this.$emit('onNodePropertyUpdated');
    },
  },
};
</script>

<style scoped>
.node-edit-panel-container {
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
