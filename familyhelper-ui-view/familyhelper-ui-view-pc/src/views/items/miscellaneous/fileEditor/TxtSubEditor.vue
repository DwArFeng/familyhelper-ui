<template>
  <div class="txt-sub-editor-container">
    <el-input class="editor" type="textarea" resize="none" v-model="content" :readonly="readonly"/>
  </div>
</template>

<script>

export default {
  name: 'TxtSubEditor',
  props: {
    blob: {
      type: Blob,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    blob(value) {
      value.text()
        .then((text) => {
          this.content = text;
        });
    },
  },
  data() {
    return {
      content: '',
    };
  },
  methods: {
    contentToBlob() {
      return new Blob([this.content], { type: 'text/plain' });
    },
  },
};
</script>

<style scoped>
.txt-sub-editor-container {
  width: 100%;
  height: 100%;
}

.txt-sub-editor-container .editor{
  width: 100%;
  height: 100%;
}

.txt-sub-editor-container .editor >>> textarea{
  width: 100%;
  height: 100%;
}
</style>
