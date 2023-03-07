<template>
<div class="pdf-sub-editor-container">
  <div class="editor-header">
    <el-pagination
      layout="prev, pager, next, jumper"
      :current-page.sync="currentPage"
      :total="pageCount"
      :page-size="1"
    />
  </div>
  <overlay-scrollbars class="scroll-bar editor-body">
    <pdf
      :src="url"
      :page="currentPage "
      @num-pages="pageCount = $event"
      @page-loaded="currentPage =$event"
    />
  </overlay-scrollbars>
</div>
</template>

<script>
import Pdf from 'vue-pdf';

export default {
  name: 'PdfSubEditor',
  components: {
    Pdf,
  },
  props: {
    url: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      pageCount: 0,
      currentPage: 0,
    };
  },
};
</script>

<style scoped>
.pdf-sub-editor-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.editor-header{
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.editor-body{
  height: 0;
  flex-grow: 1;
}
</style>
