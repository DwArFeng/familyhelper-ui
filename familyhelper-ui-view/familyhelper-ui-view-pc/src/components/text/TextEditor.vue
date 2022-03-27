<template>
<div class="text-editor-container">
  <div class="header">
    <el-select class="item selector" v-model="selector.value" size="mini">
      <i class="el-icon-s-data" slot="prefix"/>
      <el-option
        v-for="item in selector.options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-tag class="item" size="medium">长度：{{watchedValue.length}}</el-tag>
    <el-link
      class="item"
      type="primary"
      icon="el-icon-document"
      :underline="false"
      @click="handleCopy"
    >
      复制
    </el-link>
  </div>
  <div class="body">
    <plain-sub-editor
      v-model="watchedValue"
      v-if="selector.value==='plain'"
      :readonly="readonly"
    />
    <json-sub-editor
      v-model="watchedValue"
      v-else-if="selector.value==='json'"
      :readonly="readonly"
    />
    <coming-soon v-else-if="selector.value==='base64image'"/>
  </div>
</div>
</template>

<script>
import PlainSubEditor from '@/components/text/textEditor/PlainSubEditor.vue';
import JsonSubEditor from '@/components/text/textEditor/JsonSubEditor.vue';
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';

export default {
  name: 'TextEditor',
  components: { ComingSoon, PlainSubEditor, JsonSubEditor },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      required: true,
    },
  },
  watch: {
    value(value) {
      this.watchedValue = value;
    },
    watchedValue(value) {
      this.$emit('change', value);
    },
    mode() {
      this.clearValidate();
    },
  },
  data() {
    return {
      watchedValue: '',
      selector: {
        value: 'plain',
        options: [
          { value: 'plain', label: 'Text' },
          { value: 'json', label: 'JSON' },
          { value: 'base64image', label: 'Base64 图像' },
        ],
      },
    };
  },
  methods: {
    handleCopy() {
      navigator.clipboard.writeText(this.watchedValue)
        .then(() => {
          this.$message({
            showClose: true,
            message: '复制成功',
            type: 'success',
            center: true,
          });
        });
    },
  },
  mounted() {
    this.watchedValue = this.value;
  },
};
</script>

<style scoped>
.text-editor-container{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.header{
  width: 100%;
}

.body{
  width: 100%;
  height: 0;
  flex-grow: 1;
}

.header .item:not(:first-child){
  margin-left: 5px;
}

.header .selector{
  width: 140px;
}

.header .selector >>> input{
  padding-left: 20px;
}

/*noinspection CssUnusedSymbol*/
.header >>> .el-link--inner{
  margin: 0;
}
</style>
