<template>
  <div class="file-editor-container">
    <file-edit-panel
      :type="fileEditPanel.type"
      :id="fileEditPanel.id"
      :mode="fileEditPanel.mode"
    />
  </div>
</template>

<script>
import FileEditPanel from '@/views/items/miscellaneous/fileEditor/FileEditPanel.vue';

export default {
  name: 'FileEditor',
  components: {
    FileEditPanel,
  },
  watch: {
    $route(val) {
      if (val.name !== 'miscellaneous.fileEditor') {
        return;
      }
      const { type, id, action } = this.$route.query;
      this.fileEditPanel.type = type;
      this.fileEditPanel.id = id;
      this.fileEditPanel.mode = this.parseMode(action);
    },
  },
  data() {
    return {
      fileEditPanel: {
        type: '',
        id: '',
        mode: '',
      },
    };
  },
  methods: {
    parseMode(action) {
      switch (action) {
        case 'inspect':
          return 'INSPECT';
        case 'edit':
          return 'EDIT';
        default:
          return '';
      }
    },
  },
  mounted() {
    const { type, id, action } = this.$route.query;
    this.fileEditPanel.type = type;
    this.fileEditPanel.id = id;
    this.fileEditPanel.mode = this.parseMode(action);
  },
};
</script>

<style scoped>
.file-editor-container {
  height: 100%;
  width: 100%;
}
</style>
