<template>
  <div class="plain-sub-editor-container">
    <el-input
      class="el-input"
      v-model="watchedValue"
      type="textarea"
      resize="none"
      :readonly="readonly"
    />
  </div>
</template>

<script>
export default {
  name: 'PlainSubEditor',
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
      this.watchedValue = value;
    },
    watchedValue(value) {
      this.$emit('change', value);
    },
  },
  data() {
    return {
      watchedValue: '',
    };
  },
  mounted() {
    this.watchedValue = this.value;
  },
};
</script>

<style scoped>
.plain-sub-editor-container {
  height: 100%;
  width: 100%;
}

.el-input{
  height: 100%;
  width: 100%;
}

.el-input >>> textarea{
  height: 100%;
  width: 100%;
}
</style>
