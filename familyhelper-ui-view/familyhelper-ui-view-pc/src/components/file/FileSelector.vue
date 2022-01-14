<template>
  <div class="file-selector-container">
    <input
      ref="selector"
      hidden
      type="file"
      v-bind="parsedMultiple"
      :accept="accept"
      @change="handleImageSelected($event)"
    />
    <slot :select="handleFileSelect">
      <el-button
        class="avatar-editor-header"
        :type="buttonType"
        :size="buttonSize"
        @click="handleFileSelect"
      >
        选择文件
      </el-button>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'FileSelector',
  props: {
    accept: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    tester: {
      type: Function,
      default: () => true,
    },
    buttonSize: {
      type: String,
      validator(value) {
        return ['medium', 'small', 'mini', ''].indexOf(value) !== -1;
      },
      default: '',
    },
    buttonType: {
      type: String,
      validator(value) {
        return ['primary', 'success', 'info', 'warning', 'danger'].indexOf(value) !== -1;
      },
      default: 'success',
    },
  },
  computed: {
    parsedMultiple() {
      return this.multiple ? { multiple: 'multiple' } : {};
    },
  },
  data() {
    return {
      files: [],
      totalCount: 0,
      currentFinishedCount: 0,
    };
  },
  methods: {
    handleFileSelect() {
      this.$refs.selector.click();
    },
    handleImageSelected(e) {
      const { files } = e.target;

      // 对于没选择文件的情况作出处理。
      if (files.length === 0) {
        return false;
      }

      if (!this.tester(files)) {
        return false;
      }

      this.totalCount = files.length;
      this.currentFinishedCount = 0;

      // 清除所有旧文件。
      this.files.splice(0, this.files.length);

      // 对每个文件创建文件读取器。
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const { name } = file;
        const reader = new FileReader();
        reader.index = i;
        reader.onload = (event) => {
          // 获取事件的目标。
          const { target } = event;
          // 获取目标的索引值。
          const { index } = target;
          // 生成文件的 BLOB。
          const blob = new Blob([target.result]);
          // 赋值到 data 区中。
          this.$set(this.files, index, { name, blob });
          // 自增 currentFinishedCount。
          this.currentFinishedCount += 1;
          // 如果全部加载完毕，则抛出事件。
          if (this.currentFinishedCount === this.totalCount) {
            this.$emit('onFileLoaded', this.files);
          }
        };
        // 转化为 blob。
        reader.readAsArrayBuffer(file);
      }
      return true;
    },
  },
};
</script>

<style scoped>

</style>
