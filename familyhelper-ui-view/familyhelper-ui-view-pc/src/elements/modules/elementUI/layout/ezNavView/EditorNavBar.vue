<template>
  <div class="editor-nav-bar-container">
    <vim-label :type="item.meta.display.labelType" :content="item.meta.display.labelContent"/>
    <i class="el-icon-delete close-icon" @mouseup="handleDelete"/>
  </div>
</template>

<script>
import VimLabel from '@/components/vim/VimLabel.vue';

export default {
  name: 'EditorNavBar',
  components: { VimLabel },
  props: {
    item: {
      type: Object,
      required: true,
    },
    annotation: {
      type: String,
      required: true,
    },
  },
  methods: {
    handleDelete() {
      this.$emit('onDelete');
    },
  },
};
</script>

<style scoped>
.editor-nav-bar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: move;
  height: 28px;
  line-height: 26px;
  border: 1px solid #d8dce5;
  color: #495060;
  background: #fff;
  font-size: 12px;
  white-space: nowrap;
  padding: 0 4px;
}

/*noinspection CssUnusedSymbol*/
.editor-nav-bar-container >>> .vim-label {
  width: 0;
  flex-grow: 1;
  user-select: none;
}

.close-icon {
  text-align: center;
  font-size: 14px;
  color: #F56C6C;
  cursor: pointer;
}

.close-icon:hover {
  background: #EEEEEE;
}
</style>
