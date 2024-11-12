<template>
  <div class="setting-node-editor-container">
    <setting-node-edit-panel
      watching-route-name="settingrepo.settingNodeEditor"
      :id="query.id"
      :readonly="editPanelReadonly"
    />
  </div>
</template>

<script>
import SettingNodeEditPanel from '@/views/items/settingrepo/settingNode/SettingNodeEditPanel.vue';

export default {
  name: 'SettingNodeEditor',
  components: { SettingNodeEditPanel },
  computed: {
    editPanelReadonly() {
      return this.query.action === 'inspect';
    },
  },
  watch: {
    $route(val) {
      if (val.name !== 'settingrepo.settingNodeEditor') {
        return;
      }
      const { id, action } = this.$route.query;
      this.query.id = id;
      this.query.action = action;
    },
  },
  data() {
    return {
      loading: false,
      query: {
        id: '',
        action: '',
      },
    };
  },
  mounted() {
    const { id, action } = this.$route.query;
    this.query.id = id;
    this.query.action = action;
  },
};
</script>

<style scoped>
.setting-node-editor-container{
  width: 100%;
  height: 100%;
}
</style>
