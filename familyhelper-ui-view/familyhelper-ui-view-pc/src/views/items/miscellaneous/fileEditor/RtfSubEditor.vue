<template>
  <div class="rtf-sub-editor-container">
    <ckeditor :editor="editor" v-model="content"/>
  </div>
</template>

<script>
import ClassicEditor from '@/elements/modules/ckeditor/bin/ckeditor';

export default {
  name: 'RtfSubEditor',
  props: {
    url: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      editor: ClassicEditor,
      content: '<p>Content of the editor.</p>',
    };
  },
  methods: {},
};
</script>

<style scoped>
.rtf-sub-editor-container {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.rtf-sub-editor-container >>> .ck-editor{
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
.rtf-sub-editor-container >>> .ck-editor__main{
  height: 0;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.rtf-sub-editor-container >>> .ck-content{
  height: 100%;
}
</style>
