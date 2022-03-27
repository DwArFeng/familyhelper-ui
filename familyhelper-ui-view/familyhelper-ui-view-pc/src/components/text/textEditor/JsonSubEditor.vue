<template>
  <div class="json-sub-editor-container">
    <vue-json-editor
      class="json-editor"
      ref="jsonEditor"
      v-model="watchedJson"
      :showBtns="false"
      :mode="'code'"
      :modes="['code']"
      lang="zh"
    />
  </div>
</template>

<script>
import VueJsonEditor from 'vue-json-editor';

export default {
  name: 'JsonSubEditor',
  components: { VueJsonEditor },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: String,
      require: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    value(value) {
      this.watchedJson = JSON.parse(value);
    },
    watchedJson(value) {
      this.$emit('change', JSON.stringify(value));
    },
    readonly(value) {
      this.$refs.jsonEditor.$data.editor.aceEditor.setReadOnly(value);
    },
  },
  data() {
    return {
      watchedJson: '',
    };
  },
  mounted() {
    this.watchedJson = JSON.parse(this.value);
    this.$refs.jsonEditor.$data.editor.aceEditor.setReadOnly(this.readonly);
  },
};
</script>

<style scoped>
.json-sub-editor-container {
  height: 100%;
  width: 100%;
}

.json-editor{
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.json-editor >>> .jsoneditor-vue{
  height: 100%;
}
</style>
